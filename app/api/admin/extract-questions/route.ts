import { NextRequest } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { extractQuestions, extractAnswers } from "@/lib/mcqExtractor"
import {
  extractPdfMetadata,
  validatePaperMarkscheme,
  type ValidationResult,
} from "@/lib/extractPdfMetadata"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function verifyAdmin(token: string) {
  const db = getSupabaseAdmin()
  const { data: { user }, error } = await db.auth.getUser(token)
  if (error || !user || !user.user_metadata?.is_admin) return null
  return user
}

async function fetchPdfText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download PDF (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  // Import from lib/ directly — avoids pdf-parse v1's test-file autoload
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string }>
  const data = await pdfParse(buf)
  return data.text
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await verifyAdmin(token)
  if (!user) return Response.json({ error: "Forbidden — not an admin" }, { status: 403 })

  let body: { paperId?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { paperId } = body
  if (!paperId) return Response.json({ error: "paperId is required" }, { status: 400 })

  const db = getSupabaseAdmin()

  // ── 1. Fetch paper record ─────────────────────────────────────────────────
  const { data: paper, error: paperErr } = await db
    .from("papers")
    .select("id, subject, year, paper_pdf_url, markscheme_pdf_url")
    .eq("id", paperId)
    .single()

  if (paperErr || !paper) {
    return Response.json({ error: "Paper not found" }, { status: 404 })
  }
  if (!paper.paper_pdf_url) {
    return Response.json({ error: "Paper has no PDF URL" }, { status: 422 })
  }

  // ── 2. Download paper PDF ─────────────────────────────────────────────────
  let paperText: string
  try {
    paperText = await fetchPdfText(paper.paper_pdf_url)
  } catch (e) {
    return Response.json(
      { error: `Could not read paper PDF: ${e instanceof Error ? e.message : String(e)}` },
      { status: 502 },
    )
  }

  // ── 3. Download markscheme PDF (non-fatal if missing or corrupt) ──────────
  let msText: string | null = null
  if (paper.markscheme_pdf_url) {
    try {
      msText = await fetchPdfText(paper.markscheme_pdf_url)
    } catch {
      // Markscheme unavailable — proceed without it; no validation performed
    }
  }

  // ── 4. Extract metadata and validate paper ↔ markscheme match ────────────
  const paperMeta = extractPdfMetadata(paperText)
  let validation: ValidationResult

  if (msText) {
    const markschemeMeta = extractPdfMetadata(msText)
    validation = validatePaperMarkscheme(paperMeta, markschemeMeta)

    if (validation.status === "mismatch") {
      return Response.json(
        {
          error: validation.mismatches[0],
          mismatches: validation.mismatches,
          validation: {
            status: validation.status,
            mismatches: validation.mismatches,
          },
        },
        { status: 422 },
      )
    }
  } else {
    validation = { status: "no_markscheme", paperMeta, mismatches: [] }
  }

  // ── 5. Extract MCQ questions ──────────────────────────────────────────────
  const extracted = extractQuestions(paperText)
  if (extracted.length === 0) {
    return Response.json(
      { error: "No MCQ questions detected in this PDF. Check that it is a multiple-choice paper." },
      { status: 422 },
    )
  }

  // ── 6. Extract answers from markscheme ───────────────────────────────────
  let answers: Record<number, string> = {}
  if (msText) {
    answers = extractAnswers(msText)
  }

  // ── 7. Replace existing questions for this subject + year ────────────────
  await db
    .from("questions")
    .delete()
    .eq("subject", paper.subject)
    .eq("year", paper.year)

  const rows = extracted.map((q) => ({
    question: q.question,
    option_a: q.optionA,
    option_b: q.optionB,
    option_c: q.optionC,
    option_d: q.optionD,
    correct_answer: answers[q.orderNumber] ?? null,
    subject: paper.subject,
    year: paper.year,
    order_number: q.orderNumber,
  }))

  const { error: insertErr } = await db.from("questions").insert(rows)
  if (insertErr) {
    return Response.json(
      { error: `Failed to save questions: ${insertErr.message}` },
      { status: 500 },
    )
  }

  const answeredCount = rows.filter((r) => r.correct_answer).length

  return Response.json({
    extracted: rows.length,
    answered: answeredCount,
    validation: {
      status: validation.status,
      mismatches: validation.mismatches,
    },
  })
}

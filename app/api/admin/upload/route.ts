import { NextRequest } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function extractStoragePath(fileUrl: string, bucket: "papers" | "markschemes"): string | null {
  const marker = `/object/public/${bucket}/`
  const idx = fileUrl.indexOf(marker)
  return idx !== -1 ? decodeURIComponent(fileUrl.slice(idx + marker.length)) : null
}

async function verifyAdmin(token: string) {
  const db = getSupabaseAdmin()
  const { data: { user }, error } = await db.auth.getUser(token)
  if (error || !user || !user.user_metadata?.is_admin) return null
  return user
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await verifyAdmin(token)
  if (!user) return Response.json({ error: "Forbidden — not an admin" }, { status: 403 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 })
  }

  const paperFile = form.get("paperFile") as File | null
  const markschemeFile = form.get("markschemeFile") as File | null
  const metaRaw = form.get("meta") as string | null

  if (!paperFile || !metaRaw) {
    return Response.json({ error: "Missing file or metadata" }, { status: 400 })
  }

  const meta = JSON.parse(metaRaw) as {
    title: string; grade: string; subject: string; year: string
    session: string; paperType: string; examBoard: string
  }

  const db = getSupabaseAdmin()
  const safeFilename = paperFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const paperPath = `${meta.grade}/${meta.subject}/${meta.year}/${Date.now()}-${safeFilename}`

  const { error: paperErr } = await db.storage
    .from("papers")
    .upload(paperPath, Buffer.from(await paperFile.arrayBuffer()), {
      contentType: paperFile.type || "application/pdf",
      upsert: false,
    })

  if (paperErr) {
    return Response.json({ error: paperErr.message }, { status: 500 })
  }

  const { data: paperUrlData } = db.storage.from("papers").getPublicUrl(paperPath)

  let markschemeUrl: string | null = null
  if (markschemeFile) {
    const safeMsName = markschemeFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const msPath = `${meta.grade}/${meta.subject}/${meta.year}/${Date.now()}-${safeMsName}`

    const { error: msErr } = await db.storage
      .from("markschemes")
      .upload(msPath, Buffer.from(await markschemeFile.arrayBuffer()), {
        contentType: markschemeFile.type || "application/pdf",
        upsert: false,
      })

    if (!msErr) {
      const { data: msUrlData } = db.storage.from("markschemes").getPublicUrl(msPath)
      markschemeUrl = msUrlData.publicUrl
    }
  }

  const { error: dbErr } = await db.from("papers").insert({
    title: meta.title?.trim() || null,
    grade: meta.grade,
    subject: meta.subject,
    year: parseInt(meta.year, 10),
    session: meta.session || null,
    paper_type: meta.paperType || null,
    exam_board: meta.examBoard || null,
    paper_pdf_url: paperUrlData.publicUrl,
    markscheme_pdf_url: markschemeUrl,
  })

  if (dbErr) {
    await db.storage.from("papers").remove([paperPath])
    if (markschemeUrl) {
      const msPath = extractStoragePath(markschemeUrl, "markschemes")
      if (msPath) await db.storage.from("markschemes").remove([msPath])
    }
    return Response.json({ error: dbErr.message }, { status: 500 })
  }

  return Response.json({ success: true })
}

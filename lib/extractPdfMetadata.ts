export interface PdfMetadata {
  subject: string | null
  paperCode: string | null  // e.g. "0610"
  variant: string | null    // e.g. "12"  (from "0610/12")
  year: string | null       // e.g. "2025"
  session: string | null    // e.g. "May/June"
}

export interface ValidationResult {
  status: "match" | "mismatch" | "no_markscheme"
  paperMeta: PdfMetadata
  markschemeMeta?: PdfMetadata
  mismatches: string[]
}

// ── Pattern tables ─────────────────────────────────────────────────────────────

const SUBJECT_PATTERNS: [RegExp, string][] = [
  [/\bBIOLOG(?:Y|IES)\b/i, "Biology"],
  [/\bCHEMISTR(?:Y|IES)\b/i, "Chemistry"],
  [/\bPHYSICS\b/i, "Physics"],
  [/\bMATHEMAT(?:ICS)\b/i, "Mathematics"],
  [/\bENGLISH\b/i, "English"],
  [/\bHISTORY\b/i, "History"],
]

const SESSION_PATTERNS: [RegExp, string][] = [
  [/May\s*[\/\-]\s*June/i, "May/June"],
  [/October\s*[\/\-]\s*November/i, "October/November"],
  [/\bJanuary\b/i, "January"],
  [/\bMarch\b/i, "March"],
]

// ── Extractor ──────────────────────────────────────────────────────────────────

/**
 * Extracts structured metadata from the first ~2 000 characters of a
 * Cambridge exam PDF (paper or markscheme). Tolerant of extra whitespace,
 * newlines, and ™ / ® noise common in scanned or digitally-printed PDFs.
 *
 * Returned fields are null when the pattern is not found — callers should
 * treat null as "unknown" rather than a mismatch.
 */
export function extractPdfMetadata(rawText: string): PdfMetadata {
  // Normalise line endings, collapse multi-space runs, scan only title area
  const text = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .slice(0, 2000)

  // Paper code + variant: "0610/12" or "0610 / 12"
  // The regex requires exactly 4 digits, an optional-whitespace-padded slash,
  // then 2–3 digits. This avoids matching internal references like "12/4RP".
  const codeMatch = text.match(/\b(\d{4})\s*\/\s*(\d{2,3})\b/)
  const paperCode = codeMatch?.[1] ?? null
  const variant = codeMatch?.[2] ?? null

  // Year: first four-digit year in the 20xx range
  const year = text.match(/\b(20\d{2})\b/)?.[1] ?? null

  // Session
  let session: string | null = null
  for (const [rx, label] of SESSION_PATTERNS) {
    if (rx.test(text)) { session = label; break }
  }

  // Subject
  let subject: string | null = null
  for (const [rx, label] of SUBJECT_PATTERNS) {
    if (rx.test(text)) { subject = label; break }
  }

  return { subject, paperCode, variant, year, session }
}

// ── Validator ──────────────────────────────────────────────────────────────────

/**
 * Compares metadata extracted from a paper and its markscheme.
 * Returns a ValidationResult describing any field-level mismatches.
 *
 * Rules:
 *  - If we cannot extract a paperCode from either document, skip that check
 *    (partial data is treated as a pass rather than a false rejection).
 *  - Paper code + variant are validated together ("0610/12").
 *  - Year is validated independently.
 *  - Subject and session are informational and not enforced.
 */
export function validatePaperMarkscheme(
  paperMeta: PdfMetadata,
  markschemeMeta: PdfMetadata,
): ValidationResult {
  const mismatches: string[] = []

  const hasBothCodes = paperMeta.paperCode && markschemeMeta.paperCode
  const hasBothVariants = paperMeta.variant && markschemeMeta.variant
  const hasBothYears = paperMeta.year && markschemeMeta.year

  if (hasBothCodes) {
    if (hasBothVariants) {
      const paperFull = `${paperMeta.paperCode}/${paperMeta.variant}`
      const msFull = `${markschemeMeta.paperCode}/${markschemeMeta.variant}`
      if (paperFull !== msFull) {
        mismatches.push(
          `Markscheme variant ${msFull} does not match paper ${paperFull}`,
        )
      }
    } else if (paperMeta.paperCode !== markschemeMeta.paperCode) {
      mismatches.push(
        `Paper code mismatch: paper is ${paperMeta.paperCode}, markscheme is ${markschemeMeta.paperCode}`,
      )
    }
  }

  if (hasBothYears && paperMeta.year !== markschemeMeta.year) {
    mismatches.push(
      `Year mismatch between paper (${paperMeta.year}) and markscheme (${markschemeMeta.year})`,
    )
  }

  return {
    status: mismatches.length === 0 ? "match" : "mismatch",
    paperMeta,
    markschemeMeta,
    mismatches,
  }
}

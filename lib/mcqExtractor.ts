export interface ExtractedQuestion {
  orderNumber: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

// A line that is entirely an option marker: A/B/C/D + optional punct + space + non-whitespace
const OPTION_LINE = /^[ \t]*[A-D][ \t]*[.):\-–]?[ \t]+\S/

// A line that starts a numbered question (1–100), but is NOT an option line
const QNUM_LINE = /^[ \t]*(\d{1,3})[ \t]*[.):]?[ \t]+\S/

/**
 * Extracts MCQ questions from plain text produced by pdf-parse.
 *
 * Splits text into numbered blocks (1…N), locates the A/B/C/D option
 * markers within each block, and slices out question + option text.
 * Blocks without all four options are skipped (not MCQs).
 *
 * Handles options on separate lines and two-column inline layouts.
 */
export function extractQuestions(rawText: string): ExtractedQuestion[] {
  const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = text.split("\n")

  // ── 1. Segment into question blocks ──────────────────────────────────────
  // Two guards against false positives:
  //  a) Min-text-length: the text on the question-start line (after stripping
  //     the number prefix) must be ≥ 10 chars. This rejects "45 minutes" from
  //     the paper header (rest of line = "minutes" = 7 chars).
  //  b) Monotonicity: only accept a number strictly greater than the last
  //     accepted block number. This prevents numbered sub-items inside a question
  //     (e.g. "1  They can make complex molecules." inside Q38) from being
  //     treated as a new top-level block after we've already passed Q38.
  const MIN_QTEXT = 10
  const blocks: { num: number; lines: string[] }[] = []
  let current: { num: number; lines: string[] } | null = null
  let lastBlockNum = 0

  for (const line of lines) {
    const isOption = OPTION_LINE.test(line)
    const qm = !isOption && line.match(QNUM_LINE)
    if (qm) {
      const num = parseInt(qm[1], 10)
      const textAfterNum = line.replace(/^[ \t]*\d{1,3}[ \t]*[.):]?[ \t]+/, "").trim()
      if (num >= 1 && num <= 100 && num > lastBlockNum && textAfterNum.length >= MIN_QTEXT) {
        if (current) blocks.push(current)
        current = { num, lines: [line] }
        lastBlockNum = num
        continue
      }
    }
    if (current) current.lines.push(line)
  }
  if (current) blocks.push(current)

  // ── 2. Parse options from each block ──────────────────────────────────────
  const questions: ExtractedQuestion[] = []

  for (const block of blocks) {
    const blockText = block.lines.join("\n")

    // For each option letter, record where its marker begins (markerStart)
    // and where its text content begins (contentStart = after the marker).
    // When slicing option i's text we use [contentStart_i, markerStart_{i+1}]
    // so that the next option's marker is NOT included in the previous option's text.
    const optPos: { letter: string; markerStart: number; contentStart: number }[] = []

    for (const letter of ["A", "B", "C", "D"]) {
      // Prefer a line-start match; fall back to inline (two-column layouts)
      const lineStartRx = new RegExp(`(?:^|\\n)[ \\t]*${letter}[ \\t]*[.):–\\-]?[ \\t]+`, "m")
      const inlineRx = new RegExp(`[ \\t]{2,}${letter}[ \\t]*[.):–\\-]?[ \\t]+`)

      const m = blockText.match(lineStartRx) ?? blockText.match(inlineRx)
      if (!m || m.index === undefined) continue

      optPos.push({
        letter,
        markerStart: m.index,
        contentStart: m.index + m[0].length,
      })
    }

    if (optPos.length < 4) continue

    // Sort by position so we can slice between consecutive entries
    optPos.sort((a, b) => a.markerStart - b.markerStart)

    const opts: Record<string, string> = {}
    for (let i = 0; i < optPos.length; i++) {
      const start = optPos[i].contentStart
      // End at the next option's *marker* start (not its content start),
      // so we don't include the next marker in this option's text.
      const end = i + 1 < optPos.length ? optPos[i + 1].markerStart : blockText.length
      opts[optPos[i].letter] = blockText.slice(start, end).replace(/\s+/g, " ").trim()
    }

    if (!opts.A || !opts.B || !opts.C || !opts.D) continue

    // Question text: everything before A's marker, stripped of leading question number
    const qRaw = blockText
      .slice(0, optPos[0].markerStart)
      .replace(/^[ \t]*\d{1,3}[ \t]*[.):]?[ \t]*/, "")
      .replace(/\s+/g, " ")
      .trim()

    if (!qRaw) continue

    questions.push({
      orderNumber: block.num,
      question: qRaw,
      optionA: opts.A,
      optionB: opts.B,
      optionC: opts.C,
      optionD: opts.D,
    })
  }

  return questions
}

/**
 * Extracts answer key from markscheme text.
 * Recognises lines of the form:  "1   B"  /  "1. B"  /  "1) B"
 * Returns a map of question number → answer letter.
 */
export function extractAnswers(rawText: string): Record<number, string> {
  const answers: Record<number, string> = {}
  for (const line of rawText.split(/\r?\n/)) {
    const m = line.match(/^[ \t]*(\d{1,3})[ \t]*[.):]?[ \t]+([A-D])[ \t]*$/)
    if (m) answers[parseInt(m[1], 10)] = m[2]
  }
  return answers
}

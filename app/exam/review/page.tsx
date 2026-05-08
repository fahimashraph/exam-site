"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

type Question = {
  question: string
  correct_answer: string
  [key: string]: any
}

type ExamConfig = {
  subject: string
  subjectName: string
  year: number
  mode: "practice" | "exam"
}

type Filter = "all" | "correct" | "wrong" | "skipped"

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function getGrade(pct: number) {
  if (pct >= 80) return { letter: "A", color: "text-emerald-400", pill: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" }
  if (pct >= 70) return { letter: "B", color: "text-indigo-400",  pill: "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"   }
  if (pct >= 60) return { letter: "C", color: "text-amber-400",   pill: "bg-amber-500/15 border-amber-500/25 text-amber-400"     }
  if (pct >= 50) return { letter: "D", color: "text-orange-400",  pill: "bg-orange-500/15 border-orange-500/25 text-orange-400"  }
  return               { letter: "F", color: "text-red-400",      pill: "bg-red-500/15 border-red-500/25 text-red-400"           }
}

function LogoMark() {
  return (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function SpinnerScreen() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <p className="text-white/30 text-sm">Loading your results…</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// REVIEW CONTENT
// ─────────────────────────────────────────────────────────────────

function ReviewContent() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [config, setConfig] = useState<ExamConfig | null>(null)
  const [filter, setFilter] = useState<Filter>("all")

  // ── ALL ORIGINAL LOGIC PRESERVED ────────────────────────────
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("examData") || "{}")
    setAnswers(data.answers || {})
    setQuestions(data.questions || [])

    const cfg = localStorage.getItem("examConfig")
    if (cfg) setConfig(JSON.parse(cfg))
  }, [])

  const total = questions.length
  let score = 0
  questions.forEach((q, i) => {
    if (answers[i] === q.correct_answer) score++
  })
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  // ────────────────────────────────────────────────────────────

  const isPassing = percentage >= 50
  const correctCount = score
  const wrongCount = Object.keys(answers).filter(
    (k) => answers[Number(k)] !== questions[Number(k)]?.correct_answer
  ).length
  const skippedCount = total - Object.keys(answers).length
  const grade = getGrade(percentage)

  // Filtered question list
  const filtered = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => {
      const ua = answers[i]
      const isCorrect = ua === q.correct_answer
      const isSkipped = !ua
      if (filter === "correct") return isCorrect
      if (filter === "wrong") return !isCorrect && !isSkipped
      if (filter === "skipped") return isSkipped
      return true
    })

  if (questions.length === 0) return <SpinnerScreen />

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[5%] w-[450px] h-[450px] rounded-full bg-indigo-600/9 blur-[110px]" />
        <div className="absolute bottom-[15%] left-[5%] w-[350px] h-[350px] rounded-full bg-violet-600/7 blur-[90px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#0A0A0F]/90 backdrop-blur-md sticky top-0">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-sm font-semibold text-white/65 hidden sm:block">ExamPrep</span>
            {config && (
              <div className="hidden sm:flex items-center gap-1.5 ml-1">
                <span className="text-white/15">·</span>
                <span className="text-[8px] font-bold tracking-[0.14em] uppercase bg-white/[0.05] border border-white/[0.08] text-white/40 px-2 py-0.5 rounded-md">
                  {config.subjectName}
                </span>
                <span className="text-[8px] font-bold tracking-[0.14em] uppercase bg-white/[0.05] border border-white/[0.08] text-white/30 px-2 py-0.5 rounded-md">
                  {config.year}
                </span>
                <span className={`text-[7px] font-bold tracking-[0.14em] uppercase border px-2 py-0.5 rounded-md ${
                  config.mode === "practice"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/70"
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400/70"
                }`}>
                  {config.mode === "practice" ? "Practice" : "Exam"}
                </span>
              </div>
            )}
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.03] hover:bg-white/[0.07] px-3.5 py-2 rounded-xl transition-all duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 py-10 space-y-8">

        {/* ── SCORE CARD ── */}
        <div className="animate-fade-up">
          <div className={`relative rounded-2xl p-7 sm:p-8 border overflow-hidden ${
            isPassing
              ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/[0.04] border-emerald-500/25"
              : "bg-gradient-to-br from-red-500/10 to-orange-500/[0.04] border-red-500/20"
          }`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent ${isPassing ? "via-emerald-400/60" : "via-red-400/50"} to-transparent`} />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* Score ring */}
              <div className="relative shrink-0">
                <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={isPassing ? "#10b981" : "#ef4444"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{percentage}%</span>
                </div>
              </div>

              {/* Details */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
                  <p className={`text-xs font-bold tracking-widest uppercase ${isPassing ? "text-emerald-400" : "text-red-400"}`}>
                    {isPassing ? "Passed" : "Not yet"}
                  </p>
                  <span className={`text-[9px] font-bold tracking-[0.14em] uppercase border px-2 py-0.5 rounded-md ${grade.pill}`}>
                    Grade {grade.letter}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-1">
                  {score}{" "}
                  <span className="text-white/28 font-light text-2xl">/ {total}</span>
                </h1>

                <p className="text-white/38 text-sm font-light mb-5">
                  {isPassing
                    ? "Great work — you've passed this exam."
                    : "Keep practising — every attempt makes you stronger."}
                </p>

                {/* Stat pills */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">{correctCount} Correct</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-xs font-semibold text-red-400">{wrongCount} Wrong</span>
                  </div>
                  {skippedCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      <span className="text-xs font-semibold text-white/40">{skippedCount} Skipped</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/18" />
                    <span className="text-xs font-semibold text-white/32">{total} Total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex items-center gap-2 flex-wrap animate-fade-up">
          {(
            [
              { key: "all" as Filter, label: "All", count: total },
              { key: "correct" as Filter, label: "Correct", count: correctCount },
              { key: "wrong" as Filter, label: "Wrong", count: wrongCount },
              { key: "skipped" as Filter, label: "Skipped", count: skippedCount },
            ] as const
          ).map(({ key, label, count }) => {
            const active = filter === key
            const styles: Record<Filter, string> = {
              all: active
                ? "bg-white/[0.10] border-white/[0.18] text-white"
                : "text-white/38 border-white/[0.07] hover:text-white/65",
              correct: active
                ? "bg-emerald-500/15 border-emerald-500/32 text-emerald-400"
                : "text-white/38 border-white/[0.07] hover:text-white/65",
              wrong: active
                ? "bg-red-500/15 border-red-500/28 text-red-400"
                : "text-white/38 border-white/[0.07] hover:text-white/65",
              skipped: active
                ? "bg-white/[0.08] border-white/[0.16] text-white/60"
                : "text-white/38 border-white/[0.07] hover:text-white/65",
            }
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border bg-white/[0.03] text-xs font-semibold transition-all duration-200 ${styles[key]}`}
              >
                {label}
                <span className="opacity-55">({count})</span>
              </button>
            )
          })}
          <div className="flex-1 h-px bg-white/[0.06] hidden sm:block ml-2" />
          <span className="text-[9px] text-white/18 hidden sm:block">
            {filtered.length} of {total} shown
          </span>
        </div>

        {/* ── QUESTION LIST ── */}
        <div className="space-y-4 animate-fade-up">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/22 text-sm">No questions in this category.</div>
          )}

          {filtered.map(({ q, i }) => {
            const userAnswer = answers[i]
            const correctAns = q.correct_answer
            const isCorrect = userAnswer === correctAns
            const isUnanswered = !userAnswer

            return (
              <div
                key={i}
                className="rounded-2xl border overflow-hidden"
                style={{ animationDelay: `${i * 15}ms` }}
              >
                {/* Question header */}
                <div className={`px-5 sm:px-6 pt-5 pb-4 border-b flex items-start gap-3 ${
                  isUnanswered
                    ? "bg-white/[0.03] border-white/[0.06]"
                    : isCorrect
                    ? "bg-emerald-500/[0.055] border-emerald-500/15"
                    : "bg-red-500/[0.055] border-red-500/12"
                }`}>
                  {/* Status dot */}
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isUnanswered ? "bg-white/10" : isCorrect ? "bg-emerald-500/20" : "bg-red-500/20"
                  }`}>
                    {isUnanswered ? (
                      <span className="text-white/30 text-[9px] font-bold">–</span>
                    ) : isCorrect ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.5l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M3 3l4 4M7 3l-4 4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed flex-1">
                    <span className="text-white/28 font-normal mr-1.5">{i + 1}.</span>
                    {q.question}
                  </p>
                </div>

                {/* Options */}
                <div className={`px-5 sm:px-6 py-4 space-y-2 ${
                  isUnanswered ? "bg-white/[0.02]" : isCorrect ? "bg-emerald-500/[0.025]" : "bg-red-500/[0.025]"
                }`}>
                  {["A", "B", "C", "D"].map((opt) => {
                    const text = q[`option_${opt.toLowerCase()}`]
                    const isThisCorrect = opt === correctAns
                    const isThisUser = opt === userAnswer
                    const isWrongUser = isThisUser && !isThisCorrect

                    return (
                      <div
                        key={opt}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${
                          isThisCorrect
                            ? "bg-emerald-500/[0.15] border border-emerald-500/30 text-emerald-300"
                            : isWrongUser
                            ? "bg-red-500/[0.12] border border-red-500/25 text-red-300"
                            : "bg-white/[0.03] border border-white/[0.05] text-white/30"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isThisCorrect ? "bg-emerald-500/25 text-emerald-300"
                          : isWrongUser ? "bg-red-500/20 text-red-400"
                          : "bg-white/[0.06] text-white/22"
                        }`}>
                          {opt}
                        </span>
                        <span className="flex-1 leading-snug">{text}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isThisCorrect && isThisUser && (
                            <span className="text-[7px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                              ✓ Your answer
                            </span>
                          )}
                          {isThisCorrect && !isThisUser && (
                            <span className="text-[7px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                              Correct
                            </span>
                          )}
                          {isWrongUser && (
                            <span className="text-[7px] font-bold tracking-wider uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">
                              Your answer
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-up">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            Go to Dashboard
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="/exam"
            className="flex-1 flex items-center justify-center gap-2 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.14] text-white/55 hover:text-white font-medium text-sm py-3.5 rounded-xl transition-all duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8A5.5 5.5 0 112 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13.5 4.5V8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Exam
          </Link>
        </div>

      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PAGE SHELL
// ─────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  return (
    <Suspense fallback={<SpinnerScreen />}>
      <ReviewContent />
    </Suspense>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Suspense } from "react"
import Link from "next/link"

type Question = {
  question: string
  options: string[]
  correct_answer: string
  [key: string]: any
}

function ReviewContent() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [questionsFromExam, setQuestionsFromExam] = useState<Question[]>([])

  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("examData") || "{}")
    setAnswers(data.answers || [])
    setQuestionsFromExam(data.questions || [])
  }, [])

  const total = questionsFromExam.length
  let score = 0
  questionsFromExam.forEach((q, index) => {
    if (answers[index] === q.correct_answer) score++
  })
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  // ────────────────────────────────────────────────────────────────

  const isPassing = percentage >= 50
  const correct = score
  const incorrect = total - score

  if (questionsFromExam.length === 0) {
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
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <p className="text-white/35 text-sm">Loading your results…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[5%] w-[450px] h-[450px] rounded-full bg-indigo-600/9 blur-[110px]" />
        <div className="absolute bottom-[15%] left-[5%] w-[350px] h-[350px] rounded-full bg-violet-600/7 blur-[90px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-20 border-b border-white/[0.07] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80 hidden sm:block">ExamPrep</span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.03] hover:bg-white/[0.07] px-4 py-2 rounded-xl transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* ── SCORE CARD ── */}
        <div className="animate-fade-up">
          <div className={`relative rounded-2xl p-8 border overflow-hidden ${
            isPassing
              ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/25"
              : "bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20"
          }`}>
            {/* Top line */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent ${isPassing ? "via-emerald-400/60" : "via-red-400/50"} to-transparent`} />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Score circle */}
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
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{percentage}%</span>
                </div>
              </div>

              {/* Score details */}
              <div className="text-center sm:text-left flex-1">
                <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${isPassing ? "text-emerald-400" : "text-red-400"}`}>
                  {isPassing ? "Congratulations!" : "Keep Practicing"}
                </p>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {score} <span className="text-white/30 font-light text-2xl">/ {total}</span>
                </h1>
                <p className="text-white/40 text-sm font-light mb-5">
                  {isPassing
                    ? "Great work — you've passed this exam."
                    : "You didn't pass this time, but you're making progress."}
                </p>

                {/* Stat pills */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">{correct} Correct</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-xs font-semibold text-red-400">{incorrect} Incorrect</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    <span className="text-xs font-semibold text-white/40">{total} Total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION LABEL ── */}
        <div className="flex items-center gap-3 animate-fade-up animate-fade-up-1">
          <p className="text-xs font-bold tracking-widest uppercase text-white/30">Question Review</p>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* ── QUESTION REVIEW LIST ── */}
        <div className="space-y-4">
          {questionsFromExam.map((q, index) => {
            const userAnswer = answers[index]
            const correct = q.correct_answer
            const isCorrect = userAnswer === correct
            const isUnanswered = !userAnswer

            return (
              <div
                key={index}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 animate-fade-up`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Question header */}
                <div className={`px-6 pt-5 pb-4 border-b ${
                  isUnanswered
                    ? "bg-white/[0.03] border-white/[0.06]"
                    : isCorrect
                    ? "bg-emerald-500/[0.06] border-emerald-500/15"
                    : "bg-red-500/[0.06] border-red-500/12"
                }`}>
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isUnanswered
                        ? "bg-white/10"
                        : isCorrect
                        ? "bg-emerald-500/20"
                        : "bg-red-500/20"
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

                    <p className="text-sm font-semibold text-white leading-relaxed">
                      <span className="text-white/30 font-normal mr-1">{index + 1}.</span>
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className={`px-6 py-4 space-y-2 ${
                  isUnanswered ? "bg-white/[0.02]" : isCorrect ? "bg-emerald-500/[0.03]" : "bg-red-500/[0.03]"
                }`}>
                  {["A", "B", "C", "D"].map((opt) => {
                    const text = q[`option_${opt.toLowerCase()}` as keyof typeof q]
                    const isThisCorrect = opt === correct
                    const isThisUser = opt === userAnswer
                    const isWrongUser = isThisUser && !isThisCorrect

                    return (
                      <div
                        key={opt}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                          isThisCorrect
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            : isWrongUser
                            ? "bg-red-500/12 border border-red-500/25 text-red-300"
                            : "bg-white/[0.03] border border-white/[0.05] text-white/35"
                        }`}
                      >
                        {/* Letter badge */}
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isThisCorrect
                            ? "bg-emerald-500/25 text-emerald-300"
                            : isWrongUser
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/[0.06] text-white/25"
                        }`}>
                          {opt}
                        </span>

                        <span className="flex-1 leading-snug">{text}</span>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isThisCorrect && (
                            <span className="text-[9px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                              Correct
                            </span>
                          )}
                          {isWrongUser && (
                            <span className="text-[9px] font-bold tracking-wider uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">
                              Your answer
                            </span>
                          )}
                          {isThisUser && isThisCorrect && (
                            <span className="text-[9px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                              ✓ Yours
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
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="/exam"
            className="flex-1 flex items-center justify-center gap-2 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.14] text-white/60 hover:text-white font-medium text-sm py-3.5 rounded-xl transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8A5.5 5.5 0 112 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13.5 8V4.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retake Exam
          </Link>
        </div>

      </main>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
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
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  )
}

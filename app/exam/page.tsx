"use client";
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ExamPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [timeLeft, setTimeLeft] = useState(5400) // 1h 30min
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────
  const fetchQuestions = async () => {
    const { data, error } = await supabase.from("questions").select("*")
    if (!error) setQuestions(data)
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!submitted) handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (option: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: option })
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    let newScore = 0
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) newScore++
    })
    setScore(newScore)
    setSubmitted(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) return

    const { error } = await supabase.from("results").insert([
      {
        user_id: authData.user.id,
        score: newScore,
        total: questions.length,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Save error:", error)
    } else {
      console.log("Result saved!")
      console.log("QUESTIONS SENT:", questions)
      localStorage.setItem("examData", JSON.stringify({ answers, questions }))
      window.location.href = "/exam/review"
    }
  }
  // ────────────────────────────────────────────────────────────────

  const minutes = Math.floor(timeLeft / 60)
  const seconds = (timeLeft % 60).toString().padStart(2, "0")
  const isWarning = timeLeft < 300 // last 5 min
  const isCritical = timeLeft < 60  // last 1 min
  const answeredCount = Object.keys(answers).length
  const progressPct = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Loading state
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[110px]" />
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm mb-1">Preparing your exam</p>
            <p className="text-white/35 text-xs">Loading questions…</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-violet-600/6 blur-[90px]" />
      </div>

      {/* ── TOP HEADER BAR ── */}
      <header className="relative z-20 border-b border-white/[0.07] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80 hidden sm:block">ExamPrep</span>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 flex-1 max-w-xs mx-auto">
            <span className="text-xs text-white/35 shrink-0 font-medium tabular-nums">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
            <div className="flex-1 h-1 bg-white/[0.07] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-white/35 shrink-0 font-medium">
              {answeredCount} answered
            </span>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold tabular-nums shrink-0 transition-all duration-300 ${
              isCritical
                ? "bg-red-500/15 border-red-500/30 text-red-400"
                : isWarning
                ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                : "bg-white/[0.04] border-white/[0.08] text-white/70"
            }`}
            style={isCritical ? { animation: "timer-warn 1s ease-in-out infinite" } : {}}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {minutes}:{seconds}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10">

        {/* Submitted score banner */}
        {submitted && (
          <div className="mb-8 animate-fade-up">
            <div className="bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/25 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
              <p className="text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-2">Exam Complete</p>
              <h2 className="text-3xl font-bold text-white mb-1">
                {score} <span className="text-white/30 font-light">/ {questions.length}</span>
              </h2>
              <p className="text-white/40 text-sm mb-5">
                {Math.round((score / questions.length) * 100)}% — redirecting to review…
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/15 hover:bg-white/15 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
              >
                Go to Dashboard
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Question card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden animate-fade-up">

          {/* Question number label */}
          <div className="px-7 pt-7 pb-0">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-indigo-400/80">
              Question {currentQuestionIndex + 1}
            </span>
          </div>

          {/* Question text */}
          <div className="px-7 pt-4 pb-7">
            <p className="text-lg font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mx-7" />

          {/* Options */}
          <div className="p-7 space-y-3">
            {["A", "B", "C", "D"].map((opt) => {
              const value = currentQuestion[`option_${opt.toLowerCase()}`]
              const isSelected = answers[currentQuestionIndex] === opt

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={submitted}
                  className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 group ${
                    isSelected
                      ? "bg-indigo-500/15 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                      : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.14] disabled:hover:bg-white/[0.03] disabled:hover:border-white/[0.07]"
                  } disabled:cursor-not-allowed`}
                >
                  {/* Option letter badge */}
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                      isSelected
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                        : "bg-white/[0.06] text-white/40 group-hover:bg-white/10 group-hover:text-white/60"
                    }`}
                  >
                    {opt}
                  </span>

                  {/* Option text */}
                  <span
                    className={`text-sm leading-relaxed transition-colors duration-200 ${
                      isSelected ? "text-white font-medium" : "text-white/60 group-hover:text-white/80"
                    }`}
                  >
                    {value}
                  </span>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="ml-auto shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="rgba(99,102,241,0.3)"/>
                        <path d="M5 8.5l2 2 4-4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        <div className="flex items-center justify-between mt-6 animate-fade-up animate-fade-up-2">

          {/* Previous */}
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.14] text-white/60 hover:text-white text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03] disabled:hover:border-white/[0.08] disabled:hover:text-white/60"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Previous
          </button>

          {/* Question dot navigator */}
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.slice(0, Math.min(questions.length, 12)).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === currentQuestionIndex
                    ? "w-4 h-2 bg-indigo-400"
                    : answers[i]
                    ? "w-2 h-2 bg-indigo-500/40"
                    : "w-2 h-2 bg-white/15 hover:bg-white/30"
                }`}
              />
            ))}
            {questions.length > 12 && (
              <span className="text-xs text-white/25 ml-1">+{questions.length - 12}</span>
            )}
          </div>

          {/* Next / Submit */}
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitted ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                    <path d="M14 8A6 6 0 002 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  Submit Exam
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 text-sm font-medium transition-all duration-200"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Answered progress footer */}
        <div className="mt-8 flex items-center justify-center gap-2 animate-fade-up animate-fade-up-3">
          <div className="h-1 w-32 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-white/25 font-medium">
            {answeredCount} of {questions.length} answered
          </span>
        </div>

      </main>
    </div>
  )
}

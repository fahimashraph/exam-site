"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

type Question = {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  subject?: string
  year?: number
  order_number?: number
  [key: string]: any
}

type ExamConfig = {
  subject: string
  subjectName: string
  year: number
  mode: "practice" | "exam"
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const EXAM_DURATION = 5400 // 90 min in seconds
const OPTIONS = ["A", "B", "C", "D"] as const

// ─────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────

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

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[110px] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm mb-1">{message}</p>
          <p className="text-white/35 text-xs">Please wait…</p>
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

// ─────────────────────────────────────────────────────────────────
// QUESTION NAVIGATOR DRAWER
// ─────────────────────────────────────────────────────────────────

function QuestionNav({
  questions,
  currentIndex,
  answers,
  mode,
  practiceResults,
  onJump,
  onClose,
}: {
  questions: Question[]
  currentIndex: number
  answers: Record<number, string>
  mode: "practice" | "exam"
  practiceResults: Record<number, boolean>
  onJump: (i: number) => void
  onClose: () => void
}) {
  const answered = Object.keys(answers).length
  const correctCount = Object.values(practiceResults).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close navigator"
      />

      {/* Drawer */}
      <div className="relative z-10 ml-auto w-full max-w-[300px] bg-[#0D0D15] border-l border-white/[0.08] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between shrink-0">
          <div>
            <p className="text-sm font-bold text-white">Navigator</p>
            <p className="text-xs text-white/35 mt-0.5">
              {answered} / {questions.length} answered
              {mode === "practice" && answered > 0 && (
                <span className="text-emerald-400/70"> · {correctCount} correct</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-b border-white/[0.05] flex flex-wrap gap-x-3 gap-y-1.5 shrink-0">
          {[
            { dot: "bg-white/20", label: "Unanswered" },
            { dot: "bg-indigo-500/70", label: "Answered" },
            ...(mode === "practice"
              ? [
                  { dot: "bg-emerald-500/70", label: "Correct" },
                  { dot: "bg-red-500/70", label: "Wrong" },
                ]
              : []),
            { dot: "ring-2 ring-indigo-400 bg-indigo-500/20", label: "Current" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${item.dot}`} />
              <span className="text-[9px] text-white/30">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined
              const isCurrent = i === currentIndex
              const isCorrect = practiceResults[i] === true
              const isWrong = practiceResults[i] === false

              let cls = "bg-white/[0.07] text-white/30 hover:bg-white/[0.13]"
              if (isCurrent)
                cls = "ring-2 ring-indigo-400 bg-indigo-500/20 text-indigo-300"
              else if (mode === "practice" && isCorrect)
                cls = "bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/35"
              else if (mode === "practice" && isWrong)
                cls = "bg-red-500/25 text-red-300 hover:bg-red-500/35"
              else if (isAnswered)
                cls = "bg-indigo-500/22 text-indigo-300 hover:bg-indigo-500/32"

              return (
                <button
                  key={i}
                  onClick={() => { onJump(i); onClose() }}
                  className={`h-9 rounded-lg text-xs font-bold transition-all duration-150 ${cls}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// SUBMIT CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────

function SubmitModal({
  total,
  answered,
  onConfirm,
  onCancel,
}: {
  total: number
  answered: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const unanswered = total - answered
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-[#0D0D15] border border-white/[0.10] rounded-2xl p-7 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

        <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-5 mx-auto">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3l7.5 14H2.5L10 3z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M10 8v4M10 13.5v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className="text-lg font-bold text-white text-center mb-1">Submit your exam?</h2>
        <p className="text-sm text-white/40 text-center font-light mb-1">
          You&apos;ve answered{" "}
          <span className="text-white/75 font-semibold">{answered}</span> of{" "}
          <span className="text-white/75 font-semibold">{total}</span> questions.
        </p>
        {unanswered > 0 && (
          <p className="text-xs text-amber-400/80 text-center mb-5">
            {unanswered} unanswered question{unanswered > 1 ? "s" : ""} will be marked incorrect.
          </p>
        )}
        {unanswered === 0 && <div className="mb-5" />}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/55 hover:text-white text-sm font-medium transition-all duration-200"
          >
            Keep going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────

export default function ExamSessionPage() {
  const router = useRouter()

  const [config, setConfig] = useState<ExamConfig | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showNav, setShowNav] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Practice-mode per-question feedback
  const [practiceResults, setPracticeResults] = useState<Record<number, boolean>>({})
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set())

  // Guard against double-submit
  const submittedRef = useRef(false)

  // ── CONFIG + QUESTIONS ──────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("examConfig")
    if (!raw) { router.push("/exam"); return }
    const cfg: ExamConfig = JSON.parse(raw)
    setConfig(cfg)

    const load = async () => {
      // ── ORIGINAL SUPABASE LOGIC — extended with subject/year filter ──
      // Try to fetch questions filtered by subject + year in official order.
      // Falls back to all questions so dev/demo works before real papers exist.
      const { data: filtered, error } = await supabase
        .from("questions")
        .select("*")
        .eq("subject", cfg.subject)
        .eq("year", cfg.year)
        .order("order_number", { ascending: true })

      if (!error && filtered && filtered.length > 0) {
        setQuestions(filtered)
      } else {
        // Fallback: load all questions (preserves original behaviour)
        const { data: all } = await supabase
          .from("questions")
          .select("*")
          .order("id", { ascending: true })
        if (all) setQuestions(all)
      }
      setLoading(false)
    }
    load()
  }, [router])

  // ── TIMER (real exam mode only) ─────────────────────────────
  useEffect(() => {
    if (!config || config.mode !== "exam" || submitted || loading) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!submittedRef.current) doSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, submitted, loading])

  // ── ANSWER SELECTION ────────────────────────────────────────
  function handleAnswer(opt: string) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: opt }))

    // Practice: reveal immediately on first answer
    if (config?.mode === "practice" && !revealedSet.has(currentIndex)) {
      const correct = opt === questions[currentIndex]?.correct_answer
      setPracticeResults((prev) => ({ ...prev, [currentIndex]: correct }))
      setRevealedSet((prev) => new Set(prev).add(currentIndex))
    }
  }

  // ── SUBMIT ──────────────────────────────────────────────────
  // useCallback keeps a stable reference so the timer closure always calls
  // the latest version without stale-closure issues.
  const doSubmit = useCallback(
    async (_auto = false) => {
      if (submittedRef.current) return
      submittedRef.current = true
      setSubmitted(true)
      setShowConfirm(false)

      // ── SCORING — original logic preserved exactly ──
      let newScore = 0
      questions.forEach((q, i) => {
        if (answers[i] === q.correct_answer) newScore++
      })
      setScore(newScore)

      // ── SUPABASE INSERT — original logic preserved exactly ──
      const { data: authData } = await supabase.auth.getUser()
      if (authData?.user) {
        const { error } = await supabase.from("results").insert([
          {
            user_id: authData.user.id,
            score: newScore,
            total: questions.length,
            created_at: new Date().toISOString(),
          },
        ])
        if (error) console.error("Save error:", error)
        else console.log("Result saved!")
      }

      // ── LOCALSTORAGE — original logic preserved exactly ──
      localStorage.setItem("examData", JSON.stringify({ answers, questions }))
      window.location.href = "/exam/review"
    },
    [answers, questions]
  )

  // ── DERIVED VALUES ──────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, "0")
  const isWarning = timeLeft < 300
  const isCritical = timeLeft < 60
  const isPractice = config?.mode === "practice"
  const isRevealed = revealedSet.has(currentIndex)

  // ── GUARDS ──────────────────────────────────────────────────
  if (loading || !config) return <LoadingScreen message="Preparing your exam" />
  if (!currentQuestion) return <LoadingScreen message="Loading questions" />

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-violet-600/6 blur-[90px]" />
      </div>

      {/* Overlays */}
      {showNav && (
        <QuestionNav
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          mode={config.mode}
          practiceResults={practiceResults}
          onJump={setCurrentIndex}
          onClose={() => setShowNav(false)}
        />
      )}
      {showConfirm && (
        <SubmitModal
          total={questions.length}
          answered={answeredCount}
          onConfirm={() => doSubmit(false)}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ── STICKY HEADER ── */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#0A0A0F]/90 backdrop-blur-md sticky top-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2.5">

          {/* Logo */}
          <Link href="/dashboard" className="shrink-0 mr-1"><LogoMark /></Link>

          {/* Context badges */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase bg-white/[0.05] border border-white/[0.08] text-white/45 px-2 py-1 rounded-md">
              {config.subjectName}
            </span>
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase bg-white/[0.05] border border-white/[0.08] text-white/35 px-2 py-1 rounded-md">
              {config.year}
            </span>
            {isPractice ? (
              <span className="text-[8px] font-bold tracking-[0.14em] uppercase bg-emerald-500/12 border border-emerald-500/22 text-emerald-400/80 px-2 py-1 rounded-md">
                Practice
              </span>
            ) : (
              <span className="text-[8px] font-bold tracking-[0.14em] uppercase bg-indigo-500/12 border border-indigo-500/22 text-indigo-400/80 px-2 py-1 rounded-md">
                Exam
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[10px] text-white/28 shrink-0 font-mono tabular-nums">
              {currentIndex + 1}/{questions.length}
            </span>
            <div className="flex-1 h-1 bg-white/[0.07] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-white/28 shrink-0">{answeredCount} ans.</span>
          </div>

          {/* Timer — real exam mode only */}
          {!isPractice && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-sm font-bold tabular-nums shrink-0 transition-all duration-300 ${
                isCritical
                  ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : isWarning
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-white/[0.05] border-white/[0.09] text-white/65"
              }`}
              style={isCritical ? { animation: "timer-warn 1s ease-in-out infinite" } : {}}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {minutes}:{seconds}
            </div>
          )}

          {/* Navigator toggle */}
          <button
            onClick={() => setShowNav(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] text-white/45 hover:text-white text-xs font-medium transition-all duration-200 shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="7" width="9" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="11" width="11" height="2" rx="1" fill="currentColor"/>
            </svg>
            <span className="hidden sm:inline">Questions</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Practice mode indicator */}
        {isPractice && (
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400/75 font-medium">
              Practice Mode — answers revealed on selection
            </span>
          </div>
        )}

        {/* ── QUESTION CARD ── */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden mb-5 animate-fade-up">

          {/* Q number + practice result badge */}
          <div className="px-6 sm:px-8 pt-6 pb-0 flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-indigo-400/75">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {isPractice && isRevealed && (
              <span
                className={`text-[8px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-lg border shrink-0 ${
                  practiceResults[currentIndex]
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-red-500/15 text-red-400 border-red-500/25"
                }`}
              >
                {practiceResults[currentIndex] ? "✓ Correct" : "✗ Wrong"}
              </span>
            )}
          </div>

          {/* Question text */}
          <div className="px-6 sm:px-8 pt-4 pb-6">
            <p className="text-base sm:text-[17px] font-semibold text-white leading-[1.65]">
              {currentQuestion.question}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mx-6 sm:mx-8" />

          {/* ── OPTIONS ── */}
          <div className="p-5 sm:p-7 space-y-3">
            {OPTIONS.map((opt) => {
              const value = currentQuestion[`option_${opt.toLowerCase()}`]
              const isSelected = answers[currentIndex] === opt
              const isCorrectOpt = opt === currentQuestion.correct_answer

              // Determine visual state
              let wrapCls = ""
              let badgeCls = ""
              let textCls = ""
              let showCheck = false
              let showCross = false
              let showCorrectMark = false

              if (isPractice && isRevealed) {
                if (isCorrectOpt) {
                  wrapCls = "bg-emerald-500/[0.14] border-emerald-500/40 cursor-default"
                  badgeCls = "bg-emerald-500 text-white"
                  textCls = "text-emerald-300 font-medium"
                  showCorrectMark = true
                } else if (isSelected) {
                  wrapCls = "bg-red-500/[0.12] border-red-500/35 cursor-default"
                  badgeCls = "bg-red-500 text-white"
                  textCls = "text-red-300"
                  showCross = true
                } else {
                  wrapCls = "bg-white/[0.02] border-white/[0.05] opacity-45 cursor-default"
                  badgeCls = "bg-white/[0.07] text-white/25"
                  textCls = "text-white/30"
                }
              } else if (isSelected) {
                wrapCls = "bg-indigo-500/[0.15] border-indigo-500/50 shadow-md shadow-indigo-500/10"
                badgeCls = "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                textCls = "text-white font-medium"
                showCheck = true
              } else {
                wrapCls = `bg-white/[0.03] border-white/[0.07] ${submitted ? "cursor-not-allowed" : "hover:bg-white/[0.07] hover:border-white/[0.15] cursor-pointer"}`
                badgeCls = "bg-white/[0.07] text-white/40 group-hover:bg-white/[0.12] group-hover:text-white/60"
                textCls = "text-white/55 group-hover:text-white/80"
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={submitted || (isPractice && isRevealed)}
                  className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 group ${wrapCls}`}
                >
                  {/* Letter badge */}
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${badgeCls}`}>
                    {opt}
                  </span>

                  {/* Option text */}
                  <span className={`text-sm leading-relaxed flex-1 transition-colors duration-200 ${textCls}`}>
                    {value}
                  </span>

                  {/* Trailing icons */}
                  {showCheck && (
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="rgba(99,102,241,0.22)"/>
                      <path d="M5 8.5l2 2 4-4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {showCorrectMark && (
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="rgba(16,185,129,0.2)"/>
                      <path d="M5 8.5l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {showCross && (
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="rgba(239,68,68,0.18)"/>
                      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── PRACTICE EXPLANATION PLACEHOLDER ── */}
          {isPractice && isRevealed && (
            <div className="mx-5 sm:mx-7 mb-6 bg-white/[0.025] border border-dashed border-white/[0.07] rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1.3"/>
                  <path d="M8 7v4M8 5.5v.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/18">Explanation</span>
              </div>
              <p className="text-xs text-white/18 italic font-light leading-relaxed">
                Explanations will appear here once added to the question bank.
              </p>
            </div>
          )}
        </div>

        {/* ── NAVIGATION BAR ── */}
        <div className="flex items-center justify-between gap-3 animate-fade-up">

          {/* Previous */}
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.14] text-white/45 hover:text-white text-sm font-medium transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03] disabled:hover:border-white/[0.08] disabled:hover:text-white/45"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Dot navigator — desktop */}
          <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
            {questions.slice(0, Math.min(questions.length, 16)).map((_, i) => {
              const isAns = answers[i] !== undefined
              const isCur = i === currentIndex
              const isOk = practiceResults[i] === true
              const isBad = practiceResults[i] === false

              let cls = "w-2 h-2 bg-white/15 hover:bg-white/30"
              if (isCur) cls = "w-4 h-2 bg-indigo-400"
              else if (isPractice && isOk) cls = "w-2 h-2 bg-emerald-500/55"
              else if (isPractice && isBad) cls = "w-2 h-2 bg-red-500/55"
              else if (isAns) cls = "w-2 h-2 bg-indigo-500/45"

              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all duration-200 ${cls}`}
                />
              )
            })}
            {questions.length > 16 && (
              <span className="text-[9px] text-white/20 ml-1">+{questions.length - 16}</span>
            )}
          </div>

          {/* Next / Submit */}
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitted}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Submit Exam
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/[0.15] border border-indigo-500/30 hover:bg-indigo-500/[0.25] hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 text-sm font-medium transition-all duration-200"
            >
              <span className="hidden sm:inline">Next</span>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Footer progress */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-0.5 w-28 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-[10px] text-white/20 font-medium">
            {answeredCount} / {questions.length} answered
          </span>
          {isPractice && answeredCount > 0 && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-[10px] text-emerald-400/55 font-medium">
                {Object.values(practiceResults).filter(Boolean).length} correct
              </span>
            </>
          )}
        </div>

      </main>
    </div>
  )
}

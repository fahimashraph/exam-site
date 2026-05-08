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
// CONSTANTS — preserved exactly
// ─────────────────────────────────────────────────────────────────

const EXAM_DURATION = 5400 // 90 min
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
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// QUESTION NAVIGATOR DRAWER — logic & structure unchanged
// ─────────────────────────────────────────────────────────────────

function QuestionNav({
  questions, currentIndex, answers, mode, practiceResults, onJump, onClose,
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
      <button className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-label="Close navigator" />
      <div className="relative z-10 ml-auto w-full max-w-[300px] bg-[#0D0D15] border-l border-white/[0.08] flex flex-col h-full overflow-hidden">
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
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="px-5 py-3 border-b border-white/[0.05] flex flex-wrap gap-x-3 gap-y-1.5 shrink-0">
          {[
            { dot: "bg-white/20", label: "Unanswered" },
            { dot: "bg-indigo-500/70", label: "Answered" },
            ...(mode === "practice" ? [
              { dot: "bg-emerald-500/70", label: "Correct" },
              { dot: "bg-red-500/70", label: "Wrong" },
            ] : []),
            { dot: "ring-2 ring-indigo-400 bg-indigo-500/20", label: "Current" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${item.dot}`} />
              <span className="text-[9px] text-white/30">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined
              const isCurrent = i === currentIndex
              const isCorrect = practiceResults[i] === true
              const isWrong = practiceResults[i] === false
              let cls = "bg-white/[0.07] text-white/30 hover:bg-white/[0.13]"
              if (isCurrent) cls = "ring-2 ring-indigo-400 bg-indigo-500/20 text-indigo-300"
              else if (mode === "practice" && isCorrect) cls = "bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/35"
              else if (mode === "practice" && isWrong) cls = "bg-red-500/25 text-red-300 hover:bg-red-500/35"
              else if (isAnswered) cls = "bg-indigo-500/22 text-indigo-300 hover:bg-indigo-500/32"
              return (
                <button key={i} onClick={() => { onJump(i); onClose() }}
                  className={`h-9 rounded-lg text-xs font-bold transition-all duration-150 ${cls}`}>
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
// SUBMIT CONFIRM MODAL — logic unchanged
// ─────────────────────────────────────────────────────────────────

function SubmitModal({ total, answered, onConfirm, onCancel }: {
  total: number; answered: number; onConfirm: () => void; onCancel: () => void
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
          You&apos;ve answered <span className="text-white/75 font-semibold">{answered}</span> of{" "}
          <span className="text-white/75 font-semibold">{total}</span> questions.
        </p>
        {unanswered > 0 && (
          <p className="text-xs text-amber-400/80 text-center mb-5">
            {unanswered} unanswered question{unanswered > 1 ? "s" : ""} will be marked incorrect.
          </p>
        )}
        {unanswered === 0 && <div className="mb-5" />}
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/55 hover:text-white text-sm font-medium transition-all duration-200">
            Keep going
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200">
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

  // ── ALL ORIGINAL STATE — unchanged ────────────────────────────
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
  const [practiceResults, setPracticeResults] = useState<Record<number, boolean>>({})
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set())
  const submittedRef = useRef(false)
  // ──────────────────────────────────────────────────────────────

  // ── CONFIG + QUESTIONS — original Supabase logic unchanged ────
  useEffect(() => {
    const raw = localStorage.getItem("examConfig")
    if (!raw) { router.push("/exam"); return }
    const cfg: ExamConfig = JSON.parse(raw)
    setConfig(cfg)

    const load = async () => {
      const { data: filtered, error } = await supabase
        .from("questions")
        .select("*")
        .eq("subject", cfg.subject)
        .eq("year", cfg.year)
        .order("order_number", { ascending: true })

      if (!error && filtered && filtered.length > 0) {
        setQuestions(filtered)
      } else {
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

  // ── TIMER — original logic unchanged ─────────────────────────
  useEffect(() => {
    if (!config || config.mode !== "exam" || submitted || loading) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); if (!submittedRef.current) doSubmit(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, submitted, loading])

  // ── ANSWER — original logic unchanged ────────────────────────
  function handleAnswer(opt: string) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: opt }))
    if (config?.mode === "practice" && !revealedSet.has(currentIndex)) {
      const correct = opt === questions[currentIndex]?.correct_answer
      setPracticeResults((prev) => ({ ...prev, [currentIndex]: correct }))
      setRevealedSet((prev) => new Set(prev).add(currentIndex))
    }
  }

  // ── SUBMIT — original Supabase + localStorage logic unchanged ─
  const doSubmit = useCallback(async (_auto = false) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitted(true)
    setShowConfirm(false)

    let newScore = 0
    questions.forEach((q, i) => { if (answers[i] === q.correct_answer) newScore++ })
    setScore(newScore)

    const { data: authData } = await supabase.auth.getUser()
    if (authData?.user) {
      const { error } = await supabase.from("results").insert([{
        user_id: authData.user.id,
        score: newScore,
        total: questions.length,
        created_at: new Date().toISOString(),
      }])
      if (error) console.error("Save error:", error)
      else console.log("Result saved!")
    }

    localStorage.setItem("examData", JSON.stringify({ answers, questions }))
    window.location.href = "/exam/review"
  }, [answers, questions])

  // ── DERIVED ───────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, "0")
  const isWarning = timeLeft < 300
  const isCritical = timeLeft < 60
  const isPractice = config?.mode === "practice"
  const isRevealed = revealedSet.has(currentIndex)
  const selectedAnswer = answers[currentIndex]

  if (loading || !config) return <LoadingScreen message="Preparing your exam" />
  if (!currentQuestion) return <LoadingScreen message="Loading questions" />

  // ─────────────────────────────────────────────────────────────
  // OPTION VISUAL STATE
  //
  // KEY RULE: opacity is NEVER reduced on any option, ever.
  // ALL options remain at full opacity and full contrast at all times.
  // State is communicated ONLY through:
  //   - border color
  //   - background tint
  //   - letter badge fill
  //   - trailing icon (checkmark / cross)
  //   - text color (for selected/correct/wrong ONLY)
  //
  // Unselected options after answering: identical to before answering.
  // ─────────────────────────────────────────────────────────────

  function getOptionStyle(opt: string) {
    const isSelected = selectedAnswer === opt
    const isCorrectOpt = opt === currentQuestion.correct_answer

    // ── PRACTICE MODE — after answer is revealed ────────────────
    if (isPractice && isRevealed) {
      if (isCorrectOpt) {
        return {
          // Correct answer: strong emerald highlight
          wrap:   "bg-emerald-500/[0.13] border-emerald-500/60 cursor-default",
          badge:  "bg-emerald-500 text-white",
          text:   "text-white font-semibold",     // stays fully readable
          icon:   "correct",
        }
      }
      if (isSelected && !isCorrectOpt) {
        return {
          // User's wrong answer: red highlight
          wrap:   "bg-red-500/[0.10] border-red-500/50 cursor-default",
          badge:  "bg-red-500 text-white",
          text:   "text-white font-medium",        // stays fully readable
          icon:   "wrong",
        }
      }
      // All other unselected options — IDENTICAL to default state
      // No fading, no muting, no opacity change whatsoever
      return {
        wrap:  "bg-white/[0.03] border-white/[0.07] cursor-default",
        badge: "bg-white/[0.10] text-white/75",
        text:  "text-white/85",                   // full contrast — same as pre-answer
        icon:  null,
      }
    }

    // ── EXAM MODE or PRE-ANSWER — selected option ───────────────
    if (isSelected) {
      return {
        wrap:  "bg-indigo-500/[0.15] border-indigo-500/60 cursor-pointer",
        badge: "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30",
        text:  "text-white font-semibold",
        icon:  "selected",
      }
    }

    // ── DEFAULT — not yet answered, or unselected after exam mode answer ─
    // Full contrast, strong hover. These should look like clean CBT buttons.
    return {
      wrap:  "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.18] cursor-pointer",
      badge: "bg-white/[0.08] text-white/60 group-hover:bg-white/[0.14] group-hover:text-white/90",
      text:  "text-white/80 group-hover:text-white",
      icon:  null,
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-violet-600/6 blur-[90px]" />
      </div>

      {showNav && (
        <QuestionNav questions={questions} currentIndex={currentIndex} answers={answers}
          mode={config.mode} practiceResults={practiceResults}
          onJump={setCurrentIndex} onClose={() => setShowNav(false)} />
      )}
      {showConfirm && (
        <SubmitModal total={questions.length} answered={answeredCount}
          onConfirm={() => doSubmit(false)} onCancel={() => setShowConfirm(false)} />
      )}

      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#0A0A0F]/90 backdrop-blur-md sticky top-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2.5">

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
              <span className="text-[8px] font-bold tracking-[0.14em] uppercase bg-emerald-500/12 border border-emerald-500/22 text-emerald-400/80 px-2 py-1 rounded-md">Practice</span>
            ) : (
              <span className="text-[8px] font-bold tracking-[0.14em] uppercase bg-indigo-500/12 border border-indigo-500/22 text-indigo-400/80 px-2 py-1 rounded-md">Exam</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[10px] text-white/28 shrink-0 font-mono tabular-nums">
              {currentIndex + 1}/{questions.length}
            </span>
            <div className="flex-1 h-1 bg-white/[0.07] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] text-white/28 shrink-0">{answeredCount} ans.</span>
          </div>

          {/* Timer — real exam mode only */}
          {!isPractice && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-sm font-bold tabular-nums shrink-0 transition-all duration-300 ${
              isCritical ? "bg-red-500/20 border-red-500/40 text-red-400"
              : isWarning  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "bg-white/[0.05] border-white/[0.09] text-white/65"
            }`}
              style={isCritical ? { animation: "timer-warn 1s ease-in-out infinite" } : {}}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {minutes}:{seconds}
            </div>
          )}

          {/* Navigator toggle */}
          <button onClick={() => setShowNav(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] text-white/45 hover:text-white text-xs font-medium transition-all duration-200 shrink-0">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="7" width="9" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="11" width="11" height="2" rx="1" fill="currentColor"/>
            </svg>
            <span className="hidden sm:inline">Questions</span>
          </button>
        </div>
      </header>

      {/* ── MAIN ──────────────────────────────────────────────── */}
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

        {/* ── QUESTION CARD ───────────────────────────────────── */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden mb-5 animate-fade-up">

          {/* Q number + practice result badge */}
          <div className="px-6 sm:px-8 pt-6 pb-0 flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-indigo-400/75">
              Question {currentIndex + 1} of {questions.length}
            </span>

            {/* Practice result badge — shown after answer */}
            {isPractice && isRevealed && (
              <span className={`text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-lg border shrink-0 ${
                practiceResults[currentIndex]
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/25"
              }`}>
                {practiceResults[currentIndex] ? "✓ Correct" : "✗ Incorrect"}
              </span>
            )}
          </div>

          {/* Question text — large, bold, full contrast always */}
          <div className="px-6 sm:px-8 pt-5 pb-6">
            <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-tight">
              {currentQuestion.question}
            </p>
          </div>

          <div className="h-px bg-white/[0.06] mx-6 sm:mx-8" />

          {/* ── OPTIONS ─────────────────────────────────────────
              CRITICAL RULES IMPLEMENTED HERE:
              1. No opacity class ever applied to any option button
              2. No disabled attribute set on options (prevents grey-out)
              3. All text remains full-opacity at all times
              4. State signaled via border + bg + badge only
              5. Hover state always shown on non-revealed options
          ──────────────────────────────────────────────────── */}
          <div className="p-5 sm:p-7 space-y-3">
            {OPTIONS.map((opt) => {
              const value = currentQuestion[`option_${opt.toLowerCase()}`]
              const style = getOptionStyle(opt)
              const isSelected = selectedAnswer === opt
              const isCorrectOpt = opt === currentQuestion.correct_answer

              return (
                <button
                  key={opt}
                  onClick={() => {
                    // In practice mode after reveal: clicking again does nothing
                    // In exam mode: can change answer any time before submit
                    if (submitted) return
                    if (isPractice && isRevealed) return
                    handleAnswer(opt)
                  }}
                  // NO disabled prop — disabled causes browser grey-out we can't fully override
                  // Click guard is handled above in the onClick handler
                  className={`
                    w-full text-left flex items-center gap-4 px-5 py-4
                    rounded-xl border transition-all duration-200 group
                    ${style.wrap}
                  `}
                >
                  {/* Letter badge */}
                  <span className={`
                    w-9 h-9 rounded-xl flex items-center justify-center
                    text-sm font-bold shrink-0 transition-all duration-200
                    ${style.badge}
                  `}>
                    {opt}
                  </span>

                  {/* Option text — ALWAYS full weight and contrast */}
                  <span className={`
                    text-lg leading-snug flex-1 transition-colors duration-200
                    ${style.text}
                  `}>
                    {value}
                  </span>

                  {/* Trailing icon — only on selected/correct/wrong */}
                  {style.icon === "selected" && (
                    <svg className="shrink-0 ml-auto" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="8" fill="rgba(99,102,241,0.25)" stroke="rgba(99,102,241,0.6)" strokeWidth="1.2"/>
                      <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {style.icon === "correct" && (
                    <svg className="shrink-0 ml-auto" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="8" fill="rgba(16,185,129,0.25)" stroke="rgba(16,185,129,0.7)" strokeWidth="1.2"/>
                      <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {style.icon === "wrong" && (
                    <svg className="shrink-0 ml-auto" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="8" fill="rgba(239,68,68,0.20)" stroke="rgba(239,68,68,0.6)" strokeWidth="1.2"/>
                      <path d="M6 6l6 6M12 6l-6 6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── PRACTICE EXPLANATION PLACEHOLDER ──────────────── */}
          {isPractice && isRevealed && (
            <div className="mx-5 sm:mx-7 mb-6 bg-white/[0.04] border border-white/[0.10] border-dashed rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.3"/>
                  <path d="M8 7v4M8 5.5v.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/50">Explanation</span>
              </div>
              <p className="text-sm text-white/60 font-light leading-relaxed">
                Explanations will appear here once added to the question bank.
              </p>
            </div>
          )}
        </div>

        {/* ── NAVIGATION ─────────────────────────────────────────
            NEXT BUTTON: always visually active, never looks disabled.
            Only the actual last-question Submit button can be disabled
            (after submission) — and that's handled with a spinner state.
        ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 animate-fade-up">

          {/* Previous */}
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.18] text-white/60 hover:text-white text-sm font-semibold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Dot navigator — desktop */}
          <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
            {questions.slice(0, Math.min(questions.length, 16)).map((_, i) => {
              const isAns = answers[i] !== undefined
              const isCur = i === currentIndex
              const isOk  = practiceResults[i] === true
              const isBad = practiceResults[i] === false
              let cls = "w-2 h-2 bg-white/15 hover:bg-white/35 cursor-pointer"
              if (isCur)             cls = "w-4 h-2 bg-indigo-400 cursor-default"
              else if (isPractice && isOk)  cls = "w-2 h-2 bg-emerald-500/60 cursor-pointer"
              else if (isPractice && isBad) cls = "w-2 h-2 bg-red-500/60 cursor-pointer"
              else if (isAns)        cls = "w-2 h-2 bg-indigo-500/50 cursor-pointer"
              return (
                <button key={i} onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all duration-200 ${cls}`} />
              )
            })}
            {questions.length > 16 && (
              <span className="text-[9px] text-white/20 ml-1">+{questions.length - 16}</span>
            )}
          </div>

          {/* Next / Submit */}
          {currentIndex === questions.length - 1 ? (
            /*
              SUBMIT button — only appears on the last question.
              Uses disabled only after actual submission (shows spinner).
              Before submission: always fully clickable.
            */
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitted}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          ) : (
            /*
              NEXT button — NEVER disabled, NEVER faded.
              No disabled attribute. Always full colour and contrast.
              This is the core fix: the button was using text-indigo-300
              (a light pastel) and bg-indigo-500/15 (near invisible).
              Now it uses a solid indigo fill with white text — identical
              to a primary CTA — because it IS a primary action.
            */
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Next</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Footer progress */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-0.5 w-28 bg-white/[0.07] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : "0%" }} />
          </div>
          <span className="text-xs text-white/30 font-medium">
            {answeredCount} / {questions.length} answered
          </span>
          {isPractice && answeredCount > 0 && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-xs text-emerald-400/60 font-medium">
                {Object.values(practiceResults).filter(Boolean).length} correct
              </span>
            </>
          )}
        </div>

      </main>
    </div>
  )
}

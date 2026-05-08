"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────

const SUBJECTS = [
  {
    id: "mathematics",
    name: "Mathematics",
    code: "MATH",
    questions: 240,
    gradient: "from-indigo-500/[0.18] to-indigo-600/[0.06]",
    border: "border-indigo-500/[0.22]",
    hoverBorder: "hover:border-indigo-400/50",
    badge: "bg-indigo-500/[0.15] text-indigo-400 border-indigo-500/[0.25]",
    iconBg: "bg-indigo-500/[0.18]",
    iconColor: "#818cf8",
    shadowHover: "hover:shadow-indigo-500/[0.18]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4"/>
      </svg>
    ),
  },
  {
    id: "biology",
    name: "Biology",
    code: "BIO",
    questions: 185,
    gradient: "from-emerald-500/[0.18] to-emerald-600/[0.06]",
    border: "border-emerald-500/[0.22]",
    hoverBorder: "hover:border-emerald-400/50",
    badge: "bg-emerald-500/[0.15] text-emerald-400 border-emerald-500/[0.25]",
    iconBg: "bg-emerald-500/[0.18]",
    iconColor: "#34d399",
    shadowHover: "hover:shadow-emerald-500/[0.18]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C8 3 4 7 4 12s4 9 8 9 8-4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 3c4 0 8 4 8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 2"/>
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: "chemistry",
    name: "Chemistry",
    code: "CHEM",
    questions: 210,
    gradient: "from-amber-500/[0.18] to-amber-600/[0.06]",
    border: "border-amber-500/[0.22]",
    hoverBorder: "hover:border-amber-400/50",
    badge: "bg-amber-500/[0.15] text-amber-400 border-amber-500/[0.25]",
    iconBg: "bg-amber-500/[0.18]",
    iconColor: "#f59e0b",
    shadowHover: "hover:shadow-amber-500/[0.18]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 3v7L4 18a1 1 0 00.9 1.5h14.2A1 1 0 0020 18l-5-8V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 3h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="10.5" cy="15" r="1.2" fill="currentColor"/>
        <circle cx="14" cy="13" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "english",
    name: "English",
    code: "ENG",
    questions: 160,
    gradient: "from-pink-500/[0.18] to-pink-600/[0.06]",
    border: "border-pink-500/[0.22]",
    hoverBorder: "hover:border-pink-400/50",
    badge: "bg-pink-500/[0.15] text-pink-400 border-pink-500/[0.25]",
    iconBg: "bg-pink-500/[0.18]",
    iconColor: "#f472b6",
    shadowHover: "hover:shadow-pink-500/[0.18]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h10M4 17h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "physics",
    name: "Physics",
    code: "PHY",
    questions: 195,
    gradient: "from-blue-500/[0.18] to-blue-600/[0.06]",
    border: "border-blue-500/[0.22]",
    hoverBorder: "hover:border-blue-400/50",
    badge: "bg-blue-500/[0.15] text-blue-400 border-blue-500/[0.25]",
    iconBg: "bg-blue-500/[0.18]",
    iconColor: "#60a5fa",
    shadowHover: "hover:shadow-blue-500/[0.18]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.8"/>
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.8" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.8" transform="rotate(120 12 12)"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "history",
    name: "History",
    code: "HIST",
    questions: 140,
    gradient: "from-orange-500/[0.18] to-orange-600/[0.06]",
    border: "border-orange-500/[0.22]",
    hoverBorder: "hover:border-orange-400/50",
    badge: "bg-orange-500/[0.15] text-orange-400 border-orange-500/[0.25]",
    iconBg: "bg-orange-500/[0.18]",
    iconColor: "#fb923c",
    shadowHover: "hover:shadow-orange-500/[0.18]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M2 12h2M20 12h2M12 2v2M12 20v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.4"/>
      </svg>
    ),
  },
]

const YEARS = Array.from({ length: 11 }, (_, i) => 2025 - i)

const MODES = [
  {
    id: "practice" as const,
    label: "Practice Mode",
    tag: "Relaxed",
    tagStyle: "bg-emerald-500/[0.15] text-emerald-400 border-emerald-500/[0.25]",
    description: "Learn without pressure. Each answer is revealed the moment you select it — correct answers glow green, wrong ones glow red.",
    features: [
      { icon: "✓", text: "No timer — go at your pace" },
      { icon: "✓", text: "Instant correct / wrong reveal" },
      { icon: "✓", text: "Green & red answer highlighting" },
      { icon: "✓", text: "Explanation placeholder per question" },
    ],
    cardStyle: "border-emerald-500/[0.25] bg-gradient-to-b from-emerald-500/[0.09] to-transparent",
    selectedStyle: "border-emerald-400/60 bg-gradient-to-b from-emerald-500/[0.17] to-emerald-500/[0.05] shadow-xl shadow-emerald-500/[0.13]",
    dotColor: "bg-emerald-400",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="#34d399" strokeWidth="1.7"/>
        <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="#34d399" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "exam" as const,
    label: "Real Exam Mode",
    tag: "Official",
    tagStyle: "bg-indigo-500/[0.15] text-indigo-400 border-indigo-500/[0.25]",
    description: "Authentic timed conditions. No feedback during the exam — all corrections are revealed on the review page after submission.",
    features: [
      { icon: "✓", text: "90-minute countdown timer" },
      { icon: "✓", text: "No answer reveals mid-exam" },
      { icon: "✓", text: "Auto-submits when time expires" },
      { icon: "✓", text: "Full answer breakdown after" },
    ],
    cardStyle: "border-indigo-500/[0.25] bg-gradient-to-b from-indigo-500/[0.09] to-transparent",
    selectedStyle: "border-indigo-400/60 bg-gradient-to-b from-indigo-500/[0.17] to-indigo-500/[0.05] shadow-xl shadow-indigo-500/[0.13]",
    dotColor: "bg-indigo-400",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#818cf8" strokeWidth="1.7"/>
        <path d="M12 7v5l3.5 3.5" stroke="#818cf8" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
]

// ─────────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────

function AmbientBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute top-[-15%] right-[5%] w-[520px] h-[520px] rounded-full bg-indigo-600/[0.09] blur-[120px]" />
      <div className="absolute top-[50%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/[0.07] blur-[100px]" />
      <div className="absolute bottom-[5%] right-[25%] w-[300px] h-[300px] rounded-full bg-blue-600/[0.05] blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/45 transition-shadow duration-300">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-white/80 hidden sm:block">ExamPrep</span>
    </Link>
  )
}

function BackBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium mb-5 transition-colors duration-200 group"
    >
      <svg
        width="12" height="12" viewBox="0 0 16 16" fill="none"
        className="group-hover:-translate-x-0.5 transition-transform duration-200"
      >
        <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  )
}

/** Stepper bar across the top of each step */
function StepBar({ current, total }: { current: number; total: number }) {
  const labels = ["Subject", "Year", "Mode", "Preview"]
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {labels.slice(0, total).map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                  done
                    ? "bg-indigo-500 text-white"
                    : active
                    ? "border-2 border-indigo-500/70 bg-indigo-500/15 text-indigo-400"
                    : "border border-white/[0.10] bg-white/[0.04] text-white/20"
                }`}
              >
                {done ? (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block transition-colors duration-300 ${active ? "text-white" : done ? "text-indigo-400" : "text-white/20"}`}>
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`w-5 sm:w-7 h-px transition-colors duration-500 ${done ? "bg-indigo-500/50" : "bg-white/[0.07]"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ContinueBtn({
  onClick,
  disabled,
  label = "Continue",
}: {
  onClick: () => void
  disabled: boolean
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-7 py-3 rounded-xl text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-indigo-500/25"
    >
      {label}
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

function GhostBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.14] text-white/45 hover:text-white text-sm font-medium transition-all duration-200"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────

export default function ExamSelectPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [subject, setSubject] = useState<(typeof SUBJECTS)[0] | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [mode, setMode] = useState<(typeof MODES)[0] | null>(null)
  const [userName, setUserName] = useState("Student")
  const [launching, setLaunching] = useState(false)

  /* Auth guard + get first name */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth?mode=login"); return }
      const name =
        user.user_metadata?.full_name?.split(" ")[0] ??
        user.email?.split("@")[0] ??
        "Student"
      setUserName(name)
    })
  }, [router])

  function handleLaunch() {
    if (!subject || !year || !mode) return
    setLaunching(true)
    localStorage.setItem(
      "examConfig",
      JSON.stringify({
        subject: subject.id,
        subjectName: subject.name,
        year,
        mode: mode.id,
      })
    )
    router.push("/exam/session")
  }

  // ── STEP 0 — SUBJECT ──────────────────────────────────────────
  const step0 = (
    <div className="animate-fade-up">
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 mb-2">Step 1 of 4</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1.5">Choose a Subject</h1>
      <p className="text-white/40 text-sm font-light mb-10">Hey {userName} — pick the subject you want to practise.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBJECTS.map((s) => {
          const sel = subject?.id === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSubject(s)}
              className={`group relative text-left w-full rounded-2xl border bg-gradient-to-b ${s.gradient} ${s.border} ${s.hoverBorder} p-6 shadow-xl hover:shadow-2xl ${s.shadowHover} transition-all duration-300 ${
                sel ? "ring-2 ring-indigo-400/70 ring-offset-2 ring-offset-[#0A0A0F]" : ""
              }`}
            >
              {sel && (
                <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/40">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div
                className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}
                style={{ color: s.iconColor }}
              >
                {s.icon}
              </div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-[15px] font-bold text-white">{s.name}</h3>
                <span className={`text-[9px] font-bold tracking-[0.14em] uppercase border px-2 py-0.5 rounded-md shrink-0 ${s.badge}`}>
                  {s.code}
                </span>
              </div>
              <p className="text-xs text-white/35">{s.questions} questions available</p>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end mt-8">
        <ContinueBtn onClick={() => setStep(1)} disabled={!subject} />
      </div>
    </div>
  )

  // ── STEP 1 — YEAR ─────────────────────────────────────────────
  const step1 = (
    <div className="animate-fade-up">
      <BackBtn label="Back to subjects" onClick={() => setStep(0)} />
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 mb-2">Step 2 of 4</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1.5">Select Exam Year</h1>
      <div className="flex items-center gap-2 mb-10">
        <span className={`text-[9px] font-bold tracking-[0.14em] uppercase border px-2.5 py-1 rounded-lg ${subject?.badge ?? ""}`}>
          {subject?.name}
        </span>
        <span className="text-white/20 text-xs">·</span>
        <span className="text-white/35 text-xs">Past papers 2015 – 2025</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {YEARS.map((y) => {
          const sel = year === y
          const isLatest = y === 2025
          return (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`relative flex flex-col items-center justify-center py-5 px-2 rounded-2xl border transition-all duration-200 ${
                sel
                  ? "bg-indigo-500/[0.18] border-indigo-400/60 shadow-lg shadow-indigo-500/[0.18] ring-2 ring-indigo-400/50 ring-offset-2 ring-offset-[#0A0A0F]"
                  : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              {isLatest && (
                <span className="absolute top-2 right-2 text-[7px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md">
                  New
                </span>
              )}
              <span className={`text-xl font-bold tabular-nums ${sel ? "text-indigo-300" : "text-white/65"}`}>{y}</span>
              <span className={`text-[9px] font-semibold uppercase tracking-widest mt-0.5 ${sel ? "text-indigo-400/70" : "text-white/22"}`}>Paper</span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between mt-8">
        <GhostBtn onClick={() => setStep(0)} label="Back" />
        <ContinueBtn onClick={() => setStep(2)} disabled={!year} />
      </div>
    </div>
  )

  // ── STEP 2 — MODE ─────────────────────────────────────────────
  const step2 = (
    <div className="animate-fade-up">
      <BackBtn label="Back to year selection" onClick={() => setStep(1)} />
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 mb-2">Step 3 of 4</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1.5">Choose Exam Mode</h1>
      <div className="flex items-center gap-2 mb-10">
        <span className={`text-[9px] font-bold tracking-[0.14em] uppercase border px-2.5 py-1 rounded-lg ${subject?.badge ?? ""}`}>
          {subject?.name}
        </span>
        <span className="text-white/20 text-xs">·</span>
        <span className="text-[9px] font-bold tracking-[0.14em] uppercase border border-white/[0.09] bg-white/[0.04] text-white/45 px-2.5 py-1 rounded-lg">
          {year}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
        {MODES.map((m) => {
          const sel = mode?.id === m.id
          return (
            <button
              key={m.id}
              onClick={() => setMode(m)}
              className={`relative text-left w-full border rounded-2xl p-6 transition-all duration-300 ${sel ? m.selectedStyle : m.cardStyle + " hover:opacity-90"}`}
            >
              {sel && (
                <div className="absolute top-4.5 right-4.5 w-5 h-5 rounded-full bg-white/[0.12] border border-white/[0.20] flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${m.dotColor}`} />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  {m.icon}
                </div>
                <div>
                  <span className={`text-[8px] font-bold tracking-[0.14em] uppercase border px-1.5 py-0.5 rounded-md ${m.tagStyle}`}>
                    {m.tag}
                  </span>
                  <h3 className="text-[15px] font-bold text-white mt-1">{m.label}</h3>
                </div>
              </div>
              <p className="text-sm text-white/40 font-light leading-relaxed mb-4">{m.description}</p>
              <ul className="space-y-2">
                {m.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/45">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dotColor} opacity-60`} />
                    {f.text}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between mt-8">
        <GhostBtn onClick={() => setStep(1)} label="Back" />
        <ContinueBtn onClick={() => setStep(3)} disabled={!mode} label="Preview Exam" />
      </div>
    </div>
  )

  // ── STEP 3 — PREVIEW ──────────────────────────────────────────
  const step3 = subject && year && mode ? (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <BackBtn label="Change mode" onClick={() => setStep(2)} />
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 mb-2">Step 4 of 4</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-8">Ready to begin?</h1>

      {/* Exam info card */}
      <div className="relative bg-white/[0.04] border border-white/[0.09] rounded-2xl overflow-hidden mb-6 backdrop-blur-sm">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

        {/* Subject header */}
        <div className="px-6 sm:px-7 py-5 border-b border-white/[0.07] flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${subject.iconBg} flex items-center justify-center shrink-0`}
            style={{ color: subject.iconColor }}
          >
            {subject.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={`text-[8px] font-bold tracking-[0.14em] uppercase border px-1.5 py-0.5 rounded-md ${subject.badge}`}>
                {subject.code}
              </span>
              <span className={`text-[8px] font-bold tracking-[0.14em] uppercase border px-1.5 py-0.5 rounded-md ${mode.tagStyle}`}>
                {mode.tag}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white truncate">
              {subject.name} — {year} Past Paper
            </h2>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-white/[0.06]">
          {[
            { label: "Subject", value: subject.name },
            { label: "Year", value: String(year) },
            { label: "Questions", value: "40" },
            { label: "Duration", value: mode.id === "exam" ? "90 min" : "Untimed" },
          ].map((item, i) => (
            <div key={i} className="px-5 py-4">
              <p className="text-[8px] font-bold tracking-[0.18em] uppercase text-white/22 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Mode feature list */}
        <div className={`px-6 sm:px-7 py-5 border-t border-white/[0.07] ${mode.id === "practice" ? "bg-emerald-500/[0.04]" : "bg-indigo-500/[0.04]"}`}>
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/28 mb-3">
            {mode.label} — what to expect
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {mode.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/45">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${mode.dotColor} opacity-60`} />
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={launching}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold py-4 rounded-2xl text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {launching ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M14 8A6 6 0 002 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Loading exam…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5"/>
              <path d="M8 7l6 3-6 3V7z" fill="white"/>
            </svg>
            Start {mode.id === "exam" ? "Real Exam" : "Practice Session"}
          </>
        )}
      </button>
      <p className="text-center text-[10px] text-white/18 mt-4">
        Questions follow the official {year} paper order · No randomisation
      </p>
    </div>
  ) : null

  const steps = [step0, step1, step2, step3]

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <AmbientBg />

      {/* Header */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Logo />
          <StepBar current={step} total={4} />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-medium text-white/35 hover:text-white border border-white/[0.07] hover:border-white/[0.14] bg-white/[0.03] hover:bg-white/[0.07] px-3.5 py-2 rounded-xl transition-all duration-200 shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {steps[step]}
      </main>
    </div>
  )
}

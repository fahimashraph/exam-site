"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

// ─────────────────────────────────────────────────────────────────
// TYPES — unchanged
// ─────────────────────────────────────────────────────────────────

type Result = {
  id: string
  score: number
  total: number
  created_at: string
}

type User = {
  email: string
  user_metadata?: {
    full_name?: string
    school?: string
    grade_class?: string
  }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS — unchanged
// ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function getGrade(pct: number) {
  if (pct >= 90) return { label: "A+", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" }
  if (pct >= 80) return { label: "A",  color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" }
  if (pct >= 70) return { label: "B",  color: "text-indigo-400",  bg: "bg-indigo-500/15 border-indigo-500/30"  }
  if (pct >= 60) return { label: "C",  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30"    }
  if (pct >= 50) return { label: "D",  color: "text-orange-400",  bg: "bg-orange-500/15 border-orange-500/30"  }
  return               { label: "F",  color: "text-red-400",      bg: "bg-red-500/15 border-red-500/30"        }
}

function getStreak(results: Result[]) {
  if (!results.length) return 0
  const days = results
    .map((r) => new Date(r.created_at).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

function getMotivation(totalExams: number, avgScore: number) {
  if (totalExams === 0) return "Take your first exam and start building your score 🚀"
  if (avgScore >= 85) return "Outstanding work — you're exam-ready 🌟"
  if (avgScore >= 70) return "Strong performance — keep the momentum going 💪"
  if (avgScore >= 55) return "Good effort — every attempt makes you sharper ⚡"
  return "Keep going — consistency beats talent every time 🔥"
}

// ─────────────────────────────────────────────────────────────────
// STAT CARD — energetic, colourful
// ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, gradient, glow, border, barColor, barWidth,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  gradient: string
  glow: string
  border: string
  barColor: string
  barWidth: number
}) {
  return (
    <div className={`group relative rounded-2xl p-5 border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 cursor-default ${gradient} ${border}`}
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.4)" }}>
      {/* Top glow line */}
      <div className={`absolute top-0 left-0 right-0 h-px ${glow}`} />
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.03]" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-3">{icon}</div>
        {/* Value */}
        <p className="text-3xl font-extrabold text-white tracking-tight leading-none">{value}</p>
        {/* Label */}
        <p className="text-xs font-bold text-white/65 uppercase tracking-widest mt-1.5">{label}</p>
        {/* Sub */}
        {sub && <p className="text-xs text-white/60 mt-1 font-medium">{sub}</p>}
        {/* Progress bar */}
        {barWidth > 0 && (
          <div className="mt-3 h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(barWidth, 100)}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  // ── AUTH + DATA FETCH — all Supabase logic preserved ─────────
  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push("/auth?mode=login"); return }
      setUser(authUser as unknown as User)

      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (!error && data) setResults(data)
      setLoading(false)
    }
    init()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }
  // ─────────────────────────────────────────────────────────────

  // Derived stats — all logic unchanged
  const totalExams     = results.length
  const totalQuestions = results.reduce((s, r) => s + (r.total ?? 0), 0)
  const avgScore       = totalExams
    ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / totalExams)
    : 0
  const bestScore      = totalExams
    ? Math.round(Math.max(...results.map((r) => (r.score / r.total) * 100)))
    : 0
  const streak         = getStreak(results)
  const displayName    = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "Student"
  const recentResults  = results.slice(0, 5)

  // ── LOADING SCREEN ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070E] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        </div>
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/40">
            <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#07070E] text-white">

      {/* ── RICH AMBIENT BACKGROUND ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Main indigo bloom — top right */}
        <div className="absolute -top-24 -right-24 w-[700px] h-[700px] rounded-full bg-indigo-600/14 blur-[140px]" />
        {/* Violet bloom — mid left */}
        <div className="absolute top-[35%] -left-20 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        {/* Emerald accent — bottom */}
        <div className="absolute bottom-0 left-[40%] w-[400px] h-[400px] rounded-full bg-emerald-600/6 blur-[110px]" />
        {/* Blue hint — bottom right */}
        <div className="absolute bottom-[10%] right-[5%] w-[300px] h-[300px] rounded-full bg-blue-600/6 blur-[90px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.028]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(99,102,241,0.07),transparent_70%)]" />
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-white/[0.11] bg-[#020207]/92 backdrop-blur-xl sticky top-0" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.6)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/35 group-hover:shadow-indigo-500/55 group-hover:scale-105 transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white hidden sm:block">ExamPrep</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Dashboard", href: "/dashboard", active: true },
              { label: "Exams",     href: "/exam",      active: false },
              { label: "Results",   href: "/exam/review", active: false },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  item.active
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "text-white/45 hover:text-white hover:bg-white/[0.06]"
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Avatar pill */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.10] rounded-xl px-3.5 py-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
                <span className="text-[11px] font-black text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-white/75 font-semibold max-w-[120px] truncate">
                {displayName}
              </span>
            </div>

            {/* Sign out */}
            <button onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white/80 border border-white/[0.08] hover:border-white/[0.16] bg-transparent hover:bg-white/[0.05] px-3.5 py-2 rounded-xl transition-all duration-200">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-10">

        {/* ══ 1. WELCOME ══════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 animate-fade-up">

          {/* Greeting */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Welcome back
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Hey, {displayName}! 👋
            </h1>
            <p className="text-white/50 text-base mt-2 max-w-lg leading-relaxed">
              {getMotivation(totalExams, avgScore)}
            </p>
          </div>

          {/* Streak card — vibrant */}
          <div className="relative bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-yellow-500/10 border border-orange-500/30 rounded-2xl px-6 py-5 shrink-0 overflow-hidden"
            style={{ boxShadow: "0 0 40px -8px rgba(249,115,22,0.25)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-orange-500/15 blur-xl" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="text-4xl leading-none" style={{ filter: "drop-shadow(0 0 12px rgba(249,115,22,0.6))" }}>🔥</div>
              <div>
                <p className="text-3xl font-extrabold text-white leading-none">
                  {streak}
                  <span className="text-amber-900 font-bold text-lg ml-1">{streak !== 1 ? " days" : " day"}</span>
                </p>
                <p className="text-[11px] text-amber-900/80 font-extrabold uppercase tracking-[0.2em] mt-1">Study streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ 2. STAT CARDS ═══════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up animate-fade-up-1">

          <StatCard
            label="Exams Taken"
            value={totalExams}
            sub={totalExams > 0 ? `${totalExams} attempt${totalExams !== 1 ? "s" : ""}` : "Let's go!"}
            gradient="bg-gradient-to-br from-indigo-600/20 via-indigo-500/10 to-transparent"
            glow="bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
            border="border-indigo-500/25"
            barColor="bg-gradient-to-r from-indigo-500 to-indigo-400"
            barWidth={Math.min(totalExams * 10, 100)}
            icon={
              <div className="w-10 h-10 rounded-xl bg-indigo-500/25 border border-indigo-500/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="13" rx="2" stroke="#818cf8" strokeWidth="1.6"/>
                  <path d="M7 8h6M7 11h4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M7 2v4M13 2v4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />

          <StatCard
            label="Average Score"
            value={avgScore > 0 ? `${avgScore}%` : "—"}
            sub={avgScore >= 70 ? "Above average 🎯" : avgScore > 0 ? "Keep improving" : "No data yet"}
            gradient="bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-transparent"
            glow="bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
            border="border-violet-500/25"
            barColor="bg-gradient-to-r from-violet-500 to-purple-400"
            barWidth={avgScore}
            icon={
              <div className="w-10 h-10 rounded-xl bg-violet-500/25 border border-violet-500/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 14l4-5 3 3 5-7" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 17h14" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />

          <StatCard
            label="Best Score"
            value={bestScore > 0 ? `${bestScore}%` : "—"}
            sub={bestScore > 0 ? `Grade ${getGrade(bestScore).label} 🏆` : "Take an exam"}
            gradient="bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-transparent"
            glow="bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
            border="border-emerald-500/25"
            barColor="bg-gradient-to-r from-emerald-500 to-teal-400"
            barWidth={bestScore}
            icon={
              <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2l2 4.5 5 .7-3.6 3.5.85 5L10 13.5l-4.25 2.2.85-5L3 7.2l5-.7L10 2z" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
            }
          />

          <StatCard
            label="Questions Done"
            value={totalQuestions > 0 ? totalQuestions.toLocaleString() : "0"}
            sub="Total answered"
            gradient="bg-gradient-to-br from-cyan-600/20 via-blue-500/10 to-transparent"
            glow="bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
            border="border-cyan-500/25"
            barColor="bg-gradient-to-r from-cyan-500 to-blue-400"
            barWidth={Math.min((totalQuestions / 500) * 100, 100)}
            icon={
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/25 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#22d3ee" strokeWidth="1.6"/>
                  <path d="M10 7v3.5l2.5 2.5" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />
        </div>

        {/* ══ 3 + 4. MAIN GRID ════════════════════════════════ */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Quick Actions ─────────────────────────────────── */}
          <div className="space-y-3.5 animate-fade-up animate-fade-up-2">
            <h2 className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-white/35 px-1">Quick Actions</h2>

            {/* START EXAM — flagship CTA */}
            <Link href="/exam"
              className="group relative flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.30) 0%, rgba(124,58,237,0.20) 100%)",
                border: "1px solid rgba(99,102,241,0.45)",
                boxShadow: "0 8px 32px -4px rgba(99,102,241,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
              {/* Inner top shimmer */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
              {/* Hover bloom */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-indigo-500/15 to-violet-500/10" />
              {/* Icon */}
              <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/50 group-hover:scale-110 group-hover:shadow-indigo-500/70 transition-all duration-300 shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5"/>
                  <path d="M8 7l6 3-6 3V7z" fill="white"/>
                </svg>
              </div>
              <div className="relative z-10 flex-1">
                <p className="text-base font-bold text-white">Start New Exam</p>
                <p className="text-xs text-indigo-100 mt-0.5 font-medium">Choose subject, year & mode</p>
              </div>
              <div className="relative z-10 w-7 h-7 rounded-lg bg-white/[0.10] flex items-center justify-center text-indigo-300 group-hover:text-white group-hover:bg-white/[0.18] group-hover:translate-x-0.5 transition-all duration-300">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            {/* CONTINUE */}
            <Link href="/exam"
              className="group relative flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(234,88,12,0.10) 100%)",
                border: "1px solid rgba(245,158,11,0.30)",
                boxShadow: "0 4px 20px -4px rgba(245,158,11,0.20)",
              }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-amber-500/5" />
              <div className="relative z-10 w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/30 transition-all duration-300 shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 10A5 5 0 115 10" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round"/>
                  <path d="M15 6v4h-4" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="relative z-10 flex-1">
                <p className="text-base font-bold text-white">Continue Practice</p>
                <p className="text-xs text-amber-100 mt-0.5 font-medium">Pick up where you left off</p>
              </div>
              <div className="relative z-10 text-amber-500/40 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            {/* REVIEW RESULTS */}
            <Link href="/exam/review"
              className="group relative flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.08) 100%)",
                border: "1px solid rgba(16,185,129,0.28)",
                boxShadow: "0 4px 20px -4px rgba(16,185,129,0.18)",
              }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-emerald-500/5" />
              <div className="relative z-10 w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all duration-300 shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 11l2 2 4-4" stroke="#10b981" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="4" width="14" height="13" rx="2" stroke="#10b981" strokeWidth="1.5"/>
                  <path d="M7 4V2M13 4V2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="relative z-10 flex-1">
                <p className="text-base font-bold text-white">Review Results</p>
                <p className="text-xs text-emerald-100 mt-0.5 font-medium">See your answer breakdown</p>
              </div>
              <div className="relative z-10 text-emerald-500/40 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            {/* Performance bar */}
            {totalExams > 0 && (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-white/45 uppercase tracking-widest">Avg Performance</p>
                  <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${getGrade(avgScore).bg} ${getGrade(avgScore).color}`}>
                    {getGrade(avgScore).label}
                  </span>
                </div>
                <div className="h-2.5 bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-1000 ease-out"
                    style={{ width: `${avgScore}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-white/25">0%</span>
                  <span className="text-[10px] text-white/40 font-semibold">{avgScore}%</span>
                  <span className="text-[10px] text-white/25">100%</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Recent Activity ──────────────────────────────── */}
          <div className="lg:col-span-2 animate-fade-up animate-fade-up-3">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-white/35">Recent Activity</h2>
              {totalExams > 0 && (
                <Link href="/exam/review"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1">
                  View all
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </Link>
              )}
            </div>

            <div className="bg-white/[0.05] border border-white/[0.12] rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 8px 40px -4px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)" }}>

              {recentResults.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/15 border border-indigo-500/25 flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="15" rx="2" stroke="rgba(129,140,248,0.6)" strokeWidth="1.5"/>
                      <path d="M8 9h8M8 13h5" stroke="rgba(129,140,248,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-white font-bold text-base mb-1">No exams yet</p>
                  <p className="text-white/40 text-sm mb-6 max-w-xs">Take your first exam and start building your performance history</p>
                  <Link href="/exam"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all duration-200">
                    Start First Exam
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.10] bg-white/[0.04]">
                    <span className="col-span-1 text-[10px] font-black uppercase tracking-widest text-white/30">#</span>
                    <span className="col-span-4 text-[10px] font-black uppercase tracking-widest text-white/30">Date</span>
                    <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Score</span>
                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">%</span>
                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Grade</span>
                  </div>

                  {/* Rows */}
                  {recentResults.map((r, i) => {
                    const pct = Math.round((r.score / r.total) * 100)
                    const grade = getGrade(pct)
                    const isEven = i % 2 === 0
                    return (
                      <div key={r.id}
                        className={`group grid grid-cols-12 items-center px-5 py-4 border-b border-white/[0.04] last:border-0 transition-colors duration-150 ${
                          isEven ? "bg-white/[0.01]" : ""
                        } hover:bg-indigo-500/[0.06]`}>
                        {/* # */}
                        <span className="col-span-1 text-xs text-white/30 font-mono font-bold">{i + 1}</span>

                        {/* Date */}
                        <div className="col-span-4">
                          <p className="text-sm text-white font-bold">{formatDate(r.created_at)}</p>
                          <p className="text-xs text-white/55 mt-0.5 font-medium">{r.total} questions</p>
                        </div>

                        {/* Score */}
                        <div className="col-span-3 flex items-center justify-center gap-1">
                          <span className="text-sm font-extrabold text-white">{r.score}</span>
                          <span className="text-xs text-white/55 font-semibold">/ {r.total}</span>
                        </div>

                        {/* % ring */}
                        <div className="col-span-2 flex justify-center">
                          <div className="relative w-9 h-9">
                            <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5"/>
                              <circle cx="18" cy="18" r="14" fill="none"
                                stroke={pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="3.5" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 14}`}
                                strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
                                style={{ filter: pct >= 70 ? "drop-shadow(0 0 4px rgba(16,185,129,0.5))" : pct >= 50 ? "drop-shadow(0 0 4px rgba(245,158,11,0.5))" : "drop-shadow(0 0 4px rgba(239,68,68,0.5))" }}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white/80">
                              {pct}
                            </span>
                          </div>
                        </div>

                        {/* Grade pill */}
                        <div className="col-span-2 flex justify-center">
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${grade.bg} ${grade.color}`}>
                            {grade.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ══ 5. SUBJECT CARDS ════════════════════════════════ */}
        <div className="animate-fade-up animate-fade-up-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-white/35">Practice by Subject</h2>
            <span className="text-[10px] text-white/25 font-medium">Click to start a session</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Mathematics", questions: 240,
                gradient: "from-indigo-600/25 to-indigo-500/10",
                border: "border-indigo-500/30",
                glow: "rgba(99,102,241,0.25)",
                iconBg: "bg-indigo-500/20 border-indigo-500/30",
                iconColor: "#818cf8",
                hoverGlow: "group-hover:shadow-indigo-500/30",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.45"/>
                  </svg>
                ),
              },
              {
                name: "Biology", questions: 185,
                gradient: "from-emerald-600/25 to-emerald-500/10",
                border: "border-emerald-500/30",
                glow: "rgba(16,185,129,0.25)",
                iconBg: "bg-emerald-500/20 border-emerald-500/30",
                iconColor: "#34d399",
                hoverGlow: "group-hover:shadow-emerald-500/30",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3C8 3 4 7 4 12s4 9 8 9 8-4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 3c4 0 8 4 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2"/>
                    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ),
              },
              {
                name: "Chemistry", questions: 210,
                gradient: "from-amber-600/25 to-amber-500/10",
                border: "border-amber-500/30",
                glow: "rgba(245,158,11,0.25)",
                iconBg: "bg-amber-500/20 border-amber-500/30",
                iconColor: "#f59e0b",
                hoverGlow: "group-hover:shadow-amber-500/30",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M9 3v7L4 18a1 1 0 00.9 1.5h14.2A1 1 0 0020 18l-5-8V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 3h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="10.5" cy="15" r="1.2" fill="currentColor"/>
                    <circle cx="14" cy="13" r="1" fill="currentColor"/>
                  </svg>
                ),
              },
              {
                name: "English", questions: 160,
                gradient: "from-pink-600/25 to-pink-500/10",
                border: "border-pink-500/30",
                glow: "rgba(236,72,153,0.25)",
                iconBg: "bg-pink-500/20 border-pink-500/30",
                iconColor: "#f472b6",
                hoverGlow: "group-hover:shadow-pink-500/30",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M4 12h10M4 17h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
              },
            ].map((s) => (
              <Link key={s.name} href="/exam"
                className={`group relative flex flex-col bg-gradient-to-b ${s.gradient} border ${s.border} rounded-2xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${s.hoverGlow}`}
                style={{ boxShadow: `0 4px 20px -4px rgba(0,0,0,0.4)` }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent" style={{
                  backgroundImage: `linear-gradient(to right, transparent, ${s.glow.replace("rgba","rgba").replace("0.25","0.6")}, transparent)`
                }} />
                {/* Hover glow bloom */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${s.glow.replace("0.25","0.12")}, transparent 70%)` }} />

                <div className={`relative z-10 w-12 h-12 rounded-xl border ${s.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  style={{ color: s.iconColor }}>
                  {s.icon}
                </div>
                <div className="relative z-10 flex items-start justify-between gap-2 mb-1">
                  <p className="text-base font-bold text-white leading-tight">{s.name}</p>
                </div>
                <p className="relative z-10 text-xs text-white/40 mb-3">{s.questions} questions</p>
                <div className="relative z-10 mt-auto flex items-center gap-1 text-xs font-semibold text-white/30 group-hover:text-white/60 transition-colors duration-200">
                  Start now
                  <svg className="group-hover:translate-x-0.5 transition-transform duration-200" width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══ FOOTER ══════════════════════════════════════════ */}
        <footer className="border-t border-white/[0.07] pt-8 pb-4 animate-fade-up animate-fade-up-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white/40 text-sm font-semibold">ExamPrep</span>
              <span className="text-white/15 mx-1">·</span>
              <span className="text-white/25 text-xs">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors font-medium">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors font-medium">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors font-medium">Support</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  )
}

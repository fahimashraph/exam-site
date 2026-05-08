"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

// ── Types ────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getGrade(pct: number) {
  if (pct >= 90) return { label: "A+", color: "text-emerald-400" }
  if (pct >= 80) return { label: "A",  color: "text-emerald-400" }
  if (pct >= 70) return { label: "B",  color: "text-indigo-400"  }
  if (pct >= 60) return { label: "C",  color: "text-amber-400"   }
  if (pct >= 50) return { label: "D",  color: "text-orange-400"  }
  return               { label: "F",  color: "text-red-400"      }
}

function getStreak(results: Result[]) {
  if (!results.length) return 0
  const days = results
    .map((r) => new Date(r.created_at).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const diff =
      (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) /
      86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

// ── Reusable stat card ───────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accent} rounded-2xl blur-xl`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent.replace("bg-", "bg-").replace("/5", "/15")}`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mt-1">{label}</p>
        {sub && <p className="text-[11px] text-white/25 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Subject card ─────────────────────────────────────────────────
function SubjectCard({
  name,
  icon,
  questions,
  color,
  glow,
}: {
  name: string
  icon: React.ReactNode
  questions: number
  color: string
  glow: string
}) {
  return (
    <Link
      href="/exam"
      className="group relative flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glow} rounded-2xl blur-xl`} />
      <div className={`relative z-10 w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-white/35 mt-0.5">{questions} questions</p>
      </div>
      <div className="relative z-10 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-300">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  )
}

// ── Main dashboard ───────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  // ── Auth + data fetch (all Supabase logic preserved) ─────────
  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/auth?mode=login")
        return
      }
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

  // Derived stats
  const totalExams      = results.length
  const totalQuestions  = results.reduce((s, r) => s + (r.total ?? 0), 0)
  const avgScore        = totalExams
    ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / totalExams)
    : 0
  const bestScore       = totalExams
    ? Math.round(Math.max(...results.map((r) => (r.score / r.total) * 100)))
    : 0
  const streak          = getStreak(results)
  const displayName     = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "Student"
  const recentResults   = results.slice(0, 5)

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[110px] pointer-events-none" />
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[5%] w-[550px] h-[550px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute top-[40%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/7 blur-[100px]" />
        <div className="absolute bottom-[5%] right-[20%] w-[350px] h-[350px] rounded-full bg-blue-600/5 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── NAVBAR ── */}
      <header className="relative z-20 border-b border-white/[0.07] bg-white/[0.02] backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/45 transition-shadow duration-300">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white hidden sm:block">ExamPrep</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Dashboard", href: "/dashboard", active: true },
              { label: "Exams",     href: "/exam",      active: false },
              { label: "Results",   href: "/exam/review", active: false },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/45 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User pill */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/80 to-violet-600/80 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-white/70 font-medium max-w-[120px] truncate">
                {displayName}
              </span>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white border border-white/[0.07] hover:border-white/[0.14] bg-white/[0.03] hover:bg-white/[0.07] px-3.5 py-2 rounded-xl transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── PAGE BODY ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-10">

        {/* ══ 1. WELCOME SECTION ══════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-fade-up">

          {/* Greeting */}
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-400 mb-2">
              Welcome back
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Hey, {displayName} 👋
            </h1>
            <p className="text-white/40 text-sm font-light mt-2 max-w-md">
              {totalExams === 0
                ? "Ready to start your first exam? Let's build that streak."
                : avgScore >= 70
                ? "You're on a roll — keep that momentum going."
                : "Every exam makes you sharper. Keep pushing forward."}
            </p>
          </div>

          {/* Streak card */}
          <div className="relative bg-gradient-to-br from-indigo-500/15 to-violet-600/10 border border-indigo-500/25 rounded-2xl px-6 py-5 shrink-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
            <div className="flex items-center gap-4">
              <div className="text-3xl">🔥</div>
              <div>
                <p className="text-2xl font-bold text-white">{streak} day{streak !== 1 ? "s" : ""}</p>
                <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-0.5">Current streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ 2. STATS CARDS ══════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up animate-fade-up-1">
          <StatCard
            label="Exams Taken"
            value={totalExams}
            sub={totalExams === 1 ? "1 attempt" : `${totalExams} attempts`}
            accent="bg-indigo-500/5"
            icon={
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="13" rx="2" stroke="#818cf8" strokeWidth="1.5"/>
                <path d="M7 8h6M7 11h4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7 2v4M13 2v4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
          <StatCard
            label="Average Score"
            value={`${avgScore}%`}
            sub={avgScore >= 70 ? "Above average" : avgScore > 0 ? "Keep going" : "No data yet"}
            accent="bg-violet-500/5"
            icon={
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M4 14l4-5 3 3 5-7" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 17h12" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
          <StatCard
            label="Best Score"
            value={`${bestScore}%`}
            sub={bestScore > 0 ? getGrade(bestScore).label + " grade" : "No exams yet"}
            accent="bg-emerald-500/5"
            icon={
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l2.09 4.26L17 7.27l-3.5 3.41.83 4.82L10 13.25l-4.33 2.27.83-4.82L3 7.27l4.91-.71L10 2z" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            }
          />
          <StatCard
            label="Questions Done"
            value={totalQuestions.toLocaleString()}
            sub="Total answered"
            accent="bg-blue-500/5"
            icon={
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#60a5fa" strokeWidth="1.5"/>
                <path d="M10 10V7M10 13v.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
        </div>

        {/* ══ 3 + 4. MAIN GRID (actions + activity) ══════════════ */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Quick Actions (1 col) ── */}
          <div className="space-y-4 animate-fade-up animate-fade-up-2">
            <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-white/30">Quick Actions</h2>

            {/* Start Exam */}
            <Link
              href="/exam"
              className="group relative flex items-center gap-4 bg-gradient-to-r from-indigo-500/20 to-violet-600/15 hover:from-indigo-500/30 hover:to-violet-600/25 border border-indigo-500/30 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-indigo-500/5 rounded-2xl" />
              <div className="relative z-10 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300 shrink-0">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5"/>
                  <path d="M8 7l6 3-6 3V7z" fill="white"/>
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-white">Start New Exam</p>
                <p className="text-xs text-white/40 mt-0.5">Begin a fresh practice session</p>
              </div>
              <div className="relative z-10 ml-auto text-indigo-400/60 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            {/* Continue Last */}
            <Link
              href="/exam"
              className="group flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M15 10A5 5 0 115 10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M15 6v4h-4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Continue Last Exam</p>
                <p className="text-xs text-white/40 mt-0.5">Pick up where you left off</p>
              </div>
              <div className="ml-auto text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            {/* Review Results */}
            <Link
              href="/exam/review"
              className="group flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M9 11l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="4" width="14" height="13" rx="2" stroke="#10b981" strokeWidth="1.5"/>
                  <path d="M7 4V2M13 4V2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Review Results</p>
                <p className="text-xs text-white/40 mt-0.5">See detailed answer breakdown</p>
              </div>
              <div className="ml-auto text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            {/* Progress bar card */}
            {totalExams > 0 && (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Avg Performance</p>
                  <span className={`text-sm font-bold ${getGrade(avgScore).color}`}>
                    {getGrade(avgScore).label}
                  </span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out"
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-white/25">0%</span>
                  <span className="text-[10px] text-white/25">100%</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Recent Activity (2 cols) ── */}
          <div className="lg:col-span-2 animate-fade-up animate-fade-up-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-white/30">Recent Activity</h2>
              {totalExams > 0 && (
                <Link href="/exam/review" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  View all →
                </Link>
              )}
            </div>

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              {recentResults.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="15" rx="2" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                      <path d="M8 9h8M8 13h5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-white/50 font-medium text-sm mb-1">No exams yet</p>
                  <p className="text-white/25 text-xs mb-5">Take your first exam to see results here</p>
                  <Link
                    href="/exam"
                    className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
                  >
                    Start First Exam
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06]">
                    <span className="col-span-1 text-[10px] font-bold uppercase tracking-widest text-white/25">#</span>
                    <span className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-white/25">Date</span>
                    <span className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-white/25 text-center">Score</span>
                    <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-white/25 text-center">%</span>
                    <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-white/25 text-center">Grade</span>
                  </div>

                  {/* Rows */}
                  {recentResults.map((r, i) => {
                    const pct = Math.round((r.score / r.total) * 100)
                    const grade = getGrade(pct)
                    return (
                      <div
                        key={r.id}
                        className="group grid grid-cols-12 items-center px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] transition-colors duration-200"
                      >
                        <span className="col-span-1 text-xs text-white/25 font-mono">{i + 1}</span>

                        <div className="col-span-4">
                          <p className="text-sm text-white/80 font-medium">{formatDate(r.created_at)}</p>
                          <p className="text-[10px] text-white/30 mt-0.5">
                            {r.total} questions
                          </p>
                        </div>

                        <div className="col-span-3 flex items-center justify-center gap-1">
                          <span className="text-sm font-bold text-white">{r.score}</span>
                          <span className="text-xs text-white/30">/ {r.total}</span>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <div className="relative w-8 h-8">
                            <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
                              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                              <circle
                                cx="16" cy="16" r="12" fill="none"
                                stroke={pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 12}`}
                                strokeDashoffset={`${2 * Math.PI * 12 * (1 - pct / 100)}`}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/70">
                              {pct}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <span className={`text-sm font-bold ${grade.color}`}>{grade.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ══ 5. SUBJECT CARDS ════════════════════════════════════ */}
        <div className="animate-fade-up animate-fade-up-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-white/30">Practice by Subject</h2>
            <span className="text-[10px] text-white/20 font-medium">Click any subject to start</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SubjectCard
              name="Mathematics"
              questions={240}
              color="bg-indigo-500/15"
              glow="bg-indigo-500/5"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M10 4v12" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 5l10 10M15 5L5 15" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
                </svg>
              }
            />
            <SubjectCard
              name="Biology"
              questions={185}
              color="bg-emerald-500/15"
              glow="bg-emerald-500/5"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3C7 3 4 6 4 10s3 7 6 7 6-3 6-7" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M10 3c3 0 6 3 6 7" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
                  <circle cx="10" cy="10" r="2" stroke="#34d399" strokeWidth="1.5"/>
                </svg>
              }
            />
            <SubjectCard
              name="Chemistry"
              questions={210}
              color="bg-amber-500/15"
              glow="bg-amber-500/5"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 3v5L3 15a1 1 0 00.9 1.5h12.2A1 1 0 0017 15l-4-7V3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 3h7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="13" r="1" fill="#f59e0b"/>
                  <circle cx="12" cy="11.5" r="0.8" fill="#f59e0b"/>
                </svg>
              }
            />
            <SubjectCard
              name="English"
              questions={160}
              color="bg-pink-500/15"
              glow="bg-pink-500/5"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 6h12M4 10h8M4 14h10" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* ══ FOOTER ══════════════════════════════════════════════ */}
        <footer className="border-t border-white/[0.06] pt-8 pb-4 animate-fade-up animate-fade-up-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white/30 text-xs font-medium">ExamPrep</span>
              <span className="text-white/15 mx-1">·</span>
              <span className="text-white/20 text-xs">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/25">
              <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/50 transition-colors">Support</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  )
}

"use client"

import Link from "next/link"

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS (inline — no extra files needed)
// All routing/auth hrefs preserved exactly as before.
// ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          AMBIENT BACKGROUND — fixed, behind everything
      ══════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Primary glow — top left */}
        <div className="absolute -top-40 -left-20 w-[700px] h-[700px] rounded-full bg-indigo-600/[0.09] blur-[140px]" />
        {/* Secondary glow — right */}
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        {/* Tertiary — bottom */}
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/[0.06] blur-[110px]" />
        {/* Noise grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)]" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          1. NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-50 w-full">
        <nav className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9H11" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">ExamPrep</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { label: "Features",  href: "#features"   },
              { label: "Subjects",  href: "#subjects"   },
              { label: "Resources", href: "#resources"  },
              { label: "Pricing",   href: "#pricing"    },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all duration-200">
                {item.label}
              </a>
            ))}
          </div>

          {/* Auth CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/auth?mode=login"
              className="hidden sm:block text-sm font-medium text-white/55 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.05] transition-all duration-200">
              Login
            </Link>
            <Link href="/auth?mode=signup"
              className="flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200">
              Start Practising
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </nav>
        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </header>

      {/* ══════════════════════════════════════════════════════════
          2. HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-24 pb-20 sm:pt-32 sm:pb-28 px-5 sm:px-8 text-center">
        <div className="max-w-5xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/[0.10] border border-indigo-500/[0.25] text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Trusted by 50,000+ IGCSE &amp; A-Level students
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-tight mb-6">
            <span className="text-white">Master Your</span>{" "}
            <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Past Papers.
              </span>
              {/* Underline accent */}
              <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
            </span>
          </h1>

          {/* Sub */}
          <p className="text-base sm:text-lg text-white/45 max-w-xl mx-auto leading-relaxed font-light mb-10">
            Simulate real IGCSE &amp; A-Level exams. Get instant feedback in Practice Mode.
            Track your performance. Build confidence before exam day.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/auth?mode=signup"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 text-sm">
              Get Started Free
              <svg className="group-hover:translate-x-0.5 transition-transform duration-200" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/auth?mode=login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-medium text-white/55 hover:text-white border border-white/[0.10] hover:border-white/[0.20] px-7 py-3.5 rounded-xl transition-all duration-200">
              I already have an account
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto max-w-3xl">
            {/* Glow behind mockup */}
            <div className="absolute inset-x-10 -bottom-8 h-24 bg-indigo-500/20 blur-2xl rounded-full" />
            <div className="relative rounded-2xl border border-white/[0.10] bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
              {/* Mockup top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/8" />
                </div>
                <div className="flex-1 mx-3 h-5 bg-white/[0.04] rounded-md border border-white/[0.06] flex items-center px-2.5 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="h-1.5 w-28 bg-white/10 rounded-full" />
                </div>
              </div>
              {/* Mockup body */}
              <div className="p-5 sm:p-6 grid grid-cols-4 gap-3">
                {/* Stat cards */}
                {[
                  { label: "Exams Taken", value: "12", color: "text-indigo-400", bar: "bg-indigo-500/40" },
                  { label: "Avg Score", value: "74%", color: "text-violet-400", bar: "bg-violet-500/40" },
                  { label: "Best Score", value: "91%", color: "text-emerald-400", bar: "bg-emerald-500/40" },
                  { label: "Questions", value: "480", color: "text-blue-400", bar: "bg-blue-500/40" },
                ].map((s, i) => (
                  <div key={i} className="col-span-2 sm:col-span-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1.5">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color} mb-2`}>{s.value}</p>
                    <div className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
                      <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${[72, 74, 91, 60][i]}%` }} />
                    </div>
                  </div>
                ))}
                {/* Recent activity row */}
                <div className="col-span-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-3">Recent Activity</p>
                  <div className="space-y-2">
                    {[
                      { subject: "Mathematics", year: "2023", score: "18/20", pct: "90%", pass: true },
                      { subject: "Biology",     year: "2022", score: "14/20", pct: "70%", pass: true },
                      { subject: "Chemistry",   year: "2021", score: "11/20", pct: "55%", pass: false },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.pass ? "bg-emerald-400" : "bg-amber-400"}`} />
                          <span className="text-white/60 font-medium truncate">{row.subject}</span>
                          <span className="text-white/25 shrink-0">{row.year}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-white/40">{row.score}</span>
                          <span className={`font-semibold ${row.pass ? "text-emerald-400" : "text-amber-400"}`}>{row.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof stats */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {[
              { value: "50K+",  label: "Students" },
              { value: "98%",   label: "Pass Rate" },
              { value: "2,400+",label: "Questions" },
              { value: "11",    label: "Years of Papers" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{s.value}</p>
                <p className="text-[10px] text-white/35 mt-0.5 font-semibold uppercase tracking-[0.15em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Platform</SectionLabel>
          <SectionHeading>Everything You Need to Ace Your Exam</SectionHeading>
          <SectionSub>Designed for IGCSE and A-Level students who want structured, effective preparation.</SectionSub>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Real Exam Mode",
                desc: "90-minute countdown, strict conditions, no hints. Auto-submits when time expires. Feel exactly what exam day is like.",
                tag: "Timed",
                iconBg: "bg-indigo-500/15", iconColor: "#818cf8",
                gradient: "from-indigo-500/[0.12] to-transparent", border: "border-indigo-500/20",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4.5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                title: "Practice Mode",
                desc: "No timer, instant feedback after each answer. Green highlights correct answers, red shows mistakes. Learn as you go.",
                tag: "Relaxed",
                iconBg: "bg-emerald-500/15", iconColor: "#34d399",
                gradient: "from-emerald-500/[0.12] to-transparent", border: "border-emerald-500/20",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                title: "Instant Review",
                desc: "After every exam, see a full breakdown — every question, every correct answer, your answer, and what you got wrong.",
                tag: "Detailed",
                iconBg: "bg-violet-500/15", iconColor: "#a78bfa",
                gradient: "from-violet-500/[0.12] to-transparent", border: "border-violet-500/20",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                title: "Performance Analytics",
                desc: "Track your average score, best score, streak, and total questions answered from your personal dashboard.",
                tag: "Insights",
                iconBg: "bg-blue-500/15", iconColor: "#60a5fa",
                gradient: "from-blue-500/[0.12] to-transparent", border: "border-blue-500/20",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><path d="M4 15l4-5 3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                title: "Past Papers by Year",
                desc: "Access official past papers from 2015 to 2025. Questions appear in the exact official order — no randomisation.",
                tag: "Official",
                iconBg: "bg-amber-500/15", iconColor: "#f59e0b",
                gradient: "from-amber-500/[0.12] to-transparent", border: "border-amber-500/20",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                title: "Mobile-Friendly",
                desc: "Fully responsive across phones, tablets, and desktops. Practise on the bus, at home, or anywhere you study.",
                tag: "Responsive",
                iconBg: "bg-pink-500/15", iconColor: "#f472b6",
                gradient: "from-pink-500/[0.12] to-transparent", border: "border-pink-500/20",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="15" r="0.8" fill="currentColor"/></svg>,
              },
            ].map((f, i) => (
              <div key={i} className={`group relative bg-gradient-to-b ${f.gradient} border ${f.border} rounded-2xl p-6 hover:scale-[1.02] hover:border-opacity-60 transition-all duration-300 overflow-hidden`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.015] rounded-2xl" />
                <div className={`relative w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`} style={{ color: f.iconColor }}>
                  {f.icon}
                </div>
                <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/25">{f.tag}</span>
                <h3 className="text-base font-bold text-white mt-2 mb-2.5">{f.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. EXAM MODES SHOWCASE
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Modes</SectionLabel>
          <SectionHeading>Two Modes, One Goal</SectionHeading>
          <SectionSub>Whether you&apos;re learning or testing yourself under pressure — we have the right mode.</SectionSub>

          <div className="mt-14 grid sm:grid-cols-2 gap-6">
            {/* Practice Mode */}
            <div className="relative bg-gradient-to-b from-emerald-500/[0.13] to-transparent border border-emerald-500/25 rounded-2xl p-7 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="#34d399" strokeWidth="1.5"/>
                    <path d="M7 10.5l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <span className="text-[8px] font-bold tracking-[0.16em] uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-md">Relaxed</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Practice Mode</h3>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "No time pressure — go at your own pace",
                  "Instant green/red feedback per answer",
                  "Correct answer revealed immediately",
                  "Explanation placeholder per question",
                  "Navigator shows correct / wrong / skipped",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/55">
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="#34d399" strokeWidth="1.2"/>
                      <path d="M4.5 7.5l1.5 1.5 3.5-3.5" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 px-5 py-2.5 rounded-xl transition-all duration-200">
                Start Practising
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            {/* Real Exam Mode */}
            <div className="relative bg-gradient-to-b from-indigo-500/[0.13] to-transparent border border-indigo-500/25 rounded-2xl p-7 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#818cf8" strokeWidth="1.5"/>
                    <path d="M10 6v4.5l3 2" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <span className="text-[8px] font-bold tracking-[0.16em] uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-md">Official</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Real Exam Mode</h3>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "90-minute official countdown timer",
                  "Sticky timer with amber/red warnings",
                  "Zero feedback during the exam",
                  "Auto-submits the moment time runs out",
                  "Full answer breakdown on review page",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/55">
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="#818cf8" strokeWidth="1.2"/>
                      <path d="M4.5 7.5l1.5 1.5 3.5-3.5" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-400 px-5 py-2.5 rounded-xl transition-all duration-200">
                Try Real Exam
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. SUBJECTS
      ══════════════════════════════════════════════════════════ */}
      <section id="subjects" className="relative z-10 py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Subjects</SectionLabel>
          <SectionHeading>Pick Your Subject</SectionHeading>
          <SectionSub>Past papers and practice questions across core IGCSE &amp; A-Level subjects.</SectionSub>

          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Mathematics", code: "MATH", papers: "11 papers",
                gradient: "from-indigo-500/20 to-indigo-600/5", border: "border-indigo-500/22",
                iconBg: "bg-indigo-500/20", iconColor: "#818cf8",
                badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4"/></svg>,
              },
              {
                name: "Biology", code: "BIO", papers: "11 papers",
                gradient: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/22",
                iconBg: "bg-emerald-500/20", iconColor: "#34d399",
                badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3C8 3 4 7 4 12s4 9 8 9 8-4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 3c4 0 8 4 8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 2"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8"/></svg>,
              },
              {
                name: "Chemistry", code: "CHEM", papers: "11 papers",
                gradient: "from-amber-500/20 to-amber-600/5", border: "border-amber-500/22",
                iconBg: "bg-amber-500/20", iconColor: "#f59e0b",
                badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 3v7L4 18a1 1 0 00.9 1.5h14.2A1 1 0 0020 18l-5-8V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 3h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="10.5" cy="15" r="1.2" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/></svg>,
              },
              {
                name: "English", code: "ENG", papers: "11 papers",
                gradient: "from-pink-500/20 to-pink-600/5", border: "border-pink-500/22",
                iconBg: "bg-pink-500/20", iconColor: "#f472b6",
                badge: "bg-pink-500/15 text-pink-400 border-pink-500/25",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
              },
            ].map((s, i) => (
              <Link key={i} href="/auth?mode=signup"
                className={`group relative flex flex-col bg-gradient-to-b ${s.gradient} border ${s.border} hover:border-opacity-70 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.015]" />
                <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`} style={{ color: s.iconColor }}>
                  {s.icon}
                </div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-[15px] font-bold text-white leading-tight">{s.name}</h3>
                  <span className={`text-[8px] font-bold tracking-widest uppercase border px-1.5 py-0.5 rounded-md shrink-0 ${s.badge}`}>{s.code}</span>
                </div>
                <p className="text-xs text-white/35 mb-4">{s.papers} available</p>
                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-white/30 group-hover:text-white/60 transition-colors duration-200">
                  Start practising
                  <svg className="group-hover:translate-x-0.5 transition-transform duration-200" width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Coming soon note */}
          <p className="mt-6 text-center text-xs text-white/22">
            Physics, History, Geography, Economics &amp; more coming soon.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. STATISTICS
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-r from-indigo-500/[0.08] via-violet-500/[0.06] to-indigo-500/[0.08] border border-white/[0.09] rounded-3xl px-8 py-12 sm:px-14 sm:py-14 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center">
              {[
                { value: "11",    label: "Years of Past Papers",   sub: "2015 – 2025" },
                { value: "2,400+",label: "Practice Questions",     sub: "Across all subjects" },
                { value: "6",     label: "Subjects Covered",       sub: "& growing fast" },
                { value: "100%",  label: "Performance Tracked",    sub: "On your dashboard" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{s.value}</p>
                  <p className="text-sm font-semibold text-white/55 mt-1.5">{s.label}</p>
                  <p className="text-xs text-white/25 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. RESOURCES PREVIEW
      ══════════════════════════════════════════════════════════ */}
      <section id="resources" className="relative z-10 py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Coming Soon</SectionLabel>
          <SectionHeading>Beyond Past Papers</SectionHeading>
          <SectionSub>We&apos;re building a full revision toolkit — study smarter, not just harder.</SectionSub>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: "60-Second Summaries",
                desc: "Every examinable topic distilled into a punchy 60-second read. Perfect for last-minute review.",
                tag: "Coming Soon",
                iconBg: "bg-violet-500/15", iconColor: "#a78bfa",
                gradient: "from-violet-500/10 to-transparent", border: "border-violet-500/18",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4.5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                title: "Revision Notes",
                desc: "Structured, examiner-aligned notes for each topic. Designed to complement official syllabuses.",
                tag: "Coming Soon",
                iconBg: "bg-blue-500/15", iconColor: "#60a5fa",
                gradient: "from-blue-500/10 to-transparent", border: "border-blue-500/18",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7h6M7 11h4M7 15h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                title: "Quick Study Guides",
                desc: "Topic-by-topic guides covering definitions, formulas, and key facts you can't afford to miss.",
                tag: "Coming Soon",
                iconBg: "bg-pink-500/15", iconColor: "#f472b6",
                gradient: "from-pink-500/10 to-transparent", border: "border-pink-500/18",
                icon: <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><path d="M10 2l2 6h6l-5 3.6 1.9 6L10 14l-4.9 3.6L7 11.6 2 8h6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
              },
            ].map((r, i) => (
              <div key={i} className={`relative bg-gradient-to-b ${r.gradient} border ${r.border} rounded-2xl p-6 overflow-hidden`}>
                <div className={`w-10 h-10 rounded-xl ${r.iconBg} flex items-center justify-center mb-5`} style={{ color: r.iconColor }}>
                  {r.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[8px] font-bold tracking-[0.16em] uppercase bg-white/[0.06] border border-white/[0.10] text-white/35 px-2 py-0.5 rounded-md">{r.tag}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-3 mb-2">{r.title}</h3>
                <p className="text-sm text-white/38 font-light leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-[120px] bg-white/[0.06]" />
            <p className="text-xs text-white/25 font-medium">Notify me when resources launch</p>
            <div className="h-px flex-1 max-w-[120px] bg-white/[0.06]" />
          </div>
          <div className="mt-5 flex justify-center">
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 w-full max-w-sm">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-white/20 transition-colors duration-200"
              />
              <button type="submit"
                className="text-sm font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl transition-all duration-200 shrink-0">
                Notify me
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Students</SectionLabel>
          <SectionHeading>What Students Say</SectionHeading>
          <SectionSub>Real results from students who prepared with ExamPrep.</SectionSub>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                quote: "I went from 58% to 82% in Biology after practising three years of past papers. The Practice Mode is incredible — I knew exactly what I got wrong instantly.",
                name: "Amara K.",
                detail: "IGCSE Biology — Grade A",
                initial: "A",
                color: "bg-emerald-500/20 text-emerald-400",
              },
              {
                quote: "Real Exam Mode is the closest thing to sitting the actual paper. I timed myself, auto-submit hit me at 90 minutes, and the review showed every mistake. Scary but so useful.",
                name: "David M.",
                detail: "IGCSE Mathematics — Grade A*",
                initial: "D",
                color: "bg-indigo-500/20 text-indigo-400",
              },
              {
                quote: "I love that questions follow the official paper order. No randomisation means I can feel the actual exam structure and difficulty curve. This is the real deal.",
                name: "Sofia T.",
                detail: "IGCSE Chemistry — Grade B",
                initial: "S",
                color: "bg-violet-500/20 text-violet-400",
              },
              {
                quote: "The dashboard is brilliant. Seeing my average score go up over time was so motivating. I could see exactly where I was weak and what to focus on.",
                name: "Jayden O.",
                detail: "IGCSE English — Grade A",
                initial: "J",
                color: "bg-amber-500/20 text-amber-400",
              },
              {
                quote: "Practising on my phone during the commute was a game changer. Fully works on mobile — beautiful UI too. Nothing else comes close for IGCSE prep.",
                name: "Priya R.",
                detail: "IGCSE Biology — Grade A*",
                initial: "P",
                color: "bg-pink-500/20 text-pink-400",
              },
              {
                quote: "The review page after each exam is detailed. I could see my answer, the correct answer, and which ones I skipped. Helped me fix bad habits fast.",
                name: "Ethan B.",
                detail: "IGCSE Physics — Grade B",
                initial: "E",
                color: "bg-blue-500/20 text-blue-400",
              },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.13] rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05]">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b">
                      <path d="M7 1l1.5 4h4l-3.2 2.4 1.2 4L7 9 3.5 11.4l1.2-4L1.5 5h4z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-white/55 leading-relaxed font-light mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] text-white/30">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. FINAL CTA
      ══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.10] rounded-3xl px-8 py-14 sm:px-14 sm:py-16 overflow-hidden backdrop-blur-sm">
            {/* Top line glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
            {/* Inner glow */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-indigo-500/[0.07] to-transparent pointer-events-none" />

            <div className="relative">
              <span className="inline-block text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 mb-4">Free to Start</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
                Ready to pass your exam?
              </h2>
              <p className="text-white/40 text-base font-light mb-8 max-w-sm mx-auto leading-relaxed">
                Join thousands of students already using ExamPrep to build confidence and ace their exams.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/auth?mode=signup"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 text-sm">
                  Start Practising Free
                  <svg className="group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link href="/auth?mode=login"
                  className="w-full sm:w-auto flex items-center justify-center text-sm font-medium text-white/45 hover:text-white border border-white/[0.09] hover:border-white/[0.18] px-7 py-3.5 rounded-xl transition-all duration-200">
                  Sign in instead
                </Link>
              </div>

              <p className="mt-6 text-xs text-white/22">No credit card required · Free forever for core features</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">ExamPrep</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed mb-4">
                Premium past paper simulator for IGCSE &amp; A-Level students.
              </p>
              {/* Social placeholders */}
              <div className="flex gap-2">
                {["X", "IG", "YT"].map((s) => (
                  <a key={s} href="#"
                    className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] flex items-center justify-center text-[9px] font-bold text-white/30 hover:text-white/60 transition-all duration-200">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/25 mb-4">Platform</p>
              <ul className="space-y-2.5">
                {["Features", "Subjects", "Exam Modes", "Dashboard"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/25 mb-4">Resources</p>
              <ul className="space-y-2.5">
                {["60-Second Summaries", "Revision Notes", "Study Guides", "Past Papers"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/25 mb-4">Legal</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy",   href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Disclaimer",       href: "#" },
                  { label: "Contact Us",       href: "#" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-white/[0.05]">
            <p className="text-xs text-white/22">
              © {new Date().getFullYear()} ExamPrep. All rights reserved.
            </p>
            <p className="text-xs text-white/18 text-center sm:text-right max-w-xs">
              ExamPrep is an independent revision platform and is not affiliated with Cambridge Assessment International Education.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MICRO COMPONENTS — section typography helpers
// ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 mb-3 text-center">
      {children}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-center">
      {children}
    </h2>
  )
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-white/38 text-base font-light text-center max-w-xl mx-auto leading-relaxed">
      {children}
    </p>
  )
}

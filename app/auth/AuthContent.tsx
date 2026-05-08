"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

// ── Reusable field wrapper ───────────────────────────────────────
function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string
  icon: React.ReactNode
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
        <span className="text-white/25">{icon}</span>
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-white/25 pl-0.5">{hint}</p>}
    </div>
  )
}

const inputClass =
  "w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] focus:border-indigo-500/60 focus:bg-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-all duration-200 outline-none"

// ── Inline SVG icons ─────────────────────────────────────────────
const IUser = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2.5 13.5C2.5 11 5 9 8 9s5.5 2 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IMail = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const ILock = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const ISchool = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L15 6l-7 4-7-4 7-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M4 8.5V12.5c0 .8 1.8 1.5 4 1.5s4-.7 4-1.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M15 6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IGrade = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 8h6M5 5.5h4M5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IPhone = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="4" y="1" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="8" cy="12" r="0.8" fill="currentColor"/>
  </svg>
)
const IEye = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M2 10s2.7-6 8-6 8 6 8 6-2.7 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)
const IEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M3 3L17 17M8.5 8.6a2 2 0 002.9 2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6.1 5.1A8 8 0 002 10s2.7 6 8 6c1.7 0 3.2-.5 4.5-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 6.5A4 4 0 0114 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ── Main component ───────────────────────────────────────────────
export default function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get("mode") ?? "login"
  const isLogin = mode === "login"

  // Shared state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Signup-only state
  const [fullName, setFullName] = useState("")
  const [school, setSchool] = useState("")
  const [gradeClass, setGradeClass] = useState("")
  const [phone, setPhone] = useState("")

  // UI state
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // ── ALL ORIGINAL SUPABASE LOGIC PRESERVED ───────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            school,
            grade_class: gradeClass,
            phone,
          },
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Check your email to confirm your account.")
      }
    }

    setLoading(false)
  }
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[110px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9H11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[16px] font-semibold tracking-tight text-white">ExamPrep</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">

          {/* Top edge glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-white/40 font-light">
              {isLogin
                ? "Sign in to continue your exam preparation."
                : "Fill in your details to get started today."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-7">
            <Link
              href="/auth?mode=login"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ══ SIGNUP-ONLY SECTION ══════════════════════════════ */}
            {!isLogin && (
              <>
                {/* Full Name */}
                <Field label="Full Name" icon={<IUser />}>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    autoComplete="name"
                    className={inputClass}
                  />
                </Field>

                {/* School + Grade side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="School" icon={<ISchool />}>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="School name"
                      required
                      autoComplete="organization"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Grade / Class" icon={<IGrade />}>
                    <input
                      type="text"
                      value={gradeClass}
                      onChange={(e) => setGradeClass(e.target.value)}
                      placeholder="e.g. Grade 10A"
                      required
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Phone */}
                <Field label="Phone Number" icon={<IPhone />}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    autoComplete="tel"
                    className={inputClass}
                  />
                </Field>

                {/* Section divider */}
                <div className="flex items-center gap-3 !mt-6 !mb-1">
                  <div className="flex-1 h-px bg-white/[0.07]" />
                  <span className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">
                    Account credentials
                  </span>
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </div>
              </>
            )}

            {/* ══ SHARED FIELDS (both modes) ═══════════════════════ */}

            {/* Email */}
            <Field label="Email" icon={<IMail />}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputClass}
              />
            </Field>

            {/* Password */}
            <Field
              label="Password"
              icon={<ILock />}
              hint={!isLogin ? "Minimum 8 characters" : undefined}
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={!isLogin ? 8 : undefined}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <IEyeOff /> : <IEye />}
                </button>
              </div>
            </Field>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-sm text-red-400 font-light">{error}</p>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm text-emerald-400 font-light">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 !mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                    <path d="M14 8A6 6 0 002 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {isLogin ? "Signing in…" : "Creating account…"}
                </span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>

          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/25 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">
            Privacy Policy
          </a>.
        </p>

      </div>
    </div>
  )
}

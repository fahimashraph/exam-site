"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type IconName = "grid" | "upload" | "book" | "users" | "chart" | "settings" | "search" | "bell" | "chevron";

const ICONS: Record<IconName, React.ReactNode> = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 5L8 2.5L10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 11V13C2.5 13.2761 2.72386 13.5 3 13.5H13C13.2761 13.5 13.5 13.2761 13.5 13V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  book: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 4C8 4 7 2.5 4.5 2.5C3 2.5 2 3.5 2 3.5V13C2 13 3 12 4.5 12C7 12 8 13.5 8 13.5V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 4C8 4 9 2.5 11.5 2.5C13 2.5 14 3.5 14 3.5V13C14 13 13 12 11.5 12C9 12 8 13.5 8 13.5V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 13.5C2 11.0147 3.79086 9 6 9C8.20914 9 10 11.0147 10 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 13C14.5 11.067 13.3807 10 12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="9" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6.5" y="6" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2.5" width="3" height="11.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.05 3.05L4.11 4.11M11.89 11.89L12.95 12.95M3.05 12.95L4.11 11.89M11.89 4.11L12.95 3.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  bell: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2C5.79086 2 4 3.79086 4 6V9.5L2.5 11.5H13.5L12 9.5V6C12 3.79086 10.2091 2 8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.5 11.5C6.5 12.3284 7.17157 13 8 13C8.82843 13 9.5 12.3284 9.5 11.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 6L7 8L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV_PRIMARY = [
  { label: "Overview", href: "/admin", icon: "grid" as IconName },
  { label: "Upload Papers", href: "/admin/upload", icon: "upload" as IconName, badge: 5 },
  { label: "Papers Library", href: "/admin/papers", icon: "book" as IconName },
  { label: "Students", href: "/admin/students", icon: "users" as IconName },
];

const NAV_SECONDARY = [
  { label: "Analytics", href: "/admin/analytics", icon: "chart" as IconName },
  { label: "Settings", href: "/admin/settings", icon: "settings" as IconName },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/upload": "Upload Papers",
  "/admin/papers": "Papers Library",
  "/admin/students": "Students",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

function NavLink({
  item,
  isActive,
}: {
  item: { label: string; href: string; icon: IconName; badge?: number };
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={[
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 group",
        isActive
          ? "bg-indigo-50 text-indigo-700 font-medium"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-normal",
      ].join(" ")}
    >
      <span
        className={[
          "transition-colors shrink-0",
          isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500",
        ].join(" ")}
      >
        {ICONS[item.icon]}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span className="w-5 h-5 bg-indigo-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shrink-0">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";
  const [adminReady, setAdminReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !user.user_metadata?.is_admin) {
        router.replace("/dashboard");
        return;
      }
      setAdminReady(true);
    });
  }, [router]);

  if (!adminReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse" />
          <p className="text-[12px] text-gray-400 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-[240px] bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1.5L12.5 4.5V9.5L7 12.5L1.5 9.5V4.5L7 1.5Z"
                fill="rgba(255,255,255,0.9)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 tracking-tight leading-none">
              ExamPrep
            </p>
            <p className="text-[10px] text-indigo-500 tracking-widest uppercase font-semibold mt-1">
              Admin
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase px-3 mb-2">
            Main
          </p>
          <div className="space-y-0.5">
            {NAV_PRIMARY.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase px-3 mt-5 mb-2">
            System
          </p>
          <div className="space-y-0.5">
            {NAV_SECONDARY.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[11px] font-semibold shadow-sm shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-900 truncate leading-none">
                Super Admin
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                admin@examprep.com
              </p>
            </div>
            <span className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0">
              {ICONS.chevron}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 ml-[240px] overflow-hidden">
        {/* Top navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-400">Admin</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-300">
              <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[12px] font-medium text-gray-600">{pageTitle}</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52 cursor-pointer hover:border-gray-300 transition-colors">
              <span className="text-gray-400 shrink-0">{ICONS.search}</span>
              <span className="text-[13px] text-gray-400 flex-1">Search papers…</span>
              <kbd className="text-[10px] bg-white border border-gray-200 text-gray-400 px-1.5 py-0.5 rounded-md shadow-sm leading-none">
                ⌘K
              </kbd>
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors relative border border-transparent hover:border-gray-200">
              {ICONS.bell}
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[12px] font-semibold shadow-sm cursor-pointer">
              A
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

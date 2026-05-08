import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamPrep — Practice Smarter, Score Higher",
  description:
    "Real exam simulations, instant feedback, and performance tracking — everything you need to pass with confidence.",
};

/*
  THEME SCRIPT — runs synchronously before first paint (no FOUC).
  Reads prefers-color-scheme and adds/removes the "light" class on <html>.
  Also listens for OS-level theme changes at runtime.
  This is a standard pattern used by Radix, shadcn, and similar systems.
  It does NOT interfere with any auth, routing, or Supabase logic.
*/
const themeScript = `
(function() {
  function applyTheme() {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }
  applyTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Inline blocking script — executes before CSS is applied.
          suppressHydrationWarning is not needed because this script
          only touches classList, not React-managed attributes.
          The script is idempotent and tiny (~200 bytes minified).
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

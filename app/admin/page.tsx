"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// ── Types ─────────────────────────────────────────────────────────────────────

type SubjectFilter =
  | "All"
  | "Mathematics"
  | "Biology"
  | "Chemistry"
  | "English"
  | "Physics"
  | "History";

type UploadState = "idle" | "uploading" | "done" | "error";

interface QueuedFile {
  id: string;
  file: File;
  markschemeFile?: File;
  title: string;
  grade: string;
  subject: string;
  year: string;
  session: string;
  paperType: string;
  examBoard: string;
  state: UploadState;
  errorMsg?: string;
}

interface PaperRow {
  id: string;
  title: string | null;
  grade: string;
  subject: string;
  year: number;
  session: string | null;
  paper_type: string | null;
  exam_board: string | null;
  paper_pdf_url: string;
  markscheme_pdf_url: string | null;
  created_at: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Grade 13"] as const;
const SESSIONS = ["May/June", "October/November", "January", "March"] as const;
const PAPER_TYPES = ["Paper 1", "Paper 2", "Paper 3", "MCQ", "Alternative to Practical"] as const;
const EXAM_BOARDS = ["CSEC", "CAPE", "Edexcel", "Cambridge", "IBO"] as const;

const SUBJECT_NAMES = [
  "Mathematics", "Biology", "Chemistry", "English", "Physics", "History",
] as const;

const SUBJECT_FILTERS: SubjectFilter[] = ["All", ...SUBJECT_NAMES];

const SUBJECT_STYLES: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  Mathematics: { bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200",    bar: "bg-blue-500"    },
  Biology:     { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", bar: "bg-emerald-500" },
  Chemistry:   { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-200",  bar: "bg-violet-500"  },
  English:     { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   bar: "bg-amber-500"   },
  Physics:     { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200",    bar: "bg-rose-500"    },
  History:     { bg: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-200",  bar: "bg-orange-500"  },
};

const GRADE_STYLES: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  "Grade 9":  { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-200",  bar: "bg-violet-500"  },
  "Grade 10": { bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200",    bar: "bg-blue-500"    },
  "Grade 11": { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", bar: "bg-emerald-500" },
  "Grade 12": { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   bar: "bg-amber-500"   },
  "Grade 13": { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200",    bar: "bg-rose-500"    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Cambridge subject code → app subject name ────────────────────────────────
const CAMBRIDGE_CODES: Record<string, string> = {
  // IGCSE Mathematics
  "0580": "Mathematics", "0581": "Mathematics", "0607": "Mathematics",
  // IGCSE Biology
  "0610": "Biology", "0970": "Biology",
  // IGCSE Chemistry
  "0620": "Chemistry", "0971": "Chemistry",
  // IGCSE English
  "0500": "English", "0510": "English", "0511": "English", "0522": "English", "0524": "English",
  // IGCSE Physics
  "0625": "Physics", "0972": "Physics",
  // IGCSE History
  "0470": "History", "0977": "History",
  // A Level / AS Level
  "9709": "Mathematics", "9700": "Biology", "9701": "Chemistry",
  "9093": "English", "9702": "Physics", "9489": "History",
}

const CAMBRIDGE_SESSION_LETTERS: Record<string, string> = {
  s: "May/June",
  w: "October/November",
  m: "March",
  y: "January",
}

function guessMetadata(filename: string): Omit<QueuedFile, "id" | "file" | "markschemeFile" | "state"> {
  const raw = filename.replace(/\.[^.]+$/, "").trim(); // strip extension, keep underscores

  // ── Cambridge standard format: 0610_s25_qp_11 ──────────────────────────
  // Groups: [subjectCode, sessionLetter, 2-digit-year, typeCode, paperNumber]
  const cam = raw.match(/^(\d{4})_([swmy])(\d{2})_(qp|ms|sp|er|in|gt)_(\d{2,3})/i);
  if (cam) {
    const [, code, sLetter, yr2, typeCode, paperNum] = cam;
    const subject = CAMBRIDGE_CODES[code] ?? "";
    const session = CAMBRIDGE_SESSION_LETTERS[sLetter.toLowerCase()] ?? "";
    const year = `20${yr2}`;
    // IGCSE (0xxx) → Grade 10 default; A Level (9xxx) → Grade 12 default
    const grade = code.startsWith("9") ? "Grade 12" : "Grade 10";
    const pDigit = parseInt(paperNum[0], 10);
    let paperType = "";
    if (typeCode.toLowerCase() !== "ms") {
      if (pDigit === 1) paperType = "Paper 1";
      else if (pDigit === 2) paperType = "Paper 2";
      else if (pDigit === 3) paperType = "Paper 3";
      else if (pDigit === 4) paperType = "Alternative to Practical";
    }
    const title = [subject, year, session, paperType].filter(Boolean).join(" ") || raw;
    return { title, grade, subject, year, session, paperType, examBoard: "Cambridge" };
  }

  // ── Keyword fallback for descriptive filenames ──────────────────────────
  const base = raw.replace(/[_-]/g, " ").trim();
  const lower = base.toLowerCase();

  const yearMatch = base.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch?.[0] ?? "";

  const subjectMap: [string, string][] = [
    ["math", "Mathematics"], ["biology", "Biology"], [" bio ", "Biology"],
    ["chemistry", "Chemistry"], ["chem", "Chemistry"], ["english", "English"],
    ["physics", "Physics"], ["history", "History"],
  ];
  const subject = subjectMap.find(([k]) => lower.includes(k))?.[1] ?? "";

  const gradeMatch = lower.match(/grade\s*(\d{1,2})/);
  const grade = gradeMatch ? `Grade ${gradeMatch[1]}` : "";

  let paperType = "";
  if (lower.includes("mcq") || lower.includes("multiple choice")) paperType = "MCQ";
  else if (lower.includes("p3") || lower.includes("paper 3")) paperType = "Paper 3";
  else if (lower.includes("p2") || lower.includes("paper 2")) paperType = "Paper 2";
  else if (lower.includes("p1") || lower.includes("paper 1")) paperType = "Paper 1";
  else if (lower.includes("alt") || lower.includes("practical")) paperType = "Alternative to Practical";

  let examBoard = "";
  if (lower.includes("csec") || lower.includes("cxc")) examBoard = "CSEC";
  else if (lower.includes("cape")) examBoard = "CAPE";
  else if (lower.includes("edexcel")) examBoard = "Edexcel";
  else if (lower.includes("cambridge") || lower.includes("cie") || lower.includes("igcse")) examBoard = "Cambridge";
  else if (lower.includes("ibo") || lower.includes("ib ")) examBoard = "IBO";

  let session = "";
  if (lower.includes("may") || lower.includes("june") || lower.includes("mj")) session = "May/June";
  else if (lower.includes("oct") || lower.includes("nov") || lower.includes("on")) session = "October/November";
  else if (lower.includes("jan")) session = "January";
  else if (lower.includes("mar")) session = "March";

  return { title: base, grade, subject, year, session, paperType, examBoard };
}

function extractStoragePath(fileUrl: string, bucket: "papers" | "markschemes"): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = fileUrl.indexOf(marker);
  return idx !== -1 ? decodeURIComponent(fileUrl.slice(idx + marker.length)) : null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SubjectBadge({ subject }: { subject: string }) {
  const s = SUBJECT_STYLES[subject] ?? { bg: "bg-gray-100", text: "text-gray-500", ring: "ring-gray-200", bar: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text} ring-1 ${s.ring}`}>
      {subject || "Unknown"}
    </span>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const s = GRADE_STYLES[grade] ?? { bg: "bg-gray-100", text: "text-gray-500", ring: "ring-gray-200", bar: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text} ring-1 ${s.ring}`}>
      {grade || "Unset"}
    </span>
  );
}

function StatCard({
  label, value, sub, iconBg, icon, trend,
}: {
  label: string; value: string; sub: string; iconBg: string; icon: React.ReactNode;
  trend?: { dir: "up" | "down" | "neutral"; label: string };
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg ${
            trend.dir === "up" ? "bg-emerald-50 text-emerald-600"
            : trend.dir === "down" ? "bg-red-50 text-red-600"
            : "bg-gray-50 text-gray-500"
          }`}>
            {trend.dir === "up" && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 8V2M5 2L2.5 4.5M5 2L7.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {trend.label}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-[13px] font-medium text-gray-600 mt-0.5">{label}</p>
      <p className="text-[12px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-full animate-pulse w-16" /></td>
          <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-full animate-pulse w-20" /></td>
          <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded animate-pulse w-10" /></td>
          <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded animate-pulse w-16" /></td>
          <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded animate-pulse w-14" /></td>
          <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded animate-pulse w-16" /></td>
          <td className="px-4 py-4" />
        </tr>
      ))}
    </tbody>
  );
}

function ToastList({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-white border text-[13px] font-medium pointer-events-auto max-w-sm ${
          t.type === "success" ? "border-emerald-100" : "border-red-100"
        }`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            t.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          }`}>
            {t.type === "success" ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 3L7 7M7 3L3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <span className="flex-1 text-gray-800">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// Compact labelled select used inside the per-file form
function FormSelect({
  value, onChange, placeholder, options, disabled,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  options: readonly string[]; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full text-[12px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 appearance-none cursor-pointer disabled:opacity-50 ${value ? "text-gray-800" : "text-gray-400"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 3.5L5 6.5L7.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [papers, setPapers] = useState<PaperRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGradeFilter, setActiveGradeFilter] = useState("All");
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<SubjectFilter>("All");
  const [isDragging, setIsDragging] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [pendingMarkschemeId, setPendingMarkschemeId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const markschemeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchPapers(); }, []);

  // ── Data ──

  async function fetchPapers() {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }

    try {
      const res = await fetch("/api/admin/papers", {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        addToast("error", `Failed to load papers: ${json.error ?? res.status}`);
      } else {
        const json = await res.json();
        setPapers(json.papers ?? []);
      }
    } catch {
      addToast("error", "Failed to load papers.");
    }
    setIsLoading(false);
  }

  // ── Toasts ──

  function addToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }

  // ── Queue management ──

  function stageFiles(files: File[]) {
    const items: QueuedFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      state: "idle",
      ...guessMetadata(file.name),
    }));
    setQueuedFiles((prev) => [...prev, ...items]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    stageFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) stageFiles(Array.from(e.target.files));
    e.target.value = "";
  }

  function handleMarkschemeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0] || !pendingMarkschemeId) return;
    const file = e.target.files[0];
    setQueuedFiles((prev) =>
      prev.map((q) => (q.id === pendingMarkschemeId ? { ...q, markschemeFile: file } : q))
    );
    setPendingMarkschemeId(null);
    e.target.value = "";
  }

  function addMarkscheme(itemId: string) {
    setPendingMarkschemeId(itemId);
    markschemeInputRef.current?.click();
  }

  function updateQueued(
    id: string,
    field: "title" | "grade" | "subject" | "year" | "session" | "paperType" | "examBoard",
    value: string
  ) {
    setQueuedFiles((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  }

  function removeQueued(id: string) {
    setQueuedFiles((prev) => prev.filter((q) => q.id !== id));
  }

  // ── Upload ──

  async function handleUpload() {
    const toUpload = queuedFiles.filter((q) => q.state === "idle");
    const invalid = toUpload.filter((q) => !q.grade || !q.subject || !/^\d{4}$/.test(q.year));
    if (invalid.length > 0) {
      addToast("error", "Every file needs a grade, subject, and 4-digit year.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      addToast("error", "Not authenticated — please sign in again.");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of toUpload) {
      setQueuedFiles((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, state: "uploading", errorMsg: undefined } : q))
      );

      const formData = new FormData();
      formData.append("paperFile", item.file);
      if (item.markschemeFile) formData.append("markschemeFile", item.markschemeFile);
      formData.append("meta", JSON.stringify({
        title: item.title,
        grade: item.grade,
        subject: item.subject,
        year: item.year,
        session: item.session,
        paperType: item.paperType,
        examBoard: item.examBoard,
      }));

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Authorization": `Bearer ${session.access_token}` },
          body: formData,
        });
        const json = await res.json();

        if (!res.ok) {
          const msg: string = json.error ?? "Upload failed";
          addToast("error", `"${item.file.name}": ${msg}`);
          setQueuedFiles((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, state: "error", errorMsg: msg } : q))
          );
          errorCount++;
        } else {
          setQueuedFiles((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, state: "done" } : q))
          );
          successCount++;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        addToast("error", `"${item.file.name}": ${msg}`);
        setQueuedFiles((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, state: "error", errorMsg: msg } : q))
        );
        errorCount++;
      }
    }

    if (successCount > 0)
      addToast("success", `${successCount} paper${successCount !== 1 ? "s" : ""} uploaded successfully.`);
    if (errorCount > 0 && successCount === 0)
      addToast("error", "All uploads failed — check the error messages on each file.");

    setQueuedFiles((prev) => prev.filter((q) => q.state !== "done"));
    setIsUploading(false);
    await fetchPapers();
  }

  // ── Delete ──

  async function handleDelete(paper: PaperRow) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { addToast("error", "Not authenticated."); return; }

    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paperId: paper.id,
        paperPdfUrl: paper.paper_pdf_url,
        markschemeUrl: paper.markscheme_pdf_url,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      addToast("error", `Failed to delete: ${json.error ?? "Unknown error"}`);
      return;
    }

    setPapers((prev) => prev.filter((p) => p.id !== paper.id));
    addToast("success", `"${paper.title ?? `${paper.subject} ${paper.year}`}" deleted.`);
  }

  // ── Computed ──

  const filteredPapers = papers
    .filter((p) => activeGradeFilter === "All" || p.grade === activeGradeFilter)
    .filter((p) => activeSubjectFilter === "All" || p.subject === activeSubjectFilter);

  const activeGradeCount = new Set(papers.map((p) => p.grade).filter(Boolean)).size;
  const activeSubjectCount = new Set(papers.map((p) => p.subject).filter(Boolean)).size;
  const untaggedCount = papers.filter((p) => !p.grade || !p.subject).length;
  const latestPaper = papers[0];

  // Import health: per grade, target = 6 subjects × 11 years = 66 papers
  const GRADE_TARGET = 66;
  const importHealth = GRADES.map((grade) => ({
    grade,
    loaded: papers.filter((p) => p.grade === grade).length,
  }));
  const overallLoaded = importHealth.reduce((s, g) => s + g.loaded, 0);
  const overallTarget = GRADES.length * GRADE_TARGET;
  const overallPct = overallTarget > 0 ? Math.round((overallLoaded / overallTarget) * 100) : 0;

  const idleQueue = queuedFiles.filter((q) => q.state === "idle");

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 space-y-8">
      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.zip" className="hidden" onChange={handleFileChange} />
      <input ref={markschemeInputRef} type="file" accept=".pdf" className="hidden" onChange={handleMarkschemeChange} />

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Manage past papers across all grades, subjects, and sessions.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4.5 4L7 1.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 10V12C2 12.2761 2.22386 12.5 2.5 12.5H11.5C11.7761 12.5 12 12.2761 12 12V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Upload Paper
        </button>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          label="Total Papers" value={isLoading ? "—" : String(papers.length)}
          sub="Across all grades" iconBg="bg-indigo-50"
          trend={{ dir: "up", label: "Live" }}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3H15C15.5523 3 16 3.44772 16 4V16C16 16.5523 15.5523 17 15 17H5C4.44772 17 4 16.5523 4 16V4C4 3.44772 4.44772 3 5 3Z" stroke="#6366f1" strokeWidth="1.5"/><path d="M7 7H13M7 10H13M7 13H10" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
        <StatCard
          label="Grades Active" value={isLoading ? "—" : `${activeGradeCount} / 5`}
          sub={activeGradeCount === 5 ? "All grades loaded" : `${5 - activeGradeCount} grade${5 - activeGradeCount !== 1 ? "s" : ""} empty`}
          iconBg="bg-violet-50" trend={{ dir: activeGradeCount === 5 ? "neutral" : "down", label: activeGradeCount === 5 ? "Complete" : "Incomplete" }}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="#8b5cf6" strokeWidth="1.5"/><path d="M6 10h8M6 7h5M6 13h3" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
        <StatCard
          label="Subjects Active" value={isLoading ? "—" : `${activeSubjectCount} / 6`}
          sub={activeSubjectCount === 6 ? "All subjects loaded" : `${6 - activeSubjectCount} subject${6 - activeSubjectCount !== 1 ? "s" : ""} empty`}
          iconBg="bg-emerald-50" trend={{ dir: activeSubjectCount === 6 ? "neutral" : "down", label: activeSubjectCount === 6 ? "Complete" : "Incomplete" }}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L8 14L16 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <StatCard
          label="Latest Upload" value={isLoading ? "—" : latestPaper ? relativeTime(latestPaper.created_at) : "None"}
          sub={latestPaper ? `${latestPaper.grade || "No grade"} · ${latestPaper.subject || "No subject"}` : "No papers yet"}
          iconBg="bg-amber-50" trend={{ dir: "neutral", label: "Recent" }}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#f59e0b" strokeWidth="1.5"/><path d="M10 6V10L12.5 12.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-5 gap-6 items-start">

        {/* ── Papers table (3 cols) ── */}
        <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-gray-900">Recent Uploads</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {isLoading ? "Loading…" : `${papers.length} paper${papers.length !== 1 ? "s" : ""} total`}
                </p>
              </div>
              <button
                onClick={fetchPapers}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 font-medium transition-colors disabled:opacity-50"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={isLoading ? "animate-spin" : ""}>
                  <path d="M11 6.5C11 9.26142 8.76142 11.5 6 11.5C3.23858 11.5 1 9.26142 1 6.5C1 3.73858 3.23858 1.5 6 1.5C7.5 1.5 8.84315 2.14706 9.78553 3.18182" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                  <path d="M9 1.5L10 4L7 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>

            {/* Grade filter */}
            <div className="flex items-center gap-1 flex-wrap mb-2">
              {["All", ...GRADES].map((g) => (
                <button key={g} onClick={() => setActiveGradeFilter(g)}
                  className={["text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all duration-150",
                    activeGradeFilter === g ? "bg-violet-600 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                  ].join(" ")}>
                  {g === "All" ? "All Grades" : g}
                </button>
              ))}
            </div>

            {/* Subject filter */}
            <div className="flex items-center gap-1 flex-wrap">
              {SUBJECT_FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveSubjectFilter(f)}
                  className={["text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all duration-150",
                    activeSubjectFilter === f ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                  ].join(" ")}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Grade</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Subject</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Year</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Session</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Board</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Uploaded</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>

              {isLoading ? <TableSkeleton /> : (
                <tbody className="divide-y divide-gray-50">
                  {filteredPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-4 py-3.5"><GradeBadge grade={paper.grade} /></td>
                      <td className="px-4 py-3.5"><SubjectBadge subject={paper.subject} /></td>
                      <td className="px-4 py-3.5"><span className="text-[13px] text-gray-600 font-medium">{paper.year}</span></td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] text-gray-500">{paper.session ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] text-gray-500">{paper.exam_board ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-gray-400">{relativeTime(paper.created_at)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* View paper */}
                          <a href={paper.paper_pdf_url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="View paper">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M6.5 2.5C3.5 2.5 1.5 6.5 1.5 6.5C1.5 6.5 3.5 10.5 6.5 10.5C9.5 10.5 11.5 6.5 11.5 6.5C11.5 6.5 9.5 2.5 6.5 2.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
                              <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.25"/>
                            </svg>
                          </a>
                          {/* View markscheme */}
                          {paper.markscheme_pdf_url && (
                            <a href={paper.markscheme_pdf_url} target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                              title="View markscheme">
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M2 7L5 10L11 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </a>
                          )}
                          {/* Delete */}
                          <button onClick={() => handleDelete(paper)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M2.5 4H10.5M5 4V2.5H8V4M4 4V10.5C4 10.7761 4.22386 11 4.5 11H8.5C8.77614 11 9 10.7761 9 10.5V4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>

            {!isLoading && filteredPapers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 3H15C15.5523 3 16 3.44772 16 4V16C16 16.5523 15.5523 17 15 17H5C4.44772 17 4 16.5523 4 16V4C4 3.44772 4.44772 3 5 3Z" stroke="#9ca3af" strokeWidth="1.5"/>
                    <path d="M8 10H12M10 8V12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-gray-500">No papers found</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {activeGradeFilter === "All" && activeSubjectFilter === "All"
                    ? "Upload your first paper using the panel on the right."
                    : `No papers match the selected filters.`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column (2 cols) ── */}
        <div className="col-span-2 space-y-5">

          {/* ── Upload zone ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-gray-900">Upload Papers</h2>
              {idleQueue.length > 0 && (
                <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {idleQueue.length} queued
                </span>
              )}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={["border-2 border-dashed rounded-xl p-7 flex flex-col items-center text-center cursor-pointer transition-all duration-200",
                isDragging ? "border-indigo-400 bg-indigo-50/60 scale-[0.99]" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50",
              ].join(" ")}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-indigo-100" : "bg-gray-100"}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={isDragging ? "text-indigo-500" : "text-gray-400"}>
                  <path d="M10 2V13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                  <path d="M6.5 5.5L10 2L13.5 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 15V18C3 18.5523 3.44772 19 4 19H16C16.5523 19 17 18.5523 17 18V15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-[13px] font-medium text-gray-700">
                {isDragging ? "Drop files here" : "Drag & drop question papers"}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                or <span className="text-indigo-600 font-medium">browse files</span>
              </p>
              <div className="flex items-center gap-2 mt-3">
                {["PDF", "DOCX", "ZIP"].map((ext) => (
                  <span key={ext} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md tracking-wide">{ext}</span>
                ))}
              </div>
            </div>

            {/* Queued files with full metadata form */}
            {queuedFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                {queuedFiles.map((item) => (
                  <div key={item.id} className={`rounded-xl border p-3 transition-colors ${
                    item.state === "done"      ? "bg-emerald-50 border-emerald-100"
                    : item.state === "error"   ? "bg-red-50 border-red-100"
                    : item.state === "uploading" ? "bg-blue-50 border-blue-100"
                    : "bg-gray-50 border-gray-100"
                  }`}>
                    {/* File header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M2 1H7L9.5 3.5V9.5C9.5 9.77614 9.27614 10 9 10H2C1.72386 10 1.5 9.77614 1.5 9.5V1.5C1.5 1.22386 1.72386 1 2 1Z" stroke="#6366f1" strokeWidth="1.1" strokeLinejoin="round"/>
                          <path d="M7 1V4H9.5" stroke="#6366f1" strokeWidth="1.1" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-medium text-gray-600 flex-1 truncate">{item.file.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.state === "idle" && <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md">Queued</span>}
                        {item.state === "uploading" && <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-md animate-pulse">Uploading…</span>}
                        {item.state === "done" && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md">Done</span>}
                        {item.state === "error" && <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">Failed</span>}
                        {item.state !== "uploading" && (

                          <button onClick={() => removeQueued(item.id)} className="text-gray-300 hover:text-gray-500 transition-colors">
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M2 2L9 9M9 2L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Error detail — shown when upload fails */}
                    {item.state === "error" && item.errorMsg && (
                      <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-2.5 py-1.5 mt-0.5 break-words">
                        {item.errorMsg}
                      </p>
                    )}

                    {/* Metadata form — only shown while idle */}
                    {item.state === "idle" && (
                      <div className="space-y-1.5">
                        {/* Title */}
                        <input
                          type="text" value={item.title}
                          onChange={(e) => updateQueued(item.id, "title", e.target.value)}
                          placeholder="Paper title (optional)"
                          className="w-full text-[12px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 placeholder-gray-400 text-gray-800"
                        />
                        {/* Grade + Subject */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <FormSelect value={item.grade} onChange={(v) => updateQueued(item.id, "grade", v)} placeholder="Grade *" options={GRADES} />
                          <FormSelect value={item.subject} onChange={(v) => updateQueued(item.id, "subject", v)} placeholder="Subject *" options={SUBJECT_NAMES} />
                        </div>
                        {/* Year + Session */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="number" value={item.year}
                            onChange={(e) => updateQueued(item.id, "year", e.target.value)}
                            placeholder="Year *" min="1990" max="2030"
                            className="text-[12px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 placeholder-gray-400 text-gray-800"
                          />
                          <FormSelect value={item.session} onChange={(v) => updateQueued(item.id, "session", v)} placeholder="Session" options={SESSIONS} />
                        </div>
                        {/* Paper Type + Exam Board */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <FormSelect value={item.paperType} onChange={(v) => updateQueued(item.id, "paperType", v)} placeholder="Paper type" options={PAPER_TYPES} />
                          <FormSelect value={item.examBoard} onChange={(v) => updateQueued(item.id, "examBoard", v)} placeholder="Exam board" options={EXAM_BOARDS} />
                        </div>

                        {/* Markscheme attachment */}
                        <div className="pt-1">
                          {item.markschemeFile ? (
                            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-emerald-600 shrink-0">
                                <path d="M2 5.5L4.5 8L9 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-[11px] text-emerald-700 flex-1 truncate font-medium">{item.markschemeFile.name}</span>
                              <button
                                onClick={() => setQueuedFiles((prev) => prev.map((q) => q.id === item.id ? { ...q, markschemeFile: undefined } : q))}
                                className="text-emerald-400 hover:text-emerald-600 transition-colors shrink-0"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addMarkscheme(item.id)}
                              className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                              </svg>
                              Attach markscheme PDF
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Upload button */}
                {idleQueue.length > 0 && (
                  <button onClick={handleUpload} disabled={isUploading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {isUploading ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
                          <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                          <path d="M7 1.5C7 1.5 10 1.5 12.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Uploading…
                      </>
                    ) : (
                      `Upload ${idleQueue.length} file${idleQueue.length !== 1 ? "s" : ""}`
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Import health by grade ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[14px] font-semibold text-gray-900">Import Health</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {overallLoaded} / {overallTarget} papers imported
                </p>
              </div>
              <span className={`text-[18px] font-bold ${overallPct >= 90 ? "text-emerald-600" : overallPct >= 60 ? "text-amber-500" : "text-red-500"}`}>
                {overallPct}%
              </span>
            </div>

            {/* Overall bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>

            {/* Per-grade bars */}
            <div className="space-y-4">
              {importHealth.map(({ grade, loaded }) => {
                const pct = Math.round((loaded / GRADE_TARGET) * 100);
                const s = GRADE_STYLES[grade];
                return (
                  <div key={grade}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.bar} shrink-0`} />
                        <span className="text-[12px] font-medium text-gray-700">{grade}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">{loaded} papers</span>
                        <span className={`text-[11px] font-semibold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-blue-600" : "text-amber-600"}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {overallLoaded < overallTarget && (
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-[11px] text-gray-400">
                  {overallTarget - overallLoaded} papers missing — upload to complete all grades.
                </p>
              </div>
            )}
            {overallLoaded >= overallTarget && overallLoaded > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[11px] text-gray-400">All grades fully loaded.</p>
              </div>
            )}
            {!isLoading && untaggedCount > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                <p className="text-[11px] text-gray-400">
                  {untaggedCount} paper{untaggedCount !== 1 ? "s" : ""} missing grade or subject — edit metadata to count them.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastList toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

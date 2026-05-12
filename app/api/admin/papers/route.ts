import { NextRequest } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function verifyAdmin(token: string) {
  const db = getSupabaseAdmin()
  const { data: { user }, error } = await db.auth.getUser(token)
  if (error || !user || !user.user_metadata?.is_admin) return null
  return user
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await verifyAdmin(token)
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { data, error } = await getSupabaseAdmin()
    .from("papers")
    .select("id, title, grade, subject, year, session, paper_type, exam_board, paper_pdf_url, markscheme_pdf_url, created_at")
    .order("created_at", { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ papers: data ?? [] })
}

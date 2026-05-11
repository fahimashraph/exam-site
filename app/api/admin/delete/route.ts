import { NextRequest } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function extractStoragePath(fileUrl: string, bucket: "papers" | "markschemes"): string | null {
  const marker = `/object/public/${bucket}/`
  const idx = fileUrl.indexOf(marker)
  return idx !== -1 ? decodeURIComponent(fileUrl.slice(idx + marker.length)) : null
}

async function verifyAdmin(token: string) {
  const db = getSupabaseAdmin()
  const { data: { user }, error } = await db.auth.getUser(token)
  if (error || !user || !user.user_metadata?.is_admin) return null
  return user
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await verifyAdmin(token)
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 })

  const { paperId, paperPdfUrl, markschemeUrl } = await request.json() as {
    paperId: string
    paperPdfUrl: string
    markschemeUrl: string | null
  }

  const db = getSupabaseAdmin()

  if (paperPdfUrl) {
    const path = extractStoragePath(paperPdfUrl, "papers")
    if (path) await db.storage.from("papers").remove([path])
  }

  if (markschemeUrl) {
    const path = extractStoragePath(markschemeUrl, "markschemes")
    if (path) await db.storage.from("markschemes").remove([path])
  }

  const { error } = await db.from("papers").delete().eq("id", paperId)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}

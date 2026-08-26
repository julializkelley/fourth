import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const sessionId = body.sessionId;

  const { data: existing } = await db
    .from("chat_sessions")
    .select("status")
    .eq("id", sessionId)
    .maybeSingle();

  if (!existing) {
    await db.from("chat_sessions").insert({ id: sessionId, status: "ai_chat" });
  } else if (existing.status !== "paired" && existing.status !== "ended") {
    await db.from("chat_sessions").update({ last_ping_at: new Date().toISOString() }).eq("id", sessionId);
  }

  const cutoff = new Date(Date.now() - 60_000).toISOString();
  const { count } = await db
    .from("chat_sessions")
    .select("id", { count: "exact", head: true })
    .neq("id", sessionId)
    .eq("status", "ai_chat")
    .gt("last_ping_at", cutoff);

  return NextResponse.json({ othersActive: (count ?? 0) > 0 });
}

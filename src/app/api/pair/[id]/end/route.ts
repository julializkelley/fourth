import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: pairChat } = await db
    .from("pair_chats")
    .select("id, session_a_id, session_b_id")
    .eq("id", id)
    .single();

  if (!pairChat) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  if (pairChat.session_a_id !== body.sessionId && pairChat.session_b_id !== body.sessionId) {
    return NextResponse.json({ error: "Not part of this chat." }, { status: 403 });
  }

  await db
    .from("pair_chats")
    .update({ status: "ended", ended_reason: "left", ended_at: new Date().toISOString() })
    .eq("id", id);

  await db
    .from("chat_sessions")
    .update({ status: "ended" })
    .in("id", [pairChat.session_a_id, pairChat.session_b_id]);

  return NextResponse.json({ ok: true });
}

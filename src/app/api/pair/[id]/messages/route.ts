import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRiskLanguage } from "@/lib/moderation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const since = new URL(req.url).searchParams.get("since");
  const db = supabaseAdmin();

  const { data: pairChat, error: pairError } = await db
    .from("pair_chats")
    .select("id, status, ended_reason")
    .eq("id", id)
    .single();

  if (pairError || !pairChat) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  let query = db
    .from("pair_messages")
    .select("id, sender_session_id, content, flagged, created_at")
    .eq("pair_chat_id", id)
    .order("created_at", { ascending: true });

  if (since) {
    query = query.gt("created_at", since);
  }

  const { data: messages, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }

  return NextResponse.json({ pairChat, messages: messages ?? [] });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body.sessionId !== "string" || typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json({ error: "sessionId and content are required." }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: pairChat } = await db
    .from("pair_chats")
    .select("id, status, session_a_id, session_b_id")
    .eq("id", id)
    .single();

  if (!pairChat) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  if (pairChat.status === "ended") {
    return NextResponse.json({ error: "This chat has ended." }, { status: 409 });
  }

  if (pairChat.session_a_id !== body.sessionId && pairChat.session_b_id !== body.sessionId) {
    return NextResponse.json({ error: "Not part of this chat." }, { status: 403 });
  }

  const risk = checkRiskLanguage(body.content);

  const { data: message, error } = await db
    .from("pair_messages")
    .insert({
      pair_chat_id: id,
      sender_session_id: body.sessionId,
      content: body.content.trim(),
      flagged: risk.severity !== "none",
      flag_reason: risk.reason ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }

  if (risk.severity === "hard") {
    await db
      .from("pair_chats")
      .update({ status: "ended", ended_reason: "risk_language", ended_at: new Date().toISOString() })
      .eq("id", id);
    await db
      .from("chat_sessions")
      .update({ status: "ended" })
      .in("id", [pairChat.session_a_id, pairChat.session_b_id]);
  }

  return NextResponse.json({ message, endedChat: risk.severity === "hard" });
}

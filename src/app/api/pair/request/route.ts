import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db.rpc("try_pair_session", { p_session_id: body.sessionId });

  if (error) {
    return NextResponse.json({ error: "Could not look for a match right now." }, { status: 500 });
  }

  if (data) {
    return NextResponse.json({ status: "paired", pairChatId: data });
  }
  return NextResponse.json({ status: "waiting" });
}

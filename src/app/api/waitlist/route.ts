import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.name !== "string" || typeof body.email !== "string") {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const name = body.name.trim();
  const email = body.email.trim();
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const dueLabel = typeof body.due === "string" ? body.due.trim() : null;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin()
    .from("waitlist_signups")
    .insert({ name, email, role, due_label: dueLabel });

  if (error) {
    return NextResponse.json({ error: "Could not save your signup. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

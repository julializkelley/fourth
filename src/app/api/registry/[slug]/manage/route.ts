import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getRegistryForToken(slug: string, token: string) {
  const db = supabaseAdmin();
  const { data: registry, error } = await db
    .from("registries")
    .select("id, slug, mom_name, due_label, current_week, edit_token")
    .eq("slug", slug)
    .single();

  if (error || !registry || (registry as { edit_token: string }).edit_token !== token) {
    return null;
  }
  return registry as { id: string; slug: string; mom_name: string; due_label: string | null; current_week: number };
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = new URL(req.url).searchParams.get("token") ?? "";

  const registry = await getRegistryForToken(slug, token);
  if (!registry) {
    return NextResponse.json({ error: "Invalid or missing edit link." }, { status: 403 });
  }

  const db = supabaseAdmin();
  const { data: slots, error } = await db
    .from("registry_slots")
    .select("*")
    .eq("registry_id", registry.id)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load slots." }, { status: 500 });
  }

  return NextResponse.json({ registry, slots: slots ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body.token !== "string") {
    return NextResponse.json({ error: "Invalid edit link." }, { status: 403 });
  }

  const registry = await getRegistryForToken(slug, body.token);
  if (!registry) {
    return NextResponse.json({ error: "Invalid or missing edit link." }, { status: 403 });
  }

  const db = supabaseAdmin();
  const action = body.action;

  if (action === "add") {
    const { category, dayLabel, description } = body;
    if (!["meal", "item", "care"].includes(category) || !dayLabel || !description) {
      return NextResponse.json({ error: "Missing fields for new slot." }, { status: 400 });
    }
    const { error } = await db.from("registry_slots").insert({
      registry_id: registry.id,
      category,
      day_label: String(dayLabel).trim(),
      description: String(description).trim(),
      sort_order: 99,
    });
    if (error) return NextResponse.json({ error: "Could not add slot." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "remove") {
    const { error } = await db
      .from("registry_slots")
      .delete()
      .eq("id", body.slotId)
      .eq("registry_id", registry.id);
    if (error) return NextResponse.json({ error: "Could not remove slot." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reopen") {
    const { error } = await db
      .from("registry_slots")
      .update({ status: "open", claimed_by_name: null, claimed_by_contact: null, claimed_at: null })
      .eq("id", body.slotId)
      .eq("registry_id", registry.id);
    if (error) return NextResponse.json({ error: "Could not reopen slot." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getRegistryForToken(slug: string, token: string) {
  const db = supabaseAdmin();
  const { data: registry, error } = await db
    .from("registries")
    .select("id, slug, mom_name, due_label, current_week, allergies, meal_preferences, dropoff_notes, edit_token")
    .eq("slug", slug)
    .single();

  if (error || !registry || registry.edit_token !== token) {
    return null;
  }
  return registry;
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

  const { data: approvedContacts } = await db
    .from("registry_approved_contacts")
    .select("*")
    .eq("registry_id", registry.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ registry, slots: slots ?? [], approvedContacts: approvedContacts ?? [] });
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
    const { category, dayLabel, description, externalUrl, scheduledAt, scheduledTzOffsetMinutes } = body;
    if (!["meal", "item", "care", "gift_card"].includes(category) || !dayLabel || !description) {
      return NextResponse.json({ error: "Missing fields for new slot." }, { status: 400 });
    }
    const { error } = await db.from("registry_slots").insert({
      registry_id: registry.id,
      category,
      day_label: String(dayLabel).trim(),
      description: String(description).trim(),
      external_url: typeof externalUrl === "string" && externalUrl.trim() ? externalUrl.trim() : null,
      scheduled_at: typeof scheduledAt === "string" && scheduledAt ? scheduledAt : null,
      scheduled_tz_offset_minutes:
        typeof scheduledTzOffsetMinutes === "number" ? scheduledTzOffsetMinutes : null,
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

  if (action === "approve") {
    const { error } = await db
      .from("registry_slots")
      .update({ status: "taken" })
      .eq("id", body.slotId)
      .eq("registry_id", registry.id)
      .eq("status", "pending");
    if (error) return NextResponse.json({ error: "Could not approve signup." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "update_details") {
    const { allergies, mealPreferences, dropoffNotes } = body;
    const { error } = await db
      .from("registries")
      .update({
        allergies: typeof allergies === "string" ? allergies.trim() || null : undefined,
        meal_preferences: typeof mealPreferences === "string" ? mealPreferences.trim() || null : undefined,
        dropoff_notes: typeof dropoffNotes === "string" ? dropoffNotes.trim() || null : undefined,
      })
      .eq("id", registry.id);
    if (error) return NextResponse.json({ error: "Could not save details." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "add_approved_contact") {
    const { name, contact } = body;
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "A name is required." }, { status: 400 });
    }
    const { error } = await db.from("registry_approved_contacts").insert({
      registry_id: registry.id,
      name: name.trim(),
      contact: typeof contact === "string" && contact.trim() ? contact.trim() : null,
    });
    if (error) return NextResponse.json({ error: "Could not add contact." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "remove_approved_contact") {
    const { error } = await db
      .from("registry_approved_contacts")
      .delete()
      .eq("id", body.contactId)
      .eq("registry_id", registry.id);
    if (error) return NextResponse.json({ error: "Could not remove contact." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

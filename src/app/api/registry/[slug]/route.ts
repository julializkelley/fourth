import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = supabaseAdmin();

  const { data: registry, error } = await db
    .from("registries")
    .select("id, slug, mom_name, due_label, current_week, allergies, meal_preferences, dropoff_notes, created_at")
    .eq("slug", slug)
    .single();

  if (error || !registry) {
    return NextResponse.json({ error: "Registry not found." }, { status: 404 });
  }

  const { data: slots, error: slotsError } = await db
    .from("registry_slots")
    .select("id, category, day_label, description, status, claimed_by_name, external_url, sort_order")
    .eq("registry_id", registry.id)
    .order("sort_order", { ascending: true });

  if (slotsError) {
    return NextResponse.json({ error: "Could not load registry slots." }, { status: 500 });
  }

  // Don't reveal who's pending approval to the general public -- only
  // whether the slot is still open.
  const publicSlots = (slots ?? []).map((s) =>
    s.status === "pending" ? { ...s, claimed_by_name: null } : s
  );

  return NextResponse.json({ registry, slots: publicSlots });
}

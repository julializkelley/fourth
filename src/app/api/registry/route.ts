import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify, generateEditToken, defaultSlotsForWeek } from "@/lib/ids";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.momName !== "string" || !body.momName.trim()) {
    return NextResponse.json({ error: "A name is required." }, { status: 400 });
  }

  const momName = body.momName.trim();
  const dueLabel = typeof body.dueLabel === "string" ? body.dueLabel.trim() : null;
  const allergies = typeof body.allergies === "string" && body.allergies.trim() ? body.allergies.trim() : null;
  const mealPreferences =
    typeof body.mealPreferences === "string" && body.mealPreferences.trim() ? body.mealPreferences.trim() : null;
  const dropoffNotes =
    typeof body.dropoffNotes === "string" && body.dropoffNotes.trim() ? body.dropoffNotes.trim() : null;

  const db = supabaseAdmin();
  const slug = slugify(momName);
  const editToken = generateEditToken();

  const { data: registry, error } = await db
    .from("registries")
    .insert({
      slug,
      edit_token: editToken,
      mom_name: momName,
      due_label: dueLabel,
      allergies,
      meal_preferences: mealPreferences,
      dropoff_notes: dropoffNotes,
    })
    .select()
    .single();

  if (error || !registry) {
    return NextResponse.json({ error: "Could not create the registry. Please try again." }, { status: 500 });
  }

  const slots = defaultSlotsForWeek().map((slot) => ({
    ...slot,
    registry_id: (registry as { id: string }).id,
  }));

  const { error: slotsError } = await db.from("registry_slots").insert(slots);

  if (slotsError) {
    return NextResponse.json({ error: "Registry created, but default slots failed to load." }, { status: 500 });
  }

  return NextResponse.json({ slug, editToken });
}

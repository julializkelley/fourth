import { randomBytes } from "crypto";

export function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = randomBytes(3).toString("hex");
  return `${base || "registry"}-${suffix}`;
}

export function generateEditToken() {
  return randomBytes(16).toString("hex");
}

const DEFAULT_MEALS = ["Tue", "Thu", "Sat"];

export function defaultSlotsForWeek() {
  const slots: {
    category: "meal" | "item" | "care";
    day_label: string;
    description: string;
    sort_order: number;
  }[] = [];

  DEFAULT_MEALS.forEach((day, i) => {
    slots.push({
      category: "meal",
      day_label: `${day.toUpperCase()}, DINNER`,
      description: "Bring a meal",
      sort_order: i,
    });
  });

  slots.push(
    {
      category: "care",
      day_label: "THIS WEEK",
      description: "2hr babysitting so she can nap",
      sort_order: 10,
    },
    {
      category: "item",
      day_label: "ANYTIME",
      description: "Diapers, size 2",
      sort_order: 20,
    },
    {
      category: "item",
      day_label: "ANYTIME",
      description: "Postpartum recovery kit",
      sort_order: 21,
    },
    {
      category: "care",
      day_label: "THIS WEEK",
      description: "Grocery run",
      sort_order: 11,
    }
  );

  return slots;
}

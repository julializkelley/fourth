export type LibraryStage = {
  label: string;
  physical: string[];
  emotional: string[];
  reachOutAbout: string[];
};

export const LIBRARY_STAGES: LibraryStage[] = [
  {
    label: "Week 1",
    physical: [
      "Bleeding (lochia) is heaviest the first few days, often bright red, then gradually lightens.",
      "Afterpains (cramping) as the uterus contracts, especially while nursing.",
      "Swelling in feet, ankles, and hands is common, especially after IV fluids during delivery.",
      "Perineal or incision soreness — sitting, walking, and using the bathroom can all feel tender.",
      "Breast fullness or engorgement as milk comes in, usually around day 2–4.",
      "Heavy night sweats as your body sheds extra fluid from pregnancy.",
    ],
    emotional: [
      "Mood swings, tearfulness, and feeling overwhelmed are extremely common in the first two weeks (\"baby blues\") — often peaking around day 3–5.",
      "Feeling both overjoyed and completely unmoored, sometimes within the same hour, is a wide range of normal.",
      "Trouble sleeping even when the baby is asleep.",
    ],
    reachOutAbout: [
      "Bleeding that soaks a pad in an hour, or passing large clots.",
      "Fever, or a wound that looks increasingly red, swollen, or painful.",
      "A severe headache or sudden vision changes.",
      "Confusion, hallucinations, or thoughts that feel disconnected from reality — see the psychosis section above. This is different from baby blues and needs same-day attention.",
    ],
  },
  {
    label: "Weeks 2–3",
    physical: [
      "Bleeding continues to lighten, often to a brownish or pink color.",
      "Energy is still low — fatigue this deep is common on its own, not necessarily a sign anything's wrong.",
      "Some people notice hair shedding starting around now; for many it doesn't begin until months 3–4.",
      "If you had a C-section, the incision is likely still tender and healing.",
    ],
    emotional: [
      "Baby blues usually ease by around 2 weeks. If low mood, anxiety, or a sense of dread is sticking around or getting worse past this point, that's worth naming out loud to someone.",
      "Feeling like you've lost your sense of self, or grieving who you were before, is common and doesn't mean anything is wrong with you.",
    ],
    reachOutAbout: [
      "Mood symptoms that feel like they're getting worse, not better, after two weeks.",
      "Persistent anxiety, intrusive thoughts, or feeling unable to rest even when you have the chance.",
      "Any thoughts of harming yourself or the baby — call or text 988, or the National Maternal Mental Health Hotline (1-833-852-6262), immediately, day or night.",
    ],
  },
  {
    label: "Weeks 4–6",
    physical: [
      "Bleeding has usually stopped for most people by 6 weeks, though timelines vary.",
      "The 6-week checkup is often when providers clear you for exercise and sex — but \"cleared\" doesn't mean \"ready,\" and there's a wide range of normal in how long recovery actually takes.",
      "Core and pelvic floor strength are still rebuilding; some looseness or leaking when you cough or laugh is common and often improves with time and gentle movement.",
    ],
    emotional: [
      "If this is when you're returning to work or losing in-home help, the adjustment can hit hard even if things had been feeling steadier.",
      "Comparing your recovery to what you see online rarely reflects your actual timeline.",
    ],
    reachOutAbout: [
      "Postpartum depression and anxiety often show up or intensify around this window, not just in week 1 — persistent sadness, rage, panic, or feeling like you're failing are all worth naming to your provider.",
      "Pain during sex, ongoing incontinence, or a bulge/pressure feeling (possible prolapse) are common enough to ask about, not something to just live with.",
    ],
  },
  {
    label: "Weeks 6–12",
    physical: [
      "Hair shedding often peaks here for many people (months 3–4), and it does grow back.",
      "Energy typically continues improving, though sleep deprivation can still flatten it.",
      "Some physical symptoms (joint looseness, night sweats) can linger longer than expected.",
    ],
    emotional: [
      "Identity shifts continue — feeling like a different person than you were pre-baby is common well beyond the early weeks.",
      "If you're returning to work, the mix of relief, guilt, and grief people describe is real, whichever choice you made.",
    ],
    reachOutAbout: [
      "Mood or anxiety symptoms don't have a deadline — postpartum depression and anxiety can emerge any time in the first year, not just early on.",
      "If something feels consistently off for more than two weeks, that's reason enough to talk to someone, whether or not you can name exactly what's wrong.",
    ],
  },
];

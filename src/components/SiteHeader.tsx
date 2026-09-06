"use client";

import { useState } from "react";
import Link from "next/link";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="wrap">
      <Link href="/" className="logo" onClick={() => setOpen(false)}>
        Fourth<span>.</span>
      </Link>

      <button
        type="button"
        className="menu-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={open ? "nav-links nav-links-open" : "nav-links"}>
        <Link href="/#problem" onClick={() => setOpen(false)}>
          Why
        </Link>
        <Link href="/library" onClick={() => setOpen(false)}>
          Library
        </Link>
        <Link href="/#how" onClick={() => setOpen(false)}>
          How it works
        </Link>
        <Link href="/#registry" onClick={() => setOpen(false)}>
          The registry
        </Link>
        <Link href="/#join" onClick={() => setOpen(false)}>
          Join
        </Link>
        <Link href="/feedback" onClick={() => setOpen(false)}>
          Feedback
        </Link>
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export function CrisisButton() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="crisis-wrap">
      {open && (
        <div className="crisis-panel" ref={panelRef} role="dialog" aria-label="Crisis support resources">
          <div className="crisis-panel-head">
            <div>
              <h4>You don&rsquo;t have to do this alone.</h4>
              <p>There&rsquo;s no shame in seeking help — most people fully recover with treatment.</p>
            </div>
            <button
              type="button"
              className="crisis-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="crisis-option">
            <div className="crisis-option-label">National Maternal Mental Health Hotline</div>
            <p className="crisis-option-detail">
              24/7, free, confidential support — before, during, and after pregnancy.
            </p>
            <a className="btn btn-primary crisis-cta" href="tel:+18338526262">
              <PhoneIcon /> Call 1-833-TLC-MAMA
            </a>
          </div>

          <div className="crisis-option">
            <div className="crisis-option-label">Postpartum Support International</div>
            <p className="crisis-option-detail">
              Information, encouragement, and resources near you.
            </p>
            <div className="crisis-cta-row">
              <a className="btn btn-primary crisis-cta" href="tel:+18009444773">
                <PhoneIcon /> Call
              </a>
              <a className="btn btn-secondary crisis-cta" href="sms:+18009444773?body=HELP">
                Text &ldquo;HELP&rdquo;
              </a>
            </div>
          </div>

          <p className="crisis-footer-note">
            Also okay: asking a friend or family member for help with the baby or the house
            tonight.
          </p>
        </div>
      )}

      <button
        type="button"
        className="crisis-button"
        ref={buttonRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Get crisis support — call or text a hotline"
        onClick={() => setOpen((v) => !v)}
      >
        <PhoneIcon size={26} />
      </button>
    </div>
  );
}

function PhoneIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
    </svg>
  );
}

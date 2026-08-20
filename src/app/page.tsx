import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegistryBoard } from "@/components/RegistryBoard";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <header className="hero">
        <div className="wrap">
          <div className="timestamp">
            <span className="pulse-dot" />
            2:14 AM — SOMEONE IS AWAKE RIGHT NOW
          </div>
          <h1>
            You&rsquo;re not supposed to figure out <em>the fourth trimester</em> alone.
          </h1>
          <p className="hero-sub">
            Fourth connects new moms to each other, gives partners real visibility into how
            she&rsquo;s doing, and lets friends and family show up with exactly what&rsquo;s
            needed — no guesswork, no account required for them.
          </p>
          <div className="hero-ctas">
            <a href="#join" className="btn btn-primary">
              Join the waitlist
            </a>
            <a href="#registry" className="btn btn-secondary">
              See how the registry works
            </a>
          </div>
        </div>
      </header>

      <section id="problem">
        <div className="wrap">
          <div className="eyebrow">What we keep hearing</div>
          <h2>The hospital sends you home. The check-ins stop. Nobody tells you what&rsquo;s normal.</h2>
          <div className="quotes">
            <div className="quote-card">
              <div className="quote-mark">&ldquo;</div>
              <p className="quote-text">
                Nobody came to check on me for hours in the postpartum wing. I didn&rsquo;t know if
                that was normal.
              </p>
              <div className="quote-label">— on hospital follow-up</div>
            </div>
            <div className="quote-card">
              <div className="quote-mark">&ldquo;</div>
              <p className="quote-text">
                I found my mom group through word of mouth, months in. I wish I&rsquo;d known it
                existed on day one.
              </p>
              <div className="quote-label">— on finding community</div>
            </div>
            <div className="quote-card">
              <div className="quote-mark">&ldquo;</div>
              <p className="quote-text">
                People wanted to help. They just didn&rsquo;t know what I actually needed, week to
                week.
              </p>
              <div className="quote-label">— on family & friends</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <div className="eyebrow">How Fourth helps</div>
          <h2>Three people, three needs — one app that connects them.</h2>
          <div className="pillars">
            <div className="pillar">
              <div className="pillar-num">01 — For her</div>
              <h3>Find your people</h3>
              <p>
                Matched with other moms at the same stage, nearby — not another endless feed, just
                a small group of women a few weeks apart from you.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-num">02 — For her partner</div>
              <h3>See what she needs</h3>
              <p>
                Gentle check-ins translate into real visibility — mood, recovery, what today is
                actually like — so support isn&rsquo;t guesswork.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-num">03 — For everyone else</div>
              <h3>Show up right</h3>
              <p>
                A living registry tells friends, family, and her doula exactly what&rsquo;s needed
                this week — meals, errands, a few hours of childcare.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="registry">
        <div className="wrap">
          <div className="eyebrow">The part everyone can use</div>
          <h2>No account needed. Just claim a slot.</h2>
          <p className="section-lede">
            Share her registry link with anyone — a coworker, a distant aunt, a college friend.
            They pick a week, claim a meal or an item, and get a text reminder. That&rsquo;s it.
            This one&rsquo;s real — try claiming something below.
          </p>

          <RegistryBoard slug="maya-demo" />

          <p className="form-note" style={{ marginTop: 24 }}>
            Expecting or just had a baby?{" "}
            <Link href="/start" style={{ color: "var(--clay-bright)" }}>
              Create your own registry
            </Link>{" "}
            — free, no account needed for you either.
          </p>
        </div>
      </section>

      <section id="join">
        <div className="wrap">
          <div className="eyebrow">Get in early</div>
          <h2>We&rsquo;re building this now. Come be part of it.</h2>

          <div className="form-shell">
            <div className="form-side">
              <h3>What joining the waitlist gets you</h3>
              <ul>
                <li>First access when Fourth opens in your area</li>
                <li>An early invite to set up your own registry before launch</li>
                <li>
                  A say in what we build first — we&rsquo;re building this with real postpartum
                  moms, not just for them
                </li>
              </ul>
            </div>

            <WaitlistForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegistryBoard } from "@/components/RegistryBoard";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SupportChat } from "@/components/SupportChat";
import { LiveTimestamp } from "@/components/LiveTimestamp";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <header className="hero">
        <div className="wrap">
          <LiveTimestamp />
          <h1>
            You&rsquo;re not supposed to figure out <em>the fourth trimester</em> alone.
          </h1>
          <p className="hero-sub">
            Talk to someone right now — any hour, no account needed — and if you want, connect
            anonymously with another mom who&rsquo;s going through it at the same time. Set up a
            registry so the people who want to help know exactly how.
          </p>
          <SupportChat />
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
              <div className="quote-label">— Jasmine, on hospital follow-up</div>
            </div>
            <div className="quote-card">
              <div className="quote-mark">&ldquo;</div>
              <p className="quote-text">
                I found my mom group through word of mouth, months in. I wish I&rsquo;d known it
                existed on day one.
              </p>
              <div className="quote-label">— Elena, on finding community</div>
            </div>
            <div className="quote-card">
              <div className="quote-mark">&ldquo;</div>
              <p className="quote-text">
                People wanted to help. They just didn&rsquo;t know what I actually needed, week to
                week.
              </p>
              <div className="quote-label">— Courtney, on family & friends</div>
            </div>
          </div>
        </div>
      </section>

      <section id="registry">
        <div className="wrap">
          <div className="eyebrow">The part everyone can use</div>
          <h2>No account needed. Just claim a slot.</h2>
          <p className="section-lede">
            A Fourth registry is a living needs list for a new mom — meals, essentials, and blocks
            of time — that updates as her needs change week to week. Share the link with anyone: a
            coworker, a distant aunt, a college friend. They pick something, claim it, and get a
            reminder. No account needed on either end.
          </p>

          <div className="needs-library">
            <h3>Things she might need</h3>
            <p className="section-lede" style={{ marginBottom: 0 }}>
              A starting point if you&rsquo;re not sure what to add — organized by what actually
              helps in the fourth trimester.
            </p>
            <div className="needs-grid">
              <div className="needs-category">
                <div className="needs-category-label">PJs & comfort</div>
                <ul>
                  <li>Nursing-friendly pajamas</li>
                  <li>Robe</li>
                  <li>Slippers</li>
                  <li>Nursing bras</li>
                </ul>
              </div>
              <div className="needs-category">
                <div className="needs-category-label">Body care</div>
                <ul>
                  <li>Perineal spray</li>
                  <li>Sitz bath soak</li>
                  <li>Nipple cream</li>
                  <li>Postpartum belly wrap</li>
                </ul>
              </div>
              <div className="needs-category">
                <div className="needs-category-label">Supplements</div>
                <ul>
                  <li>Postnatal vitamins</li>
                  <li>Lactation support</li>
                  <li>Magnesium</li>
                  <li>Iron</li>
                </ul>
              </div>
              <div className="needs-category">
                <div className="needs-category-label">Feeding</div>
                <ul>
                  <li>Nursing pillow</li>
                  <li>Bottle set</li>
                  <li>Pumping supplies</li>
                  <li>Burp cloths</li>
                </ul>
              </div>
              <div className="needs-category">
                <div className="needs-category-label">Sleep & recovery</div>
                <ul>
                  <li>Blackout curtains</li>
                  <li>White noise machine</li>
                  <li>Heating pad</li>
                  <li>Compression socks</li>
                </ul>
              </div>
              <div className="needs-category">
                <div className="needs-category-label">Help & time</div>
                <ul>
                  <li>A grocery run</li>
                  <li>A home-cooked meal</li>
                  <li>2 hours of childcare</li>
                  <li>A load of laundry, done</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="form-note" style={{ marginTop: 56, marginBottom: 12 }}>
            See a live example — try claiming something below.
          </p>
          <RegistryBoard slug="maya-demo" />

          <div className="section-cta">
            <Link href="/start" className="btn btn-primary btn-large">
              Create a registry
            </Link>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <div className="eyebrow">What&rsquo;s coming with Fourth</div>
          <h2>Three people, three needs — one app that connects them.</h2>
          <p className="section-lede">
            Fourth is building a mobile app that will connect new moms to each other, provide
            wellbeing check-ins and partner visibility to those check-ins, and let friends and
            family show up for her with exactly what&rsquo;s needed — no guesswork, no account
            required for them.
          </p>
          <div className="pillars">
            <div className="pillar">
              <div className="pillar-num">01 — For her</div>
              <h3>Find your people</h3>
              <p>
                Connected with other moms at the same stage, nearby — not another endless feed,
                just a small group of women a few weeks apart from you.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-num">02 — For her partner</div>
              <h3>See what she needs</h3>
              <p>
                The partner sees the results of her wellbeing check-ins and gets personalized
                instructions on how they can help her — so support isn&rsquo;t guesswork.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-num">03 — For everyone else</div>
              <h3>Bring what she actually needs</h3>
              <p>
                A living registry tells friends, family, and her doula exactly what&rsquo;s needed
                this week — meals, errands, a few hours of childcare.
              </p>
            </div>
          </div>

          <div className="section-cta">
            <a href="#join" className="btn btn-primary">
              Join the waitlist
            </a>
          </div>
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

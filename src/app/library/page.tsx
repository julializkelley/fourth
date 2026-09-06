import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LIBRARY_STAGES } from "@/lib/libraryContent";

export const metadata = {
  title: "The Library — Fourth",
  description: "A week-by-week guide to what's common in the fourth trimester, and when to reach out.",
};

export default function LibraryPage() {
  return (
    <div className="simple-page">
      <SiteHeader />
      <main className="simple-main">
        <div className="wrap">
          <div className="eyebrow">The library</div>
          <h1>A wide range of normal.</h1>
          <p className="hero-sub" style={{ maxWidth: 640 }}>
            Postpartum recovery doesn&rsquo;t follow one script — everyone&rsquo;s experience is
            different. This is a general guide to what&rsquo;s commonly experienced at each stage,
            and what&rsquo;s worth checking in with someone about. It&rsquo;s education, not a
            diagnosis — if anything here worries you, talk to your provider.
          </p>

          <div className="psychosis-callout">
            <div className="psychosis-callout-label">Read this one first</div>
            <h2>Postpartum psychosis — rare, but time-sensitive</h2>
            <p>
              Postpartum psychosis is rare (roughly 1–2 in 1,000 births), but it&rsquo;s a medical
              emergency, and it looks different from baby blues or even postpartum depression. It
              typically appears suddenly, often within the first two weeks after birth, though it
              can happen later.
            </p>
            <p>
              <strong>Warning signs:</strong> confusion or disorientation; hallucinations (seeing
              or hearing things that aren&rsquo;t there); paranoia or delusional thinking; feeling
              like you or the world isn&rsquo;t real; not sleeping for days even when the baby
              sleeps; extreme agitation or mood swings unlike anything before.
            </p>
            <p>
              This isn&rsquo;t something to wait out. If you or someone you love is showing these
              signs, it needs same-day medical attention — call 988, go to an ER, or call the
              National Maternal Mental Health Hotline (1-833-852-6262). This applies to partners
              and family too: sometimes the person experiencing it doesn&rsquo;t recognize
              what&rsquo;s happening, which is exactly why the people around her matter here.
            </p>
          </div>

          <div className="library-stages">
            {LIBRARY_STAGES.map((stage) => (
              <div key={stage.label} className="library-stage">
                <h2>{stage.label}</h2>
                <div className="library-stage-grid">
                  <div>
                    <div className="library-col-label">Physical</div>
                    <ul>
                      {stage.physical.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="library-col-label">Emotional</div>
                    <ul>
                      {stage.emotional.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="library-col-label library-col-label-reach">Worth checking in about</div>
                    <ul>
                      {stage.reachOutAbout.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

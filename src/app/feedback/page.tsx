import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FeedbackForm } from "@/components/FeedbackForm";

export const metadata = {
  title: "Feedback — Fourth",
  description: "Tell us what's working and what isn't about Fourth.",
};

export default function FeedbackPage() {
  return (
    <div className="simple-page">
      <SiteHeader />
      <main className="simple-main">
        <div className="wrap-narrow legal-page">
          <div className="eyebrow">Feedback</div>
          <h1>Help shape Fourth</h1>
          <p className="hero-sub">
            Fourth is new and still evolving. If something&rsquo;s broken, confusing, or missing —
            or something worked exactly right — tell us. It goes straight to the person building
            it.
          </p>
          <FeedbackForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

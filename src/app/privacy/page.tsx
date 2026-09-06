import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy Policy — Fourth",
  description: "What Fourth collects, why, and how to reach us about it.",
};

export default function PrivacyPage() {
  return (
    <div className="simple-page">
      <SiteHeader />
      <main className="simple-main">
        <div className="wrap-narrow legal-page">
          <div className="eyebrow">Legal</div>
          <h1>Privacy Policy</h1>
          <p className="hero-sub">Last updated September 2026.</p>

          <p>
            Fourth (&ldquo;we,&rdquo; &ldquo;us&rdquo;) provides a website and mobile app to
            support women and their care circles during the postpartum period. This page explains
            what we collect, why, and how to reach us about it.
          </p>

          <h2>What we collect</h2>
          <p>
            <strong>If you join the waitlist:</strong> your name, email, role (mom, partner,
            family/friend, doula, or &ldquo;just want to help&rdquo;), and an optional due date or
            baby&rsquo;s birthday.
          </p>
          <p>
            <strong>If you create or use a registry:</strong> the registry owner&rsquo;s name and
            any optional details she adds (due date, allergies, meal preferences, drop-off notes).
            If you claim an item on someone&rsquo;s registry, we collect your name and email so we
            can send a confirmation and reminders about what you signed up for.
          </p>
          <p>
            <strong>If you use the support chat:</strong> the chat is anonymous and doesn&rsquo;t
            require an account. We assign a random session identifier stored in your browser to
            support the &ldquo;connect with another mom&rdquo; feature and to detect if you&rsquo;re
            an active participant for pairing purposes. Messages you send to the AI companion are
            processed by Anthropic (the maker of Claude) to generate a response; if you choose to
            connect anonymously with another visitor, those messages are stored so both of you can
            see the conversation, and so we can review flagged messages for safety.
          </p>
          <p>
            <strong>If you use the Fourth mobile app:</strong> we collect your email (for
            passwordless sign-in), your role (mom or partner/family), and if you&rsquo;re a mom,
            the check-ins you submit (mood, sleep, and any notes you write) and the members of your
            care circle. Partners and family you invite see check-in data according to the
            visibility you control.
          </p>

          <h2>What we don&rsquo;t do</h2>
          <p>
            We don&rsquo;t sell your data to advertisers, and we don&rsquo;t use it for ad
            targeting. We don&rsquo;t run ads on Fourth at all. Safety-critical information —
            crisis hotline numbers and postpartum psychosis warning signs — is never behind a
            login or paywall.
          </p>

          <h2>Who we share data with</h2>
          <p>
            We use a small number of service providers to run Fourth: Supabase (database and
            authentication), Resend (email delivery), Anthropic (processes support chat messages
            to generate responses), and Vercel (hosting). These providers process data on our
            behalf under their own privacy and security commitments — we don&rsquo;t sell or share
            your data with anyone else, and never for advertising.
          </p>

          <h2>Data retention and deletion</h2>
          <p>
            You can ask us to delete your data at any time by emailing{" "}
            <a href="mailto:hello@fourthapp.co">hello@fourthapp.co</a>. Anonymous chat sessions are
            not tied to an identity we can look up unless you also used the registry or app with an
            email address.
          </p>

          <h2>Not a substitute for professional care</h2>
          <p>
            Fourth&rsquo;s support chat and educational content are for information and emotional
            support only — they are not a medical provider, therapist, or crisis service, and
            don&rsquo;t diagnose or treat any condition. If you&rsquo;re in crisis, call or text 988
            (Suicide &amp; Crisis Lifeline) or the National Maternal Mental Health Hotline at
            1-833-852-6262, both free and available 24/7.
          </p>

          <h2>Children</h2>
          <p>
            Fourth is intended for adults and is not directed at children under 13. We don&rsquo;t
            knowingly collect data from children.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We&rsquo;ll update this page if what we collect or how we use it changes, and update
            the date at the top.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy or your data:{" "}
            <a href="mailto:hello@fourthapp.co">hello@fourthapp.co</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

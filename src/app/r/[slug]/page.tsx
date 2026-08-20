import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegistryBoard } from "@/components/RegistryBoard";

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="simple-page">
      <SiteHeader />
      <main className="simple-main">
        <div className="wrap">
          <div className="eyebrow">Fourth trimester registry</div>
          <h1>Pick something below — no account needed.</h1>
          <p className="hero-sub">
            Claim a meal, an item, or a bit of time. You&rsquo;ll get a lightweight confirmation,
            and that&rsquo;s it.
          </p>
          <RegistryBoard slug={slug} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

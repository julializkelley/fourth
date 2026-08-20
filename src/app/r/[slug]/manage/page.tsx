import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ManageBoard } from "@/components/ManageBoard";

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  return (
    <div className="simple-page">
      <SiteHeader />
      <main className="simple-main">
        <div className="wrap">
          <div className="eyebrow">Manage your registry</div>
          <h1>Add what you need. Remove what you don&rsquo;t.</h1>
          <p className="hero-sub">
            Only people with this exact link can make changes. Keep it somewhere safe.
          </p>
          <ManageBoard slug={slug} token={token ?? ""} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

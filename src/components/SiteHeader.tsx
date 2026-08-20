import Link from "next/link";

export function SiteHeader() {
  return (
    <nav className="wrap">
      <Link href="/" className="logo">
        Fourth<span>.</span>
      </Link>
      <div className="nav-links">
        <Link href="/#problem">Why</Link>
        <Link href="/#how">How it works</Link>
        <Link href="/#registry">The registry</Link>
        <Link href="/#join">Join</Link>
      </div>
    </nav>
  );
}

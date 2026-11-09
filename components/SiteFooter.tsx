"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Compact footer with the legal links for every page except the landing page,
// which has its own full footer.
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="bg-santa-dark border-t border-white/5 py-6 text-center text-xs text-gray-500">
      <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        <Link href="/" className="hover:text-santa-gold">Home</Link>
        <Link href="/terms" className="hover:text-santa-gold">Terms of Service</Link>
        <Link href="/privacy" className="hover:text-santa-gold">Privacy Policy</Link>
        <Link href="/refunds" className="hover:text-santa-gold">Refund Policy</Link>
      </nav>
      <p className="mt-3">&copy; {new Date().getFullYear()} Secret Santa Generator</p>
    </footer>
  );
}

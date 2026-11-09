import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-santa-dark text-gray-300">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-santa-gold hover:text-santa-gold-dark text-sm">&larr; Back to home</Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-santa-snow mt-4 mb-2 font-display">{title}</h1>
        {intro && <p className="text-gray-400 mb-8">{intro}</p>}
        <div className="legal-prose space-y-6">{children}</div>
        <nav aria-label="Legal pages" className="mt-12 pt-6 border-t border-white/10 text-sm flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/terms" className="hover:text-santa-gold">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-santa-gold">Privacy Policy</Link>
          <Link href="/refunds" className="hover:text-santa-gold">Refund Policy</Link>
        </nav>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-santa-snow mb-2">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

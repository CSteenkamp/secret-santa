import type { Metadata } from "next";

// Private, session-bound pages: keep them out of search results.
export const metadata: Metadata = {
  title: "Signing you in",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

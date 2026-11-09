import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Participant Login",
  description: "Log in to your Secret Santa group with your personal code or an email magic link.",
  alternates: { canonical: "/join" },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

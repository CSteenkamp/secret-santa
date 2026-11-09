import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join a Secret Santa Group",
  description:
    "Got an invite code? Join your family, friends or office Secret Santa group, add your wishlist and find out who you are buying for.",
  alternates: { canonical: "/join" },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}

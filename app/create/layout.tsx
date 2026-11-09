import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Secret Santa Group",
  description:
    "Start a free Secret Santa group in under two minutes. Set a group name and organizer password, add participants and share one invite link. No account needed.",
  alternates: { canonical: "/create" },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}

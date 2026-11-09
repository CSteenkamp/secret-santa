import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for the Secret Santa Generator, including the one-time Unlimited upgrade.",
  alternates: { canonical: "/terms" },
};

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" intro={`Last updated: ${legal.lastUpdated}`}>
      <Section title="1. Who we are">
        <p>
          {legal.appName} (the &ldquo;Service&rdquo;), available at {legal.siteUrl}, is operated by {legal.operator}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). You can contact us at <a className="text-santa-gold" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.
        </p>
        <p>
          By creating a group, joining a group, or purchasing an upgrade you agree to these Terms. If you do not agree, do not use the Service.
        </p>
      </Section>

      <Section title="2. What the Service does">
        <p>
          The Service lets an organiser create a Secret Santa group, invite participants with an invite code, collect wishlists, and
          randomly assign who gives a gift to whom. Participants sign in with a login code or an email link, not with a password.
        </p>
        <p>
          The Free plan allows up to 10 participants per group. The Unlimited upgrade removes that limit for one group.
        </p>
      </Section>

      <Section title="3. Eligibility and accounts">
        <p>You must be at least 16 years old to create a group or make a purchase. Organisers may add participants of any age with the consent of a parent or guardian where required.</p>
        <p>
          The organiser is responsible for keeping the group&rsquo;s admin password confidential, for the accuracy of the names and email
          addresses entered, and for having permission to enter other people&rsquo;s details. Anyone who holds a participant&rsquo;s login code can view that participant&rsquo;s wishlist and assignment; share codes carefully.
        </p>
      </Section>

      <Section title="4. The Unlimited upgrade (paid)">
        <p>
          The Unlimited upgrade is a one-time purchase of {legal.priceUsd} USD (plus any applicable tax shown at checkout) for a single group. It is not a subscription and does not renew.
        </p>
        <p>
          Payments are processed by Stripe. We do not see or store your card details. Depending on your location, Stripe may act as the merchant of record and collect any applicable sales tax or VAT. The amount charged is shown before you confirm payment.
        </p>
        <p>
          The upgrade is applied to the group automatically once Stripe confirms the payment. If the upgrade is not shown within a few minutes, contact us with the email address used at checkout and we will apply it manually.
        </p>
        <p>
          Refunds are described in our <Link href="/refunds" className="text-santa-gold">Refund Policy</Link>.
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>enter personal details of people who have not agreed to take part;</li>
          <li>post wishlist links to unlawful, harmful, or misleading content;</li>
          <li>attempt to access other groups, bypass login codes, or interfere with the Service;</li>
          <li>use automated tools to create groups or send login emails in bulk.</li>
        </ul>
        <p>We may remove content or suspend groups that break these rules.</p>
      </Section>

      <Section title="6. Your content">
        <p>
          You keep ownership of the names, wishlists and links you enter. You grant us a licence to store and display that content only as needed to run the Service for your group.
        </p>
      </Section>

      <Section title="7. Availability and changes">
        <p>
          We aim to keep the Service available, especially during the holiday season, but we do not guarantee uninterrupted service. We may change or discontinue features. If we discontinue the Service entirely, we will give reasonable notice on the website where practical.
        </p>
      </Section>

      <Section title="8. Disclaimer and limitation of liability">
        <p>
          The Service is provided &ldquo;as is&rdquo;. To the fullest extent permitted by law, we exclude all warranties and are not liable for indirect or consequential loss, lost data, or disputes between participants. Our total liability to you for any claim relating to the Service is limited to the amount you paid us in the 12 months before the claim.
        </p>
        <p>Nothing in these Terms limits rights that consumer protection law gives you and that cannot be excluded by agreement.</p>
      </Section>

      <Section title="9. Termination">
        <p>
          You may stop using the Service at any time and may ask us to delete your group. We may suspend or terminate access for breach of these Terms. Sections 6, 8 and 10 survive termination.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>
          These Terms are governed by the laws of {legal.jurisdiction}. Mandatory consumer protection rules of the country where you live continue to apply.
        </p>
      </Section>

      <Section title="11. Changes to these Terms">
        <p>
          We may update these Terms. The date at the top shows the latest version. Continued use after a change means you accept the updated Terms.
        </p>
      </Section>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund policy for the one-time Secret Santa Unlimited upgrade.",
  alternates: { canonical: "/refunds" },
};

export const dynamic = "force-dynamic";

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" intro={`Last updated: ${legal.lastUpdated}`}>
      <Section title="The purchase">
        <p>
          The Unlimited upgrade is a one-time payment of {legal.priceUsd} USD (plus any tax shown at checkout) that removes the participant limit for one Secret Santa group. It is applied immediately after payment and does not renew.
        </p>
      </Section>

      <Section title="14-day refund">
        <p>
          If you are not satisfied, email <a className="text-santa-gold" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> within 14 days of purchase with the email address used at checkout, and we will refund the full amount. We may ask whether the group has already used more than 10 participants, but we will not refuse a refund within the 14 days on that basis.
        </p>
      </Section>

      <Section title="After 14 days">
        <p>
          After 14 days refunds are at our discretion, but we will always refund if the upgrade was never applied, was applied to the wrong group through our error, or the Service was unavailable for most of the time you needed it.
        </p>
      </Section>

      <Section title="Duplicate payments">
        <p>If you were charged more than once for the same group, we refund the duplicate charges in full.</p>
      </Section>

      <Section title="How refunds are paid">
        <p>
          Refunds go back to the original payment method through Stripe, usually within 5 to 10 business days depending on your bank. Where Stripe is the merchant of record for your purchase, Stripe may process the refund on our instruction.
        </p>
      </Section>

      <Section title="Your statutory rights">
        <p>This policy adds to, and does not replace, any rights you have under the consumer protection laws of your country.</p>
      </Section>
    </LegalPage>
  );
}

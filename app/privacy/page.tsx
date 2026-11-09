import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Secret Santa Generator collects, uses and protects personal information.",
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" intro={`Last updated: ${legal.lastUpdated}`}>
      <Section title="1. Who is responsible">
        <p>
          {legal.operator} operates {legal.appName} at {legal.siteUrl} and is the responsible party (data controller) for the personal
          information described here. Contact: <a className="text-santa-gold" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.
        </p>
        <p>
          This policy is written to meet the Protection of Personal Information Act (POPIA) in South Africa and the General Data Protection Regulation (GDPR) for people in the European Economic Area and the United Kingdom.
        </p>
      </Section>

      <Section title="2. What we collect">
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-santa-snow">Group details:</strong> group name, year, optional gift budget, and a hashed admin password. We never store the password itself.</li>
          <li><strong className="text-santa-snow">Participant details:</strong> the name and optional email address the organiser enters, a generated login code, wishlist items (titles and links), and the Secret Santa assignment.</li>
          <li><strong className="text-santa-snow">Organiser email (optional):</strong> if the organiser gives an email address when creating a group, we use it once to send the invite code and dashboard link. It is not stored.</li>
          <li><strong className="text-santa-snow">Purchase details:</strong> if a group is upgraded, Stripe sends us the checkout reference, the amount paid and the email used at checkout. Card numbers are handled only by Stripe.</li>
          <li><strong className="text-santa-snow">Technical data:</strong> IP address and request logs used for security and rate limiting, kept for a short period.</li>
        </ul>
        <p>Organisers enter participants&rsquo; names and emails. By doing so they confirm they are allowed to share those details with us for the purpose of running the gift exchange.</p>
      </Section>

      <Section title="3. Why we use it and our legal basis">
        <ul className="list-disc pl-6 space-y-1">
          <li>To run your group, deliver login emails and show assignments and wishlists (performance of a contract / legitimate interest of the organiser).</li>
          <li>To process and record the Unlimited upgrade (performance of a contract, and legal obligations for tax and accounting).</li>
          <li>To keep the Service secure and prevent abuse (legitimate interest).</li>
        </ul>
        <p>We do not sell personal information, show advertising, or use the data for profiling.</p>
      </Section>

      <Section title="4. Cookies">
        <p>
          We set one strictly necessary, encrypted session cookie (<code>secret-santa-session</code>) so you stay signed in. It expires after 24 hours. We use no analytics or advertising cookies, so no cookie banner is shown. Your browser&rsquo;s local storage may hold the group you are joining while you move between pages.
        </p>
      </Section>

      <Section title="5. Who we share it with">
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-santa-snow">Stripe</strong> (payments) when a group is upgraded. See Stripe&rsquo;s privacy policy at stripe.com/privacy.</li>
          <li><strong className="text-santa-snow">Email delivery provider</strong> to send login links to participants who have an email address.</li>
          <li><strong className="text-santa-snow">Cloudflare</strong>, which routes traffic to the Service and protects it from attacks.</li>
          <li>Other participants in your group: your name and wishlist are visible to the person assigned to you; the organiser can see all names, codes, wishlists and assignments.</li>
        </ul>
        <p>Some of these providers process data outside South Africa, the EEA or the UK under their standard contractual safeguards.</p>
      </Section>

      <Section title="6. How long we keep it">
        <p>
          Group data is kept while the group exists so you can reuse it next year. We delete a group and everything in it on request from the organiser. Purchase records are kept for as long as tax and accounting law requires. Security logs are kept for up to 90 days.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          Data is sent over HTTPS, admin passwords are hashed with bcrypt, sessions are encrypted, and login attempts are rate limited. No system is perfectly secure; please keep invite codes, login codes and admin passwords private.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>
          You may ask us to access, correct or delete your personal information, to object to or restrict processing, or to receive a copy of your data. Participants can also ask the organiser to remove them from a group. To exercise a right, email <a className="text-santa-gold" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. We respond within 30 days.
        </p>
        <p>
          If you are unhappy with our response you may complain to the Information Regulator of South Africa (inforegulator.org.za) or, in the EEA or UK, to your local data protection authority.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          Organisers must be 16 or older. Children may take part in a group only when a parent, guardian or organiser enters their details with appropriate consent. We do not knowingly collect children&rsquo;s data directly.
        </p>
      </Section>

      <Section title="10. Changes">
        <p>We may update this policy. The date at the top shows the latest version.</p>
      </Section>
    </LegalPage>
  );
}

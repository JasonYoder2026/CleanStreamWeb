import { Link } from "react-router-dom";

type LegalPageType = "privacy" | "terms";

const privacySections = [
  {
    title: "Information we collect",
    paragraphs: [
      "We collect account and contact information such as your name, email address, user identifier, and profile details. When you allow location access, we use your device location to help identify nearby laundromats and provide directions.",
      "We collect machine-use records, vend status, wallet balances and activity, refund requests, maintenance requests, support communications, and photos you choose to attach. Camera access is used when you scan a machine QR code or attach a photo.",
      "Payments are processed by Stripe. Clean Stream receives payment status and transaction references but does not store your complete payment-card number.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use information to provide accounts, accept payments, start laundry equipment through Nayax, maintain wallet balances, process refunds, respond to support requests, prevent fraud, secure the service, and meet legal and accounting obligations.",
    ],
  },
  {
    title: "When information is shared",
    paragraphs: [
      "We share only the information needed with service providers that operate Clean Stream, including Supabase for application infrastructure, Stripe for card payments, Nayax for machine vending, and hosting or communications providers. We may also disclose information when required by law, to protect customers or the service, or as part of a business transaction subject to appropriate safeguards.",
      "Clean Stream does not sell personal information or use third-party advertising SDKs in the app.",
    ],
  },
  {
    title: "Retention and deletion",
    paragraphs: [
      "Account profile information is retained while your account is active and removed or anonymized after an approved deletion request. Transaction, payment, wallet, tax, dispute, and accounting records may be retained for up to seven years. Fraud and security records, support requests, and maintenance records may be retained for up to two years unless a longer period is legally required. Provider backups expire according to their normal secure rotation schedules.",
      "You can delete your account in the app or follow the instructions on our account-deletion page. Some records may be retained when needed for financial reconciliation, fraud prevention, legal claims, or compliance, but will no longer be used to provide an active account.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can change location, camera, photo, and notification permissions in your device settings. You may request access, correction, or deletion of your information by contacting us. The service is intended for adults and is not directed to children under 13.",
    ],
  },
];

const termsSections = [
  {
    title: "Using Clean Stream",
    paragraphs: [
      "You must provide accurate account information, keep your credentials secure, and use Clean Stream services lawfully. Machine access remains subject to availability, posted facility rules, and the controls on the physical washer or dryer.",
    ],
  },
  {
    title: "Payments and vending",
    paragraphs: [
      "You authorize the displayed charge when you submit a card or wallet payment. Washer prices are based on the selected machine. Dryer purchases add the time shown before payment. A successful payment does not guarantee a vend if the device is unavailable; when a vend is rejected, voided, or times out, Clean Stream will initiate the applicable card refund or wallet reversal.",
    ],
  },
  {
    title: "Clean Stream wallet",
    paragraphs: [
      "Wallet funds are prepaid Clean Stream credit for eligible services. They are not a bank account, do not earn interest, and are not redeemable for cash except where required by law. Promotional credits have no cash value and may have separate conditions.",
    ],
  },
  {
    title: "Refunds and support",
    paragraphs: [
      "Report machine or payment issues promptly through the app or our support page. We may review machine, payment, and vend records before issuing a remedy. Refunds are returned through the original payment method or wallet when appropriate and as required by law.",
    ],
  },
  {
    title: "Service availability and responsibility",
    paragraphs: [
      "Services may be interrupted for maintenance, network failures, equipment issues, or events outside our control. To the extent permitted by law, Clean Stream is not responsible for indirect or consequential losses. Nothing in these terms limits rights that cannot legally be limited.",
    ],
  },
  {
    title: "Changes and governing law",
    paragraphs: [
      "We may update these terms and will post the current version here. Continued use after an update means you accept the revised terms. Indiana law governs these terms, without overriding consumer protections that apply where you live.",
    ],
  },
];

function PublicLegalPage({ type }: { type: LegalPageType }) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? privacySections : termsSections;

  return (
    <main className="public-document">
      <p className="public-eyebrow">Effective August 3, 2026</p>
      <h1>{isPrivacy ? "Privacy Policy" : "Terms of Service"}</h1>
      <p className="public-document-lead">
        {isPrivacy
          ? "This policy explains how Clean Stream Laundry Solutions LLC handles information when you use our website, mobile app, payments, wallet, and connected laundry services."
          : "These terms govern your use of Clean Stream Laundry Solutions LLC websites, mobile applications, payments, wallet, and connected laundry services."}
      </p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
      <section>
        <h2>Contact us</h2>
        <p>Questions can be sent to <a href="mailto:jacob@cleanstreamlaundry.com">jacob@cleanstreamlaundry.com</a> or Clean Stream Laundry Solutions LLC at <a href="tel:+17656102114">(765) 610-2114</a>.</p>
        {isPrivacy && <p>For deletion instructions, visit <Link to="/account-deletion">Delete your Clean Stream account</Link>.</p>}
      </section>
    </main>
  );
}

export default PublicLegalPage;

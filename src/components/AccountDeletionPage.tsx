import { Mail, Smartphone } from "lucide-react";

function AccountDeletionPage() {
  return (
    <main className="public-document">
      <p className="public-eyebrow">Account controls</p>
      <h1>Delete your Clean Stream account</h1>
      <p className="public-document-lead">You can request deletion from the mobile app or by contacting Clean Stream. There is no fee to delete your account.</p>

      <section className="public-delete-option">
        <Smartphone />
        <div>
          <h2>Delete in the app</h2>
          <p>Sign in, open <strong>Settings</strong>, select <strong>Edit Profile</strong>, choose <strong>Delete Account</strong>, and confirm the request.</p>
        </div>
      </section>

      <section className="public-delete-option">
        <Mail />
        <div>
          <h2>Request deletion by email</h2>
          <p>Email <a href="mailto:jacob@cleanstreamlaundry.com?subject=Clean%20Stream%20account%20deletion">jacob@cleanstreamlaundry.com</a> from the address associated with your account. Use the subject “Clean Stream account deletion.” We may verify ownership before completing the request.</p>
        </div>
      </section>

      <section>
        <h2>What happens next</h2>
        <p>Your sign-in access and personal profile are removed or anonymized. Transaction, payment, wallet, tax, dispute, and accounting records may be retained for up to seven years. Fraud and security records, support requests, and maintenance records may be retained for up to two years unless law requires longer retention.</p>
        <p>Deleted wallets are not normally restored or attached to a new account. Any refund or dispute already in progress will continue using the minimum information needed to complete it.</p>
      </section>
    </main>
  );
}

export default AccountDeletionPage;

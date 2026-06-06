import Link from 'next/link';
import AccountAuthForm from '@/components/AccountAuthForm';

export const dynamic = 'force-dynamic';

export default function AccountLoginPage() {
  return (
    <main className="account-page">
      <section className="account-card">
        <p className="eyebrow">Customer account</p>
        <h1>Log in to your ZAIHAI account</h1>
        <p>View orders, payment status and shipment updates using the email from checkout.</p>
        <AccountAuthForm mode="login" />
        <div className="account-links">
          <Link href="/account/register">Create account</Link>
          <Link href="/account/forgot-password">Forgot password?</Link>
        </div>
      </section>
    </main>
  );
}

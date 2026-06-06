import Link from 'next/link';
import AccountAuthForm from '@/components/AccountAuthForm';

export const dynamic = 'force-dynamic';

export default function AccountRegisterPage() {
  return (
    <main className="account-page account-register-page">
      <section className="account-card account-register-card">
        <p className="eyebrow">Customer account</p>
        <h1>Create account</h1>
        <p className="account-card-copy">Use your checkout email so your orders can be linked automatically.</p>
        <AccountAuthForm mode="register" />
        <div className="account-links">
          <Link href="/account/login">Already have an account? Log in</Link>
        </div>
      </section>
    </main>
  );
}

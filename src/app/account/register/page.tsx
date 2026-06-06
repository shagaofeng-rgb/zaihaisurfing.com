import Link from 'next/link';
import AccountAuthForm from '@/components/AccountAuthForm';

export const dynamic = 'force-dynamic';

export default function AccountRegisterPage() {
  return (
    <main className="account-page">
      <section className="account-card">
        <p className="eyebrow">Customer account</p>
        <h1>Create your ZAIHAI account</h1>
        <p>If you already placed an order, use the same email and your orders will be linked automatically.</p>
        <AccountAuthForm mode="register" />
        <div className="account-links">
          <Link href="/account/login">Already have an account?</Link>
        </div>
      </section>
    </main>
  );
}

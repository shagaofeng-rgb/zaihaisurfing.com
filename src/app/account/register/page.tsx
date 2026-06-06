import Link from 'next/link';
import AccountAuthForm from '@/components/AccountAuthForm';

export const dynamic = 'force-dynamic';

export default function AccountRegisterPage() {
  return (
    <main className="account-page account-register-page">
      <section className="account-register-shell">
        <div className="account-register-hero">
          <p className="eyebrow">Customer account</p>
          <h1>Create your ZAIHAI account</h1>
          <p>Track paid orders, logistics updates and after-sales support from one private account center.</p>
          <div className="account-trust-list" aria-label="Account benefits">
            <span>Order matching by email</span>
            <span>Payment and shipment status</span>
            <span>Direct ZAIHAI support</span>
          </div>
          <img src="/assets/catalog/x1-pro/hero-angle.png" alt="ZAIHAI electric surfboard" />
        </div>
        <div className="account-card account-register-card">
          <div className="account-card-top">
            <span>Registration</span>
            <strong>Account setup</strong>
          </div>
          <AccountAuthForm mode="register" />
          <div className="account-links">
            <Link href="/account/login">Already have an account? Log in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

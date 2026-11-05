import Image from 'next/image';
import Link from 'next/link';
import AccountAuthForm from '@/components/AccountAuthForm';

const copy = {
  login: {title: 'Sign in', intro: 'Access your orders and account details.'},
  register: {title: 'Create an account', intro: 'Save your details and review past orders.'},
  forgot: {title: 'Forgot your password?', intro: 'Enter the email you use for your account.'},
  reset: {title: 'Choose a new password', intro: 'Use a strong password for your account.'}
};

export default function AccountEntry({mode, token}: {mode: keyof typeof copy; token?: string}) {
  return <main className="account-entry">
    <section className="account-card">
      <p className="eyebrow">ZAIHAI account</p>
      <h1>{copy[mode].title}</h1><p className="account-card-copy">{copy[mode].intro}</p>
      <AccountAuthForm mode={mode} token={token} />
      <nav className="account-entry-links" aria-label="Account help">
        {mode !== 'login' ? <Link href="/account/login">Sign in →</Link> : null}
        {mode !== 'forgot' ? <Link href="/account/forgot-password">Forgot password? →</Link> : null}
        {mode !== 'register' ? <Link href="/account/register">Create an account →</Link> : null}
      </nav>
    </section>
    <aside className="account-entry-feature">
      <Image src="/assets/home-ocean/resort-hero.webp" alt="ZAIHAI surfboard rider" width={720} height={405} sizes="(max-width:760px) 90vw, 440px" />
      <h2>Your equipment and orders in one place.</h2>
      <p>Find your order history and keep your contact details up to date.</p>
    </aside>
  </main>;
}

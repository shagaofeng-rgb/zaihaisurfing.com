'use client';

import {useState} from 'react';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

export default function AccountAuthForm({mode, token = ''}: {mode: Mode; token?: string}) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const isEmailEntry = mode === 'login' || mode === 'register';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const endpoint = {
      login: '/api/account/login',
      register: '/api/account/register',
      forgot: '/api/account/forgot-password',
      reset: '/api/account/reset-password'
    }[mode];

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...body, token})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(result.message || 'Request failed. Please try again.');
        return;
      }
      if (mode === 'forgot') {
        setStatus(result.message || 'If the email exists, a reset link has been sent.');
        return;
      }
      window.location.href = '/account/orders';
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={isEmailEntry ? 'account-form account-email-form' : 'account-form'} onSubmit={handleSubmit}>
      {isEmailEntry ? (
        <label className="account-email-field">
          <span className="sr-only">Email</span>
          <input name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
        </label>
      ) : (
        mode !== 'reset' && (
          <label>
            Email
            <input name="email" type="email" placeholder="name@company.com" autoComplete="email" required />
          </label>
        )
      )}
      {!isEmailEntry && mode !== 'forgot' && (
        <label>
          Password
          <input name="password" type="password" placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required />
        </label>
      )}
      {mode === 'reset' && (
        <label>
          Confirm password
          <input name="confirmPassword" type="password" placeholder="Repeat password" autoComplete="new-password" minLength={8} required />
        </label>
      )}
      <button className={isEmailEntry ? 'account-email-submit' : 'button primary account-submit'} disabled={busy} type="submit">
        {busy ? 'Processing...' : isEmailEntry ? 'Continue' : mode === 'forgot' ? 'Send reset link' : 'Set password'}
      </button>
      {isEmailEntry && (
        <p className="account-legal">By continuing, you agree to receive account emails from ZAIHAI SURFING and use this email to access your customer order center.</p>
      )}
      {status && <p className="account-status">{status}</p>}
    </form>
  );
}

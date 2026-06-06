'use client';

import {useState} from 'react';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

export default function AccountAuthForm({mode, token = ''}: {mode: Mode; token?: string}) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

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
    <form className="account-form" onSubmit={handleSubmit}>
      {mode === 'register' && (
        <>
          <div className="account-form-intro">
            <span>Secure customer access</span>
            <p>Use the same email as checkout so previous and future orders can be matched automatically.</p>
          </div>
          <div className="account-form-grid">
            <label>
              First name
              <input name="firstName" placeholder="David" autoComplete="given-name" required />
            </label>
            <label>
              Last name
              <input name="lastName" placeholder="Sha" autoComplete="family-name" />
            </label>
          </div>
          <label>
            Country / region
            <input name="country" placeholder="United States" autoComplete="country-name" />
          </label>
        </>
      )}
      {mode !== 'reset' && (
        <label>
          Email
          <input name="email" type="email" placeholder="name@company.com" autoComplete="email" required />
        </label>
      )}
      {mode !== 'forgot' && (
        <label>
          Password
          <input name="password" type="password" placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required />
        </label>
      )}
      {(mode === 'register' || mode === 'reset') && (
        <label>
          Confirm password
          <input name="confirmPassword" type="password" placeholder="Repeat password" autoComplete="new-password" minLength={8} required />
        </label>
      )}
      {mode === 'register' && (
        <label className="account-checkbox">
          <input name="acceptedTerms" type="checkbox" value="true" required />
          <span>I agree to the privacy policy and website terms.</span>
        </label>
      )}
      <button className="button primary account-submit" disabled={busy} type="submit">
        {busy ? 'Processing...' : mode === 'login' ? 'Log in' : mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Set password'}
      </button>
      {status && <p className="account-status">{status}</p>}
    </form>
  );
}

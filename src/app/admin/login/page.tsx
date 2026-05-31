export default async function AdminLoginPage({searchParams}: {searchParams: Promise<{error?: string}>}) {
  const query = await searchParams;

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" action="/api/admin/login" method="post">
        <p className="eyebrow">ZAIHAI Admin</p>
        <h1>Commerce Dashboard Login</h1>
        <p>Use the admin account to view orders, logistics, checkout events and Qianhai gateway status.</p>
        {query.error ? <strong className="admin-login-error">Login failed. Check email and password.</strong> : null}
        <label>
          Email
          <input name="email" type="email" defaultValue="davidsha@zaihaisurfing.com" required />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Set ADMIN_PASSWORD in Vercel" required />
        </label>
        <button className="button primary" type="submit">
          Login
        </button>
        <small>Local development fallback: zaihai-admin-demo. Production requires ADMIN_PASSWORD in Vercel.</small>
      </form>
    </main>
  );
}

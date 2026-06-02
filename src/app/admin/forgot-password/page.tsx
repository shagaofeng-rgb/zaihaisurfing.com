export default function AdminForgotPasswordPage() {
  return (
    <main className="admin-login-page">
      <form className="admin-login-card" action="/api/admin/forgot-password" method="post">
        <p className="eyebrow">Password recovery</p>
        <h1>Reset Admin Password</h1>
        <p>Enter the admin email. When SMTP is configured, a reset link can be sent to the configured administrator mailbox.</p>
        <label>
          Email
          <input name="email" type="email" required placeholder="admin@example.com" />
        </label>
        <button className="button primary" type="submit">Continue</button>
        <small><a href="/admin/login">Back to login</a></small>
      </form>
    </main>
  );
}

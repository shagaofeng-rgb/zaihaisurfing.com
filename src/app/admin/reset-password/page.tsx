export default function AdminResetPasswordPage() {
  return (
    <main className="admin-login-page">
      <form className="admin-login-card" action="/api/admin/reset-password" method="post">
        <p className="eyebrow">Password reset</p>
        <h1>Set New Password</h1>
        <p>This page is prepared for token-based password reset. Configure SMTP and token storage before public use.</p>
        <label>
          Reset token
          <input name="token" required placeholder="Token from email" />
        </label>
        <label>
          New password
          <input name="password" type="password" required placeholder="New secure password" />
        </label>
        <button className="button primary" type="submit">Reset Password</button>
        <small><a href="/admin/login">Back to login</a></small>
      </form>
    </main>
  );
}

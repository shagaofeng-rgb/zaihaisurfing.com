export default function AdminForgotPasswordPage() {
  return (
    <main className="admin-login-page">
      <form className="admin-login-card" action="/api/admin/forgot-password" method="post">
        <p className="eyebrow">密码找回</p>
        <h1>重置后台密码</h1>
        <p>如需重置密码，请联系系统管理员。</p>
        <label>
          邮箱
          <input name="email" type="email" required placeholder="admin@example.com" />
        </label>
        <button className="button primary" type="submit">继续</button>
        <small><a href="/admin/login">返回登录</a></small>
      </form>
    </main>
  );
}

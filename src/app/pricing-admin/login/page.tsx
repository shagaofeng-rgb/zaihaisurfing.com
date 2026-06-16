export const dynamic = 'force-dynamic';

export default async function PricingAdminLoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <main className="pricing-login-page">
      <form className="pricing-login-card" action="/api/pricing-admin/login" method="post">
        <p className="pricing-kicker">ZAIHAI Pricing Admin</p>
        <h1>计价后台登录</h1>
        <p>这个后台独立用于价格、汇率、佣金和成交订单记录。</p>
        {params.error ? <strong className="pricing-login-error">登录失败，请检查账号或密码。</strong> : null}
        <label>
          邮箱
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          密码
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="pricing-primary-button" type="submit">登录计价后台</button>
      </form>
    </main>
  );
}

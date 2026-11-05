import AccountEntry from '@/components/AccountEntry';

export const dynamic = 'force-dynamic';

export default async function AccountResetPasswordPage({searchParams}: {searchParams: Promise<{token?: string}>}) {
  const {token} = await searchParams;
  return <AccountEntry mode={token ? 'reset' : 'forgot'} token={token} />;
}

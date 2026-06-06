import {redirect} from 'next/navigation';

export default async function LocalizedAccountResetPasswordPage({searchParams}: {searchParams: Promise<{token?: string}>}) {
  const {token} = await searchParams;
  redirect(`/account/reset-password${token ? `?token=${encodeURIComponent(token)}` : ''}`);
}

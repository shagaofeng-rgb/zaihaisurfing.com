import {requireAdminSession} from '@/lib/adminAuth';
import AdminFrame from '@/components/AdminFrame';

export default async function AdminShell({children}: {active: string; children: React.ReactNode}) {
  const session = await requireAdminSession();
  return <AdminFrame email={session.email || '管理员'}>{children}</AdminFrame>;
}

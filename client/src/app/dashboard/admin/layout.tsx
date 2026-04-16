import { requireRole } from '@/lib/server-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('org_admin');
  return <>{children}</>;
}

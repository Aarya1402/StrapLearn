import { getCurrentUser, getDashboardPath } from '@/lib/server-auth';
import { redirect } from 'next/navigation';

export default async function SuperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role_type !== 'super_admin') {
     if (user) redirect(getDashboardPath(user.role_type));
     else redirect('/login');
  }

  return <>{children}</>;
}

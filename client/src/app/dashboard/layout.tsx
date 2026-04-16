import { getCurrentUser } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={{ username: user.username, role_type: user.role_type }}>
      {children}
    </DashboardShell>
  );
}

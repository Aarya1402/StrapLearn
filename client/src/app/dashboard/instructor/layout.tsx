import { requireRole } from '@/lib/server-auth';

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  await requireRole('org_admin', 'instructor');
  return <>{children}</>;
}

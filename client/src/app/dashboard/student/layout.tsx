import { requireAuth } from '@/lib/server-auth';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}

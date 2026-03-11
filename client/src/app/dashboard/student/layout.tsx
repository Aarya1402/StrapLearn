import { requireAuth } from '@/lib/server-auth';
import { logoutAction } from '@/actions/auth.actions';

// Protects all /dashboard/student/* routes — any authenticated user
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <nav style={{ background: '#0f3460', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <span>StrapLearn — <strong>Student</strong> | {user.email}</span>
        <form action={logoutAction}>
          <button type="submit" style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 12px', cursor: 'pointer' }}>
            Logout
          </button>
        </form>
      </nav>
      <aside style={{ display: 'flex', gap: 24, padding: 24 }}>
        <ul style={{ listStyle: 'none', padding: 0, minWidth: 160 }}>
          <li><a href='/dashboard/student'>Dashboard</a></li>
          <li><a href="/dashboard/student/courses">My Courses</a></li>
          <li><a href="/dashboard/student/progress">Progress</a></li>
          <li><a href="/courses">Browse Courses</a></li>
          <li><a href="/dashboard/student/settings">Org Settings</a></li>
        </ul>
        <main style={{ flex: 1 }}>{children}</main>
      </aside>
    </div>
  );
}

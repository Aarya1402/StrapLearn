import { requireRole } from '@/lib/server-auth';
import { logoutAction } from '@/actions/auth.actions';

// Protects all /dashboard/instructor/* routes
export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('org_admin', 'instructor');

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <nav style={{ background: '#1a1a2e', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <span>StrapLearn — <strong>Instructor</strong> | {user.email}</span>
        <form action={logoutAction}>
          <button type="submit" style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 12px', cursor: 'pointer' }}>
            Logout
          </button>
        </form>
      </nav>
      <aside style={{ display: 'flex', gap: 24, padding: 24 }}>
        <ul style={{ listStyle: 'none', padding: 0, minWidth: 160 }}>
          
          <li><a href="/dashboard/instructor">🏠 Dashboard</a></li>
          <li><a href="/dashboard/courses?filter=my">📚 My Courses</a></li>
          <li><a href="/dashboard/instructor/lessons">📖 Lessons</a></li>
          <li><a href="/dashboard/instructor/settings">⚙️ Org Settings</a></li>
        </ul>
        <main style={{ flex: 1 }}>{children}</main>
      </aside>
    </div>
  );
}

import { requireRole } from '@/lib/server-auth';
import { logoutAction } from '@/actions/auth.actions';

// Protects all /dashboard/admin/* routes
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('org_admin'); // redirects if not org_admin

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <nav style={{ background: '#111', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <span>StrapLearn — <strong>Org Admin</strong> | {user.email}</span>
        <form action={logoutAction}>
          <button type="submit" style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 12px', cursor: 'pointer' }}>
            Logout
          </button>
        </form>
      </nav>
      <aside style={{ display: 'flex', gap: 24, padding: 24 }}>
        <ul style={{ listStyle: 'none', padding: 0, minWidth: 160 }}>
          <li><a href="/dashboard/admin">Overview</a></li>
          <li><a href="/dashboard/admin/users">Users</a></li>
          <li><a href="/dashboard/admin/courses">Courses</a></li>
        </ul>
        <main style={{ flex: 1 }}>{children}</main>
      </aside>
    </div>
  );
}

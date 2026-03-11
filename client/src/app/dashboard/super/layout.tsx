import { getCurrentUser, getDashboardPath } from '@/lib/server-auth';
import { redirect } from 'next/navigation';

export default async function SuperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role_type !== 'super_admin') {
     // If not super_admin, redirect to their respective dashboard
     if (user) redirect(getDashboardPath(user.role_type));
     else redirect('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fcfcfc' }}>
      <nav style={{ 
        height: 64, 
        borderBottom: '1px solid #eee', 
        background: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>S</div>
          <span style={{ fontWeight: 'bold', letterSpacing: '-0.5px' }}>StrapLearn <span style={{ color: '#ef4444' }}>Super</span></span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666' }}>{user.email}</span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee' }}></div>
        </div>
      </nav>
      <aside style={{ display: 'flex', gap: 24, padding: 24 }}>
        <ul style={{ listStyle: 'none', padding: 0, minWidth: 160 }}>
          <li><a href="/dashboard/super" style={sidebarLinkStyle}>Dashboard</a></li>
          <li><a href="/dashboard/super/organizations" style={sidebarLinkStyle}>Organizations</a></li>
          <li><a href="/dashboard/super/users" style={sidebarLinkStyle}>Global Users</a></li>
          <li><a href="/dashboard/super/settings" style={sidebarLinkStyle}>System Settings</a></li>
        </ul>
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </aside>
    </div>
  );
}

const sidebarLinkStyle = {
  display: 'block',
  padding: '10px 16px',
  color: '#444',
  textDecoration: 'none',
  fontSize: 14,
  borderRadius: 8,
  marginBottom: 4,
  transition: 'all 0.2s',
  fontWeight: 500
};

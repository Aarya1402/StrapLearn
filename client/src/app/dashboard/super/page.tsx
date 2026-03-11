import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getSystemOverview } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import { Layers, Users, BookOpen, Activity, Zap, ShieldAlert, Database, Globe } from 'lucide-react';

export default async function SuperDashboardPage() {
  const user = await requireRole('super_admin');
  const jwt = (await getCurrentJwt())!;

  const stats = await getSystemOverview(jwt);

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>System Overview</h1>
        <p style={{ color: '#666' }}>Global metrics across all tenants and organizations.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: 24, 
        marginBottom: 40 
      }}>
        <StatCard 
          label="Total Organizations" 
          value={stats?.orgCount || 0} 
          icon={<Layers size={20} />} 
          color="#111"
        />
        <StatCard 
          label="Global Students" 
          value={stats?.studentCount || 0} 
          icon={<Users size={20} />} 
          color="#3b82f6"
        />
        <StatCard 
          label="Total Courses" 
          value={stats?.courseCount || 0} 
          icon={<BookOpen size={20} />} 
          color="#8b5cf6"
        />
        <StatCard 
          label="Global Enrollments" 
          value={stats?.enrollmentCount || 0} 
          icon={<Activity size={20} />} 
          color="#10b981"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Zap size={20} color="#f59e0b" />
            <h2 style={{ fontSize: 18, fontWeight: 'bold' }}>System Health</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={healthRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Activity size={16} color="#666" />
                <span style={{ fontSize: 14 }}>Instance Status</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                Healthy
              </span>
            </div>
            
            <div style={healthRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={16} color="#666" />
                <span style={{ fontSize: 14 }}>Global Uptime</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>99.98%</span>
            </div>

            <div style={healthRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={16} color="#666" />
                <span style={{ fontSize: 14 }}>Database Load</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>12%</span>
            </div>

            <div style={healthRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={16} color="#666" />
                <span style={{ fontSize: 14 }}>Active Security Policies</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>24 Active</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #eee' }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Global Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            <a href="/dashboard/super/organizations/new" style={{ textDecoration: 'none' }}>
              <button style={superButtonStyle}>Create New Organization</button>
            </a>
            <button style={superButtonStyle}>Generate Global Usage Report</button>
            <button style={superButtonStyle}>Manage System Integrations</button>
            <button style={{ ...superButtonStyle, color: '#ef4444' }}>Emergency System Maintenance</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const healthRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #f4f4f5'
};

const superButtonStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  padding: '12px 16px',
  background: '#f9fafb',
  border: '1px solid #eee',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s'
};

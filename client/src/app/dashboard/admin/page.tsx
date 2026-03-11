import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrgOverview } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import EnrollmentChart from '@/components/EnrollmentChart';
import { Users, BookOpen, CheckCircle, TrendingUp, ShieldCheck, Mail } from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;

  const orgSlug = user.organization?.slug || '';
  const overview = await getOrgOverview(jwt, orgSlug);

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: '#666' }}>
          Organization: <strong style={{ color: '#111' }}>{user.organization?.name}</strong>
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 24, 
        marginBottom: 32 
      }}>
        <StatCard 
          label="Total Students" 
          value={overview?.totalStudents || 0} 
          icon={<Users size={20} />} 
          color="#3b82f6"
        />
        <StatCard 
          label="Total Courses" 
          value={overview?.totalCourses || 0} 
          icon={<BookOpen size={20} />} 
          color="#8b5cf6"
        />
        <StatCard 
          label="Avg. Completion Rate" 
          value={`${overview?.avgCompletionRate || 0}%`} 
          icon={<TrendingUp size={20} />} 
          color="#10b981"
        />
        <StatCard 
          label="Total Enrollments" 
          value={overview?.enrollmentCount || 0} 
          icon={<CheckCircle size={20} />} 
          color="#f59e0b"
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <EnrollmentChart data={overview?.activity} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #eee' }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <a href="/dashboard/admin/users" style={actionButtonStyle}>
              <Users size={18} />
              Manage Users
            </a>
            <a href="/dashboard/courses" style={actionButtonStyle}>
              <BookOpen size={18} />
              Manage Courses
            </a>
            <a href="/settings" style={actionButtonStyle}>
              <ShieldCheck size={18} />
              Org Settings
            </a>
            <a href="mailto:support@straplearn.com" style={actionButtonStyle}>
              <Mail size={18} />
              Support
            </a>
          </div>
        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #eee' }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Organization Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={infoRowStyle}>
              <span style={{ color: '#666' }}>Organization Slug:</span>
              <code style={{ background: '#f4f4f5', padding: '2px 6px', borderRadius: 4 }}>{user.organization?.slug}</code>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: '#666' }}>Active Users:</span>
              <span style={{ fontWeight: 600 }}>{overview?.totalStudents || 0}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: '#666' }}>Courses Catalog:</span>
              <span style={{ fontWeight: 600 }}>{overview?.totalCourses || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const actionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px',
  background: '#f9fafb',
  border: '1px solid #eee',
  borderRadius: 12,
  color: '#111',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 14,
  transition: 'all 0.2s ease',
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 14,
  paddingBottom: 12,
  borderBottom: '1px solid #f4f4f5',
};

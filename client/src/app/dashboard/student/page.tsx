import { getMyEnrollments } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';

export default async function StudentDashboardPage() {
  const user = await requireAuth();
  const jwt = await getCurrentJwt();
  const enrollments = jwt ? await getMyEnrollments(jwt) : [];
  
  const completedCount = enrollments.filter((e: any) => e.isCompleted).length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Student Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Welcome back, <strong>{user.username}</strong></p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ padding: 20, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
          <div style={{ fontSize: 13, color: '#666' }}>Active Courses</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{inProgressCount}</div>
        </div>
        <div style={{ padding: 20, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
          <div style={{ fontSize: 13, color: '#666' }}>Completed</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{completedCount}</div>
        </div>
        <div style={{ padding: 20, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
          <div style={{ fontSize: 13, color: '#666' }}>Organization</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>{user.organization?.name ?? 'Personal'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <a 
          href="/dashboard/student/courses" 
          style={{ padding: '12px 24px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 'bold' }}
        >
          View My Courses
        </a>
        <a 
          href="/courses" 
          style={{ padding: '12px 24px', border: '1px solid #000', color: '#000', textDecoration: 'none', borderRadius: 8, fontWeight: 'bold' }}
        >
          Browse More
        </a>
      </div>
    </div>
  );
}

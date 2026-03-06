import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllCoursesForDashboard } from '@/lib/course';

export default async function AdminDashboardPage() {
  const user = await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;

  const courses = await getAllCoursesForDashboard(jwt, user.organization?.slug);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, <strong>{user.username}</strong></p>
      <p>Organization: <strong>{user.organization?.name ?? 'Not assigned'}</strong></p>
      <hr />
      <section>
        <h2>Overview</h2>
        <ul>
          <li>Total Users: <em>(available in Module 10)</em></li>
          <li>Total Courses: <strong>{courses.length}</strong></li>
          <li>Completion Rate: <em>(available in Module 8)</em></li>
        </ul>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/dashboard/admin/users">Manage Users</a></li>
          <li><a href="/dashboard/courses">Manage Courses</a></li>
          <li>
            <a href="/dashboard/courses" style={{ display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              See All Courses
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

import { requireRole } from '@/lib/server-auth';

export default async function AdminDashboardPage() {
  const user = await requireRole('org_admin');

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
          <li>Total Courses: <em>(available in Module 5)</em></li>
          <li>Completion Rate: <em>(available in Module 8)</em></li>
        </ul>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/dashboard/admin/users">Manage Users</a></li>
          <li><a href="/dashboard/admin/courses">Manage Courses</a></li>
        </ul>
      </section>
    </div>
  );
}

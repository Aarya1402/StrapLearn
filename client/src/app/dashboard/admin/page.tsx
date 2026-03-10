import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllCoursesForDashboard, getOrgEnrollmentStats } from '@/lib/course';

export default async function AdminDashboardPage() {
  const user = await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;

  const [courses, stats] = await Promise.all([
    getAllCoursesForDashboard(jwt, user.organization?.slug),
    getOrgEnrollmentStats(jwt),
  ]);

  const completionRate = stats?.completionRate ?? null;
  const totalEnrollments = stats?.totalEnrollments ?? 0;
  const completedEnrollments = stats?.completedEnrollments ?? 0;

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
          <li>
            Total Enrollments: <strong>{totalEnrollments}</strong>
            {completedEnrollments > 0 && (
              <> &mdash; Completed: <strong>{completedEnrollments}</strong></>
            )}
          </li>
          <li>
            Completion Rate:{' '}
            {completionRate !== null ? (
              <strong
                style={{
                  color:
                    completionRate >= 75
                      ? '#10b981'
                      : completionRate >= 40
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              >
                {completionRate}%
              </strong>
            ) : (
              <em>No enrollments yet</em>
            )}
          </li>
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

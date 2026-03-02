import { requireAuth } from '@/lib/server-auth';

export default async function StudentDashboardPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1>Student Dashboard</h1>
      <p>Welcome, <strong>{user.username}</strong></p>
      <p>Organization: <strong>{user.organization?.name ?? 'Not assigned'}</strong></p>
      <hr />
      <section>
        <h2>My Enrolled Courses</h2>
        <p><em>Enrolled courses will appear here after Module 7.</em></p>
        <a href="/courses">Browse all courses →</a>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>My Progress</h2>
        <p><em>Course completion progress will appear here after Module 8.</em></p>
      </section>
    </div>
  );
}

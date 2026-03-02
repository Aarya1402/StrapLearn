import { requireRole } from '@/lib/server-auth';

export default async function InstructorDashboardPage() {
  const user = await requireRole('org_admin', 'instructor');

  return (
    <div>
      <h1>Instructor Dashboard</h1>
      <p>Welcome, <strong>{user.username}</strong></p>
      <p>Role: <strong>{user.role_type}</strong></p>
      <hr />
      <section>
        <h2>My Courses</h2>
        <p><em>Course list will appear here after Module 5.</em></p>
        <a href="/dashboard/instructor/courses/new">+ Create New Course</a>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Pending Reviews</h2>
        <p><em>Draft courses awaiting publish will appear here.</em></p>
      </section>
    </div>
  );
}

import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllCoursesForDashboard, getMyCourses } from '@/lib/course';

export default async function InstructorDashboardPage() {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;

  // Instructors only see their own courses via the dedicated /courses/my endpoint
  // (Strapi v5 blocks filtering/populating plugin::users-permissions.user through the REST API).
  // Org admins see all courses belonging to their organization.
  const courses = user.role_type === 'instructor'
    ? await getMyCourses(jwt)
    : await getAllCoursesForDashboard(jwt, user.organization?.slug);
  const drafts = courses.filter((c) => !c.publishedAt);
  const published = courses.filter((c) => c.publishedAt);

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <h1>Instructor Dashboard</h1>
      <p>Welcome, <strong>{user.username}</strong> &bull; <code>{user.role_type}</code></p>
      {user.organization && <p>🏢 {user.organization.name}</p>}
      <hr />

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '16px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>{drafts.length}</p>
          <p style={{ color: '#666', margin: '4px 0 0' }}>Drafts</p>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '16px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>{published.length}</p>
          <p style={{ color: '#666', margin: '4px 0 0' }}>Published</p>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '16px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>{courses.length}</p>
          <p style={{ color: '#666', margin: '4px 0 0' }}>Total</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <a href="/dashboard/courses?filter=my"
          style={{ padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none' }}>
          📚 My Courses
        </a>
        <a href="/dashboard/courses"
          style={{ padding: '10px 20px', border: '1px solid #000', textDecoration: 'none' }}>
          📖 See All Courses
        </a>
        <a href="/dashboard/courses/new"
          style={{ padding: '10px 20px', border: '1px solid #000', textDecoration: 'none' }}>
          + Create New Course
        </a>
      </div>

      {drafts.length > 0 && (
        <section>
          <h2>📝 Drafts awaiting publish</h2>
          <ul>
            {drafts.map((c) => (
              <li key={c.documentId}>
                <a href={`/dashboard/courses/${c.documentId}`}>{c.title}</a>
                {' '}<span style={{ fontSize: 12, color: '#888' }}>{c.level}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {published.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2>✅ Published Courses</h2>
          <ul>
            {published.map((c) => (
              <li key={c.documentId}>
                <a href={`/courses/${c.slug}`}>{c.title}</a>
                {' '}<a href={`/dashboard/courses/${c.documentId}`} style={{ fontSize: 12 }}>(edit)</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

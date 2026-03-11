import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllCoursesForDashboard, getMyCourses } from '@/lib/course';
import { publishCourseAction, unpublishCourseAction, deleteCourseAction } from '@/actions/course.actions';
import type { Course } from '@/lib/types/course';

export default async function DashboardCoursesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ filter?: string }> 
}) {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;
  const filter = (await searchParams).filter;

  // filter=my → call the dedicated /courses/my endpoint (Strapi v5 blocks filtering
  // on plugin::users-permissions.user relations through the standard REST API).
  // No filter → fetch all courses in the org.
  const courses: Course[] = filter === 'my'
    ? await getMyCourses(jwt)
    : await getAllCoursesForDashboard(jwt, user.organization?.slug);

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{filter === 'my' ? 'My Courses' : 'All Courses'}</h1>
        <a href="/dashboard/courses/new" style={{ padding: '8px 16px', background: '#000', color: '#fff', textDecoration: 'none' }}>
          + New Course
        </a>
      </div>

      {courses.length === 0 && (
        <p>No courses yet. <a href="/dashboard/courses/new">Create your first course</a>.</p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Title</th>
            <th style={{ padding: 8 }}>Level</th>
            <th style={{ padding: 8 }}>Price</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.documentId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>
                <strong>{course.title}</strong>
                <br />
                <code style={{ fontSize: 11, color: '#888' }}>{course.slug}</code>
              </td>
              <td style={{ padding: 8 }}>{course.level}</td>
              <td style={{ padding: 8 }}>{course.isFree ? '🆓 Free' : `₹${course.price ?? 0}`}</td>
              <td style={{ padding: 8 }}>
                {course.publishedAt ? '✅ Published' : '📝 Draft'}
              </td>
              <td style={{ padding: 8, display: 'flex', gap: 8 }}>
                <a href={`/dashboard/courses/${course.documentId}`} style={{ color: '#3b82f6' }}>Edit</a>
                <a href={`/courses/${course.slug}`} target="_blank" style={{ color: '#10b981', textDecoration: 'none' }}>Preview</a>
                {/* Publish / Unpublish */}
                {user.role_type === 'org_admin' && (
                  course.publishedAt ? (
                    <form action={unpublishCourseAction.bind(null, course.documentId)} style={{ display: 'inline' }}>
                      <button type="submit" style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: 0 }}>
                        Unpublish
                      </button>
                    </form>
                  ) : (
                    <form action={publishCourseAction.bind(null, course.documentId)} style={{ display: 'inline' }}>
                      <button type="submit" style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 0 }}>
                        Publish
                      </button>
                    </form>
                  )
                )}
                <form action={deleteCourseAction.bind(null, course.documentId)} style={{ display: 'inline' }}>
                  <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

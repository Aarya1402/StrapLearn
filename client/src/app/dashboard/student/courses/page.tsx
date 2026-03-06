import { getMyEnrollments } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';

export default async function MyCoursesPage() {
  const user = await requireAuth();
  const jwt = await getCurrentJwt();
  const enrollments = jwt ? await getMyEnrollments(jwt) : [];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>My Courses</h1>
      
      {enrollments.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#f9fafb', borderRadius: 8 }}>
          <p style={{ color: '#666' }}>You are not enrolled in any courses yet.</p>
          <a
            href="/courses"
            style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: 4 }}
          >
            Browse Courses
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {enrollments.map((enrollment: any) => {
            const course = enrollment.course;
            if (!course) return null;
            
            const isCompleted = enrollment.isCompleted;

            return (
              <div
                key={enrollment.documentId}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                {/* Thumbnail */}
                <div style={{ height: 160, background: '#f3f4f6', position: 'relative' }}>
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url.startsWith('http') ? course.thumbnail.url : `http://localhost:1337${course.thumbnail.url}`}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                      No image
                    </div>
                  )}
                  {isCompleted && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold' }}>
                      COMPLETED
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{course.title}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px', minHeight: 40 }}>
                    {course.description ? course.description.substring(0, 100) + '...' : 'No description.'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#999' }}>
                      Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                    <a
                      href={`/courses/${course.slug}`}
                      style={{
                        padding: '6px 12px',
                        background: isCompleted ? '#f3f4f6' : '#000',
                        color: isCompleted ? '#000' : '#fff',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    >
                      {isCompleted ? 'Review' : 'Continue'}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { getMyEnrollments, getCourseProgress } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import CourseProgressBar from '@/components/CourseProgressBar';

export default async function ProgressPage() {
  const user = await requireAuth();
  const jwt = await getCurrentJwt();
  
  if (!jwt) return null;

  const enrollments = await getMyEnrollments(jwt);

  // Fetch progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment: any) => {
      if (!enrollment.course) return { ...enrollment, progress: { percentage: 0 } };
      const progress = await getCourseProgress(enrollment.course.documentId, jwt);
      return { ...enrollment, progress };
    })
  );

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <h1 style={{ marginBottom: 24 }}>Learning Progress</h1>
      
      {enrollmentsWithProgress.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#f9fafb', borderRadius: 8 }}>
          <p style={{ color: '#666' }}>No active enrollments found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {enrollmentsWithProgress.map((item: any) => {
            const course = item.course;
            if (!course) return null;
            const progress = item.progress;

            return (
              <div
                key={item.documentId}
                style={{
                  padding: 20,
                  border: '1px solid #eee',
                  borderRadius: 12,
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20 }}>{course.title}</h2>
                    <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                      Enrolled on {new Date(item.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a 
                    href={`/courses/${course.slug}`}
                    style={{ 
                      padding: '6px 16px', 
                      background: '#000', 
                      color: '#fff', 
                      textDecoration: 'none', 
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 'bold'
                    }}
                  >
                    Continue
                  </a>
                </div>

                <div style={{ maxWidth: 500 }}>
                  <CourseProgressBar percentage={progress.percentage} />
                </div>

                <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#666' }}>
                  <span>
                    <strong>{progress.completedLessons}</strong> of <strong>{progress.totalLessons}</strong> lessons completed
                  </span>
                  {item.isCompleted && (
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                      🟢 Course Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

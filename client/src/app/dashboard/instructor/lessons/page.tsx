import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getMyCourses } from '@/lib/course';
import { BookOpen, Edit, ExternalLink } from 'lucide-react';

export default async function InstructorLessonsPage() {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;

  const courses = await getMyCourses(jwt);
  
  // Flatten lessons from all courses
  const allLessons = courses.flatMap(course => 
    (course.lessons || []).map((lesson: any) => ({
      ...lesson,
      courseTitle: course.title,
      courseDocumentId: course.documentId,
      courseSlug: course.slug
    }))
  ).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Lessons Management</h1>
        <p style={{ color: '#666' }}>
          View and manage all lessons across your courses.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold' }}>All Lessons</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Lesson Title</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Course</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Order</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666' }}>Free Preview</th>
                <th style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#666', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allLessons.length > 0 ? (
                allLessons.map((lesson) => (
                  <tr key={lesson.documentId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#111' }}>{lesson.title}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{lesson.slug}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                        <BookOpen size={14} color="#666" />
                        {lesson.courseTitle}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 14 }}>{lesson.order}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 6, 
                        fontSize: 11, 
                        fontWeight: 600,
                        background: lesson.isFree ? '#f0fdf4' : '#f4f4f5',
                        color: lesson.isFree ? '#166534' : '#71717a'
                      }}>
                        {lesson.isFree ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <a 
                          href={`/courses/${lesson.courseSlug}/lessons/${lesson.slug}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
                        >
                          <ExternalLink size={14} /> View
                        </a>
                        <a 
                          href={`/dashboard/courses/${lesson.courseDocumentId}/lessons/${lesson.documentId}`} 
                          style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}
                        >
                          <Edit size={14} /> EditLesson
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: '#666' }}>
                    No lessons found. Start by creating a course and adding lessons to it.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

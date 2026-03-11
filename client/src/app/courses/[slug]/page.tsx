import { getCourseBySlug, checkEnrollment } from '@/lib/course';
import { getCurrentJwt, getCurrentUser } from '@/lib/server-auth';
import { enrollAction } from '@/actions/enrollment.actions';
import { notFound } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props { params: Promise<{ slug: string }> }

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const jwt = await getCurrentJwt();
  const course = await getCourseBySlug(slug, jwt || undefined);
  if (!course) notFound();

  const user = await getCurrentUser();
  const isEnrolled = jwt ? await checkEnrollment(course.documentId, jwt) : false;
  const isSuper = user?.role_type === 'super_admin';
  const hasAccess = isEnrolled || isSuper;

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <a href="/courses">← All Courses</a>

      {course.thumbnail?.url && (
        <img
          src={`${STRAPI_URL}${course.thumbnail.url}`}
          alt={course.title}
          style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8, margin: '16px 0' }}
        />
      )}

      <span style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>
        {course.level}
      </span>
      <h1 style={{ margin: '12px 0 8px' }}>{course.title}</h1>

      <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#666', marginBottom: 16 }}>
        {course.instructor && <span>👤 {course.instructor.username}</span>}
        {course.organization && <span>🏢 {course.organization.name}</span>}
        {course.category && <span>📁 {course.category.name}</span>}
        {course.duration && <span>⏱ {course.duration} min</span>}
      </div>

      <div style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}
        dangerouslySetInnerHTML={{ __html: course.description }} />

      {/* Lesson list */}
      {course.lessons && course.lessons.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 12px' }}>
            📚 Course Content
            <span style={{ fontSize: 14, fontWeight: 'normal', color: '#666', marginLeft: 8 }}>
              {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
            {course.lessons.map((lesson, idx) => (
              <li
                key={lesson.documentId}
                style={{ borderBottom: idx < course.lessons!.length - 1 ? '1px solid #eee' : 'none' }}
              >
                <a
                  href={`/courses/${slug}/lessons/${lesson.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', color: 'inherit' }}
                >
                  <span style={{ color: '#aaa', fontSize: 13, minWidth: 20 }}>{lesson.order}.</span>
                  <span style={{ flex: 1 }}>{lesson.title}</span>
                  {lesson.duration && (
                    <span style={{ fontSize: 12, color: '#888' }}>
                      {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                    </span>
                  )}
                  {lesson.isFree || hasAccess
                    ? <span style={{ fontSize: 11, color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>VIEW</span>
                    : <span style={{ fontSize: 13, color: '#aaa' }}>🔒</span>
                  }
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Quizzes list */}
      {course.quizzes && course.quizzes.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 12px' }}>
            📝 Assessments
            <span style={{ fontSize: 14, fontWeight: 'normal', color: '#666', marginLeft: 8 }}>
              {course.quizzes.length} quiz{course.quizzes.length !== 1 ? 'zes' : ''}
            </span>
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
            {course.quizzes.map((quiz, idx) => (
               <li
                key={quiz.documentId}
                style={{ borderBottom: idx < course.quizzes!.length - 1 ? '1px solid #eee' : 'none' }}
               >
                <a
                  href={`/courses/${slug}/quizzes/${quiz.documentId}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', color: 'inherit' }}
                >
                  <span style={{ flex: 1 }}>{quiz.title}</span>
                  {hasAccess
                    ? <span style={{ fontSize: 11, color: '#3b82f6', background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>START</span>
                    : <span style={{ fontSize: 13, color: '#aaa' }}>🔒</span>
                  }
                </a>
               </li>
            ))}
          </ul>
        </section>
      )}

      {/* Enroll CTA */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 24, fontWeight: 'bold', margin: '0 0 8px' }}>
          {course.isFree ? '🆓 Free' : `₹${course.price ?? 0}`}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {hasAccess ? (
            <a
              href={`/courses/${slug}/lessons/${course.lessons?.[0]?.slug}`}
              style={{ display: 'inline-block', padding: '12px 32px', background: '#10b981', color: '#fff', textDecoration: 'none', borderRadius: 6 }}
            >
              🚀 Continue Learning
            </a>
          ) : jwt ? (
            <form action={async () => {
              'use server';
              await enrollAction(course.documentId, slug);
            }}>
              <button
                type="submit"
                style={{ display: 'inline-block', padding: '12px 32px', background: '#000', color: '#fff', textDecoration: 'none', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Enroll Now
              </button>
            </form>
          ) : (
            <a
              href="/login"
              style={{ display: 'inline-block', padding: '12px 32px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: 6 }}
            >
              Sign in to Enroll
            </a>
          )}

          {!hasAccess && course.lessons && course.lessons.length > 0 && (
            <a
              href={`/courses/${slug}/lessons/${course.lessons[0].slug}`}
              style={{ display: 'inline-block', padding: '12px 32px', background: '#f3f4f6', color: '#000', textDecoration: 'none', borderRadius: 6 }}
            >
              ▶ Preview FREE Lessons
            </a>
          )}
        </div>
      </div>
    </div>
  );
}



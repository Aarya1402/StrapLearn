import { getPublishedCourses } from '@/lib/course';
import type { Course } from '@/lib/types/course';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default async function CoursesPage() {
  const courses: Course[] = await getPublishedCourses();

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Courses</h1>
      <p style={{ color: '#666' }}>{courses.length} published course{courses.length !== 1 ? 's' : ''}</p>
      <hr />

      {courses.length === 0 && (
        <p>No courses published yet.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 20 }}>
        {courses.map((course) => (
          <a
            key={course.documentId}
            href={`/courses/${course.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', display: 'block' }}
          >
            {course.thumbnail?.url && (
              <img
                src={`${STRAPI_URL}${course.thumbnail.url}`}
                alt={course.title}
                style={{ width: '100%', height: 160, objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: 16 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#888' }}>{course.level}</span>
              <h3 style={{ margin: '4px 0 8px' }}>{course.title}</h3>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 12px' }}>
                {course.description?.replace(/<[^>]+>/g, '').slice(0, 100)}...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>
                  {course.isFree ? '🆓 Free' : `$${course.price ?? 0}`}
                </span>
                <span style={{ fontSize: 12, color: '#666' }}>
                  {course.duration ? `${course.duration} min` : ''}
                </span>
              </div>
              {course.organization && (
                <p style={{ fontSize: 11, color: '#999', margin: '8px 0 0' }}>
                  {course.organization.name}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

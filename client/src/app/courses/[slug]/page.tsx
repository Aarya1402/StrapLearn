import { getCourseBySlug } from '@/lib/course';
import { notFound } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props { params: Promise<{ slug: string }> }

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

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

      {/* Enroll CTA */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 24, fontWeight: 'bold', margin: '0 0 8px' }}>
          {course.isFree ? '🆓 Free' : `$${course.price ?? 0}`}
        </p>
        <a
          href="/register"
          style={{ display: 'inline-block', padding: '12px 32px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: 6 }}
        >
          Enroll Now
        </a>
      </div>
    </div>
  );
}

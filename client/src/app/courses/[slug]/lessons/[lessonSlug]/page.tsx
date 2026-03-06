import { getCourseBySlug } from '@/lib/course';
import { notFound } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

function renderVideoEmbed(videoUrl: string, provider?: string) {
  if (provider === 'youtube' || videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
    if (videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          width="100%" height="400" frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: 8 }}
        />
      );
    }
  }
  if (provider === 'vimeo' || videoUrl.includes('vimeo')) {
    const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          width="100%" height="400" frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: 8 }}
        />
      );
    }
  }
  return <a href={videoUrl} target="_blank" rel="noopener noreferrer">▶ Watch Video</a>;
}

export default async function LessonViewerPage({ params }: Props) {
  const { slug: courseSlug, lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  const lesson = course.lessons?.find((l) => l.slug === lessonSlug);
  if (!lesson) notFound();

  const lessons = course.lessons ?? [];
  const currentIndex = lessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];

  return (
    <div style={{ fontFamily: 'monospace', display: 'flex', gap: 24, maxWidth: 1100, margin: '0 auto', padding: 24 }}>

      {/* Sidebar — lesson list */}
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid #eee', paddingRight: 16 }}>
        <a href={`/courses/${courseSlug}`} style={{ fontSize: 13, color: '#666' }}>← {course.title}</a>
        <h3 style={{ marginTop: 16 }}>Lessons</h3>
        <ol style={{ paddingLeft: 16, margin: 0 }}>
          {lessons.map((l) => (
            <li
              key={l.documentId}
              style={{
                padding: '6px 0',
                fontWeight: l.slug === lessonSlug ? 'bold' : 'normal',
                listStyle: 'decimal',
              }}
            >
              <a href={`/courses/${courseSlug}/lessons/${l.slug}`}
                style={{ color: l.slug === lessonSlug ? '#000' : '#555', textDecoration: 'none' }}>
                {l.title}
                {l.isFree && <span style={{ fontSize: 10, color: '#10b981', marginLeft: 4 }}>FREE</span>}
              </a>
            </li>
          ))}
        </ol>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        <h1>{lesson.title}</h1>
        {lesson.duration && (
          <p style={{ color: '#666', fontSize: 13 }}>⏱ {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s</p>
        )}

        {/* Video player */}
        {lesson.videoUrl && (
          <div style={{ marginBottom: 24 }}>
            {renderVideoEmbed(lesson.videoUrl, lesson.videoProvider)}
          </div>
        )}

        {/* Rich text content */}
        {lesson.content && lesson.content.length > 0 && (
          <div style={{ lineHeight: 1.7 }}>
            {lesson.content.map((block: any, i: number) => {
              if (block.type === 'paragraph') {
                return <p key={i}>{block.children?.map((c: any) => c.text).join('')}</p>;
              }
              if (block.type === 'heading') {
                const Tag = `h${block.level}` as any;
                return <Tag key={i}>{block.children?.map((c: any) => c.text).join('')}</Tag>;
              }
              return null;
            })}
          </div>
        )}

        {/* Prev / Next navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, borderTop: '1px solid #eee', paddingTop: 16 }}>
          {prevLesson
            ? <a href={`/courses/${courseSlug}/lessons/${prevLesson.slug}`}>← {prevLesson.title}</a>
            : <span />}
          {nextLesson
            ? <a href={`/courses/${courseSlug}/lessons/${nextLesson.slug}`}>{nextLesson.title} →</a>
            : <a href={`/courses/${courseSlug}`}>✅ Finish course</a>}
        </div>
      </main>
    </div>
  );
}

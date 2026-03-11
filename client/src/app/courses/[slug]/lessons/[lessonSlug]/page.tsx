import { getCourseBySlug, checkEnrollment, getCourseProgress } from '@/lib/course';
import FinishCourseButton from '@/components/FinishCourseButton';
import MarkCompleteButton from '@/components/MarkCompleteButton';
import CourseProgressBar from '@/components/CourseProgressBar';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import { notFound, redirect } from 'next/navigation';
import type { ElementType } from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

// ─── Video Embed ──────────────────────────────────────────────────────────────

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

// ─── Rich Text Renderer (Strapi Blocks format) ────────────────────────────────

function renderInlineChildren(children: any[]) {
  return children?.map((child: any, i: number) => {
    if (child.type === 'link') {
      return (
        <a key={i} href={child.url} target="_blank" rel="noopener noreferrer">
          {renderInlineChildren(child.children)}
        </a>
      );
    }
    let node: React.ReactNode = child.text ?? '';
    if (child.bold)          node = <strong key={i}>{node}</strong>;
    if (child.italic)        node = <em key={i}>{node}</em>;
    if (child.underline)     node = <u key={i}>{node}</u>;
    if (child.strikethrough) node = <s key={i}>{node}</s>;
    if (child.code)          node = (
      <code key={i} style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace' }}>
        {node}
      </code>
    );
    return <span key={i}>{node}</span>;
  });
}

function renderBlock(block: any, i: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={i} style={{ margin: '0 0 12px', lineHeight: 1.7 }}>
          {renderInlineChildren(block.children)}
        </p>
      );

    case 'heading': {
      const Tag = `h${block.level}` as ElementType;
      return (
        <Tag key={i} style={{ marginTop: 24, marginBottom: 8 }}>
          {renderInlineChildren(block.children)}
        </Tag>
      );
    }

    case 'list': {
      const items = block.children?.map((item: any, j: number) => (
        <li key={j} style={{ marginBottom: 4 }}>{renderInlineChildren(item.children)}</li>
      ));
      return block.format === 'ordered'
        ? <ol key={i} style={{ paddingLeft: 24, margin: '0 0 12px' }}>{items}</ol>
        : <ul key={i} style={{ paddingLeft: 24, margin: '0 0 12px' }}>{items}</ul>;
    }

    case 'quote':
      return (
        <blockquote key={i} style={{ borderLeft: '4px solid #d1d5db', paddingLeft: 16, margin: '16px 0', color: '#6b7280', fontStyle: 'italic' }}>
          {renderInlineChildren(block.children)}
        </blockquote>
      );

    case 'code':
      return (
        <pre key={i} style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto', margin: '16px 0', fontSize: 13 }}>
          <code>{block.children?.map((c: any) => c.text).join('')}</code>
        </pre>
      );

    case 'image': {
      const { url, alternativeText, width, height } = block.image ?? {};
      const src = url?.startsWith('http') ? url : `${STRAPI_URL}${url}`;
      return (
        <figure key={i} style={{ margin: '20px 0', textAlign: 'center' }}>
          <img src={src} alt={alternativeText ?? ''} width={width} height={height}
            style={{ maxWidth: '100%', borderRadius: 6 }} />
          {alternativeText && (
            <figcaption style={{ fontSize: 12, color: '#888', marginTop: 6 }}>{alternativeText}</figcaption>
          )}
        </figure>
      );
    }

    default:
      return (
        <p key={i} style={{ margin: '0 0 12px', lineHeight: 1.7 }}>
          {block.children?.map((c: any) => c.text).join('')}
        </p>
      );
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // Access check
  let canAccess = lesson.isFree;
  const jwt = await getCurrentJwt();
  let progress = { percentage: 0, completedLessonIds: [] as string[] };
  
  if (jwt) {
    // If logged in, fetch progress even if course is free (to track it)
    progress = await getCourseProgress(course.documentId, jwt);

    if (!canAccess) {
      const isEnrolled = await checkEnrollment(course.documentId, jwt);
      if (isEnrolled) canAccess = true;
      
      // Also allow org_admins/instructors to see their own org courses
      if (!canAccess) {
         const user = await requireAuth();
         if (user.role_type==='super_admin' || user.role_type === 'org_admin' || user.role_type === 'instructor') {
            canAccess = true;
         }
      }
    }
  }

  const isCompleted = progress.completedLessonIds.includes(lesson.documentId);

  return (
    <div style={{ fontFamily: 'monospace', display: 'flex', gap: 24, maxWidth: 1100, margin: '0 auto', padding: 24 }}>

      {/* Sidebar — lesson list */}
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid #eee', paddingRight: 16 }}>
        <a href={`/courses/${courseSlug}`} style={{ fontSize: 13, color: '#666' }}>← {course.title}</a>
        
        {jwt && (
            <div style={{ marginTop: 24 }}>
                <CourseProgressBar percentage={progress.percentage} />
            </div>
        )}

        <h3 style={{ marginTop: 16 }}>Lessons</h3>
        <ol style={{ paddingLeft: 16, margin: 0 }}>
          {lessons.map((l: any) => {
            const isLessonCompleted = progress.completedLessonIds.includes(l.documentId);
            return (
              <li
                key={l.documentId}
                style={{
                  padding: '6px 0',
                  fontWeight: l.slug === lessonSlug ? 'bold' : 'normal',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {jwt && (
                        <span style={{ fontSize: 12 }}>
                            {isLessonCompleted ? '✅' : '⚪️'}
                        </span>
                    )}
                    <a
                      href={`/courses/${courseSlug}/lessons/${l.slug}`}
                      style={{ color: l.slug === lessonSlug ? '#000' : '#555', textDecoration: 'none' }}
                    >
                      {l.title}
                      {l.isFree && <span style={{ fontSize: 10, color: '#10b981', marginLeft: 4 }}>FREE</span>}
                    </a>
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        {!canAccess ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: 12 }}>
            <h2 style={{ fontSize: 32, marginBottom: 16 }}>🔒 Enrolled Students Only</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>This lesson is part of a premium course. Please enroll to unlock the content.</p>
            <a
              href={`/courses/${courseSlug}`}
              style={{ display: 'inline-block', padding: '12px 32px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: 6 }}
            >
              Back to Course
            </a>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{lesson.title}</h1>
                    {lesson.duration && (
                      <p style={{ color: '#666', fontSize: 13 }}>
                        ⏱ {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                      </p>
                    )}
                </div>
                {jwt && (
                    <MarkCompleteButton 
                        lessonId={lesson.documentId} 
                        courseId={course.documentId} 
                        courseSlug={courseSlug} 
                        lessonSlug={lessonSlug}
                        isCompleted={isCompleted} 
                    />
                )}
            </div>

            {/* Video player */}
            {lesson.videoUrl && (
              <div style={{ marginBottom: 24 }}>
                {renderVideoEmbed(lesson.videoUrl, lesson.videoProvider)}
              </div>
            )}

            {/* Rich text — all Strapi block types handled */}
            {lesson.content && lesson.content.length > 0 && (
              <div style={{ lineHeight: 1.7 }}>
                {lesson.content.map((block: any, i: number) => renderBlock(block, i))}
              </div>
            )}

            {/* Prev / Next navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, borderTop: '1px solid #eee', paddingTop: 16 }}>
              {prevLesson
                ? <a href={`/courses/${courseSlug}/lessons/${prevLesson.slug}`}>← {prevLesson.title}</a>
                : <span />}
              {nextLesson
                ? <a href={`/courses/${courseSlug}/lessons/${nextLesson.slug}`}>{nextLesson.title} →</a>
                : <FinishCourseButton courseId={course.documentId} courseSlug={courseSlug} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

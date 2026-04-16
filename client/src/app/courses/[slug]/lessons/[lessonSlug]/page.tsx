import { getCourseBySlug, checkEnrollment, getCourseProgress } from '@/lib/course';
import FinishCourseButton from '@/components/FinishCourseButton';
import MarkCompleteButton from '@/components/MarkCompleteButton';
import CourseProgressBar from '@/components/CourseProgressBar';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import { notFound, redirect } from 'next/navigation';
import type { ElementType } from 'react';
import { 
  ChevronLeft, 
  PlayCircle, 
  CheckCircle2, 
  Circle, 
  Lock, 
  ArrowLeft, 
  ArrowRight,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

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
        <div className="overflow-hidden rounded-3xl bg-black shadow-premium">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="aspect-video w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }
  if (provider === 'vimeo' || videoUrl.includes('vimeo')) {
    const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      return (
        <div className="overflow-hidden rounded-3xl bg-black shadow-premium">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="aspect-video w-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }
  return (
    <a 
      href={videoUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-2xl bg-secondary p-4 font-bold text-foreground transition-all hover:bg-brand-50"
    >
      <ExternalLink size={20} />
      Watch on {provider || 'Video Platform'}
    </a>
  );
}

// ─── Rich Text Renderer (Strapi Blocks format) ────────────────────────────────

function renderInlineChildren(children: any[]) {
  return children?.map((child: any, i: number) => {
    if (child.type === 'link') {
      return (
        <a key={i} href={child.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline font-bold transition-colors hover:text-brand-700">
          {renderInlineChildren(child.children)}
          <ExternalLink size={12} className="inline ml-1 opacity-50" />
        </a>
      );
    }
    let node: React.ReactNode = child.text ?? '';
    if (child.bold)          node = <strong key={i} className="font-extrabold text-foreground">{node}</strong>;
    if (child.italic)        node = <em key={i} className="italic text-muted-foreground">{node}</em>;
    if (child.underline)     node = <u key={i} className="underline decoration-brand-300 underline-offset-4">{node}</u>;
    if (child.strikethrough) node = <s key={i} className="line-through decoration-red-400 opacity-60">{node}</s>;
    if (child.code)          node = (
      <code key={i} className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-sm text-brand-700">
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
        <p key={i} className="mb-6 text-lg leading-relaxed text-muted-foreground last:mb-0">
          {renderInlineChildren(block.children)}
        </p>
      );

    case 'heading': {
      const Tag = `h${block.level}` as ElementType;
      const classNames = {
        1: 'text-4xl font-black tracking-tight text-foreground mb-8 mt-12',
        2: 'text-3xl font-bold tracking-tight text-foreground mb-6 mt-10',
        3: 'text-2xl font-bold text-foreground mb-4 mt-8',
        4: 'text-xl font-bold text-foreground mb-4 mt-6',
        5: 'text-lg font-bold text-foreground mb-3 mt-4',
        6: 'text-base font-bold text-foreground mb-2 mt-4',
      }[block.level as 1|2|3|4|5|6];
      return (
        <Tag key={i} className={classNames}>
          {renderInlineChildren(block.children)}
        </Tag>
      );
    }

    case 'list': {
      const items = block.children?.map((item: any, j: number) => (
        <li key={j} className="mb-3 pl-2">
          {renderInlineChildren(item.children)}
        </li>
      ));
      return block.format === 'ordered'
        ? <ol key={i} className="mb-8 list-decimal space-y-2 pl-6 text-lg text-muted-foreground">{items}</ol>
        : <ul key={i} className="mb-8 list-disc space-y-2 pl-6 text-lg text-muted-foreground">{items}</ul>;
    }

    case 'quote':
      return (
        <blockquote key={i} className="relative mb-8 overflow-hidden rounded-3xl border-l-8 border-brand-500 bg-brand-50/50 px-8 py-6 italic text-brand-900 shadow-sm dark:bg-brand-900/10 dark:text-brand-100">
          <div className="absolute top-2 left-4 text-6xl text-brand-500/10 font-serif leading-none">"</div>
          <div className="relative text-xl font-medium leading-relaxed">
            {renderInlineChildren(block.children)}
          </div>
        </blockquote>
      );

    case 'code':
      return (
        <div key={i} className="mb-8 mt-6 overflow-hidden rounded-3xl bg-slate-900 shadow-premium">
          <div className="flex items-center gap-2 bg-slate-800/50 px-5 py-3 border-b border-slate-700/50">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">Code Terminal</span>
          </div>
          <pre className="overflow-x-auto p-6 text-sm font-mono text-slate-100 leading-relaxed">
            <code>{block.children?.map((c: any) => c.text).join('')}</code>
          </pre>
        </div>
      );

    case 'image': {
      const { url, alternativeText, width, height } = block.image ?? {};
      const src = url?.startsWith('http') ? url : `${STRAPI_URL}${url}`;
      return (
        <figure key={i} className="my-10 space-y-4">
          <img 
            src={src} 
            alt={alternativeText ?? ''} 
            width={width} 
            height={height}
            className="mx-auto rounded-3xl shadow-premium transition-transform hover:scale-[1.02]" 
          />
          {alternativeText && (
            <figcaption className="text-center text-sm font-medium text-muted-foreground italic">
              — {alternativeText}
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      return (
        <p key={i} className="mb-6 text-lg leading-relaxed text-muted-foreground">
          {block.children?.map((c: any) => c.text).join('')}
        </p>
      );
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LessonViewerPage({ params }: Props) {
  const { slug: courseSlug, lessonSlug } = await params;
  const jwt = await getCurrentJwt();
  const course = await getCourseBySlug(courseSlug, jwt || undefined);
  if (!course) notFound();

  const lesson = course.lessons?.find((l) => l.slug === lessonSlug);
  if (!lesson) notFound();

  const lessons = course.lessons ?? [];
  const currentIndex = lessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];

  // Access check
  let canAccess = lesson.isFree;
  
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
    <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">

      {/* Sidebar — lesson list */}
      <aside className="sticky top-0 z-40 h-screen w-full flex-shrink-0 border-r border-border bg-card lg:w-80 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="border-b border-border bg-muted/30 p-8">
            <a 
              href={`/courses/${courseSlug}`} 
              className="group flex items-center gap-2 text-sm font-black text-muted-foreground transition-all hover:text-brand-600"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              {course.title}
            </a>
            
            {jwt && (
                <div className="mt-8 space-y-2">
                    <CourseProgressBar percentage={progress.percentage} />
                </div>
            )}
          </div>

          <div className="flex-1 p-8">
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Course Modules</h3>
            <div className="space-y-2">
              {lessons.map((l: any, idx: number) => {
                const isActive = l.slug === lessonSlug;
                const isLessonCompleted = progress.completedLessonIds.includes(l.documentId);
                return (
                  <a
                    key={l.documentId}
                    href={`/courses/${courseSlug}/lessons/${l.slug}`}
                    className={`
                      group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all
                      ${isActive 
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                        : 'text-foreground hover:bg-secondary'
                      }
                    `}
                  >
                    <div className={`
                      flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black
                      ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground group-hover:bg-brand-50 group-hover:text-brand-600'}
                    `}>
                      {isLessonCompleted ? <CheckCircle2 size={14} /> : String(idx + 1).padStart(2, '0')}
                    </div>
                    <span className="flex-1 truncate">{l.title}</span>
                    {l.isFree && !isActive && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black text-emerald-700">FREE</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="mt-auto border-t border-border p-8 bg-muted/20">
             <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary">
               <MessageSquare size={16} /> Community Help
             </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {!canAccess ? (
          <div className="flex h-full flex-col items-center justify-center p-12 text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-amber-50 text-amber-500 shadow-premium ring-1 ring-amber-500/20">
              <Lock size={48} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-foreground">Enrolled Students Only</h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground leading-relaxed">
              This module contains premium educational content. Enroll in the full course to unlock this lesson and many others.
            </p>
            <a
              href={`/courses/${courseSlug}`}
              className="mt-10 inline-flex items-center justify-center rounded-2xl bg-brand-500 px-12 py-4 text-lg font-bold text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1 active:scale-95"
            >
              Get Enrollment Access
            </a>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl px-8 py-16 lg:px-12">
            <header className="mb-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-600">
                          <PlayCircle size={14} /> Module {currentIndex + 1}
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">{lesson.title}</h1>
                        {lesson.duration && (
                          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <Clock size={16} className="text-blue-500" />
                            {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                          </div>
                        )}
                    </div>
                    {jwt && (
                        <div className="shrink-0">
                          <MarkCompleteButton 
                              lessonId={lesson.documentId} 
                              courseId={course.documentId} 
                              courseSlug={courseSlug} 
                              lessonSlug={lessonSlug}
                              isCompleted={isCompleted} 
                          />
                        </div>
                    )}
                </div>
            </header>

            {/* Video player */}
            {lesson.videoUrl && (
              <div className="mb-16">
                {renderVideoEmbed(lesson.videoUrl, lesson.videoProvider)}
              </div>
            )}

            {/* Content area */}
            <div className="article-content">
              {lesson.content && lesson.content.length > 0 ? (
                <div className="space-y-4">
                  {lesson.content.map((block: any, i: number) => renderBlock(block, i))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border py-16 text-center">
                  <BookOpen size={48} className="mb-4 text-muted-foreground/20" />
                  <p className="font-bold text-muted-foreground">This lesson contains video content only.</p>
                </div>
              )}
            </div>

            {/* Improved Prev / Next navigation */}
            <nav className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-border pt-12 sm:flex-row">
              {prevLesson ? (
                <a 
                  href={`/courses/${courseSlug}/lessons/${prevLesson.slug}`}
                  className="group flex flex-col items-start gap-2"
                >
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <ArrowLeft size={10} /> Previous
                  </span>
                  <span className="text-lg font-bold text-foreground transition-colors group-hover:text-brand-600">
                    {prevLesson.title}
                  </span>
                </a>
              ) : <div />}

              {nextLesson ? (
                <a 
                  href={`/courses/${courseSlug}/lessons/${nextLesson.slug}`}
                  className="group flex flex-col items-end gap-2 text-right"
                >
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Next <ArrowRight size={10} />
                  </span>
                  <span className="text-lg font-bold text-foreground transition-colors group-hover:text-brand-600 text-right">
                    {nextLesson.title}
                  </span>
                </a>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">Final Step</span>
                  <FinishCourseButton courseId={course.documentId} courseSlug={courseSlug} />
                </div>
              )}
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}


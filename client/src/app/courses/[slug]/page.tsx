import { getCourseBySlug, checkEnrollment } from '@/lib/course';
import { getCurrentJwt, getCurrentUser } from '@/lib/server-auth';
import { enrollAction } from '@/actions/enrollment.actions';
import { notFound } from 'next/navigation';
import { BookOpen, User, Building, Folder, Clock, ChevronLeft, PlayCircle, Lock, Sparkles, Award, CheckCircle2 } from 'lucide-react';

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
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      <a 
        href="/courses" 
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-brand-600"
      >
        <ChevronLeft size={16} /> Back to Catalog
      </a>

      {course.thumbnail?.url && (
        <div className="relative mb-12 aspect-[21/9] w-full overflow-hidden rounded-[2.5rem] shadow-premium">
          <img
            src={`${STRAPI_URL}${course.thumbnail.url}`}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10">
            <span className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/20">
              {course.level}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">{course.title}</h1>
            <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
              {course.instructor && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-brand-600">
                    <User size={16} />
                  </div>
                  {course.instructor.username}
                </div>
              )}
              {course.organization && (
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-brand-500" />
                  {course.organization.name}
                </div>
              )}
              {course.category && (
                <div className="flex items-center gap-2">
                  <Folder size={16} className="text-amber-500" />
                  {course.category.name}
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  {course.duration} min
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: course.description }} />

          {/* Lesson list */}
          {course.lessons && course.lessons.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-border pb-4">
                <h2 className="text-2xl font-black italic tracking-tight">
                  Curriculum
                </h2>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {course.lessons.length} Modules
                </span>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card shadow-premium">
                {course.lessons.map((lesson, idx) => (
                  <a
                    key={lesson.documentId}
                    href={`/courses/${slug}/lessons/${lesson.slug}`}
                    className="group flex flex-col gap-4 p-6 transition-all hover:bg-secondary/50 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4 sm:flex-1">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-black text-muted-foreground group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        {String(lesson.order).padStart(2, '0')}
                      </span>
                      <span className="font-bold text-foreground group-hover:text-brand-600 transition-colors">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      {lesson.duration && (
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tighter">
                          {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                        </span>
                      )}
                      {lesson.isFree || hasAccess ? (
                        <div className="flex h-8 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-900/20">
                           <PlayCircle size={14} /> Play
                        </div>
                      ) : (
                        <Lock size={16} className="text-muted-foreground/30" />
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Quizzes list */}
          {course.quizzes && course.quizzes.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-border pb-4">
                <h2 className="text-2xl font-black italic tracking-tight">
                  Assessments
                </h2>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {course.quizzes.length} Knowledge Checks
                </span>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card shadow-premium">
                {course.quizzes.map((quiz, idx) => (
                   <a
                    key={quiz.documentId}
                    href={`/courses/${slug}/quizzes/${quiz.documentId}`}
                    className="group flex items-center justify-between p-6 transition-all hover:bg-secondary/50"
                   >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform group-hover:rotate-12">
                        <Award size={18} />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-indigo-600 transition-colors">{quiz.title}</span>
                    </div>
                    {hasAccess ? (
                      <div className="flex h-8 items-center gap-2 rounded-lg bg-indigo-50 px-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:bg-indigo-900/20">
                         <Sparkles size={14} /> Start
                      </div>
                    ) : (
                      <Lock size={16} className="text-muted-foreground/30" />
                    )}
                   </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Enroll Sidebar CTA */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="sticky top-12 rounded-[2.5rem] border border-border bg-card p-8 shadow-premium ring-1 ring-brand-500/10">
            <div className="mb-6 text-center">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Investment</span>
              <p className="mt-2 text-5xl font-black tracking-tighter text-foreground">
                {course.isFree ? 'FREE' : `₹${course.price ?? 0}`}
              </p>
            </div>

            <div className="space-y-4">
              {hasAccess ? (
                <a
                  href={`/courses/${slug}/lessons/${course.lessons?.[0]?.slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4 text-base font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
                >
                  <PlayCircle size={20} /> Continue Learning
                </a>
              ) : jwt ? (
                <form action={async () => {
                  'use server';
                  await enrollAction(course.documentId, slug);
                }}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-bold text-background transition-all hover:bg-foreground/90 hover:shadow-lg active:scale-95"
                  >
                    Enroll Now
                  </button>
                </form>
              ) : (
                <a
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-bold text-background transition-all hover:bg-foreground/90 active:scale-95"
                >
                  Sign in to Enroll
                </a>
              )}

              {!hasAccess && course.lessons && course.lessons.length > 0 && (
                <a
                  href={`/courses/${slug}/lessons/${course.lessons[0].slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary py-4 text-base font-bold text-foreground transition-all hover:bg-secondary/80 active:scale-95"
                >
                  Preview FREE Lessons
                </a>
              )}
            </div>

            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <CheckCircle2 size={16} className="text-brand-500" /> Lifetime access
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <CheckCircle2 size={16} className="text-brand-500" /> Certificate of completion
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <CheckCircle2 size={16} className="text-brand-500" /> Flexible learning schedule
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




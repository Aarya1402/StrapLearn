import { getPublishedCourses } from '@/lib/course';
import type { Course } from '@/lib/types/course';
import { BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default async function CoursesPage() {
  const courses: Course[] = await getPublishedCourses();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-10">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Global Learning <span className="text-brand-600">Catalog</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Unlock your potential with over <span className="font-bold text-foreground">{courses.length}</span> industry-standard courses designed by leading experts at our partner organizations.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
            <BookOpen size={48} />
          </div>
          <h2 className="text-2xl font-bold">No courses found</h2>
          <p className="mt-2 text-muted-foreground">We're currently updating our catalog. Check back soon!</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <a
              key={course.documentId}
              href={`/courses/${course.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-premium transition-all duration-300 hover:-translate-y-2 hover:shadow-premium-hover"
            >
              {course.thumbnail?.url ? (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={`${STRAPI_URL}${course.thumbnail.url}`}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-secondary">
                  <BookOpen size={48} className="text-muted-foreground/20" />
                </div>
              )}
              
              <div className="flex flex-1 flex-col p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-900/20">
                    {course.level}
                  </span>
                  {course.duration && (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Clock size={14} />
                      {course.duration}m
                    </span>
                  )}
                </div>

                <h3 className="mb-3 text-2xl font-bold leading-tight decoration-brand-500 underline-offset-4 group-hover:underline">
                  {course.title}
                </h3>
                
                <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {course.description?.replace(/<[^>]+>/g, '') || 'Begin your journey into this subject with our comprehensive curriculum and expert-led sessions.'}
                </p>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Price</span>
                    <span className="text-xl font-black text-foreground">
                      {course.isFree ? 'FREE' : `₹${course.price ?? 0}`}
                    </span>
                  </div>
                  
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background transition-all group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-500/25">
                    <ArrowRight size={20} />
                  </div>
                </div>

                {course.organization && (
                  <div className="mt-6 flex items-center gap-2 border-t border-border/50 pt-4 opacity-70">
                    <div className="h-4 w-4 rounded bg-brand-500" />
                    <span className="text-xs font-bold text-muted-foreground">
                      {course.organization.name}
                    </span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}


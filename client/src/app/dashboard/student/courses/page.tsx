import { getMyEnrollments } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import { BookOpen, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default async function MyCoursesPage() {
  const user = await requireAuth();
  const jwt = await getCurrentJwt();
  const enrollments = jwt ? await getMyEnrollments(jwt) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
        <p className="text-muted-foreground text-lg">Continue your learning journey where you left off.</p>
      </div>
      
      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">You haven't enrolled yet</h3>
          <p className="max-w-xs text-muted-foreground mb-8">
            Explore our catalog and find the perfect course to start learning.
          </p>
          <a
            href="/courses"
            className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg active:scale-95 shadow-brand-500/20"
          >
            Browse Catalog
          </a>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {enrollments.map((enrollment: any) => {
            const course = enrollment.course;
            if (!course) return null;
            
            const isCompleted = enrollment.isCompleted;

            return (
              <div
                key={enrollment.documentId}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-hover"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url.startsWith('http') ? course.thumbnail.url : `http://localhost:1337${course.thumbnail.url}`}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <BookOpen size={48} className="opacity-20" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={12} />
                      Completed
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex-1">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-brand-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {course.description || 'No description available for this course yet.'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar size={14} />
                      Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <a
                      href={`/courses/${course.slug}`}
                      className={`
                        flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]
                        ${isCompleted 
                          ? 'bg-secondary text-foreground hover:bg-secondary/80' 
                          : 'bg-foreground text-background hover:bg-foreground/90'
                        }
                      `}
                    >
                      {isCompleted ? 'Review Course' : 'Continue Learning'}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


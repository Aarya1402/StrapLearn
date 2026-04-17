import { getMyEnrollments } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import { BookOpen, Calendar, CheckCircle2, ArrowRight, Search } from 'lucide-react';

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const user = await requireAuth();
  const jwt = await getCurrentJwt();
  // Robust search param extraction
  const queryRaw = params.q;
  const query = Array.isArray(queryRaw) ? queryRaw[0] : queryRaw;
  
  let enrollments = jwt ? await getMyEnrollments(jwt, query) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
          {query ? (
             <p className="text-muted-foreground text-sm">
               Showing results for <span className="text-brand-600 font-bold">"{query}"</span>
             </p>
          ) : (
             <p className="text-muted-foreground">Continue your learning journey where you left off.</p>
          )}
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-500 pointer-events-none" size={16} />
          <form action="/dashboard/student/courses" method="GET">
            <input 
              name="q"
              type="text" 
              placeholder="Search my enrollments..." 
              defaultValue={query}
              className="h-10 w-72 rounded-2xl border border-border bg-card px-10 text-xs font-bold ring-brand-500/10 transition-all focus:outline-none focus:ring-4 focus:bg-background focus:w-80"
            />
          </form>
        </div>
      </div>
      
      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {query ? 'No matching courses' : "You haven't enrolled yet"}
          </h3>
          <p className="max-w-xs text-muted-foreground mb-8">
            {query ? 'Try using a different search term or browse the full catalog.' : 'Explore our catalog and find the perfect course to start learning.'}
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


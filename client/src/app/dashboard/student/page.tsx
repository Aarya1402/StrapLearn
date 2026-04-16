import { getMyEnrollments, getCourseProgress } from '@/lib/course';
import { getCurrentJwt, requireAuth } from '@/lib/server-auth';
import StatCard from '@/components/StatCard';
import CourseProgressBar from '@/components/CourseProgressBar';
import { BookOpen, CheckCircle, GraduationCap, Building2, ArrowRight } from 'lucide-react';

export default async function StudentDashboardPage() {
  const user = await requireAuth();
  const jwt = await getCurrentJwt();
  
  if (!jwt) return <div>Unauthorized</div>;

  const enrollments = await getMyEnrollments(jwt);
  
  // Fetch progress for each course
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (e: any) => {
      const progress = await getCourseProgress(e.course.documentId, jwt);
      return { ...e, progress };
    })
  );

  const completedCount = enrollments.filter((e: any) => e.isCompleted).length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <section className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-muted-foreground">
            Track your learning journey and pick up where you left off.
          </p>
        </div>
      </section>
      
      {/* Stats Overview */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Active Courses" 
          value={inProgressCount} 
          icon={<BookOpen size={20} />} 
          color="var(--color-brand-500)"
        />
        <StatCard 
          label="Completed" 
          value={completedCount} 
          icon={<CheckCircle size={20} />} 
          color="#10b981"
        />
        <StatCard 
          label="Knowledge Points" 
          value={completedCount * 100} 
          icon={<GraduationCap size={20} />} 
          color="#f59e0b"
        />
        <StatCard 
          label="Organization" 
          value={user.organization?.name ?? 'Personal'} 
          icon={<Building2 size={20} />} 
          color="#8b5cf6"
        />
      </section>

      {/* Main Learning Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Your Learning Progress</h2>
          <a 
            href="/dashboard/student/courses" 
            className="group flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            View All Courses
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {enrollmentsWithProgress.length > 0 ? (
            enrollmentsWithProgress.slice(0, 4).map((enrollment: any) => (
              <div 
                key={enrollment.documentId} 
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-hover"
              >
                <div className="mb-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                      Ongoing
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Last active: Today
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold leading-tight group-hover:text-brand-600 transition-colors">
                    {enrollment.course.title}
                  </h3>
                  <p className="mb-6 line-clamp-2 text-sm text-muted-foreground">
                    Master the fundamentals of {enrollment.course.title.split(' ')[0]} with hands-on exercises.
                  </p>
                  <CourseProgressBar percentage={enrollment.progress.percentage} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">
                    {enrollment.progress.completedLessons} of {enrollment.progress.totalLessons} lessons
                  </span>
                  <a 
                    href={`/courses/${enrollment.course.slug}`} 
                    className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-all hover:bg-foreground/90 active:scale-95"
                  >
                    Continue
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <BookOpen size={32} />
              </div>
              <h3 className="mb-1 text-lg font-semibold">No active enrollments</h3>
              <p className="mb-8 max-w-xs text-sm text-muted-foreground">
                You haven't enrolled in any courses yet. Start your learning journey today.
              </p>
              <a 
                href="/courses" 
                className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg active:scale-95 shadow-brand-500/20"
              >
                Browse Catalog
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


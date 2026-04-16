import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllCoursesForDashboard, getMyCourses } from '@/lib/course';
import { getCourseAnalytics } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import { Users, FileText, CheckCircle2, Plus, ArrowRight, BarChart3, Edit3 } from 'lucide-react';

export default async function InstructorDashboardPage() {
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;

  const courses = user.role_type === 'instructor'
    ? await getMyCourses(jwt)
    : await getAllCoursesForDashboard(jwt, user.organization?.slug);
  
  const drafts = courses.filter((c) => !c.publishedAt);
  const published = courses.filter((c) => (c as any).publishedAt);

  // Fetch analytics for each course to get enrollment counts
  const orgSlug = user.organization?.slug || '';
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const stats = await getCourseAnalytics(course.documentId, jwt, orgSlug);
      return { ...course, stats };
    })
  );

  const totalEnrollments = coursesWithStats.reduce((acc, curr) => acc + (curr.stats?.enrollmentCount || 0), 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Instructor Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-lg">
            Welcome back, <span className="font-semibold text-foreground">{user.username}</span>. You're teaching at <span className="text-brand-600 font-medium">{user.organization?.name}</span>.
          </p>
        </div>
        <a 
          href="/dashboard/courses/new" 
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1 active:scale-[0.98]"
        >
          <Plus size={20} />
          Create New Course
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Students" 
          value={totalEnrollments} 
          icon={<Users size={24} />} 
          color="#3b82f6"
        />
        <StatCard 
          label="Draft Content" 
          value={drafts.length} 
          icon={<FileText size={24} />} 
          color="#f59e0b"
        />
        <StatCard 
          label="Live Courses" 
          value={published.length} 
          icon={<CheckCircle2 size={24} />} 
          color="#10b981"
        />
        <StatCard 
          label="Global Catalog" 
          value={courses.length} 
          icon={<BarChart3 size={24} />} 
          color="#8b5cf6"
        />
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-premium overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-8 py-6">
          <h2 className="text-xl font-bold tracking-tight">Active Curriculum</h2>
          <div className="flex items-center gap-4">
             <a href="/dashboard/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1">
               Full Management
               <ArrowRight size={14} />
             </a>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Details</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Enrollments</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Success Rate</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {coursesWithStats.map((course) => (
                <tr key={course.documentId} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-foreground leading-tight group-hover:text-brand-600 transition-colors">{course.title}</div>
                    <div className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{course.level}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`
                      inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest leading-none
                      ${course.publishedAt ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}
                    `}>
                      {course.publishedAt ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-lg text-foreground/80">{course.stats?.enrollmentCount || 0}</td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-foreground/80">{course.stats?.completionCount || 0}</span>
                      <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((course.stats?.completionCount || 0) / (course.stats?.enrollmentCount || 1)) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <a 
                      href={`/dashboard/courses/${course.documentId}`} 
                      className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-foreground transition-all hover:bg-brand-500 hover:text-white"
                    >
                      <Edit3 size={14} />
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


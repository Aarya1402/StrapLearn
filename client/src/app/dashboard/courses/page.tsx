import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllCoursesForDashboard, getMyCourses } from '@/lib/course';
import { publishCourseAction, unpublishCourseAction, deleteCourseAction } from '@/actions/course.actions';
import type { Course } from '@/lib/types/course';
import { Plus, Search, Filter, MoreVertical, Eye, Edit3, CheckCircle, FileText, Trash2, Globe, Lock } from 'lucide-react';

export default async function DashboardCoursesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ filter?: string; q?: string }> 
}) {
  const params = await searchParams;
  const user = await requireRole('org_admin', 'instructor');
  const jwt = (await getCurrentJwt())!;
  
  const filter = params.filter;
  const q = params.q;
  const query = Array.isArray(q) ? q[0] : q;

  let courses: Course[] = filter === 'my'
    ? await getMyCourses(jwt, query)
    : await getAllCoursesForDashboard(jwt, user.organization?.slug, query);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {filter === 'my' ? 'My Curriculum' : 'Global Catalog'}
          </h1>
          {query ? (
             <p className="text-muted-foreground text-sm">
               Filtering by <span className="text-brand-600 font-black">"{query}"</span> in {filter === 'my' ? 'personal drafts' : 'organizational catalog'}
             </p>
          ) : (
             <p className="text-muted-foreground mt-1 text-lg">Manage, curate and publish your educational content.</p>
          )}
        </div>
        <a 
          href="/dashboard/courses/new" 
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1 active:scale-95"
        >
          <Plus size={20} />
          Create New Course
        </a>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-premium overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-500 pointer-events-none" size={16} />
                <form action="/dashboard/courses" method="GET">
                  {filter && <input type="hidden" name="filter" value={filter} />}
                  <input 
                    name="q"
                    type="text" 
                    placeholder="Search courses..." 
                    defaultValue={query}
                    className="h-10 w-64 rounded-xl border border-input bg-background pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:w-80 transition-all font-bold"
                  />
                </form>
             </div>
             
          </div>
          <div className="flex h-10 items-center rounded-xl bg-secondary/50 p-1">
             <a 
               href="/dashboard/courses" 
               className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${!filter ? 'bg-card text-brand-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
               All
             </a>
             <a 
               href="/dashboard/courses?filter=my" 
               className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${filter === 'my' ? 'bg-card text-brand-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
               Mine
             </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Course Asset</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Expertise</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Valuation</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      {query ? <Search size={48} /> : <FileText size={48} />}
                      <p className="text-sm font-bold uppercase tracking-widest">
                        {query ? `Refined search yielded no matches for "${query}"` : "No courses identified in this segment."}
                      </p>
                      {query ? (
                        <a href="/dashboard/courses" className="text-brand-600 underline">Clear search criteria</a>
                      ) : (
                        <a href="/dashboard/courses/new" className="text-brand-600 underline">Deploy first course</a>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.documentId} className="group hover:bg-secondary/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-foreground leading-tight group-hover:text-brand-600 transition-colors uppercase tracking-tight">{course.title}</div>
                      <div className="mt-1 font-mono text-[10px] text-muted-foreground opacity-60">REF: {course.slug}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{course.level}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 font-black text-foreground">
                        {course.isFree ? (
                          <span className="text-emerald-600">FREE</span>
                        ) : (
                          <>
                            <span className="text-muted-foreground text-xs opacity-50">₹</span>
                            {course.price ?? 0}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`
                        inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest
                        ${course.publishedAt ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}
                      `}>
                        {course.publishedAt ? <Globe size={12} /> : <Lock size={12} />}
                        {course.publishedAt ? 'Public' : 'Staging'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`/courses/${course.slug}`} 
                          target="_blank" 
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </a>
                        <a 
                          href={`/dashboard/courses/${course.documentId}`} 
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground shadow-sm transition-all hover:bg-brand-50 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </a>
                        
                        {user.role_type === 'org_admin' && (
                          <form action={course.publishedAt ? unpublishCourseAction.bind(null, course.documentId) : publishCourseAction.bind(null, course.documentId)}>
                            <button 
                              type="submit" 
                              className={`
                                flex h-9 w-24 items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${course.publishedAt ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}
                              `}
                            >
                              {course.publishedAt ? 'Recall' : 'Deploy'}
                            </button>
                          </form>
                        )}
                        
                        <form action={deleteCourseAction.bind(null, course.documentId)}>
                          <button 
                            type="submit" 
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground shadow-sm transition-all hover:bg-red-50 hover:text-red-600"
                            title="Purge"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


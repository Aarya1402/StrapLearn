import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrgOverview } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import EnrollmentChart from '@/components/EnrollmentChart';
import { Users, BookOpen, CheckCircle, TrendingUp, ShieldCheck, Mail, ArrowRight, Activity, Settings } from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;

  const orgSlug = user.organization?.slug || '';
  const overview = await getOrgOverview(jwt, orgSlug);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Organization Control Center</h1>
        <p className="text-lg text-muted-foreground">
          Commanding <span className="font-bold text-brand-600 underline underline-offset-4">{user.organization?.name}</span>'s digital learning environment.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Learning Community" 
          value={overview?.totalStudents || 0} 
          icon={<Users size={24} />} 
          color="#3b82f6"
        />
        <StatCard 
          label="Course Portfolio" 
          value={overview?.totalCourses || 0} 
          icon={<BookOpen size={24} />} 
          color="#8b5cf6"
        />
        <StatCard 
          label="Succes Rate" 
          value={`${overview?.avgCompletionRate || 0}%`} 
          icon={<TrendingUp size={24} />} 
          color="#10b981"
        />
        <StatCard 
          label="Total Enrollments" 
          value={overview?.enrollmentCount || 0} 
          icon={<CheckCircle size={24} />} 
          color="#f59e0b"
        />
      </div>

      <div className="relative">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/10 to-transparent blur opacity-50" />
        <EnrollmentChart data={overview?.activity} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-black italic tracking-tight">System Operations</h2>
            <Activity size={20} className="text-brand-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Directory', href: '/dashboard/admin/users', icon: Users, color: 'text-blue-500' },
              { label: 'Curriculum', href: '/dashboard/courses', icon: BookOpen, color: 'text-brand-500' },
              { label: 'Security', href: '/dashboard/admin/settings', icon: ShieldCheck, color: 'text-indigo-500' },
              { label: 'Concierge', href: 'mailto:support@straplearn.com', icon: Mail, color: 'text-amber-500' },
            ].map((action) => (
              <a 
                key={action.label}
                href={action.href} 
                className="group flex flex-col items-center gap-4 rounded-3xl border border-border bg-secondary/30 p-6 text-center transition-all hover:-translate-y-1 hover:bg-brand-500 hover:text-white hover:shadow-lg hover:shadow-brand-500/20"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-sm transition-colors group-hover:bg-white/20 ${action.color}`}>
                  <action.icon size={22} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-black italic tracking-tight">Organization Profile</h2>
            <Settings size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-secondary/50 px-6 py-4">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Identifier</span>
              <code className="rounded-lg bg-card px-3 py-1 text-xs font-bold text-brand-600 shadow-sm">{user.organization?.slug}</code>
            </div>
            
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <span className="text-sm font-bold text-muted-foreground">Human Capital</span>
              <span className="flex h-8 w-12 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-900/20">{overview?.totalStudents || 0}</span>
            </div>
            
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <span className="text-sm font-bold text-muted-foreground">Digital Assets</span>
              <span className="flex h-8 w-12 items-center justify-center rounded-full bg-brand-50 text-xs font-black text-brand-600 dark:bg-brand-900/20">{overview?.totalCourses || 0}</span>
            </div>

            <div className="pt-4 text-center">
               <button className="text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand-600 flex items-center gap-2 mx-auto">
                 Download Audit Log <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


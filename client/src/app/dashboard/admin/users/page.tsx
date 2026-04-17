import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrgUsers } from '@/lib/auth';
import { Users, Mail, UserCheck, Shield, Zap, Search, Filter, MoreVertical, GraduationCap, School } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function OrgUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const user = await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;

  if (!user.organization?.documentId && !user.organization?.id) {
    // This shouldn't happen for a valid org_admin, but handle just in case
    return (
      <div className="rounded-[2.5rem] bg-red-50 p-12 text-center dark:bg-red-900/10">
        <h1 className="text-2xl font-black text-red-600">Unauthorized Access</h1>
        <p className="mt-2 text-muted-foreground">Your account is not associated with any organization.</p>
      </div>
    );
  }

  // Use id if available, fallback to documentId (Strapi mixed usage)
  const orgId = user.organization.id || user.organization.documentId;
  const query = params.q as string;
  let users = await getOrgUsers(jwt, String(orgId), query);

  // Filter users by role for count indicators
  const students = users.filter(u => u.role_type === 'student');
  const instructors = users.filter(u => u.role_type === 'instructor' || u.role_type === 'org_admin');

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-600">
            <School size={14} /> Institutional Registry
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            {user.organization.name} <span className="text-muted-foreground/30 font-light">—</span> Users
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Manage your organization's academic community, including <span className="font-bold text-foreground">{students.length} students</span> and <span className="font-bold text-foreground">{instructors.length} faculty members</span>.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <form action="/dashboard/admin/users" method="GET" className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-500 pointer-events-none" size={18} />
            <input 
              name="q"
              type="text" 
              placeholder="Search directory..." 
              defaultValue={params.q}
              className="h-12 w-full rounded-2xl border border-input bg-card pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/10 md:w-80 transition-all uppercase italic"
            />
          </form>
          
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatSummary 
            icon={<GraduationCap className="text-brand-600" />} 
            label="Total Students" 
            value={students.length} 
            color="bg-brand-50"
        />
        <StatSummary 
            icon={<Shield className="text-indigo-600" />} 
            label="Faculty Staff" 
            value={instructors.length} 
            color="bg-indigo-50"
        />
        <StatSummary 
            icon={<Zap className="text-emerald-600" />} 
            label="Active Sessions" 
            value={Math.floor(users.length * 0.4)} 
            color="bg-emerald-50"
        />
      </div>

      <div className="rounded-[2.5rem] border border-border bg-card shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-secondary text-muted-foreground mx-auto">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-black italic uppercase text-foreground">No matches identified</h3>
              <p className="mt-2 text-muted-foreground">The directory contains no records matching <span className="text-brand-600 font-bold whitespace-nowrap">"{params.q}"</span>.</p>
              <a href="/dashboard/admin/users" className="mt-6 inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-brand-600 hover:text-brand-700">
                Clear search criteria
              </a>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">identity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">privilege level</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">contact</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-secondary/20 transition-all duration-300">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 font-black transition-transform group-hover:scale-110 shadow-sm border border-brand-500/10 group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-brand-500/20">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-foreground text-base italic group-hover:text-brand-600 transition-colors uppercase tracking-tight">{u.username}</div>
                          <div className="text-[9px] font-black text-muted-foreground/60 tracking-[0.2em]">UID: {String(u.id).substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest
                        ${u.role_type === 'org_admin' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 shadow-sm shadow-amber-500/5' : 
                          u.role_type === 'instructor' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 shadow-sm shadow-indigo-500/5' : 
                          'bg-brand-50 text-brand-600 dark:bg-brand-900/20 shadow-sm shadow-brand-500/5'}
                      `}>
                        {u.role_type === 'org_admin' ? <Shield size={12} /> : u.role_type === 'instructor' ? <School size={12} /> : <GraduationCap size={12} />}
                        {u.role_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors italic lowercase">
                        <Mail size={14} className="opacity-40" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80">Active</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all hover:shadow-sm active:scale-95 border border-transparent hover:border-border">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatSummary({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number | string, color: string }) {
    return (
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color} shadow-sm border border-black/5`}>
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{label}</div>
                <div className="text-3xl font-black text-foreground tracking-tighter">{value}</div>
            </div>
        </div>
    )
}

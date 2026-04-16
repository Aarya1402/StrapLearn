import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllUsers } from '@/lib/auth';
import { Users, Mail, UserCheck, Shield, Zap, Search, Filter, MoreVertical } from 'lucide-react';

export default async function SuperUsersPage() {
  await requireRole('super_admin');
  const jwt = (await getCurrentJwt())!;

  const users = await getAllUsers(jwt);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Global User Directory</h1>
          <p className="text-muted-foreground">Manage and audit all users across the entire StrapLearn platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 md:w-64"
            />
          </div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Profile</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">System Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-brand-600 transition-transform group-hover:scale-110">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{user.username}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">ID: {String(user.id).substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider
                      ${user.role_type === 'super_admin' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 
                        user.role_type === 'org_admin' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}
                    `}>
                      {user.role_type === 'super_admin' ? <Zap size={12} /> : <Shield size={12} />}
                      {user.role_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.organization ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-foreground">{user.organization.name}</div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{user.organization.slug}</div>
                      </div>
                    ) : (
                      <span className="text-xs font-medium italic text-muted-foreground opacity-50">Global Straplearn</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      <Mail size={14} className="opacity-40" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
                      <UserCheck size={12} /> Verified
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <MoreVertical size={16} />
                    </button>
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


import Link from 'next/link';
import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllOrganizations } from '@/lib/organization';
import { ShieldCheck, ShieldAlert, Eye, Search, Mail, ArrowUpRight } from 'lucide-react';

export default async function SuperOrganizationsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams;
  const queryRaw = params.q;
  const query = Array.isArray(queryRaw) ? queryRaw[0] : queryRaw;

  await requireRole('super_admin');
  const jwt = (await getCurrentJwt())!;

  const organizations = await getAllOrganizations(jwt, query);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Cloud Tenants</h1>
          {query ? (
             <p className="text-muted-foreground text-sm">
               Filtering infrastructure for <span className="text-brand-600 font-black">&quot;{query}&quot;</span>
             </p>
          ) : (
            <p className="text-muted-foreground text-lg">Manage multi-tenant isolation and global organization configurations.</p>
          )}
        </div>
        <Link 
          href="/dashboard/super/organizations/new" 
          className="group flex w-full sm:w-auto items-center justify-between rounded-2xl bg-brand-500 p-6 sm:px-6 sm:py-3.5 text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1"
        >
          <span className="text-sm font-black uppercase tracking-widest">Deploy New Tenant</span>
          <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-premium overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-8 py-6">
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-500 pointer-events-none" size={16} />
                <form action="/dashboard/super/organizations" method="GET">
                  <input 
                    name="q"
                    type="text" 
                    placeholder="Filter organizations..." 
                    defaultValue={query}
                    className="h-10 w-64 rounded-xl border border-input bg-background pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:w-80 transition-all"
                  />
                </form>
             </div>
             
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Tenant Profile</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Reference Slug</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Governance Status</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Admin Concierge</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {organizations.map((org) => (
                <tr key={org.documentId} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: org.primaryColor || 'var(--color-brand-500)' }}
                      >
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-foreground uppercase tracking-tight">{org.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground opacity-60">ID: {org.documentId.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <code className="rounded-lg bg-secondary/80 px-3 py-1 text-xs font-bold text-brand-600 shadow-sm">{org.slug}</code>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`
                      inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest
                      ${org.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}
                    `}>
                      {org.isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {org.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      <Mail size={14} className="opacity-40" />
                      {org.supportEmail || 'No email set'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      href={`/dashboard/super/organizations/${org.documentId}`} 
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground shadow-sm transition-all hover:bg-brand-500 hover:text-white"
                      title="Inspect Organization"
                    >
                      <Eye size={18} />
                    </Link>
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


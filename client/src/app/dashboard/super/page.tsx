import Link from 'next/link';
import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getSystemOverview } from '@/lib/analytics';
import StatCard from '@/components/StatCard';
import { Layers, Users, BookOpen, Activity, Zap, ShieldAlert, Database, Globe, Command, ArrowUpRight, AlertTriangle } from 'lucide-react';

export default async function SuperDashboardPage() {
  await requireRole('super_admin');
  const jwt = (await getCurrentJwt())!;

  const stats = await getSystemOverview(jwt);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Mission Control</h1>
        <p className="text-lg text-muted-foreground">Global infrastructure and multi-tenant performance metrics.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Instances" 
          value={stats?.orgCount || 0} 
          icon={<Layers size={24} />} 
          color="#111"
        />
        <StatCard 
          label="Global Users" 
          value={stats?.studentCount || 0} 
          icon={<Users size={24} />} 
          color="#3b82f6"
        />
        <StatCard 
          label="System Catalog" 
          value={stats?.courseCount || 0} 
          icon={<BookOpen size={24} />} 
          color="#8b5cf6"
        />
        <StatCard 
          label="Platform Velocity" 
          value={stats?.enrollmentCount || 0} 
          icon={<Activity size={24} />} 
          color="#10b981"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm">
                <Zap size={20} />
              </div>
              <h2 className="text-xl font-black italic tracking-tight text-foreground">Cluster Health</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-900/20">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Operational
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Uptime', value: '99.99%', icon: Globe, color: 'text-blue-500' },
              { label: 'Database Load', value: '14%', icon: Database, color: 'text-indigo-500' },
              { label: 'Network Latency', value: '12ms', icon: Activity, color: 'text-emerald-500' },
              { label: 'Security Protocols', value: 'Active', icon: ShieldAlert, color: 'text-red-500' },
            ].map((metric) => (
              <div key={metric.label} className="group flex items-center justify-between rounded-2xl bg-secondary/30 px-6 py-4 transition-colors hover:bg-secondary/50">
                <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground group-hover:text-foreground">
                  <metric.icon size={18} className={metric.color} />
                  {metric.label}
                </div>
                <span className="text-sm font-black text-foreground">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-black italic tracking-tight text-foreground">Global Operations</h2>
            <Command size={20} className="text-muted-foreground/30" />
          </div>
          <div className="space-y-4">
            <Link 
              href="/dashboard/super/organizations/new" 
              className="group flex w-full items-center justify-between rounded-2xl bg-brand-500 p-6 text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-1"
            >
              <span className="text-sm font-black uppercase tracking-widest">Deploy New Tenant</span>
              <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            
            {[
              { label: 'System Analytics', icon: Activity, danger: false },
              { label: 'Internal Integrations', icon: Layers, danger: false },
              { label: 'Emergency Maintenance', icon: AlertTriangle, danger: true },
            ].map((action) => (
              <button 
                key={action.label}
                className={`flex w-full items-center gap-4 rounded-2xl border border-border bg-secondary/50 p-5 text-sm font-bold transition-all hover:bg-secondary ${action.danger ? 'text-red-600 hover:bg-red-50' : 'text-foreground'}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm ${action.danger ? 'text-red-500' : 'text-muted-foreground'}`}>
                  <action.icon size={18} />
                </div>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


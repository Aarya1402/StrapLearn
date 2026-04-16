import { getCurrentUser, getDashboardPath } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { 
  ShieldAlert, 
  Terminal, 
  Globe, 
  Zap, 
  Database, 
  Server, 
  Save,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default async function SuperSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role_type !== 'super_admin') {
     if (user) redirect(getDashboardPath(user.role_type));
     else redirect('/login');
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header section with technical aura */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-red-500 mb-3">
            <Terminal size={14} /> System Laboratory
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">Platform Core</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage high-level infrastructure protocols and global multi-tenant defaults.</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 rounded-2xl bg-foreground px-8 py-4 text-sm font-black uppercase tracking-widest text-background shadow-xl transition-all hover:bg-foreground/90 active:scale-95">
          <Save size={18} /> Deploy Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Branding & Identity */}
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                <Globe size={20} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Platform Branding</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Application Title</label>
                <input 
                  type="text" 
                  defaultValue="StrapLearn" 
                  className="h-12 w-full rounded-2xl border border-input bg-secondary/50 px-4 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Global Tagline</label>
                <input 
                  type="text" 
                  defaultValue="Enterprise Training Orchestrator" 
                  className="h-12 w-full rounded-2xl border border-input bg-secondary/50 px-4 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-border bg-card p-10 shadow-premium space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Zap size={20} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Infrastructure Defaults</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl bg-secondary/30 p-6 border border-border/50">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-foreground uppercase tracking-tight">Auto-Tenant Provisioning</div>
                  <div className="text-xs text-muted-foreground">Automatically initialize resources for new organizations.</div>
                </div>
                <div className="h-6 w-12 rounded-full bg-brand-500 p-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white ml-auto" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-secondary/30 p-6 border border-border/50">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-foreground uppercase tracking-tight">Maintenance Mode</div>
                  <div className="text-xs text-muted-foreground">Restrict all student-facing portals globally.</div>
                </div>
                <div className="h-6 w-12 rounded-full bg-muted p-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Technical Stats & Security */}
        <div className="space-y-8">
          <section className="rounded-[2.5rem] bg-foreground text-background p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-6">
                <ShieldAlert size={14} /> Security Protocol
              </div>
              <div className="space-y-4">
                <div className="text-3xl font-black italic tracking-tighter uppercase leading-none">Level 4</div>
                <p className="text-xs text-brand-200/60 leading-relaxed">
                  All platform mutations are cryptographically signed and organizationally isolated.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest pt-4">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   Verification Active
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-border bg-card p-8 shadow-premium space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">Database Pool</span>
                </div>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server size={16} className="text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">Web Sockets</span>
                </div>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">CDN Purging</span>
                </div>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
               <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Uptime Index</div>
               <div className="text-xl font-black text-foreground tabular-nums">99.998%</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

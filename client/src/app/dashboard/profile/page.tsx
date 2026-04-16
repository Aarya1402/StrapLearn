import { requireAuth, getCurrentJwt } from '@/lib/server-auth';
import ProfileSettingsForm from '@/components/ProfileSettingsForm';
import { UserCircle, ShieldCheck } from 'lucide-react';

export default async function ProfilePage() {
  const user = await requireAuth();
  const jwt = (await getCurrentJwt())!;

  return (
    <div className="mx-auto max-w-2xl space-y-12 py-10">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-brand-500 text-white shadow-2xl shadow-brand-500/20 ring-8 ring-brand-500/5">
           <UserCircle size={48} />
        </div>
        <div>
          <h1 className="text-4xl font-black italic tracking-tight text-foreground uppercase">Identity Vault</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage your personal credentials and organizational profile.</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-900/20">
          <ShieldCheck size={14} /> Cryptographically Secured Session
        </div>
      </div>

      <div className="rounded-[3rem] border border-border bg-card p-10 shadow-premium">
        <ProfileSettingsForm user={user} jwt={jwt} />
      </div>

      <div className="text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Session ID: {user.documentId.substring(0, 12)}...
        </p>
      </div>
    </div>
  );
}

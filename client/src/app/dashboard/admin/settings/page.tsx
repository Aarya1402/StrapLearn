import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrganizationById } from '@/lib/organization';
import OrganizationDetailsClient from '../../super/organizations/[id]/OrganizationDetailsClient';
import { ChevronLeft, Building2 } from 'lucide-react';

export default async function AdminOrgSettingsPage() {
  const user = await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;

  if (!user.organization?.documentId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
          <Building2 size={40} />
        </div>
        <h1 className="text-2xl font-black italic tracking-tight">Identity Mismatch</h1>
        <p className="mt-2 text-muted-foreground">Your account is not canonically associated with a valid organization.</p>
      </div>
    );
  }

  const organization = await getOrganizationById(user.organization.documentId, jwt);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6">
        <a 
          href="/dashboard/admin" 
          className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-all hover:text-brand-600"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Gateway Management
        </a>
        
        <div className="border-b border-border pb-8">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Organizational Identity</h1>
          <p className="mt-1 text-lg text-muted-foreground">Audit your institution's profile and cryptographic credentials.</p>
        </div>
      </div>
      
      <div className="rounded-[2.5rem] border border-border bg-card shadow-premium overflow-hidden">
        <OrganizationDetailsClient org={organization} hideEdit={true} />
      </div>
    </div>
  );
}


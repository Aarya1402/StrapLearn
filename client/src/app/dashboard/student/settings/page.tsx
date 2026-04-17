import Link from 'next/link';
import { requireAuth, getCurrentJwt } from '@/lib/server-auth';
import { getOrganizationById } from '@/lib/organization';
import OrganizationDetailsClient from '../../super/organizations/[id]/OrganizationDetailsClient';
import { ChevronLeft } from 'lucide-react';

export default async function StudentOrgSettingsPage() {
  const user = await requireAuth();
  const jwt = (await getCurrentJwt())!;

  if (!user.organization?.documentId) {
    return (
      <div style={{ padding: 24 }}>
        <h1>No Organization Found</h1>
        <p>Your account is not associated with an organization.</p>
      </div>
    );
  }

  const organization = await getOrganizationById(user.organization.documentId, jwt);

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <Link 
          href="/dashboard/student" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4, 
            color: '#666', 
            textDecoration: 'none', 
            fontSize: 14,
            fontWeight: 500
          }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
      </div>
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Organization Profile</h1>
        <p style={{ color: '#666' }}>View your organization&apos;s brand identity and system profile.</p>
      </div>
      
      <OrganizationDetailsClient org={organization} hideEdit={true} />
    </div>
  );
}

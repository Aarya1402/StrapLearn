import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrganizationById } from '@/lib/organization';
import OrganizationDetailsClient from '../../super/organizations/[id]/OrganizationDetailsClient';
import { ChevronLeft } from 'lucide-react';

export default async function AdminOrgSettingsPage() {
  const user = await requireRole('org_admin');
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
        <a 
          href="/dashboard/admin" 
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
        </a>
      </div>
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Organization Settings</h1>
        <p style={{ color: '#666' }}>View your organization's brand identity and system profile.</p>
      </div>
      
      <OrganizationDetailsClient org={organization} hideEdit={true} />
    </div>
  );
}

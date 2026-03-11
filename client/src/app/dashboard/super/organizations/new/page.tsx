import { requireRole } from '@/lib/server-auth';
import { ChevronLeft } from 'lucide-react';
import NewOrgForm from './NewOrgForm';

export default async function NewOrganizationPage() {
  await requireRole('super_admin');

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <a 
          href="/dashboard/super/organizations" 
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
          <ChevronLeft size={16} /> Back to Organizations
        </a>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Create New Organization</h1>
        <p style={{ color: '#666' }}>Provision a new tenant on the platform. Slugs are auto-generated from the name.</p>
      </div>

      <NewOrgForm />
    </div>
  );
}

import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrganizationById } from '@/lib/organization';
import { notFound } from 'next/navigation';
import OrganizationDetailsClient from './OrganizationDetailsClient';
import { ChevronLeft } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SuperOrganizationDetailPage({ params }: Props) {
  const { id } = await params;
  await requireRole('super_admin');
  const jwt = (await getCurrentJwt())!;

  let organization;
  try {
    organization = await getOrganizationById(id, jwt);
  } catch (err) {
    notFound();
  }

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
      
      <OrganizationDetailsClient org={organization} />
    </div>
  );
}

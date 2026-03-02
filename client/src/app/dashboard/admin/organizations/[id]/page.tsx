import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrganizationById } from '@/lib/organization';
import { updateOrganizationAction, deactivateOrganizationAction } from '@/actions/organization.actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;
  const { id } = await params;

  let org;
  try {
    org = await getOrganizationById(Number(id), jwt);
  } catch {
    return <div style={{ fontFamily: 'monospace' }}><h1>Organization not found</h1><a href="/dashboard/admin/organizations">← Back</a></div>;
  }

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <a href="/dashboard/admin/organizations">← All Organizations</a>
      <h1>Edit: {org.name}</h1>
      <p>Slug: <code>{org.slug}</code> (auto-generated)</p>
      <p>Status: {org.isActive ? '✅ Active' : '❌ Inactive'}</p>
      <hr />

      {/* Edit Form */}
      <form
        action={updateOrganizationAction.bind(null, org.id)}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}
      >
        <label>
          Name *
          <input name="name" type="text" defaultValue={org.name} required style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Support Email
          <input name="supportEmail" type="email" defaultValue={org.supportEmail ?? ''} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Primary Color (hex)
          <input name="primaryColor" type="text" defaultValue={org.primaryColor ?? ''} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Save Changes</button>
      </form>

      {/* Deactivate */}
      {org.isActive && (
        <>
          <hr style={{ margin: '24px 0' }} />
          <h3>Danger Zone</h3>
          <form action={deactivateOrganizationAction.bind(null, org.id)}>
            <button type="submit" style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Deactivate Organization
            </button>
          </form>
        </>
      )}
    </div>
  );
}

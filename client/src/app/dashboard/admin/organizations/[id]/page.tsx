import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getOrganizationById } from '@/lib/organization';
import { updateOrganizationAction, deactivateOrganizationAction } from '@/actions/organization.actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;
  const { id: documentId } = await params;

  let org;
  try {
    org = await getOrganizationById(documentId, jwt);
  } catch {
    return (
      <div style={{ fontFamily: 'monospace' }}>
        <h1>Organization not found</h1>
        <a href="/dashboard/admin/organizations">← Back</a>
      </div>
    );
  }

  const strapiBase = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 500 }}>
      <a href="/dashboard/admin/organizations">← All Organizations</a>
      <h1>Edit: {org.name}</h1>
      <p>Slug: <code>{org.slug}</code></p>
      <p>Status: {org.isActive ? '✅ Active' : '❌ Inactive'}</p>
      <hr />

      <form
        action={updateOrganizationAction.bind(null, documentId)}
        encType="multipart/form-data"
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <label>
          Name *
          <input
            name="name"
            type="text"
            defaultValue={org.name}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Logo
          {/* Show current logo if present */}
          {org.logo?.url && (
            <div style={{ margin: '8px 0' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Current logo:</p>
              <img
                src={`${strapiBase}${org.logo.url}`}
                alt="Current logo"
                style={{ height: 60, objectFit: 'contain', borderRadius: 4, border: '1px solid #eee', padding: 4 }}
              />
            </div>
          )}
          <input
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
          <small style={{ color: '#666' }}>
            {org.logo?.url ? 'Upload a new file to replace the current logo.' : 'No logo yet. PNG, JPG, WebP or SVG.'}
          </small>
        </label>

        <label>
          Support Email
          <input
            name="supportEmail"
            type="email"
            defaultValue={org.supportEmail ?? ''}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Primary Color (hex)
          <input
            name="primaryColor"
            type="text"
            defaultValue={org.primaryColor ?? ''}
            placeholder="#3b82f6"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <button
          type="submit"
          style={{ padding: '10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Save Changes
        </button>
      </form>

      {org.isActive && (
        <>
          <hr style={{ margin: '28px 0' }} />
          <h3 style={{ color: '#dc2626' }}>Danger Zone</h3>
          <form action={deactivateOrganizationAction.bind(null, documentId)}>
            <button
              type="submit"
              style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Deactivate Organization
            </button>
          </form>
        </>
      )}
    </div>
  );
}

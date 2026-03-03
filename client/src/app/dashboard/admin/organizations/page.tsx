import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllOrganizations, type Organization } from '@/lib/organization';
import { createOrganizationAction } from '@/actions/organization.actions';

export default async function OrganizationsPage() {
  await requireRole('org_admin');
  const jwt = (await getCurrentJwt())!;

  let orgs: Organization[] = [];
  let error = '';
  try {
    orgs = await getAllOrganizations(jwt);
  } catch {
    error = 'Could not fetch organizations. Make sure the Organization content type is created in Strapi.';
  }

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Organizations</h1>
        <a href="/dashboard/admin/organizations/new" style={{ padding: '8px 16px', background: '#000', color: '#fff', textDecoration: 'none' }}>
          + New Organization
        </a>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {orgs.length === 0 && !error && (
        <p>No organizations yet. <a href="/dashboard/admin/organizations/new">Create one</a>.</p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Slug</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org: any) => (
            <tr key={org.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{org.name}</td>
              <td style={{ padding: 8 }}><code>{org.slug}</code></td>
              <td style={{ padding: 8 }}>{org.isActive ? '✅ Active' : '❌ Inactive'}</td>
              <td style={{ padding: 8 }}>
                <a href={`/dashboard/admin/organizations/${org.documentId}`}>Edit</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Quick Create Form */}
      <hr style={{ margin: '32px 0' }} />
      <h2>Quick Create</h2>
      <form action={createOrganizationAction} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
        <label>
          Name *
          <input name="name" type="text" required style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Support Email
          <input name="supportEmail" type="email" style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Primary Color (hex)
          <input name="primaryColor" type="text" placeholder="#3b82f6" style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Create Organization</button>
      </form>
    </div>
  );
}

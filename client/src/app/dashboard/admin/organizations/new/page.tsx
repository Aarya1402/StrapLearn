import { requireRole } from '@/lib/server-auth';
import { createOrganizationAction } from '@/actions/organization.actions';

export default async function NewOrganizationPage() {
  await requireRole('org_admin');

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 500 }}>
      <a href="/dashboard/admin/organizations" style={{ display: 'block', marginBottom: 16 }}>
        ← Back to Organizations
      </a>
      <h1>Create New Organization</h1>
      <hr />

      {/* encType required for file uploads in forms */}
      <form
        action={createOrganizationAction}
        encType="multipart/form-data"
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <label>
          Name *
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Acme Corp"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Logo
          <input
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
          <small style={{ color: '#666' }}>PNG, JPG, WebP or SVG. Optional.</small>
        </label>

        <label>
          Support Email
          <input
            name="supportEmail"
            type="email"
            placeholder="support@acme.com"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Primary Color (hex)
          <input
            name="primaryColor"
            type="text"
            placeholder="#3b82f6"
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: '12px',
            background: '#000',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          Create Organization
        </button>
      </form>
    </div>
  );
}

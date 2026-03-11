import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllOrganizations } from '@/lib/organization';
import { Layers, Plus, ExternalLink, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';

export default async function SuperOrganizationsPage() {
  await requireRole('super_admin');
  const jwt = (await getCurrentJwt())!;

  const organizations = await getAllOrganizations(jwt);

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Organizations</h1>
          <p style={{ color: '#666' }}>Manage all tenants and account settings across the platform.</p>
        </div>
        <a href="/dashboard/super/organizations/new" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          padding: '10px 20px', 
          background: '#000', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 10, 
          fontWeight: 600, 
          cursor: 'pointer',
          textDecoration: 'none'
        }}>
          <Plus size={18} /> New Organization
        </a>
      </div>

      <div style={{ 
        background: '#fff', 
        borderRadius: 16, 
        border: '1px solid #eee', 
        overflow: 'hidden' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
              <th style={thStyle}>Organization</th>
              <th style={thStyle}>Slug</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.documentId} style={{ borderBottom: '1px solid #f4f4f5' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      background: org.primaryColor || '#eee', 
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 18
                    }}>
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{org.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>ID: {org.documentId}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <code style={{ background: '#f4f4f5', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>{org.slug}</code>
                </td>
                <td style={tdStyle}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: org.isActive ? '#10b981' : '#ef4444',
                    background: org.isActive ? '#ecfdf5' : '#fef2f2',
                    padding: '4px 10px',
                    borderRadius: 20
                  }}>
                    {org.isActive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {org.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontSize: 14 }}>{org.supportEmail || 'No email set'}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <a href={`/dashboard/super/organizations/${org.documentId}`} style={{ color: '#666', textDecoration: 'none' }}>
                      <Eye size={18} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '16px 24px',
  fontSize: 13,
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle: React.CSSProperties = {
  padding: '16px 24px',
  verticalAlign: 'middle'
};

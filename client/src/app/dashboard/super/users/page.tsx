import { requireRole, getCurrentJwt } from '@/lib/server-auth';
import { getAllUsers } from '@/lib/auth';
import { Users, Mail, UserCheck, Shield, Zap } from 'lucide-react';

export default async function SuperUsersPage() {
  await requireRole('super_admin');
  const jwt = (await getCurrentJwt())!;

  const users = await getAllUsers(jwt);

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Global Users</h1>
          <p style={{ color: '#666' }}>Directory of all users across all organizations.</p>
        </div>
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
              <th style={thStyle}>User</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Organization</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      background: '#f4f4f5', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={20} color="#666" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.username}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: getRoleColor(user.role_type),
                    textTransform: 'capitalize'
                  }}>
                    {user.role_type === 'super_admin' ? <Zap size={14} /> : <Shield size={14} />}
                    {user.role_type.replace('_', ' ')}
                  </span>
                </td>
                <td style={tdStyle}>
                  {user.organization ? (
                    <div style={{ fontSize: 14 }}>
                      <div style={{ fontWeight: 500 }}>{user.organization.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{user.organization.slug}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>Platform Global</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#444' }}>
                    <Mail size={14} color="#999" />
                    {user.email}
                  </div>
                </td>
                <td style={tdStyle}>
                   <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: '#10b981',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase'
                  }}>
                    <UserCheck size={12} /> Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin': return '#ef4444';
    case 'org_admin': return '#8b5cf6';
    case 'instructor': return '#3b82f6';
    default: return '#666';
  }
};

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

'use client';

import { useState } from 'react';
import { registerAction } from '@/actions/auth.actions';
import type { Organization } from '@/lib/organization';

interface Props {
  organizations: Organization[];
}

export default function RegisterForm({ organizations }: Props) {
  const [role, setRole] = useState('student');

  return (
    <form
      action={async (formData: FormData) => {
        await registerAction({
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          role_type: formData.get('role_type') as any,
          organization: formData.get('organization') as string,
        });
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <label>
        Username
        <input name="username" type="text" required style={inputStyle} />
      </label>
      <label>
        Email
        <input name="email" type="email" required style={inputStyle} />
      </label>
      <label>
        Password
        <input name="password" type="password" required minLength={6} style={inputStyle} />
      </label>
      <label>
        Role
        <select 
          name="role_type" 
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="org_admin">Org Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </label>

      {role !== 'super_admin' && (
        <label>
          Organization
          <select name="organization" required style={inputStyle}>
            <option value="">Select your organization...</option>
            {organizations.map((org) => (
              <option key={org.documentId} value={org.documentId}>
                {org.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <button type="submit" style={{ padding: '12px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', marginTop: 8 }}>
        Create Account
      </button>
    </form>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginTop: '4px',
  border: '1px solid #ddd',
  borderRadius: 4,
  fontFamily: 'inherit'
};

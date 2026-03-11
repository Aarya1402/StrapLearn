'use client';

import { Building2, Mail, Palette, Image as ImageIcon, Save } from 'lucide-react';
import { createOrgSuperAction } from '@/actions/organization.actions';

export default function NewOrganizationForm() {
  return (
    <form action={createOrgSuperAction} style={{ 
      background: '#fff', 
      padding: 32, 
      borderRadius: 20, 
      border: '1px solid #eee',
      maxWidth: 600
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}><Building2 size={14} /> Organization Name</label>
          <input 
            name="name" 
            placeholder="e.g. Acme Corporation" 
            required 
            style={inputStyle} 
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}><Mail size={14} /> Support Email</label>
          <input 
            name="supportEmail" 
            type="email" 
            placeholder="support@acme.com" 
            style={inputStyle} 
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}><Palette size={14} /> Brand Color (Hex)</label>
          <div style={{ display: 'flex', gap: 12 }}>
              <input 
                  type="color" 
                  defaultValue="#3b82f6"
                  style={{ border: 'none', background: 'none', width: 44, height: 44, padding: 0, cursor: 'pointer' }}
                  onChange={(e) => {
                    const textInput = document.getElementsByName('primaryColor')[0] as HTMLInputElement;
                    if (textInput) textInput.value = e.target.value;
                  }}
              />
              <input 
                  name="primaryColor" 
                  placeholder="#3b82f6" 
                  defaultValue="#3b82f6"
                  style={inputStyle} 
              />
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}><ImageIcon size={14} /> Organization Logo</label>
          <div style={{ 
              border: '2px dashed #eee', 
              padding: '24px', 
              borderRadius: 12, 
              textAlign: 'center',
              background: '#f9f9f9'
          }}>
              <input 
                name="logo" 
                type="file" 
                accept="image/*"
                style={{ fontSize: 13 }}
              />
              <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>PNG, JPG or SVG (Max 2MB)</p>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" style={saveButtonStyle}>
            <Save size={18} /> Provision Organization
          </button>
        </div>
      </div>
    </form>
  );
}

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: '#999',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: 6
};

const inputStyle = {
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid #ddd',
  fontSize: 15,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const saveButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '14px 24px',
  background: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'transform 0.1s active'
};

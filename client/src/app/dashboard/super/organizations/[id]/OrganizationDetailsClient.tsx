'use client';

import { useState } from 'react';
import { updateOrgSuperAction } from '@/actions/organization.actions';
import { ShieldCheck, ShieldAlert, Edit2, Check, X, Mail, Globe, Palette } from 'lucide-react';

interface Props {
  org: any;
}

export default function OrganizationDetailsClient({ org: initialOrg }: Props) {
  const [org, setOrg] = useState(initialOrg);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialOrg.name,
    slug: initialOrg.slug,
    supportEmail: initialOrg.supportEmail || '',
    primaryColor: initialOrg.primaryColor || '#111111',
    isActive: initialOrg.isActive
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateOrgSuperAction(org.documentId, formData);
      setOrg(result.data);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            background: formData.primaryColor, 
            borderRadius: 16, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontSize: 32,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {formData.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 4 }}>{org.name}</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Document ID: {org.documentId}</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            style={editButtonStyle}
          >
            <Edit2 size={16} /> Edit Organization
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setIsEditing(false)} style={cancelButtonStyle}>
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={loading} style={saveButtonStyle}>
              {loading ? 'Saving...' : <><Check size={16} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      {/* Grid Details */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 24,
        background: '#fff',
        padding: 32,
        borderRadius: 20,
        border: '1px solid #eee'
      }}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}><Globe size={14} /> Organization Name</label>
          {isEditing ? (
            <input 
              style={inputStyle} 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          ) : (
            <div style={valueStyle}>{org.name}</div>
          )}
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}><Globe size={14} /> Slug (Internal Key)</label>
          {isEditing ? (
            <input 
              style={inputStyle} 
              value={formData.slug} 
              onChange={e => setFormData({...formData, slug: e.target.value})} 
            />
          ) : (
            <code style={{ ...valueStyle, background: '#f4f4f5', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>{org.slug}</code>
          )}
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}><Mail size={14} /> Support Email</label>
          {isEditing ? (
            <input 
              style={inputStyle} 
              type="email"
              value={formData.supportEmail} 
              onChange={e => setFormData({...formData, supportEmail: e.target.value})} 
            />
          ) : (
            <div style={valueStyle}>{org.supportEmail || 'Not specified'}</div>
          )}
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}><Palette size={14} /> Brand Color</label>
          {isEditing ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 <input 
                    type="color"
                    style={{ border: 'none', background: 'none', width: 40, height: 40, padding: 0, cursor: 'pointer' }}
                    value={formData.primaryColor} 
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})} 
                />
                <input 
                    style={inputStyle} 
                    value={formData.primaryColor} 
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})} 
                />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: org.primaryColor }}></div>
                <div style={valueStyle}>{org.primaryColor || '#111111'}</div>
            </div>
          )}
        </div>

        <div style={{ ...fieldGroupStyle, gridColumn: 'span 2' }}>
          <label style={labelStyle}>System Status</label>
          {isEditing ? (
            <select 
              style={inputStyle}
              value={formData.isActive ? 'true' : 'false'}
              onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}
            >
              <option value="true">Active / Healthy</option>
              <option value="false">Suspended / Maintenance</option>
            </select>
          ) : (
            <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6, 
                fontSize: 14, 
                fontWeight: 600, 
                color: org.isActive ? '#10b981' : '#ef4444',
                background: org.isActive ? '#ecfdf5' : '#fef2f2',
                padding: '6px 14px',
                borderRadius: 20,
                width: 'fit-content'
              }}>
                {org.isActive ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                {org.isActive ? 'Organization is Active' : 'Organization Suspended'}
              </span>
          )}
        </div>
      </div>
    </div>
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

const valueStyle = {
  fontSize: 16,
  fontWeight: 500,
  color: '#111'
};

const inputStyle = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #ddd',
  fontSize: 15,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const editButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 18px',
  background: '#f9fafb',
  border: '1px solid #eee',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer'
};

const saveButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 18px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer'
};

const cancelButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 18px',
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer'
};

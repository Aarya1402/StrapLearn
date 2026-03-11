import React from 'react';

interface Props {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, icon, color = '#3b82f6' }: Props) {
  return (
    <div style={{ 
      padding: 20, 
      border: '1px solid #eee', 
      borderRadius: 12, 
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{label}</span>
        {icon && <div style={{ color }}>{icon}</div>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

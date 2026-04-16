import React from 'react';

interface Props {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, icon, color = 'var(--primary)' }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-hover">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon && (
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400"
            style={{ color: color.startsWith('#') ? color : undefined }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}


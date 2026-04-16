'use client';

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  data?: { name: string; enrollments: number }[];
}

export default function EnrollmentChart({ data = [] }: Props) {
  return (
    <div className="h-[360px] w-full rounded-2xl border border-border bg-card p-6 shadow-premium">
      <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Enrollment Activity</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data.length > 0 ? data : [
              { name: 'Jan', enrollments: 0 },
              { name: 'Feb', enrollments: 0 },
              { name: 'Mar', enrollments: 0 },
              { name: 'Apr', enrollments: 0 },
              { name: 'May', enrollments: 0 },
              { name: 'Jun', enrollments: 0 },
              { name: 'Jul', enrollments: 0 },
            ]}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: 'var(--shadow-premium)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="enrollments" 
              stroke="var(--color-brand-500)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorEnroll)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


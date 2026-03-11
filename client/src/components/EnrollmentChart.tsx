'use client';

import { 
  LineChart, 
  Line, 
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
    <div style={{ width: '100%', height: 300, background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eee' }}>
      <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>Enrollment Activity</h3>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data.length > 0 ? data : [
          { name: 'Jan', enrollments: 0 },
          { name: 'Feb', enrollments: 0 },
          { name: 'Mar', enrollments: 0 },
          { name: 'Apr', enrollments: 0 },
          { name: 'May', enrollments: 0 },
          { name: 'Jun', enrollments: 0 },
          { name: 'Jul', enrollments: 0 },
        ]}>
          <defs>
            <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#999' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#999' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="enrollments" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorEnroll)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

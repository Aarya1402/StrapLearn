interface Props {
  percentage: number;
}

export default function CourseProgressBar({ percentage }: Props) {
  return (
    <div style={{ width: '100%', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#666', fontWeight: 'bold' }}>Your Progress</span>
        <span style={{ fontSize: 13, color: '#666', fontWeight: 'bold' }}>{percentage}%</span>
      </div>
      <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: '#3b82f6',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

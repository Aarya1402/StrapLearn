interface Props {
  percentage: number;
}

export default function CourseProgressBar({ percentage }: Props) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Progress</span>
        <span className="text-sm font-bold text-foreground">{percentage}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundImage: 'linear-gradient(90deg, var(--color-brand-400), var(--color-brand-600))',
          }}
        />
      </div>
    </div>
  );
}


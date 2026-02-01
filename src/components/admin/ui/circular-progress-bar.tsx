import { cn } from "@/lib/utils";

type CircularStepProgressProps = {
  current: number;
  total: number;
  size?: number; // px
  strokeWidth?: number;
  className?: string;
};

export function CircularStepProgress({
  current,
  total,
  size = 44,
  strokeWidth = 4,
  className,
}: CircularStepProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (current / total) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-slate-50 rounded-full`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke=""
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand-blue)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Center text */}
      <span className={`absolute font-medium text-foreground ${className}`}>
        {current}/{total}
      </span>
    </div>
  );
}

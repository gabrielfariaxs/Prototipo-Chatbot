import { motion } from 'framer-motion'
import { AnimatedCounter } from './AnimatedCounter'

interface AnimatedProgressBarProps {
  label: string
  value: number
  maxValue: number
  colorClass?: string
  delay?: number
  suffix?: string
}

export function AnimatedProgressBar({
  label,
  value,
  maxValue,
  colorClass = 'bg-blue-600',
  delay = 0,
  suffix = '',
}: AnimatedProgressBarProps) {
  const percentage = maxValue > 0 ? Math.min(100, Math.max(0, (value / maxValue) * 100)) : 0

  return (
    <div className="flex items-center gap-4">
      <span className="w-28 text-sm font-semibold text-slate-700 truncate shrink-0">
        {label}
      </span>
      <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
        <motion.div
          className={`h-full ${colorClass} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.9,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>
      <span className="w-12 text-right text-xs font-bold text-slate-500 shrink-0">
        <AnimatedCounter value={value} suffix={suffix} />
      </span>
    </div>
  )
}

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AnimatedCounter } from './AnimatedCounter'


interface AnimatedMetricCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: ReactNode
  iconBgColor?: string
  iconTextColor?: string
  prefix?: string
  suffix?: string
  decimals?: number
  delay?: number
  trend?: {
    value: string
    isPositive?: boolean
  }
}

export function AnimatedMetricCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
  prefix = '',
  suffix = '',
  decimals = 0,
  delay = 0,
  trend,
}: AnimatedMetricCardProps) {
  const isNumeric = typeof value === 'number'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 relative overflow-hidden group"
    >
      <div className={`p-3.5 ${iconBgColor} ${iconTextColor} rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{title}</p>
          {trend && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          {isNumeric ? (
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          ) : (
            value
          )}
        </h3>

        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

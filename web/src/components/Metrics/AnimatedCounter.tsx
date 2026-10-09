import { useEffect, useState } from 'react'
import { useSpring } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const spring = useSpring(0, {
    stiffness: 60,
    damping: 18,
    restDelta: 0.01,
  })

  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      const formatted = latest.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      setDisplayValue(formatted)
    })
    return () => unsubscribe()
  }, [spring, decimals])

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}

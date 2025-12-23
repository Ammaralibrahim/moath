'use client'

import { colors } from '@/components/shared/constants'

export default function StatusBadge({ status }) {
  const config = {
    pending: { color: colors.warning, text: 'قيد الانتظار', gradient: colors.gradientWarning },
    confirmed: { color: colors.success, text: 'مؤكد', gradient: colors.gradientSuccess },
    cancelled: { color: colors.error, text: 'ملغى', gradient: colors.gradientError }
  }
  
  const { color, text, gradient } = config[status] || config.pending
  
  return (
    <span
      className="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-default"
      style={{ 
        background: gradient,
        color: '#FFFFFF',
        border: `1px solid ${color}40`
      }}
    >
      {text}
    </span>
  )
}
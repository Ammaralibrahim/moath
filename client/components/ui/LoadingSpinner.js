'use client'

import { colors } from '@/components/shared/constants'

export default function LoadingSpinner({ message = 'جاري تحميل البيانات...' }) {
  return (
    <div className="text-center py-12">
      <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" 
        style={{ borderColor: colors.primary }}></div>
      <p className="mt-4 font-medium" style={{ color: colors.textMuted }}>{message}</p>
    </div>
  )
}
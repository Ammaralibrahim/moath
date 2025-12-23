'use client'

import { colors } from '@/components/shared/constants'

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full animate-spin border-4 border-solid"
            style={{ 
              borderColor: colors.primary + '20',
              borderTopColor: colors.primary
            }}>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-lg font-semibold mb-1" style={{ color: colors.text }}>جاري التحميل</div>
          <div className="text-sm" style={{ color: colors.textLight }}>يرجى الانتظار...</div>
        </div>
      </div>
    </div>
  )
}
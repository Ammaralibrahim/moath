'use client'

import { colors } from '@/components/shared/constants'

export default function RestoreModal({ backup, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="rounded-2xl max-w-md w-full p-6 shadow-2xl" style={{ 
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`
      }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
            background: colors.gradientWarning,
            opacity: 0.2
          }}>
            <svg className="w-8 h-8" style={{ color: colors.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>تأكيد استعادة النسخة الاحتياطية</h3>
          <p className="text-sm" style={{ color: colors.textLight }}>
            هل أنت متأكد من استعادة النسخة الاحتياطية؟<br />
            سيتم حذف جميع البيانات الحالية واستبدالها بالنسخة المحفوظة.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ 
              border: `1px solid ${colors.borderLight}`,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            إلغاء
          </button>
          <button
            onClick={() => onConfirm(backup)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
            style={{ 
              background: colors.gradientError,
              color: '#FFFFFF'
            }}
          >
            تأكيد الاستعادة
          </button>
        </div>
      </div>
    </div>
  )
}
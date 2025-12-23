'use client'

import { colors } from '@/components/shared/constants'

export default function PatientModal({ patient, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8" style={{ 
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`
      }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>إضافة مريض جديد</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surfaceLight transition-colors"
            style={{ color: colors.textLight }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal content will be added here */}
        
        <div className="flex gap-3 justify-end mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
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
            onClick={() => onSave(patient)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
            style={{ 
              background: colors.gradientSuccess,
              color: '#FFFFFF'
            }}
          >
            إنشاء المريض
          </button>
        </div>
      </div>
    </div>
  )
}
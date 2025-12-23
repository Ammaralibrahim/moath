'use client'

import { colors } from '@/components/shared/constants'
import { formatFileSize, formatDate } from '@/components/shared/utils'

export default function RestoreModal({ backup, onClose, onConfirm }) {
  if (!backup) return null

  const getTypeText = (type) => {
    switch(type) {
      case 'full': return 'كاملة'
      case 'patients': return 'مرضى'
      case 'appointments': return 'مواعيد'
      case 'partial': return 'جزئية'
      case 'restoration': return 'استعادة'
      default: return type
    }
  }

  const getTypeClass = (type) => {
    switch(type) {
      case 'full': return 'bg-indigo-500/20 text-indigo-400'
      case 'patients': return 'bg-emerald-500/20 text-emerald-400'
      case 'appointments': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

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
          <p className="text-sm mb-4" style={{ color: colors.textLight }}>
            هل أنت متأكد من استعادة النسخة الاحتياطية؟<br />
            سيتم حذف جميع البيانات الحالية واستبدالها بالنسخة المحفوظة.
          </p>
          
          {/* Backup Details */}
          <div className="bg-surfaceLight rounded-lg p-4 text-right" style={{ borderColor: colors.border }}>
            <div className="mb-2">
              <span className="text-sm font-medium" style={{ color: colors.textLight }}>اسم الملف:</span>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>{backup.filename}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sm font-medium" style={{ color: colors.textLight }}>النوع:</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium block mt-1 ${getTypeClass(backup.type)}`}>
                  {getTypeText(backup.type)}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium" style={{ color: colors.textLight }}>الحجم:</span>
                <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                  {formatFileSize(backup.size)}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium" style={{ color: colors.textLight }}>عدد السجلات:</span>
                <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                  {backup.recordCount}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium" style={{ color: colors.textLight }}>تاريخ الإنشاء:</span>
                <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                  {formatDate(backup.backupDate)}
                </p>
              </div>
            </div>
          </div>
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
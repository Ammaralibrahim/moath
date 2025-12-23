'use client'

import { colors } from '@/components/shared/constants'
import { formatFileSize, formatDate } from '@/components/shared/utils'

export default function BackupTable({ backups, pagination, onPageChange, onDownload, onRestore, onDelete }) {
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
      case 'partial': return 'bg-blue-500/20 text-blue-400'
      case 'restoration': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'success': return 'bg-emerald-500/20 text-emerald-400'
      case 'failed': return 'bg-rose-500/20 text-rose-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'success': return 'ناجحة'
      case 'failed': return 'فشلت'
      case 'pending': return 'قيد الانتظار'
      default: return status
    }
  }

  if (backups.length === 0) {
    return (
      <div className="rounded-2xl border overflow-hidden shadow-xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
            background: colors.gradientPrimary,
            opacity: 0.1
          }}>
            <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-lg font-bold mb-2" style={{ color: colors.text }}>لا توجد نسخ احتياطية</div>
          <p className="font-medium" style={{ color: colors.textLight }}>لم يتم إنشاء أي نسخ احتياطية بعد</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border overflow-hidden shadow-xl">
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>النسخ الاحتياطية السابقة</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead style={{ backgroundColor: colors.surfaceLight }}>
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>اسم الملف</th>
                <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>النوع</th>
                <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الحجم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>تاريخ الإنشاء</th>
                <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border }}>
              {backups.map((backup) => (
                <tr key={backup._id}>
                  <td className="px-6 py-3">
                    <div className="text-sm font-semibold" style={{ color: colors.text }}>{backup.filename}</div>
                    <div className="text-xs" style={{ color: colors.textLight }}>
                      {backup.recordCount} سجل
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeClass(backup.type)}`}>
                      {getTypeText(backup.type)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-sm" style={{ color: colors.text }}>
                      {formatFileSize(backup.size)}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-sm" style={{ color: colors.text }}>
                      {formatDate(backup.backupDate)}
                    </div>
                    <div className="text-xs" style={{ color: colors.textLight }}>
                      {new Date(backup.backupDate).toLocaleTimeString('ar-EG')}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusClass(backup.status)}`}>
                      {getStatusText(backup.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDownload(backup._id, backup.filename)}
                        disabled={backup.status !== 'success'}
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          background: colors.gradientInfo,
                          color: '#FFFFFF'
                        }}
                      >
                        تحميل
                      </button>
                      <button
                        onClick={() => onRestore(backup)}
                        disabled={backup.status !== 'success'}
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          background: colors.gradientSuccess,
                          color: '#FFFFFF'
                        }}
                      >
                        استعادة
                      </button>
                      <button
                        onClick={() => onDelete(backup._id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                        style={{ 
                          background: colors.gradientError,
                          color: '#FFFFFF'
                        }}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                style={{ 
                  borderColor: colors.borderLight,
                  color: colors.textLight,
                  backgroundColor: colors.surfaceLight
                }}
              >
                السابق
              </button>
              <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                الصفحة {pagination.page} من {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                style={{ 
                  borderColor: colors.borderLight,
                  color: colors.textLight,
                  backgroundColor: colors.surfaceLight
                }}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
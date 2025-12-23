'use client'

import { colors } from '@/components/shared/constants'
import { formatFileSize, formatDate } from '@/components/shared/utils'

export default function BackupTable({ backups, pagination, onPageChange }) {
  const handleDownload = (backupId, filename) => {
    console.log('Download backup:', backupId, filename)
  }

  const handleRestore = (backupId) => {
    console.log('Restore backup:', backupId)
  }

  const handleDelete = (backupId) => {
    console.log('Delete backup:', backupId)
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
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      backup.type === 'full' 
                        ? 'bg-indigo-500/20 text-indigo-400' 
                        : backup.type === 'patients'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {backup.type === 'full' ? 'كاملة' : backup.type === 'patients' ? 'مرضى' : 'مواعيد'}
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
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      backup.status === 'success' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : backup.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {backup.status === 'success' ? 'ناجحة' : backup.status === 'failed' ? 'فشلت' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(backup._id, backup.filename)}
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                        style={{ 
                          background: colors.gradientInfo,
                          color: '#FFFFFF'
                        }}
                      >
                        تحميل
                      </button>
                      <button
                        onClick={() => handleRestore(backup._id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                        style={{ 
                          background: colors.gradientSuccess,
                          color: '#FFFFFF'
                        }}
                      >
                        استعادة
                      </button>
                      <button
                        onClick={() => handleDelete(backup._id)}
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
'use client'

import { colors } from '@/components/shared/constants'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  IconDatabase,
  IconFolder,
  IconArrowDownTray,
  IconArrowPath,
  IconTrash,
  IconClock,
  IconServer,
  IconCheckCircle,
  IconExclamationTriangle
} from '@/components/shared/icons'

export default function PremiumBackupList({ 
  backups, 
  pagination, 
  onDelete, 
  onDownload, 
  onRestore, 
  onPageChange 
}) {
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeText = (type) => {
    switch (type) {
      case 'full': return 'كامل'
      case 'patients': return 'المرضى'
      case 'appointments': return 'المواعيد'
      case 'automatic': return 'تلقائي'
      default: return type
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'full': return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
      case 'patients': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30'
      case 'appointments': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
      case 'automatic': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30'
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <IconCheckCircle className="w-5 h-5 text-green-500" />
      case 'failed': return <IconExclamationTriangle className="w-5 h-5 text-red-500" />
      case 'pending': return <IconClock className="w-5 h-5 text-yellow-500" />
      case 'restored': return <IconArrowPath className="w-5 h-5 text-blue-500" />
      default: return <IconDatabase className="w-5 h-5 text-gray-500" />
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      onPageChange(newPage)
    }
  }

  if (!backups || backups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: `2px solid ${colors.border}`
        }}>
          <IconDatabase className="w-12 h-12" style={{ color: colors.primary }} />
        </div>
        <div className="text-xl font-bold mb-3" style={{ color: colors.text }}>لا توجد نسخ احتياطية</div>
        <p className="font-medium mb-6" style={{ color: colors.textLight }}>ابدأ بحماية بياناتك من خلال إنشاء نسخة احتياطية أولى</p>
        <div className="w-64 h-1 mx-auto rounded-full opacity-50" style={{ 
          background: colors.gradientPrimary 
        }}></div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead style={{ 
            backgroundColor: colors.surfaceLight,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
          }}>
            <tr>
              <th className="px-6 py-5 text-right text-sm font-bold tracking-wider uppercase" style={{ color: colors.textLight, letterSpacing: '0.05em' }}>
                <div className="flex items-center gap-2">
                  <IconFolder className="w-5 h-5" />
                  الملف
                </div>
              </th>
              <th className="px-6 py-5 text-right text-sm font-bold tracking-wider uppercase" style={{ color: colors.textLight, letterSpacing: '0.05em' }}>
                <div className="flex items-center gap-2">
                  <IconDatabase className="w-5 h-5" />
                  النوع
                </div>
              </th>
              <th className="px-6 py-5 text-right text-sm font-bold tracking-wider uppercase" style={{ color: colors.textLight, letterSpacing: '0.05em' }}>
                <div className="flex items-center gap-2">
                  <IconCheckCircle className="w-5 h-5" />
                  الحالة
                </div>
              </th>
              <th className="px-6 py-5 text-right text-sm font-bold tracking-wider uppercase" style={{ color: colors.textLight, letterSpacing: '0.05em' }}>
                <div className="flex items-center gap-2">
                  <IconClock className="w-5 h-5" />
                  التاريخ
                </div>
              </th>
              <th className="px-6 py-5 text-right text-sm font-bold tracking-wider uppercase" style={{ color: colors.textLight, letterSpacing: '0.05em' }}>
                <div className="flex items-center gap-2">
                  <IconServer className="w-5 h-5" />
                  الحجم
                </div>
              </th>
              <th className="px-6 py-5 text-right text-sm font-bold tracking-wider uppercase" style={{ color: colors.textLight, letterSpacing: '0.05em' }}>
                <div className="flex items-center gap-2">
                  <IconArrowPath className="w-5 h-5" />
                  الإجراءات
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup, index) => (
              <tr 
                key={backup._id} 
                className={`group hover:scale-[1.002] transition-all duration-300 hover:shadow-2xl ${
                  index % 2 === 0 ? 'bg-surface/50' : 'bg-surfaceLight/50'
                }`}
                style={{
                  borderBottom: `1px solid ${colors.border}`
                }}
              >
                {/* اسم الملف */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500" style={{ 
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                      border: `1px solid ${colors.border}`
                    }}>
                      <IconFolder className="w-6 h-6" style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1 group-hover:text-blue-300 transition-colors" style={{ color: colors.text }}>
                        {backup.filename || 'غير معروف'}
                      </div>
                      <div className="text-xs flex items-center gap-2" style={{ color: colors.textLight }}>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ 
                          backgroundColor: colors.surface,
                          color: colors.textMuted
                        }}>
                          ID: {backup._id?.substring(0, 8) || 'N/A'}...
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* النوع */}
                <td className="px-6 py-5">
                  <div className={`px-4 py-2 rounded-xl text-xs font-bold text-center ${getTypeColor(backup.type)}`}>
                    {getTypeText(backup.type)}
                    {backup.type === 'automatic' && (
                      <div className="text-[10px] mt-1 opacity-75 flex items-center justify-center gap-1">
                        <IconClock className="w-3 h-3" />
                        تلقائي
                      </div>
                    )}
                  </div>
                </td>
                
                {/* الحالة */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div>
                      {getStatusIcon(backup.status)}
                    </div>
                    <div>
                      <StatusBadge status={backup.status} />
                      {backup.status === 'success' && backup.metadata && (
                        <div className="text-xs mt-1" style={{ color: colors.textLight }}>
                          {backup.metadata?.patients || 0} مريض • {backup.metadata?.appointments || 0} موعد
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                {/* التاريخ */}
                <td className="px-6 py-5">
                  <div className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
                    {backup.createdAt ? new Date(backup.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'غير معروف'}
                  </div>
                  <div className="text-xs flex items-center gap-1" style={{ color: colors.textLight }}>
                    <IconClock className="w-3 h-3" />
                    {backup.createdAt ? new Date(backup.createdAt).toLocaleTimeString('ar-EG', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    }) : 'غير معروف'}
                  </div>
                </td>
                
                {/* الحجم */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
                        border: `1px solid ${colors.border}`
                      }}>
                        <IconServer className="w-6 h-6" style={{ color: colors.info }} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                        background: colors.gradientInfo,
                        color: '#FFFFFF'
                      }}>
                        {formatBytes(backup.size).split(' ')[1]?.charAt(0) || 'B'}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: colors.text }}>
                        {formatBytes(backup.size)}
                      </div>
                      <div className="text-xs" style={{ color: colors.textLight }}>
                        حجم مضغوط
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* الإجراءات */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {/* تحميل */}
                    <button
                      onClick={() => onDownload(backup)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group/download"
                      style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}
                      title="تحميل النسخة الاحتياطية"
                    >
                      <IconArrowDownTray className="w-4 h-4 group-hover/download:animate-bounce" />
                      تحميل
                    </button>
                    
                    {/* استعادة */}
                    <button
                      onClick={() => onRestore(backup)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group/restore"
                      style={{ 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                      title="استعادة من هذه النسخة"
                    >
                      <IconArrowPath className="w-4 h-4 group-hover/restore:rotate-180 transition-transform" />
                      استعادة
                    </button>
                    
                    {/* حذف */}
                    <button
                      onClick={() => onDelete(backup._id)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group/delete"
                      style={{ 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                      }}
                      title="حذف النسخة الاحتياطية"
                    >
                      <IconTrash className="w-4 h-4 group-hover/delete:animate-pulse" />
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Premium Pagination */}
      {pagination.pages > 1 && (
        <div className="p-6 border-t border-b flex items-center justify-between" style={{ 
          borderColor: colors.border,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
        }}>
          <div className="text-sm flex items-center gap-2" style={{ color: colors.textLight }}>
            <span className="px-3 py-1.5 rounded-lg" style={{ 
              backgroundColor: colors.surface,
              color: colors.text
            }}>
              الصفحة <span className="font-bold">{pagination.page}</span> من <span className="font-bold">{pagination.pages}</span>
            </span>
            <span className="hidden md:inline">
              • عرض <span className="font-bold">{((pagination.page - 1) * pagination.limit) + 1}</span> إلى <span className="font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> من أصل <span className="font-bold">{pagination.total}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{ 
                background: pagination.page === 1 ? colors.surfaceLight : colors.gradientPrimary,
                color: pagination.page === 1 ? colors.textLight : '#FFFFFF',
                border: pagination.page === 1 ? `1px solid ${colors.border}` : 'none',
                boxShadow: pagination.page === 1 ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              السابق
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = []
                const maxVisible = 5
                
                if (pagination.pages <= maxVisible) {
                  for (let i = 1; i <= pagination.pages; i++) {
                    pages.push(i)
                  }
                } else {
                  if (pagination.page <= 3) {
                    for (let i = 1; i <= 4; i++) pages.push(i)
                    pages.push('...')
                    pages.push(pagination.pages)
                  } else if (pagination.page >= pagination.pages - 2) {
                    pages.push(1)
                    pages.push('...')
                    for (let i = pagination.pages - 3; i <= pagination.pages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    pages.push('...')
                    pages.push(pagination.page - 1)
                    pages.push(pagination.page)
                    pages.push(pagination.page + 1)
                    pages.push('...')
                    pages.push(pagination.pages)
                  }
                }
                
                return pages.map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`dots-${idx}`} className="px-2" style={{ color: colors.textLight }}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all hover:scale-110 ${
                        pageNum === pagination.page 
                          ? 'shadow-lg scale-110' 
                          : 'hover:opacity-90'
                      }`}
                      style={
                        pageNum === pagination.page 
                          ? {
                              background: colors.gradientPrimary,
                              color: '#FFFFFF',
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                            }
                          : {
                              border: `1px solid ${colors.border}`,
                              color: colors.text,
                              backgroundColor: colors.surfaceLight
                            }
                      }
                    >
                      {pageNum}
                    </button>
                  )
                ))
              })()}
            </div>
            
            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{ 
                background: pagination.page === pagination.pages ? colors.surfaceLight : colors.gradientPrimary,
                color: pagination.page === pagination.pages ? colors.textLight : '#FFFFFF',
                border: pagination.page === pagination.pages ? `1px solid ${colors.border}` : 'none',
                boxShadow: pagination.page === pagination.pages ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              التالي
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
// @/components/ui/StatusBadge.jsx
'use client'

import { memo } from 'react'

const StatusBadge = memo(({ status }) => {
  const statusConfig = {
    confirmed: {
      text: 'مؤكد',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    pending: {
      text: 'قيد الانتظار',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    cancelled: {
      text: 'ملغى',
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    success: {
      text: 'ناجح',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    active: {
      text: 'نشط',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    failed: {
      text: 'فشل',
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    error: {
      text: 'خطأ',
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    restored: {
      text: 'تم الاستعادة',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }
  }

  const config = statusConfig[status] || {
    text: status || 'غير محدد',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-60"></span>
      {config.text}
    </span>
  )
})

StatusBadge.displayName = 'StatusBadge'

export default StatusBadge
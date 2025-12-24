'use client'

import { colors } from '@/components/shared/constants'

export default function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'success':
      case 'confirmed':
      case 'active':
        return {
          text: status === 'success' ? 'ناجح' : status === 'confirmed' ? 'مؤكد' : 'نشط',
          bgColor: 'bg-emerald-500/20',
          textColor: 'text-emerald-400',
          dotColor: 'bg-emerald-500'
        }
      case 'pending':
        return {
          text: 'قيد الانتظار',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400',
          dotColor: 'bg-yellow-500'
        }
      case 'failed':
      case 'cancelled':
      case 'error':
        return {
          text: status === 'failed' ? 'فشل' : status === 'cancelled' ? 'ملغي' : 'خطأ',
          bgColor: 'bg-rose-500/20',
          textColor: 'text-rose-400',
          dotColor: 'bg-rose-500'
        }
      case 'restored':
        return {
          text: 'تم الاستعادة',
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-400',
          dotColor: 'bg-blue-500'
        }
      default:
        return {
          text: status,
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          dotColor: 'bg-gray-500'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></div>
      {config.text}
    </div>
  )
}
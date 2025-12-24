'use client'

import { colors } from '@/components/shared/constants'
import { 
  IconHeart, 
  IconDatabase, 
  IconChartBar, 
  IconClock,
  IconShieldCheck 
} from '@/components/shared/icons'

export default function PremiumBackupStats({ stats }) {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getHealthColor = (percent) => {
    if (percent >= 80) return '#10B981'
    if (percent >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const calculateHealth = () => {
    if (!stats.total) return 100
    return Math.round((stats.successful / stats.total) * 100)
  }

  const health = calculateHealth()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Health Card */}
      <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
        border: `1px solid ${colors.border}`
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: colors.textLight }}>صحة النظام</div>
            <IconHeart className="w-8 h-8" style={{ color: getHealthColor(health) }} />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold mb-1" style={{ color: getHealthColor(health) }}>
                {health}%
              </div>
              <div className="text-xs" style={{ color: colors.textLight }}>
                {health >= 80 ? 'ممتاز' : health >= 60 ? 'جيد' : 'يحتاج اهتمام'}
              </div>
            </div>
            <div className="w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={getHealthColor(health)}
                  strokeWidth="3"
                  strokeDasharray={`${health}, 100`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Total Backups Card */}
      <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        border: `1px solid ${colors.border}`
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: colors.textLight }}>إجمالي النسخ</div>
            <IconDatabase className="w-8 h-8" style={{ color: colors.primary }} />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>
            {stats.total}
          </div>
          <div className="text-xs" style={{ color: colors.textLight }}>
            {stats.successful} ناجحة
          </div>
        </div>
      </div>

      {/* Total Size Card */}
      <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
        border: `1px solid ${colors.border}`
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: colors.textLight }}>الحجم الإجمالي</div>
            <IconChartBar className="w-8 h-8" style={{ color: colors.info }} />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: colors.info }}>
            {formatBytes(stats.totalSize)}
          </div>
          <div className="text-xs" style={{ color: colors.textLight }}>
            متوفرة في {stats.typeStats?.length || 0} نوع
          </div>
        </div>
      </div>

      {/* Last Backup Card */}
      <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
        border: `1px solid ${colors.border}`
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: colors.textLight }}>آخر نسخة</div>
            <IconClock className="w-8 h-8" style={{ color: colors.purple || colors.primary }} />
          </div>
          {stats.recent && stats.recent[0] ? (
            <>
              <div className="text-lg font-bold mb-1 truncate" style={{ color: colors.text }}>
                {new Date(stats.recent[0].createdAt).toLocaleDateString('ar-EG')}
              </div>
              <div className="text-xs flex items-center justify-between" style={{ color: colors.textLight }}>
                <span className="truncate max-w-[120px]">{stats.recent[0].filename}</span>
                <span className="font-semibold">{formatBytes(stats.recent[0].size)}</span>
              </div>
            </>
          ) : (
            <div className="text-lg font-bold" style={{ color: colors.textLight }}>
              لا توجد نسخ
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
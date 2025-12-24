// @/components/shared/StatsPanel.js
'use client'

import { colors, arabicText } from '@/components/shared/constants'

export default function StatsPanel({ stats }) {
  if (!stats) return null

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(1)}%`
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDiskUsage = () => {
    if (!stats.diskUsage) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(stats.diskUsage) / Math.log(k))
    return parseFloat((stats.diskUsage / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDiskUsagePercentage = () => {
    if (!stats.diskUsage) return 0
    const maxSize = 1024 * 1024 * 1024 // 1GB
    return Math.min((stats.diskUsage / maxSize) * 100, 100)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">




      {/* Disk Usage */}
      <div className="rounded-2xl p-6 border hover-glow transition-all duration-300" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl font-bold" style={{ color: colors.info }}>
            {formatDiskUsage()}
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
            backgroundColor: `${colors.info}20`
          }}>
            <svg className="w-6 h-6" style={{ color: colors.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="text-sm font-medium" style={{ color: colors.textLight }}>
          استخدام التخزين
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${getDiskUsagePercentage()}%`,
              background: colors.gradientInfo
            }}
          />
        </div>
      </div>


    </div>
  )
}
'use client'

import { colors } from '@/components/shared/constants'

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: 'إجمالي المواعيد',
      value: stats.totalAppointments,
      color: colors.primary,
      gradient: colors.gradientPrimary,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      title: 'إجمالي المرضى',
      value: stats.totalPatients,
      color: colors.success,
      gradient: colors.gradientSuccess,
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      title: 'مواعيد اليوم',
      value: stats.today,
      color: colors.warning,
      gradient: colors.gradientWarning,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      title: 'مواعيد ملغاة',
      value: stats.cancelled,
      color: colors.error,
      gradient: colors.gradientError,
      icon: 'M6 18L18 6M6 6l12 12'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="p-6 rounded-2xl border shadow-xl backdrop-blur-sm" style={{ 
          borderColor: colors.border,
          backgroundColor: colors.surface,
          backgroundImage: `linear-gradient(135deg, ${card.color}05 0%, ${card.color}02 100%)`
        }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
              <div className="text-sm font-medium mt-1" style={{ color: colors.textLight }}>{card.title}</div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
              background: card.gradient
            }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
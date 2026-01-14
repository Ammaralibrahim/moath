// @/components/dashboard/StatsCards.jsx
'use client'

import { memo } from 'react'

const StatsCards = memo(({ stats }) => {
  const cards = [
    {
      title: 'إجمالي المواعيد',
      value: stats.totalAppointments || 0,
      color: '#667eea',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'إجمالي المرضى',
      value: stats.totalPatients || 0,
      color: '#10b981',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      title: 'مواعيد اليوم',
      value: stats.today || 0,
      color: '#f59e0b',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'مواعيد ملغاة',
      value: stats.cancelled || 0,
      color: '#ef4444',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-gradient-to-br from-gray-900/40 to-gray-900/20 backdrop-blur-sm rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-100 tracking-tight">
                {card.value.toLocaleString('ar-EG')}
              </div>
              <div className="text-sm text-gray-400 mt-1">{card.title}</div>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: `${card.color}15`,
                color: card.color
              }}
            >
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((card.value / 100) * 100, 100)}%`,
                  backgroundColor: card.color
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

StatsCards.displayName = 'StatsCards'

export default StatsCards
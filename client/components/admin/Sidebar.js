'use client'

import { colors } from '@/components/shared/constants'

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, stats }) {
  const menuItems = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'appointments', name: 'المواعيد', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'patients', name: 'المرضى', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' },
    { id: 'reports', name: 'التقارير', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'system', name: 'النظام', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-30
        w-72
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:shadow-none h-screen lg:h-auto
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
      `} style={{ 
        backgroundColor: colors.surface,
        borderLeft: `1px solid ${colors.border}`
      }}>
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>القائمة الرئيسية</h2>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
                activeTab === item.id
                  ? 'font-semibold shadow-lg transform scale-[1.02]'
                  : 'font-medium hover:bg-surfaceLight'
              }`}
              style={{ 
                background: activeTab === item.id ? colors.gradientPrimary : 'transparent',
                color: activeTab === item.id ? '#FFFFFF' : colors.textLight
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
        
        {/* Quick Stats */}
        <div className="p-4 mt-8">
          <div className="text-sm font-semibold mb-4" style={{ color: colors.textLight }}>ملخص سريع</div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl border" style={{ 
              borderColor: colors.border,
              backgroundColor: colors.surfaceLight
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: colors.text }}>المواعيد</span>
                <span className="font-bold text-lg" style={{ color: colors.primary }}>{stats.totalAppointments}</span>
              </div>
              <div className="text-xs" style={{ color: colors.textMuted }}>إجمالي المواعيد</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ 
              borderColor: colors.border,
              backgroundColor: colors.surfaceLight
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: colors.text }}>المرضى</span>
                <span className="font-bold text-lg" style={{ color: colors.success }}>{stats.totalPatients}</span>
              </div>
              <div className="text-xs" style={{ color: colors.textMuted }}>إجمالي المرضى</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ 
              borderColor: colors.border,
              backgroundColor: colors.surfaceLight
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: colors.text }}>اليوم</span>
                <span className="font-bold text-lg" style={{ color: colors.warning }}>{stats.today}</span>
              </div>
              <div className="text-xs" style={{ color: colors.textMuted }}>مواعيد اليوم</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
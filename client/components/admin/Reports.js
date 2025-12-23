'use client'

import { colors } from '@/components/shared/constants'

export default function Reports({ stats }) {
  const handleExportAppointments = () => {
    console.log('Export appointments')
  }

  const handleExportPatients = () => {
    console.log('Export patients')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6 shadow-xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>التقارير والإحصائيات</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Options */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>توليد التقارير</h4>
            <div className="space-y-4">
              <button className="w-full p-4 border rounded-xl hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group" style={{ 
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceLight,
                backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
              }}>
                <div>
                  <div className="font-semibold mb-1" style={{ color: colors.text }}>تقرير المواعيد اليومية</div>
                  <div className="text-sm" style={{ color: colors.textMuted }}>تقرير مفصل بجميع مواعيد اليوم</div>
                </div>
                <svg className="w-5 h-5 group-hover:text-indigo-400 transition-colors" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button
                onClick={handleExportAppointments}
                className="w-full p-4 border rounded-xl hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceLight,
                  backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                }}
              >
                <div>
                  <div className="font-semibold mb-1" style={{ color: colors.text }}>تصدير جميع المواعيد</div>
                  <div className="text-sm" style={{ color: colors.textMuted }}>تصدير جميع المواعيد بتنسيق CSV</div>
                </div>
                <svg className="w-5 h-5 group-hover:text-emerald-400 transition-colors" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button
                onClick={handleExportPatients}
                className="w-full p-4 border rounded-xl hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceLight,
                  backgroundImage: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                }}
              >
                <div>
                  <div className="font-semibold mb-1" style={{ color: colors.text }}>تصدير بيانات المرضى</div>
                  <div className="text-sm" style={{ color: colors.textMuted }}>تصدير جميع بيانات المرضى</div>
                </div>
                <svg className="w-5 h-5 group-hover:text-rose-400 transition-colors" style={{ color: colors.error }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Statistics Summary */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>ملخص الإحصائيات</h4>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border" style={{ 
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>إجمالي المواعيد</div>
                    <div className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>{stats.totalAppointments}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                    background: colors.gradientPrimary
                  }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border" style={{ 
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>إجمالي المرضى</div>
                    <div className="text-2xl font-bold mt-1" style={{ color: colors.success }}>{stats.totalPatients}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                    background: colors.gradientSuccess
                  }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border" style={{ 
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>مواعيد اليوم</div>
                    <div className="text-2xl font-bold mt-1" style={{ color: colors.warning }}>{stats.today}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                    background: colors.gradientWarning
                  }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
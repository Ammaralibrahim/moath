'use client'

import { colors } from '@/components/shared/constants'
import { useState } from 'react'

export default function Header({ activeTab, sidebarOpen, setSidebarOpen }) {
  const [viewMode, setViewMode] = useState('table')

  return (
    <header style={{ 
      background: colors.gradientPrimary,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      borderBottom: `1px solid ${colors.border}`
    }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-black/10 transition-colors lg:hidden"
              style={{ color: '#FFFFFF' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">لوحة التحكم المتقدمة</h1>
                <p className="text-sm font-medium text-white/90">مركز الصواف للتصوير الشعاعي - إدارة شامل</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-white/80">عرض:</span>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                جدول
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                تقويم
              </button>
            </div>
            <button
              onClick={() => {
                // Export functionality
                console.log('Export clicked')
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 hover:opacity-90 shadow-lg"
              style={{ 
                background: colors.gradientSuccess,
                color: '#FFFFFF'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              تصدير البيانات
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
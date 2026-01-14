// @/components/layout/Header.jsx
'use client'

import { memo, useState, useCallback } from 'react'

const Header = memo(({ activeTab, sidebarOpen, setSidebarOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const tabNames = {
    dashboard: "لوحة التحكم",
    appointments: "المواعيد",
    patients: "المرضى",
    reports: "التقارير",
    system: "النظام",
    backup: "النسخ الاحتياطي"
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 to-gray-900/95 backdrop-blur-xl border-b border-gray-800">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Menu toggle and title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-100 leading-tight">
                  مركز الصواف للتصوير الشعاعي
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {tabNames[activeTab] || "لوحة التحكم"}
                </p>
              </div>
            </div>
          </div>

          {/* Right side: Actions and user menu */}
          <div className="flex items-center gap-3">
            {/* User menu */}
            <div className="relative">
              <button
                onClick={handleMenuToggle}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">م</span>
                </div>
                <div className="hidden lg:block text-right">
                  <div className="text-sm font-medium text-gray-100">المدير العام</div>
                  <div className="text-xs text-gray-400">مركز الصواف</div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-40 py-2">
                    <button className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 text-right transition-colors">
                      الإعدادات
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 text-right transition-colors">
                      الملف الشخصي
                    </button>
                    <div className="border-t border-gray-800 my-2"></div>
                    <button className="w-full px-4 py-2 text-sm text-rose-400 hover:bg-gray-800 text-right transition-colors">
                      تسجيل الخروج
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header
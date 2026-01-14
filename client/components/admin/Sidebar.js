// @/components/layout/Sidebar.jsx
"use client";

import { memo, useCallback } from "react";

const Sidebar = memo(({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  stats,
}) => {
  const menuItems = [
    {
      id: "dashboard",
      name: "لوحة التحكم",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "appointments",
      name: "المواعيد",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: "patients",
      name: "المرضى",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "reports",
      name: "التقارير",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: "system",
      name: "النظام",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
    },
    {
      id: "backup",
      name: "النسخ الاحتياطي",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
  ];

  const handleItemClick = useCallback((id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  }, [setActiveTab, setSidebarOpen]);

  const statItems = [
    {
      label: "المواعيد",
      value: stats?.totalAppointments || 0,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      description: "إجمالي المواعيد"
    },
    {
      label: "المرضى",
      value: stats?.totalPatients || 0,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      description: "إجمالي المرضى"
    },
    {
      label: "اليوم",
      value: stats?.today || 0,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      description: "مواعيد اليوم"
    },
    {
      label: "النسخ الاحتياطي",
      value: stats?.backupCount || 0,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      description: "النسخ النشطة"
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 right-0 z-50
          w-64 lg:w-56 xl:w-64
          transform transition-all duration-300 ease-out
          h-screen overflow-y-auto
          bg-gray-900/95 backdrop-blur-xl border-l border-gray-800
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">القائمة الرئيسية</h2>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl
                text-right transition-all duration-200
                ${activeTab === item.id
                  ? "bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-800/50 hover:text-gray-100"
                }
              `}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${activeTab === item.id 
                  ? "bg-white/20" 
                  : "bg-gray-800/50"
                }
              `}>
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 mt-6 border-t border-gray-800/50">
          <div className="text-sm font-medium text-gray-400 mb-4">ملخص سريع</div>
          <div className="space-y-3">
            {statItems.map((stat, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border border-gray-800/50 ${stat.bgColor} transition-all hover:border-gray-700/50`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300 font-medium">
                    {stat.label}
                  </span>
                  <span className={`text-lg font-bold ${stat.color}`}>
                    {stat.value.toLocaleString('ar-EG')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
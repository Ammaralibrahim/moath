'use client'

import { colors } from '@/components/shared/constants'

export default function Filters({ filters, onFilterChange, onApplyFilters }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    onFilterChange({ ...filters, [name]: value })
  }

  const handleClearFilters = () => {
    onFilterChange({
      date: '',
      status: '',
      patientName: '',
      phoneNumber: '',
      showPast: false
    })
  }

  return (
    <div className="rounded-2xl border p-6 shadow-xl" style={{ 
      borderColor: colors.border,
      backgroundColor: colors.surface
    }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>تصفية المواعيد</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>اسم المريض</label>
          <input
            type="text"
            name="patientName"
            value={filters.patientName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="ابحث بالاسم..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>رقم الهاتف</label>
          <input
            type="text"
            name="phoneNumber"
            value={filters.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="ابحث بالهاتف..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>حالة الموعد</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>تاريخ الموعد</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
          />
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ 
            borderColor: colors.borderLight,
            color: colors.textLight,
            backgroundColor: colors.surfaceLight
          }}
        >
          مسح الفلاتر
        </button>
        <button
          onClick={() => onFilterChange({ ...filters, showPast: !filters.showPast })}
          className={`px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity ${
            filters.showPast ? 'active' : ''
          }`}
          style={{ 
            borderColor: filters.showPast ? colors.primary : colors.borderLight,
            color: filters.showPast ? colors.primary : colors.textLight,
            backgroundColor: filters.showPast ? `${colors.primary}15` : colors.surfaceLight
          }}
        >
          {filters.showPast ? 'إخفاء المنتهية' : 'عرض المنتهية'}
        </button>
        <button
          onClick={onApplyFilters}
          className="px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ 
            background: colors.gradientPrimary,
            color: '#FFFFFF'
          }}
        >
          تطبيق الفلاتر
        </button>
      </div>
    </div>
  )
}
// @/components/appointments/Filters.jsx
'use client'

import { useState, useCallback, memo } from 'react'

const Filters = memo(({ filters, onFilterChange, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = useCallback((key, value) => {
    const updatedFilters = { ...localFilters, [key]: value }
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }, [localFilters, onFilterChange])

  const handleApply = useCallback(() => {
    onApplyFilters()
  }, [onApplyFilters])

  const handleReset = useCallback(() => {
    const resetFilters = {
      date: '',
      status: '',
      patientName: '',
      phoneNumber: '',
      showPast: false
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
    onApplyFilters()
  }, [onFilterChange, onApplyFilters])

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100">فلاتر البحث</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
          >
            إعادة الضبط
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            تطبيق
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">التاريخ</label>
          <input
            type="date"
            value={localFilters.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">حالة الموعد</label>
          <select
            value={localFilters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        
        {/* Patient Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">اسم المريض</label>
          <input
            type="text"
            value={localFilters.patientName}
            onChange={(e) => handleChange('patientName', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="بحث باسم المريض"
          />
        </div>
        
        {/* Phone Number Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف</label>
          <input
            type="text"
            value={localFilters.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="بحث برقم الهاتف"
          />
        </div>
      </div>
      
      {/* Toggle for past appointments */}
      <div className="flex items-center">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="showPast"
              checked={localFilters.showPast}
              onChange={(e) => handleChange('showPast', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${localFilters.showPast ? 'bg-blue-500' : 'bg-gray-700'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${localFilters.showPast ? 'transform translate-x-5' : ''}`}></div>
            </div>
          </div>
          <span className="text-sm text-gray-300 mr-3">عرض المواعيد الماضية</span>
        </label>
      </div>
    </div>
  )
})

Filters.displayName = 'Filters'

export default Filters
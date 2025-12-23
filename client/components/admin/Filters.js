'use client'

import { useState } from 'react'
import { colors } from '@/components/shared/constants'

export default function Filters({ filters, onFilterChange, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value }
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleApply = () => {
    onApplyFilters()
  }

  const handleReset = () => {
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
  }

  return (
    <div className="rounded-2xl border p-6 shadow-xl" style={{ 
      borderColor: colors.border,
      backgroundColor: colors.surface
    }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>فلاتر البحث</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>التاريخ</label>
          <input
            type="date"
            value={localFilters.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>حالة الموعد</label>
          <select
            value={localFilters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
          >
            <option value="">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>اسم المريض</label>
          <input
            type="text"
            value={localFilters.patientName}
            onChange={(e) => handleChange('patientName', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="ابحث باسم المريض"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>رقم الهاتف</label>
          <input
            type="text"
            value={localFilters.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="ابحث برقم الهاتف"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPast"
            checked={localFilters.showPast}
            onChange={(e) => handleChange('showPast', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="showPast" className="text-sm font-medium" style={{ color: colors.textLight }}>
            عرض المواعيد الماضية
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ 
              borderColor: colors.borderLight,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            إعادة الضبط
          </button>
          <button
            onClick={handleApply}
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
    </div>
  )
}
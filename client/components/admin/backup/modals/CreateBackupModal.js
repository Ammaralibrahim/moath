'use client'

import { useState } from 'react'
import { colors } from '@/components/shared/constants'

export default function CreateBackupModal({ onClose, onCreate }) {
  const [type, setType] = useState('full')
  const [schedule, setSchedule] = useState('none')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onCreate({ type, schedule: schedule !== 'none' ? schedule : undefined })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: '1px'
      }}>
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>إنشاء نسخ احتياطي جديد</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
              نوع النسخ الاحتياطي
            </label>
            <div className="space-y-3">
              {[
                { value: 'full', label: 'نسخ احتياطي كامل', description: 'جميع البيانات (المرضى والمواعيد)' },
                { value: 'patients', label: 'المرضى فقط', description: 'بيانات المرضى فقط' },
                { value: 'appointments', label: 'المواعيد فقط', description: 'المواعيد فقط' },
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-3 p-4 rounded-lg cursor-pointer hover:opacity-90 transition-all" style={{ 
                  border: `1px solid ${type === option.value ? colors.primary : colors.border}`,
                  backgroundColor: type === option.value ? `${colors.primary}15` : colors.surfaceLight
                }}>
                  <input
                    type="radio"
                    name="backupType"
                    value={option.value}
                    checked={type === option.value}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: colors.text }}>{option.label}</div>
                    <div className="text-sm mt-1" style={{ color: colors.textLight }}>{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
              جدولة النسخ الاحتياطي
            </label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-sm"
              style={{ 
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceLight,
                color: colors.text
              }}
            >
              <option value="none">لا يوجد جدولة</option>
              <option value="daily">يومياً</option>
              <option value="weekly">أسبوعياً</option>
              <option value="monthly">شهرياً</option>
            </select>
          </div>

          <div className="text-sm p-3 rounded-lg" style={{ 
            backgroundColor: `${colors.info}15`,
            color: colors.info,
            border: `1px solid ${colors.info}30`
          }}>
            ℹ️ سيتم تشفير النسخ الاحتياطي وتخزينه بشكل آمن لمدة 30 يوم
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ 
                border: `1px solid ${colors.border}`,
                color: colors.textLight,
                backgroundColor: colors.surfaceLight
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: colors.gradientSuccess,
                color: '#FFFFFF'
              }}
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء النسخ الاحتياطي'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
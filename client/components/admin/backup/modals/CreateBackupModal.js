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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto my-8 flex flex-col" style={{ 
        minHeight: 'auto',
        maxHeight: '90vh'
      }}>
        <div className="rounded-2xl shadow-2xl flex flex-col flex-1" style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: '1px'
        }}>
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>إنشاء نسخ احتياطي جديد</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ 
                  backgroundColor: colors.surfaceLight,
                  color: colors.textLight
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Form Content - Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Backup Type */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <label className="text-sm font-semibold" style={{ color: colors.textLight }}>
                    نوع النسخ الاحتياطي
                  </label>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {[
                    { value: 'full', label: 'نسخ احتياطي كامل', description: 'جميع البيانات (المرضى والمواعيد)' },
                    { value: 'patients', label: 'المرضى فقط', description: 'بيانات المرضى فقط' },
                    { value: 'appointments', label: 'المواعيد فقط', description: 'المواعيد فقط' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      className="flex flex-col p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]" 
                      style={{ 
                        border: `2px solid ${type === option.value ? colors.primary : colors.border}`,
                        backgroundColor: type === option.value ? `${colors.primary}10` : colors.surfaceLight
                      }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="relative flex-shrink-0">
                          <input
                            type="radio"
                            name="backupType"
                            value={option.value}
                            checked={type === option.value}
                            onChange={(e) => setType(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === option.value ? 'border-' + colors.primary : 'border-gray-300'}`}>
                            {type === option.value && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base truncate" style={{ color: colors.text }}>{option.label}</div>
                          <div className="text-sm mt-1 line-clamp-2" style={{ color: colors.textLight }}>{option.description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.info }} />
                  <label className="text-sm font-semibold" style={{ color: colors.textLight }}>
                    جدولة النسخ الاحتياطي
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'none', label: 'لا يوجد جدولة', icon: '🚫' },
                    { value: 'daily', label: 'يومياً', icon: '📅' },
                    { value: 'weekly', label: 'أسبوعياً', icon: '📆' },
                    { value: 'monthly', label: 'شهرياً', icon: '🗓️' },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setSchedule(option.value)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${schedule === option.value ? 'ring-2 ring-offset-2' : ''}`}
                      style={{ 
                        border: `1px solid ${schedule === option.value ? colors.info : colors.border}`,
                        backgroundColor: schedule === option.value ? `${colors.info}10` : colors.surfaceLight
                      }}
                    >
                      <span className="text-2xl mb-2">{option.icon}</span>
                      <span className="text-sm font-medium" style={{ color: colors.text }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: `${colors.info}10`,
                border: `1px solid ${colors.info}30`
              }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                    backgroundColor: colors.info,
                    color: 'white'
                  }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: colors.info }}>معلومات هامة</div>
                    <div className="text-sm" style={{ color: colors.textLight }}>
                      سيتم تشفير النسخ الاحتياطي وتخزينه بشكل آمن لمدة 30 يوم. يمكنك استعادته في أي وقت خلال هذه الفترة.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer - Fixed at bottom */}
            <div className="p-6 border-t flex-shrink-0" style={{ borderColor: colors.border }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
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
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ 
                    background: colors.gradientSuccess,
                    color: '#FFFFFF'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      إنشاء النسخ الاحتياطي
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import toast from 'react-hot-toast'

export default function RestoreModal({ backup, onClose, onRestore }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState('preview')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (step === 'preview' && !preview && backup?._id) {
      fetchPreview()
    }
  }, [step, preview, backup])

  const fetchPreview = async () => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup/${backup._id}/restore`, {
        method: 'POST',
        body: JSON.stringify({ mode: 'preview' })
      })
      
      if (data.success) {
        setPreview(data.data)
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
      toast.error('فشل في تحميل معاينة النسخ الاحتياطي')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!confirmed) {
      setStep('warning')
      return
    }

    try {
      setLoading(true)
      setStep('restoring')
      const data = await apiRequest(`/api/backup/${backup._id}/restore`, {
        method: 'POST',
        body: JSON.stringify({ mode: 'restore' })
      })
      
      if (data.success) {
        toast.success('تم استعادة النسخ الاحتياطي بنجاح')
        onRestore()
        onClose()
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      toast.error('فشل في استعادة النسخ الاحتياطي')
      setStep('warning')
    } finally {
      setLoading(false)
    }
  }

  const renderPreview = () => (
    <div className="space-y-6">
      {/* Backup Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <div className="text-xs mb-1" style={{ color: colors.textLight }}>النوع</div>
          <div className="font-semibold text-sm" style={{ color: colors.text }}>
            {preview.type === 'full' ? 'كامل' : 
             preview.type === 'patients' ? 'المرضى فقط' : 'المواعيد فقط'}
          </div>
        </div>
        
        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <div className="text-xs mb-1" style={{ color: colors.textLight }}>تاريخ الإنشاء</div>
          <div className="font-semibold text-sm" style={{ color: colors.text }}>
            {new Date(preview.metadata.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <div className="text-xs mb-1" style={{ color: colors.textLight }}>عدد المرضى</div>
          <div className="font-semibold text-sm flex items-center gap-2" style={{ color: colors.success }}>
            <span>{preview.stats.patients}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <div className="text-xs mb-1" style={{ color: colors.textLight }}>عدد المواعيد</div>
          <div className="font-semibold text-sm flex items-center gap-2" style={{ color: colors.warning }}>
            <span>{preview.stats.appointments}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sample Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {preview.sample.patients.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.success }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.text }}>عينة من المرضى</h4>
            </div>
            <div className="space-y-2">
              {preview.sample.patients.map((patient, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:scale-[1.02] transition-all" style={{ 
                  backgroundColor: colors.surfaceLight,
                  border: `1px solid ${colors.border}`
                }}>
                  <div>
                    <div className="font-medium text-sm" style={{ color: colors.text }}>{patient.patientName}</div>
                    <div className="text-xs" style={{ color: colors.textLight }}>{patient.phoneNumber}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded" style={{ 
                    backgroundColor: colors.success + '20',
                    color: colors.success
                  }}>
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preview.sample.appointments && preview.sample.appointments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.warning }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.text }}>عينة من المواعيد</h4>
            </div>
            <div className="space-y-2">
              {preview.sample.appointments.map((appointment, idx) => (
                <div key={idx} className="p-3 rounded-lg hover:scale-[1.02] transition-all" style={{ 
                  backgroundColor: colors.surfaceLight,
                  border: `1px solid ${colors.border}`
                }}>
                  <div className="font-medium text-sm mb-1" style={{ color: colors.text }}>{appointment.patientName}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: colors.textLight }}>{appointment.appointmentDate}</span>
                    <span style={{ color: colors.textLight }}>{appointment.appointmentTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
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
          onClick={() => setStep('warning')}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{ 
            background: colors.gradientWarning,
            color: '#FFFFFF'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          متابعة للاستعادة
        </button>
      </div>
    </div>
  )

  const renderWarning = () => (
    <div className="space-y-6">
      <div className="text-center p-6 rounded-xl" style={{ 
        backgroundColor: colors.error + '10',
        border: `1px solid ${colors.error}30`
      }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
          background: colors.gradientError,
          color: '#FFFFFF'
        }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h4 className="text-lg font-bold mb-3" style={{ color: colors.error }}>تحذير هام!</h4>
        <div className="space-y-2">
          <p className="text-sm" style={{ color: colors.textLight }}>
            عملية الاستعادة ستحذف <span className="font-bold" style={{ color: colors.error }}>جميع البيانات الحالية</span> وتستبدلها بالبيانات القديمة.
          </p>
          <p className="text-sm font-bold" style={{ color: colors.error }}>
            هذا الإجراء لا يمكن التراجع عنه!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h5 className="font-semibold text-sm" style={{ color: colors.text }}>قبل المتابعة، تأكد من:</h5>
        
        <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-all" style={{ 
          border: `1px solid ${confirmed ? colors.success : colors.border}`,
          backgroundColor: confirmed ? colors.success + '10' : colors.surfaceLight
        }}>
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${confirmed ? 'border-' + colors.success : 'border-gray-300'}`}>
              {confirmed && (
                <svg className="w-3 h-3" style={{ color: colors.success }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <div className="font-medium text-sm mb-1" style={{ color: colors.text }}>أتفهم أن البيانات الحالية سيتم حذفها</div>
            <div className="text-xs" style={{ color: colors.textLight }}>جميع المرضى والمواعيد الحالية ستختفي</div>
          </div>
        </label>

        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: colors.warning + '10',
          border: `1px solid ${colors.warning}30`
        }}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm" style={{ color: colors.textLight }}>
              <span className="font-semibold">نصيحة:</span> يوصى بإنشاء نسخة احتياطية من البيانات الحالية قبل المتابعة.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => {
            setStep('preview')
            setConfirmed(false)
          }}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
          style={{ 
            border: `1px solid ${colors.border}`,
            color: colors.textLight,
            backgroundColor: colors.surfaceLight
          }}
        >
          رجوع
        </button>
        <button
          onClick={handleRestore}
          disabled={!confirmed}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ 
            background: colors.gradientError,
            color: '#FFFFFF'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          تأكيد والاستعادة
        </button>
      </div>
    </div>
  )

  const renderRestoring = () => (
    <div className="text-center py-8">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 border-4 border-t-transparent rounded-full animate-spin" style={{ 
          borderColor: `${colors.primary} transparent transparent transparent`
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 animate-pulse" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
      <div className="text-lg font-bold mb-2" style={{ color: colors.text }}>
        جاري استعادة النسخ الاحتياطي
      </div>
      <p className="text-sm max-w-md mx-auto" style={{ color: colors.textLight }}>
        يرجى الانتظار، هذه العملية قد تستغرق بضع دقائق حسب حجم البيانات. لا تغلق هذه النافذة.
      </p>
      <div className="mt-6 flex justify-center">
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto my-8">
        <div className="rounded-2xl shadow-2xl" style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: '1px'
        }}>
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                استعادة النسخ الاحتياطي
              </h3>
              <button
                onClick={onClose}
                disabled={loading || step === 'restoring'}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
          
          {/* Content */}
          <div className="p-6">
            {loading && !preview ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ 
                  borderColor: `${colors.primary} transparent transparent transparent`
                }} />
                <div className="text-sm" style={{ color: colors.textLight }}>
                  جاري تحميل معاينة النسخ الاحتياطي...
                </div>
              </div>
            ) : step === 'preview' && preview ? (
              renderPreview()
            ) : step === 'warning' ? (
              renderWarning()
            ) : step === 'restoring' ? (
              renderRestoring()
            ) : (
              <div className="py-12 text-center">
                <div className="text-sm" style={{ color: colors.textLight }}>
                  فشل في تحميل البيانات
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
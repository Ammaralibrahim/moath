'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function RestoreModal({ backup, onClose, onRestore }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState('preview') // preview, warning, restoring
  const [confirmed, setConfirmed] = useState(false)

  // useEffect ile fetchPreview'u çağır
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: '1px'
      }}>
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>
            استعادة النسخ الاحتياطي
          </h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="py-8">
              <LoadingSpinner />
            </div>
          ) : step === 'preview' && preview ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm" style={{ color: colors.textLight }}>النوع</div>
                    <div className="font-semibold" style={{ color: colors.text }}>
                      {preview.type === 'full' ? 'كامل' : 
                       preview.type === 'patients' ? 'المرضى' : 'المواعيد'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: colors.textLight }}>تاريخ الإنشاء</div>
                    <div className="font-semibold" style={{ color: colors.text }}>
                      {new Date(preview.metadata.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: colors.textLight }}>عدد المرضى</div>
                    <div className="font-semibold" style={{ color: colors.text }}>
                      {preview.stats.patients}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: colors.textLight }}>عدد المواعيد</div>
                    <div className="font-semibold" style={{ color: colors.text }}>
                      {preview.stats.appointments}
                    </div>
                  </div>
                </div>
              </div>

              {preview.sample.patients.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: colors.text }}>عينة من المرضى</h4>
                  <div className="space-y-2">
                    {preview.sample.patients.map((patient, idx) => (
                      <div key={idx} className="text-sm p-2 rounded" style={{ 
                        backgroundColor: colors.surfaceLight,
                        color: colors.textLight
                      }}>
                        {patient.patientName} • {patient.phoneNumber}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  onClick={() => setStep('warning')}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ 
                    background: colors.gradientWarning,
                    color: '#FFFFFF'
                  }}
                >
                  متابعة للاستعادة
                </button>
              </div>
            </div>
          ) : step === 'warning' ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                  background: colors.gradientError,
                  color: '#FFFFFF'
                }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold mb-2" style={{ color: colors.text }}>تحذير هام!</h4>
                <p className="mb-4" style={{ color: colors.textLight }}>
                  عملية الاستعادة ستحذف البيانات الحالية وتستبدلها بالبيانات القديمة.
                  <br />
                  <span className="font-bold text-red-400">هذا الإجراء لا يمكن التراجع عنه!</span>
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  <span style={{ color: colors.text }}>أتفهم أن البيانات الحالية سيتم حذفها</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                  />
                  <span style={{ color: colors.text }}>لدي نسخة احتياطية حديثة من البيانات الحالية</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('preview')}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
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
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: colors.gradientError,
                    color: '#FFFFFF'
                  }}
                >
                  تأكيد والاستعادة
                </button>
              </div>
            </div>
          ) : step === 'restoring' ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <div className="mt-4 text-lg font-bold" style={{ color: colors.text }}>
                جاري استعادة النسخ الاحتياطي
              </div>
              <p className="mt-2" style={{ color: colors.textLight }}>
                يرجى الانتظار، هذه العملية قد تستغرق بعض الوقت...
              </p>
            </div>
          ) : (
            <div className="py-8">
              <LoadingSpinner />
              <div className="mt-4 text-center" style={{ color: colors.text }}>
                جاري تحميل معاينة النسخ الاحتياطي...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
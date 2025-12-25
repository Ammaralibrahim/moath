'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/components/shared/constants'

export default function AppointmentModal({ appointment, patient, onClose, onSave }) {
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    status: 'pending'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment.patientName || '',
        phoneNumber: appointment.phoneNumber || '',
        appointmentDate: appointment.appointmentDate ? 
          new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
        appointmentTime: appointment.appointmentTime || '',
        notes: appointment.notes || '',
        status: appointment.status || 'pending'
      })
    } else if (patient) {
      // Eğer patient prop'u varsa (PatientViewModal'dan geldiyse), otomatik doldur
      setFormData(prev => ({
        ...prev,
        patientName: patient.patientName || '',
        phoneNumber: patient.phoneNumber || '',
        patientId: patient._id || null
      }))
    }
  }, [appointment, patient])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'اسم المريض مطلوب'
    } else if (formData.patientName.length < 2) {
      newErrors.patientName = 'اسم المريض يجب أن يكون على الأقل حرفين'
    } else if (formData.patientName.length > 100) {
      newErrors.patientName = 'اسم المريض يجب ألا يتجاوز 100 حرف'
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب'
    } else if (!/^[0-9+\-\s()]{10,20}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'يرجى إدخال رقم هاتف صالح'
    }
    
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'تاريخ الموعد مطلوب'
    } else if (new Date(formData.appointmentDate) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.appointmentDate = 'تاريخ الموعد لا يمكن أن يكون في الماضي'
    }
    
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'وقت الموعد مطلوب'
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.appointmentTime)) {
      newErrors.appointmentTime = 'يرجى إدخال تنسيق وقت صالح (HH:MM)'
    }
    
    if (formData.notes.length > 500) {
      newErrors.notes = 'الملاحظات يجب ألا تتجاوز 500 حرف'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length === 0) {
      const appointmentData = {
        ...formData,
        appointmentDate: new Date(formData.appointmentDate),
        patientId: appointment?.patientId || patient?._id || null,
        _id: appointment?._id || null
      }
      onSave(appointmentData)
    } else {
      setErrors(validationErrors)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[95vw] mx-auto my-4">
        <div className="rounded-2xl shadow-2xl max-h-[90vh] flex flex-col" style={{ 
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}>
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                  background: colors.gradientPrimary
                }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                    {appointment ? 'تعديل الموعد' : 'إضافة موعد جديد'}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                    {patient ? `للمريض: ${patient.patientName}` : (appointment ? 'تعديل بيانات الموعد الحالي' : 'أدخل معلومات الموعد الجديد')}
                  </p>
                </div>
              </div>
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
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Info (Auto-filled if from PatientViewModal) */}
                <div className="lg:col-span-2">
                  <div className="p-4 rounded-xl mb-6" style={{ 
                    backgroundColor: colors.surfaceLight,
                    border: `1px solid ${colors.border}`
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4" style={{ color: colors.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-semibold" style={{ color: colors.text }}>معلومات المريض</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textLight }}>اسم المريض</div>
                        <div className="text-sm font-semibold" style={{ color: colors.text }}>{formData.patientName}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textLight }}>رقم الهاتف</div>
                        <div className="text-sm font-semibold" style={{ color: colors.text }}>{formData.phoneNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date and Time */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    <span className="text-red-500">*</span> التاريخ
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${errors.appointmentDate ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                    style={{ 
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                  />
                  {errors.appointmentDate && (
                    <p className="text-red-500 text-xs mt-2">{errors.appointmentDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    <span className="text-red-500">*</span> الوقت
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${errors.appointmentTime ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                    style={{ 
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                  />
                  {errors.appointmentTime && (
                    <p className="text-red-500 text-xs mt-2">{errors.appointmentTime}</p>
                  )}
                </div>

                {/* Status */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    الحالة
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'pending', label: 'قيد الانتظار', color: colors.warning },
                      { value: 'confirmed', label: 'مؤكد', color: colors.success },
                      { value: 'cancelled', label: 'ملغي', color: colors.error },
                    ].map((option) => (
                      <label key={option.value} className="flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ 
                        border: `2px solid ${formData.status === option.value ? option.color : colors.border}`,
                        backgroundColor: formData.status === option.value ? option.color + '10' : colors.surfaceLight
                      }}>
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-sm font-medium mb-1" style={{ color: colors.text }}>{option.label}</div>
                        <div className={`w-8 h-2 rounded-full ${formData.status === option.value ? '' : 'opacity-50'}`} style={{ 
                          backgroundColor: option.color 
                        }} />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    ملاحظات
                  </label>
                  <div className="relative">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      maxLength="500"
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.notes ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                      style={{ 
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                      placeholder="ملاحظات إضافية (اختياري)"
                    />
                    <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded" style={{ 
                      backgroundColor: colors.surfaceLight,
                      color: formData.notes.length >= 480 ? colors.error : colors.textLight
                    }}>
                      {formData.notes.length}/500
                    </div>
                  </div>
                  {errors.notes && (
                    <p className="text-red-500 text-xs mt-2">{errors.notes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t" style={{ borderColor: colors.border }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                  style={{ 
                    border: `2px solid ${colors.border}`,
                    color: colors.textLight,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ 
                    background: colors.gradientPrimary,
                    color: '#FFFFFF'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {appointment ? 'حفظ التغييرات' : 'إضافة الموعد'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
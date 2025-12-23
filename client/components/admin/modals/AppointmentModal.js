'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/components/shared/constants'

export default function AppointmentModal({ appointment, onClose, onSave }) {
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
    }
  }, [appointment])

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
        patientId: appointment?.patientId || null,
        _id: appointment?._id || null
      }
      onSave(appointmentData)
    } else {
      setErrors(validationErrors)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="rounded-2xl max-w-md w-full p-6 shadow-2xl" style={{ 
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`
      }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>
            {appointment ? 'تعديل الموعد' : 'إضافة موعد جديد'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surfaceLight transition-colors"
            style={{ color: colors.textLight }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Hasta Adı */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                اسم المريض *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                  errors.patientName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="اسم المريض الكامل"
              />
              {errors.patientName && (
                <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>
              )}
            </div>

            {/* Telefon Numarası */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                  errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="05XXXXXXXXX"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Tarih ve Saat */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                  التاريخ *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                    errors.appointmentDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                />
                {errors.appointmentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.appointmentDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                  الوقت *
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                    errors.appointmentTime ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                />
                {errors.appointmentTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.appointmentTime}</p>
                )}
              </div>
            </div>

            {/* Durum */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                الحالة
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
              >
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            {/* Notlar */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                maxLength="500"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all resize-none ${
                  errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="ملاحظات إضافية (اختياري)"
              />
              <div className="text-right text-xs mt-1" style={{ color: colors.textLight }}>
                {formData.notes.length}/500 حرف
              </div>
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ 
                border: `1px solid ${colors.borderLight}`,
                color: colors.textLight,
                backgroundColor: colors.surfaceLight
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
              style={{ 
                background: colors.gradientPrimary,
                color: '#FFFFFF'
              }}
            >
              {appointment ? 'حفظ التغييرات' : 'إضافة الموعد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
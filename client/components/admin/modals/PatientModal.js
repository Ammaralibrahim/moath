'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/components/shared/constants'

export default function PatientModal({ patient, onClose, onSave }) {
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    birthDate: '',
    gender: 'male',
    address: '',
    email: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (patient) {
      setFormData({
        patientName: patient.patientName || '',
        phoneNumber: patient.phoneNumber || '',
        birthDate: patient.birthDate ? 
          new Date(patient.birthDate).toISOString().split('T')[0] : '',
        gender: patient.gender || 'male',
        address: patient.address || '',
        email: patient.email || '',
        emergencyContact: patient.emergencyContact || '',
        medicalHistory: patient.medicalHistory || '',
        allergies: patient.allergies || '',
        medications: patient.medications || '',
        notes: patient.notes || ''
      })
    }
  }, [patient])

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
      newErrors.patientName = 'Hasta adı gereklidir'
    } else if (formData.patientName.length < 2) {
      newErrors.patientName = 'Hasta adı en az 2 karakter olmalıdır'
    } else if (formData.patientName.length > 100) {
      newErrors.patientName = 'Hasta adı en fazla 100 karakter olabilir'
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefon numarası gereklidir'
    } else if (!/^[0-9+\-\s()]{10,20}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz'
    }
    
    if (formData.birthDate && new Date(formData.birthDate) > new Date()) {
      newErrors.birthDate = 'Doğum tarihi gelecekte olamaz'
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz'
    }
    
    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'Adres en fazla 500 karakter olabilir'
    }
    
    if (formData.medicalHistory && formData.medicalHistory.length > 2000) {
      newErrors.medicalHistory = 'Tıbbi geçmiş en fazla 2000 karakter olabilir'
    }
    
    if (formData.allergies && formData.allergies.length > 500) {
      newErrors.allergies = 'Alerjiler en fazla 500 karakter olabilir'
    }
    
    if (formData.medications && formData.medications.length > 500) {
      newErrors.medications = 'İlaçlar en fazla 500 karakter olabilir'
    }
    
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notlar en fazla 1000 karakter olabilir'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length === 0) {
      const patientData = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        _id: patient?._id || null
      }
      onSave(patientData)
    } else {
      setErrors(validationErrors)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8" style={{ 
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`
      }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>
            {patient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temel Bilgiler */}
            <div className="md:col-span-2">
              <h4 className="font-semibold mb-3" style={{ color: colors.text }}>المعلومات الأساسية</h4>
            </div>

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
                  errors.patientName ? 'border-red-500' : 'border-gray-300'
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
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
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

            {/* Doğum Tarihi */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                تاريخ الميلاد
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
              />
              {errors.birthDate && (
                <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
              )}
            </div>

            {/* Cinsiyet */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                الجنس
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="example@domain.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Acil Durum İletişim */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                جهة اتصال الطوارئ
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="رقم هاتف جهة اتصال الطوارئ"
              />
            </div>

            {/* Adres */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                العنوان
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                maxLength="500"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all resize-none ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="العنوان الكامل"
              />
              <div className="text-right text-xs mt-1" style={{ color: colors.textLight }}>
                {formData.address.length}/500 حرف
              </div>
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Tıbbi Bilgiler */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold mb-3" style={{ color: colors.text }}>المعلومات الطبية</h4>
            </div>

            {/* Tıbbi Geçmiş */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                التاريخ الطبي
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows="3"
                maxLength="2000"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all resize-none ${
                  errors.medicalHistory ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="التاريخ الطبي السابق للمريض"
              />
              <div className="text-right text-xs mt-1" style={{ color: colors.textLight }}>
                {formData.medicalHistory.length}/2000 حرف
              </div>
              {errors.medicalHistory && (
                <p className="text-red-500 text-xs mt-1">{errors.medicalHistory}</p>
              )}
            </div>

            {/* Alerjiler */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                الحساسية
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows="2"
                maxLength="500"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all resize-none ${
                  errors.allergies ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="الحساسية المعروفة للمريض"
              />
              <div className="text-right text-xs mt-1" style={{ color: colors.textLight }}>
                {formData.allergies.length}/500 حرف
              </div>
              {errors.allergies && (
                <p className="text-red-500 text-xs mt-1">{errors.allergies}</p>
              )}
            </div>

            {/* İlaçlar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                الأدوية الحالية
              </label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                rows="2"
                maxLength="500"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all resize-none ${
                  errors.medications ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="الأدوية التي يتناولها المريض حالياً"
              />
              <div className="text-right text-xs mt-1" style={{ color: colors.textLight }}>
                {formData.medications.length}/500 حرف
              </div>
              {errors.medications && (
                <p className="text-red-500 text-xs mt-1">{errors.medications}</p>
              )}
            </div>

            {/* Notlar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>
                ملاحظات إضافية
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                maxLength="1000"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 transition-all resize-none ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="ملاحظات إضافية عن المريض"
              />
              <div className="text-right text-xs mt-1" style={{ color: colors.textLight }}>
                {formData.notes.length}/1000 حرف
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
                background: colors.gradientSuccess,
                color: '#FFFFFF'
              }}
            >
              {patient ? 'تحديث البيانات' : 'إنشاء المريض'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
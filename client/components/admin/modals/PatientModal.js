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
    
    if (formData.birthDate && new Date(formData.birthDate) > new Date()) {
      newErrors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل'
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صالح'
    }
    
    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'العنوان يجب ألا يتجاوز 500 حرف'
    }
    
    if (formData.medicalHistory && formData.medicalHistory.length > 2000) {
      newErrors.medicalHistory = 'التاريخ الطبي يجب ألا يتجاوز 2000 حرف'
    }
    
    if (formData.allergies && formData.allergies.length > 500) {
      newErrors.allergies = 'الحساسية يجب ألا تتجاوز 500 حرف'
    }
    
    if (formData.medications && formData.medications.length > 500) {
      newErrors.medications = 'الأدوية يجب ألا تتجاوز 500 حرف'
    }
    
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'الملاحظات يجب ألا تتجاوز 1000 حرف'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[95vw] mx-auto my-4">
        <div className="rounded-2xl shadow-2xl max-h-[90vh] flex flex-col" style={{ 
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}>
          {/* Header - Fixed */}
          <div className="p-6 border-b flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                  background: colors.gradientSuccess
                }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                    {patient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                    {patient ? 'تحديث معلومات المريض الحالي' : 'أدخل معلومات المريض الجديد'}
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
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column - Personal Information */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-6 rounded-full" style={{ backgroundColor: colors.primary }} />
                      <h4 className="font-bold text-lg" style={{ color: colors.text }}>المعلومات الشخصية</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Patient Name */}
                      <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                          <span className="text-red-500">*</span> اسم المريض
                        </label>
                        <input
                          type="text"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handleChange}
                          className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${errors.patientName ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                          style={{ 
                            backgroundColor: colors.background,
                            color: colors.text
                          }}
                          placeholder="أدخل اسم المريض الكامل"
                        />
                        {errors.patientName && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.patientName}
                          </p>
                        )}
                      </div>

                      {/* Phone & Email Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                            <span className="text-red-500">*</span> رقم الهاتف
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                            style={{ 
                              backgroundColor: colors.background,
                              color: colors.text
                            }}
                            placeholder="05XXXXXXXXX"
                          />
                          {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                            البريد الإلكتروني
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                            style={{ 
                              backgroundColor: colors.background,
                              color: colors.text
                            }}
                            placeholder="example@domain.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Birth Date & Gender Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                            تاريخ الميلاد
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              name="birthDate"
                              value={formData.birthDate}
                              onChange={handleChange}
                              max={new Date().toISOString().split('T')[0]}
                              className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${errors.birthDate ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                              style={{ 
                                backgroundColor: colors.background,
                                color: colors.text
                              }}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: colors.textLight }}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          {errors.birthDate && (
                            <p className="text-red-500 text-sm mt-2">{errors.birthDate}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                            الجنس
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'male', label: 'ذكر', icon: '👨', color: colors.primary },
                              { value: 'female', label: 'أنثى', icon: '👩', color: colors.pink },
                            ].map((option) => (
                              <label 
                                key={option.value} 
                                className={`flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${formData.gender === option.value ? 'ring-2 ring-offset-2' : ''}`}
                                style={{ 
                                  border: `2px solid ${formData.gender === option.value ? option.color : colors.border}`,
                                  backgroundColor: formData.gender === option.value ? `${option.color}15` : colors.surfaceLight
                                }}
                              >
                                <input
                                  type="radio"
                                  name="gender"
                                  value={option.value}
                                  checked={formData.gender === option.value}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <span className="text-xl">{option.icon}</span>
                                <span className="text-sm font-semibold" style={{ color: colors.text }}>{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                          جهة اتصال الطوارئ
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          style={{ 
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text
                          }}
                          placeholder="رقم هاتف جهة اتصال الطوارئ"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                          العنوان
                        </label>
                        <div className="relative">
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            maxLength="500"
                            className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.address ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                            style={{ 
                              backgroundColor: colors.background,
                              color: colors.text
                            }}
                            placeholder="العنوان الكامل"
                          />
                          <div className="absolute bottom-4 right-4 text-sm px-3 py-1 rounded-lg" style={{ 
                            backgroundColor: colors.surface,
                            color: formData.address.length >= 480 ? colors.error : colors.textLight
                          }}>
                            {formData.address.length}/500
                          </div>
                        </div>
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-2">{errors.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Medical Information */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-6 rounded-full" style={{ backgroundColor: colors.info }} />
                      <h4 className="font-bold text-lg" style={{ color: colors.text }}>المعلومات الطبية</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Medical History */}
                      <div>
                        <label className="block text-sm font-semibold mb-3 flex items-center justify-between" style={{ color: colors.text }}>
                          <span>التاريخ الطبي</span>
                          <span className="text-xs font-normal" style={{ color: colors.textLight }}>
                            أمراض سابقة، عمليات، تاريخ عائلي
                          </span>
                        </label>
                        <div className="relative">
                          <textarea
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={handleChange}
                            rows="5"
                            maxLength="2000"
                            className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.medicalHistory ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                            style={{ 
                              backgroundColor: colors.background,
                              color: colors.text
                            }}
                            placeholder="أدخل التاريخ الطبي الكامل للمريض..."
                          />
                          <div className="absolute bottom-4 right-4 text-sm px-3 py-1 rounded-lg" style={{ 
                            backgroundColor: colors.surface,
                            color: formData.medicalHistory.length >= 1900 ? colors.error : colors.textLight
                          }}>
                            {formData.medicalHistory.length}/2000
                          </div>
                        </div>
                        {errors.medicalHistory && (
                          <p className="text-red-500 text-sm mt-2">{errors.medicalHistory}</p>
                        )}
                      </div>

                      {/* Allergies */}
                      <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                          الحساسية
                        </label>
                        <div className="relative">
                          <textarea
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            rows="3"
                            maxLength="500"
                            className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.allergies ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                            style={{ 
                              backgroundColor: colors.background,
                              color: colors.text
                            }}
                            placeholder="الحساسية المعروفة للمريض (أدوية، أطعمة، مواد أخرى)"
                          />
                          <div className="absolute bottom-4 right-4 text-sm px-3 py-1 rounded-lg" style={{ 
                            backgroundColor: colors.surface,
                            color: formData.allergies.length >= 480 ? colors.error : colors.textLight
                          }}>
                            {formData.allergies.length}/500
                          </div>
                        </div>
                        {errors.allergies && (
                          <p className="text-red-500 text-sm mt-2">{errors.allergies}</p>
                        )}
                      </div>

                      {/* Medications */}
                      <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                          الأدوية الحالية
                        </label>
                        <div className="relative">
                          <textarea
                            name="medications"
                            value={formData.medications}
                            onChange={handleChange}
                            rows="3"
                            maxLength="500"
                            className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.medications ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                            style={{ 
                              backgroundColor: colors.background,
                              color: colors.text
                            }}
                            placeholder="الأدوية التي يتناولها المريض حالياً (الجرعة، التكرار)"
                          />
                          <div className="absolute bottom-4 right-4 text-sm px-3 py-1 rounded-lg" style={{ 
                            backgroundColor: colors.surface,
                            color: formData.medications.length >= 480 ? colors.error : colors.textLight
                          }}>
                            {formData.medications.length}/500
                          </div>
                        </div>
                        {errors.medications && (
                          <p className="text-red-500 text-sm mt-2">{errors.medications}</p>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                          ملاحظات إضافية
                        </label>
                        <div className="relative">
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            maxLength="1000"
                            className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.notes ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                            style={{ 
                              backgroundColor: colors.background,
                              color: colors.text
                            }}
                            placeholder="ملاحظات إضافية عن المريض (عادات، سلوكيات، معلومات أخرى)"
                          />
                          <div className="absolute bottom-4 right-4 text-sm px-3 py-1 rounded-lg" style={{ 
                            backgroundColor: colors.surface,
                            color: formData.notes.length >= 950 ? colors.error : colors.textLight
                          }}>
                            {formData.notes.length}/1000
                          </div>
                        </div>
                        {errors.notes && (
                          <p className="text-red-500 text-sm mt-2">{errors.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 border-t flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ 
                  border: `2px solid ${colors.border}`,
                  color: colors.textLight,
                  backgroundColor: colors.surfaceLight
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                style={{ 
                  background: colors.gradientSuccess,
                  color: '#FFFFFF'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {patient ? 'تحديث البيانات' : 'إنشاء المريض'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
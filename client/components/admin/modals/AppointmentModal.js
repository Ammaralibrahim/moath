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
    diagnosis: '',
    prescription: '',
    doctorSuggestions: '',
    testResults: [],
    followUpDate: '',
    followUpNotes: '',
    status: 'pending'
  })
  const [errors, setErrors] = useState({})
  const [showTestSection, setShowTestSection] = useState(false)

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment.patientName || '',
        phoneNumber: appointment.phoneNumber || '',
        appointmentDate: appointment.appointmentDate ? 
          new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
        appointmentTime: appointment.appointmentTime || '',
        notes: appointment.notes || '',
        diagnosis: appointment.diagnosis || '',
        prescription: appointment.prescription || '',
        doctorSuggestions: appointment.doctorSuggestions || '',
        testResults: appointment.testResults || [],
        followUpDate: appointment.followUpDate ? 
          new Date(appointment.followUpDate).toISOString().split('T')[0] : '',
        followUpNotes: appointment.followUpNotes || '',
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

  const handleTestResultChange = (index, field, value) => {
    const updatedTests = [...formData.testResults]
    updatedTests[index] = { ...updatedTests[index], [field]: value }
    setFormData(prev => ({ ...prev, testResults: updatedTests }))
  }

  const addTestResult = () => {
    setFormData(prev => ({
      ...prev,
      testResults: [...prev.testResults, {
        testName: '',
        result: '',
        normalRange: '',
        unit: '',
        notes: ''
      }]
    }))
  }

  const removeTestResult = (index) => {
    const updatedTests = formData.testResults.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, testResults: updatedTests }))
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
    
    if (formData.doctorSuggestions && formData.doctorSuggestions.length > 2000) {
      newErrors.doctorSuggestions = 'التوصيات الطبية يجب ألا تتجاوز 2000 حرف'
    }
    
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'الملاحظات يجب ألا تتجاوز 500 حرف'
    }
    
    if (formData.diagnosis && formData.diagnosis.length > 1000) {
      newErrors.diagnosis = 'التشخيص يجب ألا يتجاوز 1000 حرف'
    }
    
    if (formData.prescription && formData.prescription.length > 2000) {
      newErrors.prescription = 'الوصفة الطبية يجب ألا تتجاوز 2000 حرف'
    }
    
    if (formData.followUpNotes && formData.followUpNotes.length > 500) {
      newErrors.followUpNotes = 'ملاحظات المتابعة يجب ألا تتجاوز 500 حرف'
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
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
        patientId: appointment?.patientId || patient?._id || null,
        _id: appointment?._id || null
      }
      onSave(appointmentData)
    } else {
      setErrors(validationErrors)
    }
  }

  const renderTestResultsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-base" style={{ color: colors.text }}>
          نتائج الفحوصات
        </h4>
        <button
          type="button"
          onClick={addTestResult}
          className="px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ 
            background: colors.gradientInfo,
            color: '#FFFFFF'
          }}
        >
          + إضافة فحص
        </button>
      </div>
      
      {formData.testResults.length === 0 ? (
        <div className="text-center py-6 rounded-lg" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px dashed ${colors.border}`
        }}>
          <p style={{ color: colors.textLight }}>لا توجد نتائج فحوصات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {formData.testResults.map((test, index) => (
            <div key={index} className="p-4 rounded-lg" style={{ 
              backgroundColor: colors.surfaceLight,
              border: `1px solid ${colors.border}`
            }}>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium" style={{ color: colors.text }}>
                  فحص #{index + 1}
                </h5>
                <button
                  type="button"
                  onClick={() => removeTestResult(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  حذف
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                    اسم الفحص
                  </label>
                  <input
                    type="text"
                    value={test.testName}
                    onChange={(e) => handleTestResultChange(index, 'testName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="اسم الفحص"
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                    النتيجة
                  </label>
                  <input
                    type="text"
                    value={test.result}
                    onChange={(e) => handleTestResultChange(index, 'result', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="النتيجة"
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                    المعدل الطبيعي
                  </label>
                  <input
                    type="text"
                    value={test.normalRange}
                    onChange={(e) => handleTestResultChange(index, 'normalRange', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="المعدل الطبيعي"
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                    الوحدة
                  </label>
                  <input
                    type="text"
                    value={test.unit}
                    onChange={(e) => handleTestResultChange(index, 'unit', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="الوحدة"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                    ملاحظات
                  </label>
                  <textarea
                    value={test.notes}
                    onChange={(e) => handleTestResultChange(index, 'notes', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="ملاحظات إضافية"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

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
              <div className="space-y-6">
                {/* Patient Info (Auto-filled if from PatientViewModal) */}
                <div>
                  <div className="p-4 rounded-xl mb-4" style={{ 
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    الحالة
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'pending', label: 'قيد الانتظار', color: colors.warning },
                      { value: 'confirmed', label: 'مؤكد', color: colors.success },
                      { value: 'completed', label: 'مكتمل', color: colors.info },
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

                {/* Medical Information */}
                {formData.status === 'completed' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        التشخيص
                      </label>
                      <textarea
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        rows="3"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.diagnosis ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                        style={{ 
                          backgroundColor: colors.background,
                          color: colors.text
                        }}
                        placeholder="تشخيص الطبيب"
                      />
                      {errors.diagnosis && (
                        <p className="text-red-500 text-xs mt-2">{errors.diagnosis}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        الوصفة الطبية
                      </label>
                      <textarea
                        name="prescription"
                        value={formData.prescription}
                        onChange={handleChange}
                        rows="4"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.prescription ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                        style={{ 
                          backgroundColor: colors.background,
                          color: colors.text
                        }}
                        placeholder="الوصفة الطبية"
                      />
                      {errors.prescription && (
                        <p className="text-red-500 text-xs mt-2">{errors.prescription}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        توصيات الطبيب
                      </label>
                      <textarea
                        name="doctorSuggestions"
                        value={formData.doctorSuggestions}
                        onChange={handleChange}
                        rows="4"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none ${errors.doctorSuggestions ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                        style={{ 
                          backgroundColor: colors.background,
                          color: colors.text
                        }}
                        placeholder="توصيات الطبيب للمريض"
                      />
                      {errors.doctorSuggestions && (
                        <p className="text-red-500 text-xs mt-2">{errors.doctorSuggestions}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold" style={{ color: colors.text }}>
                          نتائج الفحوصات
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowTestSection(!showTestSection)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {showTestSection ? 'إخفاء' : 'إظهار'}
                        </button>
                      </div>
                      {showTestSection && renderTestResultsSection()}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                          تاريخ المتابعة
                        </label>
                        <input
                          type="date"
                          name="followUpDate"
                          value={formData.followUpDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          style={{ 
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                          ملاحظات المتابعة
                        </label>
                        <input
                          type="text"
                          name="followUpNotes"
                          value={formData.followUpNotes}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${errors.followUpNotes ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
                          style={{ 
                            backgroundColor: colors.background,
                            color: colors.text
                          }}
                          placeholder="ملاحظات المتابعة"
                        />
                        {errors.followUpNotes && (
                          <p className="text-red-500 text-xs mt-2">{errors.followUpNotes}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                <div>
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
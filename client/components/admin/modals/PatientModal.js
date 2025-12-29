'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/components/shared/constants'

export default function PatientModal({ patient, onClose, onSave }) {
  const [formData, setFormData] = useState({
    // البيانات الديموغرافية
    patientName: '',
    birthDate: '',
    gender: 'male',
    address: '',
    phoneNumber: '',
    email: '',
    nationalAddress: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      buildingNumber: '',
      additionalNumber: ''
    },
    
    // معلومات التسجيل
    patientId: '',
    registrationDate: '',
    referralSources: [{
      doctorName: '',
      clinicName: '',
      referralDate: '',
      specialty: '',
      contactNumber: '',
      email: '',
      notes: ''
    }],
    
    // البيانات الطبية الأساسية
    medicalSummary: '',
    allergies: '',
    currentMedications: '',
    weight: '',
    height: '',
    
    // بيانات التأمين
    insurance: {
      companyName: '',
      policyNumber: '',
      coveragePercentage: '',
      expiryDate: '',
      isActive: true,
      notes: ''
    },
    
    // معلومات إضافية
    doctorSuggestions: '',
    bloodType: 'غير معروف',
    chronicDiseases: [],
    testResults: []
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState('demographic')

  useEffect(() => {
    if (patient) {
      setFormData({
        // البيانات الديموغرافية
        patientName: patient.patientName || '',
        birthDate: patient.birthDate ? 
          new Date(patient.birthDate).toISOString().split('T')[0] : '',
        gender: patient.gender || 'male',
        address: patient.address || '',
        phoneNumber: patient.phoneNumber || '',
        email: patient.email || '',
        nationalAddress: patient.nationalAddress || {
          street: '',
          city: '',
          district: '',
          postalCode: '',
          buildingNumber: '',
          additionalNumber: ''
        },
        
        // معلومات التسجيل
        patientId: patient.patientId || '',
        registrationDate: patient.registrationDate ? 
          new Date(patient.registrationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        referralSources: patient.referralSources?.length > 0 ? patient.referralSources : [{
          doctorName: '',
          clinicName: '',
          referralDate: '',
          specialty: '',
          contactNumber: '',
          email: '',
          notes: ''
        }],
        
        // البيانات الطبية الأساسية
        medicalSummary: patient.medicalSummary || '',
        allergies: patient.allergies || '',
        currentMedications: patient.currentMedications || '',
        weight: patient.weight || '',
        height: patient.height || '',
        
        // بيانات التأمين
        insurance: patient.insurance || {
          companyName: '',
          policyNumber: '',
          coveragePercentage: '',
          expiryDate: '',
          isActive: true,
          notes: ''
        },
        
        // معلومات إضافية
        doctorSuggestions: patient.doctorSuggestions || '',
        bloodType: patient.bloodType || 'غير معروف',
        chronicDiseases: patient.chronicDiseases || [],
        testResults: patient.testResults || []
      })
    } else {
      // توليد رقم ملف فريد للمريض الجديد
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      setFormData(prev => ({
        ...prev,
        patientId: `PAT-${year}-${randomNum}`,
        registrationDate: new Date().toISOString().split('T')[0]
      }))
    }
  }, [patient])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else if (name.includes('nationalAddress.')) {
      const [, field] = name.split('nationalAddress.')
      setFormData(prev => ({
        ...prev,
        nationalAddress: {
          ...prev.nationalAddress,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleReferralSourceChange = (index, field, value) => {
    const updatedSources = [...formData.referralSources]
    updatedSources[index] = { ...updatedSources[index], [field]: value }
    setFormData(prev => ({ ...prev, referralSources: updatedSources }))
  }

  const addReferralSource = () => {
    setFormData(prev => ({
      ...prev,
      referralSources: [...prev.referralSources, {
        doctorName: '',
        clinicName: '',
        referralDate: '',
        specialty: '',
        contactNumber: '',
        email: '',
        notes: ''
      }]
    }))
  }

  const removeReferralSource = (index) => {
    const updatedSources = formData.referralSources.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, referralSources: updatedSources }))
  }

  const handleChronicDiseaseChange = (index, field, value) => {
    const updatedDiseases = [...formData.chronicDiseases]
    updatedDiseases[index] = { ...updatedDiseases[index], [field]: value }
    setFormData(prev => ({ ...prev, chronicDiseases: updatedDiseases }))
  }

  const addChronicDisease = () => {
    setFormData(prev => ({
      ...prev,
      chronicDiseases: [...prev.chronicDiseases, {
        diseaseName: '',
        diagnosisDate: '',
        severity: 'متوسط',
        currentStatus: 'مستقر',
        notes: ''
      }]
    }))
  }

  const removeChronicDisease = (index) => {
    const updatedDiseases = formData.chronicDiseases.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, chronicDiseases: updatedDiseases }))
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
        testDate: new Date().toISOString().split('T')[0],
        result: '',
        normalRange: '',
        unit: '',
        labName: '',
        fileUrl: '',
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
    
    // التحقق من البيانات الديموغرافية
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'اسم المريض مطلوب'
    } else if (formData.patientName.length < 2) {
      newErrors.patientName = 'اسم المريض يجب أن يكون على الأقل حرفين'
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'تاريخ الميلاد مطلوب'
    } else if (new Date(formData.birthDate) > new Date()) {
      newErrors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب'
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب'
    } else if (!/^[0-9+\-\s()]{10,20}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'يرجى إدخال رقم هاتف صالح'
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صالح'
    }
    
    // التحقق من البيانات الطبية
    if (formData.weight && (formData.weight < 0 || formData.weight > 300)) {
      newErrors.weight = 'الوزن يجب أن يكون بين 0 و 300 كجم'
    }
    
    if (formData.height && (formData.height < 0 || formData.height > 250)) {
      newErrors.height = 'الطول يجب أن يكون بين 0 و 250 سم'
    }
    
    // التحقق من بيانات التأمين
    if (formData.insurance.coveragePercentage && 
        (formData.insurance.coveragePercentage < 0 || formData.insurance.coveragePercentage > 100)) {
      newErrors['insurance.coveragePercentage'] = 'نسبة التغطية يجب أن تكون بين 0 و 100'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    
    try {
      const patientData = {
        ...formData,
        birthDate: new Date(formData.birthDate),
        registrationDate: new Date(formData.registrationDate),
        referralSources: formData.referralSources.map(source => ({
          ...source,
          referralDate: source.referralDate ? new Date(source.referralDate) : new Date()
        })),
        insurance: {
          ...formData.insurance,
          expiryDate: formData.insurance.expiryDate ? new Date(formData.insurance.expiryDate) : null
        },
        chronicDiseases: formData.chronicDiseases.map(disease => ({
          ...disease,
          diagnosisDate: disease.diagnosisDate ? new Date(disease.diagnosisDate) : null
        })),
        testResults: formData.testResults.map(test => ({
          ...test,
          testDate: test.testDate ? new Date(test.testDate) : new Date()
        })),
        _id: patient?._id || null
      }
      
      await onSave(patientData)
    } catch (error) {
      console.error('Error saving patient:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderDemographicSection = () => (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg mb-4" style={{ color: colors.text }}>
        البيانات الديموغرافية
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الاسم الكامل */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            <span className="text-red-500">*</span> الاسم الكامل للمريض
          </label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors.patientName ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الاسم الكامل للمريض"
            disabled={isSubmitting}
          />
          {errors.patientName && (
            <p className="text-red-500 text-sm mt-2">{errors.patientName}</p>
          )}
        </div>

        {/* تاريخ الميلاد */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            <span className="text-red-500">*</span> تاريخ الميلاد
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors.birthDate ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            disabled={isSubmitting}
          />
          {errors.birthDate && (
            <p className="text-red-500 text-sm mt-2">{errors.birthDate}</p>
          )}
        </div>

        {/* الجنس */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            <span className="text-red-500">*</span> الجنس
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'male', label: 'ذكر', icon: '👨' },
              { value: 'female', label: 'أنثى', icon: '👩' },
            ].map((option) => (
              <label 
                key={option.value} 
                className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${formData.gender === option.value ? 'ring-2 ring-offset-2' : ''}`}
                style={{ 
                  border: `2px solid ${formData.gender === option.value ? colors.primary : colors.border}`,
                  backgroundColor: formData.gender === option.value ? `${colors.primary}15` : colors.surfaceLight
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <span>{option.icon}</span>
                <span className="text-sm font-medium" style={{ color: colors.text }}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* العنوان */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            <span className="text-red-500">*</span> العنوان
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors.address ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="العنوان الكامل"
            disabled={isSubmitting}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-2">{errors.address}</p>
          )}
        </div>

        {/* رقم الهاتف */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            <span className="text-red-500">*</span> رقم الهاتف
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="05XXXXXXXXX"
            disabled={isSubmitting}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>
          )}
        </div>

        {/* البريد الإلكتروني */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="example@domain.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
          )}
        </div>

        {/* العنوان الوطني */}
        <div className="lg:col-span-2">
          <h5 className="font-semibold mb-3" style={{ color: colors.text }}>العنوان الوطني (إن وجد)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textLight }}>الشارع</label>
              <input
                type="text"
                name="nationalAddress.street"
                value={formData.nationalAddress.street}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="اسم الشارع"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textLight }}>المدينة</label>
              <input
                type="text"
                name="nationalAddress.city"
                value={formData.nationalAddress.city}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="المدينة"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textLight }}>الحي</label>
              <input
                type="text"
                name="nationalAddress.district"
                value={formData.nationalAddress.district}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="اسم الحي"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textLight }}>الرمز البريدي</label>
              <input
                type="text"
                name="nationalAddress.postalCode"
                value={formData.nationalAddress.postalCode}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="الرمز البريدي"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textLight }}>رقم المبنى</label>
              <input
                type="text"
                name="nationalAddress.buildingNumber"
                value={formData.nationalAddress.buildingNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="رقم المبنى"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textLight }}>الرقم الإضافي</label>
              <input
                type="text"
                name="nationalAddress.additionalNumber"
                value={formData.nationalAddress.additionalNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="الرقم الإضافي"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRegistrationSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg" style={{ color: colors.text }}>
          معلومات التسجيل
        </h4>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رقم الملف الفريد */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            رقم الملف الفريد
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
              placeholder="سيتم توليد رقم تلقائياً"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => {
                const year = new Date().getFullYear();
                const randomNum = Math.floor(10000 + Math.random() * 90000);
                setFormData(prev => ({ ...prev, patientId: `PAT-${year}-${randomNum}` }))
              }}
              className="px-3 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ 
                background: colors.gradientInfo,
                color: '#FFFFFF'
              }}
            >
              توليد
            </button>
          </div>
        </div>

        {/* تاريخ التسجيل */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            تاريخ التسجيل
          </label>
          <input
            type="date"
            name="registrationDate"
            value={formData.registrationDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* مصادر الإحالة */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-semibold" style={{ color: colors.text }}>مصادر الإحالة</h5>
          <button
            type="button"
            onClick={addReferralSource}
            className="px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ 
              background: colors.gradientSuccess,
              color: '#FFFFFF'
            }}
          >
            + إضافة مصدر إحالة
          </button>
        </div>
        
        {formData.referralSources.map((source, index) => (
          <div key={index} className="p-4 rounded-lg mb-4" style={{ 
            backgroundColor: colors.surfaceLight,
            border: `1px solid ${colors.border}`
          }}>
            <div className="flex items-center justify-between mb-3">
              <h6 className="font-medium" style={{ color: colors.text }}>
                مصدر الإحالة #{index + 1}
              </h6>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeReferralSource(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  حذف
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                  اسم الطبيب
                </label>
                <input
                  type="text"
                  value={source.doctorName}
                  onChange={(e) => handleReferralSourceChange(index, 'doctorName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                  placeholder="اسم الطبيب المحيل"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                  اسم العيادة
                </label>
                <input
                  type="text"
                  value={source.clinicName}
                  onChange={(e) => handleReferralSourceChange(index, 'clinicName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                  placeholder="اسم العيادة"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                  تاريخ الإحالة
                </label>
                <input
                  type="date"
                  value={source.referralDate || ''}
                  onChange={(e) => handleReferralSourceChange(index, 'referralDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                  التخصص
                </label>
                <input
                  type="text"
                  value={source.specialty}
                  onChange={(e) => handleReferralSourceChange(index, 'specialty', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                  placeholder="تخصص الطبيب"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                  رقم الاتصال
                </label>
                <input
                  type="text"
                  value={source.contactNumber}
                  onChange={(e) => handleReferralSourceChange(index, 'contactNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                  placeholder="رقم اتصال الطبيب"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={source.email}
                  onChange={(e) => handleReferralSourceChange(index, 'email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                  placeholder="بريد الطبيب الإلكتروني"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                  ملاحظات
                </label>
                <textarea
                  value={source.notes}
                  onChange={(e) => handleReferralSourceChange(index, 'notes', e.target.value)}
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
    </div>
  )

  const renderMedicalSection = () => (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg mb-4" style={{ color: colors.text }}>
        البيانات الطبية الأساسية
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* التاريخ الطبي الموجز */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            التاريخ الطبي الموجز
          </label>
          <textarea
            name="medicalSummary"
            value={formData.medicalSummary}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="ملخص التاريخ الطبي للمريض"
            disabled={isSubmitting}
          />
        </div>

        {/* الحساسيات */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            الحساسيات
          </label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الحساسيات المعروفة للمريض"
            disabled={isSubmitting}
          />
        </div>

        {/* الأدوية الحالية */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            الأدوية الحالية
          </label>
          <textarea
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الأدوية التي يتناولها المريض حالياً"
            disabled={isSubmitting}
          />
        </div>

        {/* الوزن */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            الوزن (كجم)
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min="0"
            max="300"
            step="0.1"
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors.weight ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الوزن بالكيلوجرام"
            disabled={isSubmitting}
          />
          {errors.weight && (
            <p className="text-red-500 text-sm mt-2">{errors.weight}</p>
          )}
        </div>

        {/* الطول */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            الطول (سم)
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            min="0"
            max="250"
            step="0.1"
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors.height ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الطول بالسنتيمتر"
            disabled={isSubmitting}
          />
          {errors.height && (
            <p className="text-red-500 text-sm mt-2">{errors.height}</p>
          )}
        </div>

        {/* فصيلة الدم */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            فصيلة الدم
          </label>
          <select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            disabled={isSubmitting}
          >
            <option value="غير معروف">غير معروف</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* الأمراض المزمنة */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-semibold" style={{ color: colors.text }}>الأمراض المزمنة</h5>
          <button
            type="button"
            onClick={addChronicDisease}
            className="px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ 
              background: colors.gradientInfo,
              color: '#FFFFFF'
            }}
          >
            + إضافة مرض مزمن
          </button>
        </div>
        
        {formData.chronicDiseases.length === 0 ? (
          <div className="text-center py-6 rounded-lg" style={{ 
            backgroundColor: colors.surfaceLight,
            border: `1px dashed ${colors.border}`
          }}>
            <p style={{ color: colors.textLight }}>لا توجد أمراض مزمنة مسجلة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.chronicDiseases.map((disease, index) => (
              <div key={index} className="p-4 rounded-lg" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-medium" style={{ color: colors.text }}>
                    المرض #{index + 1}
                  </h6>
                  <button
                    type="button"
                    onClick={() => removeChronicDisease(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                      اسم المرض
                    </label>
                    <input
                      type="text"
                      value={disease.diseaseName}
                      onChange={(e) => handleChronicDiseaseChange(index, 'diseaseName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                      placeholder="اسم المرض"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                      تاريخ التشخيص
                    </label>
                    <input
                      type="date"
                      value={disease.diagnosisDate || ''}
                      onChange={(e) => handleChronicDiseaseChange(index, 'diagnosisDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                      الشدة
                    </label>
                    <select
                      value={disease.severity}
                      onChange={(e) => handleChronicDiseaseChange(index, 'severity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    >
                      <option value="خفيف">خفيف</option>
                      <option value="متوسط">متوسط</option>
                      <option value="شديد">شديد</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                      الحالة الحالية
                    </label>
                    <select
                      value={disease.currentStatus}
                      onChange={(e) => handleChronicDiseaseChange(index, 'currentStatus', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    >
                      <option value="نشط">نشط</option>
                      <option value="متحكم به">متحكم به</option>
                      <option value="مستقر">مستقر</option>
                      <option value="في تحسن">في تحسن</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                      ملاحظات
                    </label>
                    <textarea
                      value={disease.notes}
                      onChange={(e) => handleChronicDiseaseChange(index, 'notes', e.target.value)}
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
    </div>
  )

  const renderInsuranceSection = () => (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg mb-4" style={{ color: colors.text }}>
        بيانات التأمين
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* شركة التأمين */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            شركة التأمين
          </label>
          <input
            type="text"
            name="insurance.companyName"
            value={formData.insurance.companyName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="اسم شركة التأمين"
            disabled={isSubmitting}
          />
        </div>

        {/* رقم البوليصة */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            رقم البوليصة
          </label>
          <input
            type="text"
            name="insurance.policyNumber"
            value={formData.insurance.policyNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="رقم وثيقة التأمين"
            disabled={isSubmitting}
          />
        </div>

        {/* نسبة التغطية */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            نسبة التغطية (%)
          </label>
          <input
            type="number"
            name="insurance.coveragePercentage"
            value={formData.insurance.coveragePercentage}
            onChange={handleChange}
            min="0"
            max="100"
            step="1"
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${errors['insurance.coveragePercentage'] ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="نسبة التغطية"
            disabled={isSubmitting}
          />
          {errors['insurance.coveragePercentage'] && (
            <p className="text-red-500 text-sm mt-2">{errors['insurance.coveragePercentage']}</p>
          )}
        </div>

        {/* تاريخ انتهاء الصلاحية */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            تاريخ انتهاء الصلاحية
          </label>
          <input
            type="date"
            name="insurance.expiryDate"
            value={formData.insurance.expiryDate || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* حالة التأمين */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            حالة التأمين
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="insurance.isActive"
                checked={formData.insurance.isActive === true}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  insurance: { ...prev.insurance, isActive: true }
                }))}
                className="w-4 h-4"
              />
              <span style={{ color: colors.text }}>نشط</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="insurance.isActive"
                checked={formData.insurance.isActive === false}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  insurance: { ...prev.insurance, isActive: false }
                }))}
                className="w-4 h-4"
              />
              <span style={{ color: colors.text }}>غير نشط</span>
            </label>
          </div>
        </div>

        {/* ملاحظات التأمين */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            ملاحظات التأمين
          </label>
          <textarea
            name="insurance.notes"
            value={formData.insurance.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="ملاحظات إضافية عن التأمين"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  )

  const renderTestResultsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg" style={{ color: colors.text }}>
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
          <p style={{ color: colors.textLight }}>لا توجد نتائج فحوصات مسجلة</p>
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
                  className="text-red-500 hover:text-red-700"
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
                    تاريخ الفحص
                  </label>
                  <input
                    type="date"
                    value={test.testDate || ''}
                    onChange={(e) => handleTestResultChange(index, 'testDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
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
                
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                    اسم المختبر
                  </label>
                  <input
                    type="text"
                    value={test.labName}
                    onChange={(e) => handleTestResultChange(index, 'labName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="اسم المختبر"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1" style={{ color: colors.textLight }}>
                    رابط الملف (اختياري)
                  </label>
                  <input
                    type="text"
                    value={test.fileUrl}
                    onChange={(e) => handleTestResultChange(index, 'fileUrl', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="رابط الملف"
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

  const renderAdditionalSection = () => (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg mb-4" style={{ color: colors.text }}>
        معلومات إضافية
      </h4>
      
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
          توصيات الطبيب
        </label>
        <textarea
          name="doctorSuggestions"
          value={formData.doctorSuggestions}
          onChange={handleChange}
          rows="6"
          className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          style={{ 
            borderColor: colors.border,
            backgroundColor: colors.background,
            color: colors.text
          }}
          placeholder="توصيات الطبيب للمريض"
          disabled={isSubmitting}
        />
      </div>
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
                disabled={isSubmitting}
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

            {/* Sections Navigation */}
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {['demographic', 'registration', 'medical', 'insurance', 'tests', 'additional'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeSection === section ? '' : 'hover:opacity-80'}`}
                  style={{
                    backgroundColor: activeSection === section ? colors.primary : colors.surfaceLight,
                    color: activeSection === section ? '#FFFFFF' : colors.textLight
                  }}
                >
                  {section === 'demographic' && 'البيانات الديموغرافية'}
                  {section === 'registration' && 'معلومات التسجيل'}
                  {section === 'medical' && 'البيانات الطبية'}
                  {section === 'insurance' && 'بيانات التأمين'}
                  {section === 'tests' && 'الفحوصات'}
                  {section === 'additional' && 'إضافية'}
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeSection === 'demographic' && renderDemographicSection()}
              {activeSection === 'registration' && renderRegistrationSection()}
              {activeSection === 'medical' && renderMedicalSection()}
              {activeSection === 'insurance' && renderInsuranceSection()}
              {activeSection === 'tests' && renderTestResultsSection()}
              {activeSection === 'additional' && renderAdditionalSection()}
            </div>

            {/* Footer */}
            <div className="p-6 border-t" style={{ borderColor: colors.border }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: colors.gradientSuccess,
                    color: '#FFFFFF'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {patient ? 'تحديث البيانات' : 'إنشاء المريض'}
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
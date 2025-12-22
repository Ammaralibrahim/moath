'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import axios from 'axios'
import { Cairo } from 'next/font/google'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Types
interface ClinicInfo {
  name: string;
  description: string;
  logoText: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  workingHours: {
    weekdays: string;
    weekend: string;
    friday: string;
  };
}

interface AvailableDate {
  date: string;
  available: boolean;
  availableSlots: number;
}

interface FormData {
  patientName: string;
  phoneNumber: string;
  notes: string;
}

interface Message {
  type: 'success' | 'error' | '';
  text: string;
}

interface DateStatus {
  status: 'past' | 'unavailable' | 'full' | 'available';
  text: string;
}

interface ArabicDate {
  day: string;
  dayNumber: number;
  month: string;
  year: number;
}

// Clinic Information - Damascus Medical Imaging Center
const CLINIC_INFO: ClinicInfo = {
  name: 'مؤسسة الصواف للتصوير الطبي',
  description: 'مركز متخصص في التصوير الطبي بالدماغ والأعصاب، الباطنة، العظام، النسائية وغيرها',
  logoText: 'الصواف',
  address: 'برج دمشق، ساحة المرجة، دمشق، سوريا',
  phone: '+963 11 231 2685',
  emergencyPhone: '+963 11 231 2685',
  workingHours: {
    weekdays: '8:00 صباحاً - 7:00 مساءً (الاثنين - الخميس)',
    weekend: '8:00 صباحاً - 7:00 مساءً (السبت - الأحد)',
    friday: 'مغلق'
  }
}

interface Colors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

export default function Home() {
  const [step, setStep] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    phoneNumber: '',
    notes: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<Message>({ type: '', text: '' })
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])

  // Modern & Simple Color Palette
  const colors: Colors = {
    primary: '#0EA5E9',     // Modern Sky Blue
    primaryLight: '#F0F9FF', // Very Light Blue
    secondary: '#6366F1',   // Indigo
    accent: '#10B981',      // Emerald Green
    background: '#FFFFFF',
    surface: '#F8FAFC',     // Light Gray-Blue
    text: '#1E293B',        // Dark Blue-Gray
    textLight: '#64748B',   // Slate
    border: '#E2E8F0',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
  }

  // Arabic Date Formatting
  const arabicDays: string[] = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const arabicMonths: string[] = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 60)

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const getArabicDate = (date: Date): ArabicDate => {
    const day = arabicDays[date.getDay()]
    const dayNumber = date.getDate()
    const month = arabicMonths[date.getMonth()]
    const year = date.getFullYear()
    return { day, dayNumber, month, year }
  }

  // Fetch available dates from API
  const fetchAvailableDates = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await axios.get<{ success: boolean; data: AvailableDate[]; message?: string }>(
        `${API_BASE_URL}/api/available-dates`
      )
      if (response.data.success) {
        setAvailableDates(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch dates')
      }
    } catch (error) {
      console.error('خطأ في جلب التواريخ:', error)
      // Fallback dates
      const dates: AvailableDate[] = []
      const currentDate = new Date(today)
      
      while (currentDate <= maxDate) {
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek !== 5) { // Exclude Fridays
          dates.push({
            date: formatDate(new Date(currentDate)),
            available: true,
            availableSlots: 8
          })
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      setAvailableDates(dates)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableDates()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: string): Promise<void> => {
    try {
      setLoading(true)
      const response = await axios.get<{ success: boolean; data: string[]; message?: string }>(
        `${API_BASE_URL}/api/available-slots?date=${date}`
      )
      if (response.data.success) {
        setAvailableSlots(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch slots')
      }
    } catch (error) {
      console.error('خطأ في جلب الأوقات:', error)
      // Fallback time slots (align with working hours)
      const fallbackTimes = [
        '08:00', '09:00', '10:00', '11:00', 
        '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00'
      ]
      setAvailableSlots(fallbackTimes)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: string): void => {
    setSelectedDate(date)
    setSelectedTime('')
    setStep(2)
    setMessage({ type: '', text: '' })
  }

  const handleTimeSelect = (time: string): void => {
    setSelectedTime(time)
    setStep(3)
    setMessage({ type: '', text: '' })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.patientName.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم المريض' })
      return false
    }
    
    if (!formData.phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال رقم الهاتف' })
      return false
    }

    const phoneRegex = /^[0-9+\-\s()]{10,20}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setMessage({ type: 'error', text: 'رقم الهاتف غير صحيح' })
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const appointmentData = {
        patientName: formData.patientName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        notes: formData.notes.trim(),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime
      }
      
      const response = await axios.post<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/api/appointments`, 
        appointmentData, 
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'تم حجز الموعد بنجاح! سنتصل بك لتأكيد الحجز.' 
        })
        setStep(4)
        fetchAvailableDates()
      } else {
        throw new Error(response.data.message || 'فشل في حجز الموعد')
      }
    } catch (error) {
      console.error('خطأ في الحجز:', error)
      
      let errorMessage = 'حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.'
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage
        } else if (error.request) {
          errorMessage = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = (): void => {
    setStep(1)
    setSelectedDate('')
    setSelectedTime('')
    setFormData({
      patientName: '',
      phoneNumber: '',
      notes: ''
    })
    setMessage({ type: '', text: '' })
    fetchAvailableDates()
  }

  const getDateStatus = (dateObj: Date): DateStatus => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (dateObj < today) {
      return { status: 'past', text: 'منتهي' }
    }
    
    const availableDate = availableDates.find(d => d.date === formatDate(dateObj))
    if (!availableDate || !availableDate.available) {
      return { status: 'unavailable', text: 'غير متاح' }
    }
    
    if (availableDate.availableSlots === 0) {
      return { status: 'full', text: 'مكتمل' }
    }
    
    return { status: 'available', text: 'متاح' }
  }

  return (
    <div dir="rtl" className={`min-h-screen ${cairo.className}`} style={{ backgroundColor: colors.background }}>
      {/* Modern Simplified Header */}
      <header style={{ 
        backgroundColor: colors.background, 
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Clinic Logo */}
              <div style={{ 
                backgroundColor: colors.primary,
                background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
              }} className="w-10 h-10 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{CLINIC_INFO.logoText}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: colors.text }}>{CLINIC_INFO.name}</h1>
                <p className="text-xs" style={{ color: colors.primary }}>{CLINIC_INFO.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>الاثنين - الخميس: 8 ص - 7 م</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Progress Indicator - Modern Design */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-3">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step >= stepNumber 
                      ? 'text-white shadow-lg' 
                      : 'border-2'
                  }`}
                  style={{ 
                    backgroundColor: step >= stepNumber ? colors.primary : 'transparent',
                    borderColor: step < stepNumber ? colors.border : 'transparent',
                    color: step < stepNumber ? colors.textLight : 'white'
                  }}
                >
                  {step > stepNumber ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-semibold text-sm sm:text-base">{stepNumber}</span>
                  )}
                </div>
                {stepNumber < 4 && (
                  <div 
                    className="w-8 sm:w-16 h-0.5 mx-1 sm:mx-2"
                    style={{ 
                      backgroundColor: step > stepNumber ? colors.primary : colors.border 
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-center">
            <span style={{ 
              color: step >= 1 ? colors.text : colors.textLight,
              fontWeight: step >= 1 ? '600' : '400'
            }}>التاريخ</span>
            <span style={{ 
              color: step >= 2 ? colors.text : colors.textLight,
              fontWeight: step >= 2 ? '600' : '400'
            }}>الوقت</span>
            <span style={{ 
              color: step >= 3 ? colors.text : colors.textLight,
              fontWeight: step >= 3 ? '600' : '400'
            }}>المعلومات</span>
            <span style={{ 
              color: step >= 4 ? colors.text : colors.textLight,
              fontWeight: step >= 4 ? '600' : '400'
            }}>التأكيد</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div style={{ 
          backgroundColor: colors.surface,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          marginBottom: '32px'
        }}>
          {/* Alert Message */}
          {message.text && (
            <div 
              className={`mb-6 p-3 rounded-lg flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={message.type === 'success' 
                      ? "M5 13l4 4L19 7" 
                      : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    } 
                  />
                </svg>
              </div>
              <span className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </span>
            </div>
          )}

          {/* Step 1: Date Selection - Modern Grid */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: colors.text }}>اختر تاريخ الموعد</h2>
                <p className="text-sm sm:text-base" style={{ color: colors.textLight }}>التواريخ المتاحة خلال 60 يوم</p>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
                  <p className="mt-3 text-sm" style={{ color: colors.textLight }}>جاري تحميل التواريخ...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {availableDates.slice(0, 30).map((dateInfo, index) => {
                    const dateObj = new Date(dateInfo.date)
                    const arabicDate = getArabicDate(dateObj)
                    const status = getDateStatus(dateObj)
                    const isToday = dateObj.toDateString() === new Date().toDateString()
                    
                    return (
                      <button
                        key={index}
                        onClick={() => status.status === 'available' && handleDateSelect(dateInfo.date)}
                        disabled={status.status !== 'available'}
                        className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                          status.status === 'available'
                            ? 'hover:shadow-md cursor-pointer border-gray-200 hover:border-blue-400 hover:shadow-blue-50'
                            : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                        } ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                        style={{
                          borderColor: status.status === 'available' ? colors.border : '#EDF2F7',
                          backgroundColor: status.status === 'available' ? colors.background : '#F7FAFC'
                        }}
                      >
                        <div className="text-xs font-medium mb-1" style={{ 
                          color: status.status === 'available' ? colors.textLight : colors.textLight
                        }}>
                          {arabicDate.day}
                        </div>
                        <div className={`text-lg font-bold mb-1 ${
                          isToday ? 'text-blue-600' : ''
                        }`} style={{ 
                          color: status.status === 'available' ? colors.text : colors.textLight
                        }}>
                          {arabicDate.dayNumber}
                        </div>
                        <div className="text-xs" style={{ 
                          color: status.status === 'available' ? colors.textLight : colors.textLight
                        }}>
                          {arabicDate.month}
                        </div>
                        <div className={`text-xs font-semibold mt-2 px-2 py-1 rounded-full ${
                          status.status === 'available' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {status.text}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time Selection - Modern Layout */}
          {step === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  style={{ color: colors.primary }}
                >
                  <svg className="w-3 h-3 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  رجوع
                </button>
                <div className="flex-1 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: colors.text }}>اختر وقت الموعد</h2>
                  <p className="text-sm sm:text-base" style={{ color: colors.textLight }}>
                    {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
                  <p className="mt-3 text-sm" style={{ color: colors.textLight }}>جاري تحميل الأوقات...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlots.map((time, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 rounded-lg border text-center transition-all duration-200 font-medium ${
                        selectedTime === time
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      style={{ 
                        borderColor: selectedTime === time ? colors.primary : colors.border,
                        backgroundColor: selectedTime === time ? colors.primaryLight : colors.background,
                        color: selectedTime === time ? colors.primary : colors.text
                      }}
                    >
                      <span className="text-base">{time}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" style={{ color: colors.textLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>لا توجد أوقات متاحة</h3>
                  <p className="mb-4 text-sm" style={{ color: colors.textLight }}>عذراً، جميع المواعيد مكتملة لهذا التاريخ.</p>
                  <button 
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: colors.primary }}
                  >
                    اختر تاريخ آخر
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Patient Information - Modern Form */}
          {step === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-sm font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  style={{ color: colors.primary }}
                >
                  <svg className="w-3 h-3 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  رجوع
                </button>
                <div className="flex-1 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: colors.text }}>معلومات المريض</h2>
                  <p className="text-sm sm:text-base" style={{ color: colors.textLight }}>
                    {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })} - {selectedTime}
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    اسم المريض *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="+963 XX XXX XXXX"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                    placeholder="أي معلومات إضافية أو نوع التصوير المطلوب..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-medium text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </span>
                  ) : (
                    'تأكيد الحجز'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Confirmation - Modern Design */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: colors.text }}>تم تأكيد الحجز!</h2>
              <p className="text-sm sm:text-base mb-6 max-w-md mx-auto" style={{ color: colors.textLight }}>
                سنقوم بالاتصال بك على الرقم <span className="font-semibold" style={{ color: colors.text }}>{formData.phoneNumber}</span> لتأكيد الموعد
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-right max-w-md mx-auto border" style={{ borderColor: colors.border }}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: colors.border }}>
                    <span className="font-medium text-sm" style={{ color: colors.textLight }}>المريض:</span>
                    <span className="font-semibold" style={{ color: colors.text }}>{formData.patientName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: colors.border }}>
                    <span className="font-medium text-sm" style={{ color: colors.textLight }}>التاريخ:</span>
                    <span className="font-semibold" style={{ color: colors.text }}>
                      {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm" style={{ color: colors.textLight }}>الوقت:</span>
                    <span className="font-semibold" style={{ color: colors.text }}>{selectedTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.primary }}
                >
                  حجز موعد جديد
                </button>
                <p className="text-xs" style={{ color: colors.textLight }}>
                  لتعديل أو إلغاء الموعد، يرجى الاتصال على {CLINIC_INFO.phone}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Clinic Information Cards - Modern Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${colors.primary}15` }}>
                <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm" style={{ color: colors.text }}>العنوان</h3>
                <p className="text-xs" style={{ color: colors.textLight }}>{CLINIC_INFO.address}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${colors.accent}15` }}>
                <svg className="w-5 h-5" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm" style={{ color: colors.text }}>الاتصال</h3>
                <p className="text-xs" style={{ color: colors.textLight }}>{CLINIC_INFO.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${colors.secondary}15` }}>
                <svg className="w-5 h-5" style={{ color: colors.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm" style={{ color: colors.text }}>ساعات العمل</h3>
                <p className="text-xs" style={{ color: colors.textLight }}>{CLINIC_INFO.workingHours.weekdays}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="mt-8 py-4 border-t" style={{ 
        borderColor: colors.border, 
        backgroundColor: colors.surface 
      }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs" style={{ color: colors.textLight }}>
            © 2024 {CLINIC_INFO.name}. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs mt-1" style={{ color: colors.textLight }}>
            نظام الحجز الإلكتروني - {CLINIC_INFO.address}
          </p>
        </div>
      </footer>
    </div>
  )
}
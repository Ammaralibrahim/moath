'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Cairo font için CSS import (next/font kullanıyoruz)
import { Cairo } from 'next/font/google'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export default function Home() {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [availableDates, setAvailableDates] = useState([])

  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 60)

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  // Arapça gün isimleri
  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

  const getArabicDate = (date) => {
    const day = arabicDays[date.getDay()]
    const dayNumber = date.getDate()
    const month = arabicMonths[date.getMonth()]
    const year = date.getFullYear()
    return { day, dayNumber, month, year }
  }

  // Tüm müsait tarihleri backend'den çek
  const fetchAvailableDates = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/available-dates`)
      if (response.data.success) {
        setAvailableDates(response.data.data)
      }
    } catch (error) {
      console.error('خطأ في جلب التواريخ المتاحة:', error)
      // Fallback: Manuel tarih hesaplama
      const dates = []
      const currentDate = new Date(today)
      
      while (currentDate <= maxDate) {
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          dates.push({
            date: formatDate(new Date(currentDate)),
            available: true,
            availableSlots: 12
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

  const fetchAvailableSlots = async (date) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/available-slots?date=${date}`)
      if (response.data.success) {
        setAvailableSlots(response.data.data)
      }
    } catch (error) {
      console.error('خطأ في جلب الأوقات المتاحة:', error)
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحميل الأوقات المتاحة.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
    setStep(2)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setStep(3)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      setMessage({ type: 'error', text: 'اسم المريض مطلوب.' })
      return false
    }
    
    if (!formData.phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'رقم الهاتف مطلوب.' })
      return false
    }

    const phoneRegex = /^[0-9+\-\s()]{10,20}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setMessage({ type: 'error', text: 'يرجى إدخال رقم هاتف صحيح.' })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
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
      
      const response = await axios.post(`${API_BASE_URL}/api/appointments`, appointmentData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'تم حجز موعدك بنجاح! سنتصل بك في أقرب وقت.' 
        })
        setStep(4)
        fetchAvailableDates()
      } else {
        throw new Error(response.data.message || 'فشل في حجز الموعد.')
      }
    } catch (error) {
      console.error('خطأ في حجز الموعد:', error)
      
      let errorMessage = 'حدث خطأ أثناء حجز الموعد.'
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage
      } else if (error.request) {
        errorMessage = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.'
      } else {
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

  const resetForm = () => {
    setStep(1)
    setSelectedDate('')
    setSelectedTime('')
    setFormData({
      patientName: '',
      phoneNumber: '',
      notes: ''
    })
    setMessage({ type: '', text: '' })
  }

  const getDateStatus = (dateObj) => {
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
    
    return { status: 'available', text: `${availableDate.availableSlots} متاح` }
  }

  return (
    <div dir="rtl" className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${cairo.className}`}>
      {/* الهيدر */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900">عيادة برزة</h1>
                <p className="text-sm text-gray-600 mt-1">مساكن برزة، دمشق</p>
              </div>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-blue-600">ساعات العمل</div>
              <div className="text-xs text-gray-600">الإثنين - الجمعة: 9:00 - 15:00</div>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* قسم البطل */}
        <div className="text-center mb-12">
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-6 rounded-full"></div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            نظام الحجز <span className="text-blue-600">الإلكتروني</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            احجز موعدك بسهولة وسرعة للخدمات الطبية المتخصصة
          </p>
        </div>

        {/* عملية الحجز */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-12">
          {/* خطوات التقدم */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex flex-col items-center z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold transition-all duration-500 ${
                    step >= num 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > num ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      num
                    )}
                  </div>
                  <div className={`mt-3 text-sm font-medium transition-all duration-300 ${
                    step >= num ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {['اختر التاريخ', 'اختر الوقت', 'المعلومات', 'التأكيد'][num-1]}
                  </div>
                </div>
              ))}
              <div className="absolute top-6 left-12 right-12 h-1 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* رسالة التنبيه */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl border-r-4 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-700' 
                : 'bg-red-50 border-red-400 text-red-700'
            }`}>
              <div className="flex items-center">
                <svg className={`w-5 h-5 ml-3 ${
                  message.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={message.type === 'success' 
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    } 
                  />
                </svg>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* الخطوة 1: اختيار التاريخ */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر تاريخ الموعد</h2>
                <p className="text-gray-600">يرجى اختيار تاريخ مناسب من بين التواريخ المتاحة</p>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                  <p className="text-gray-600">جاري تحميل التواريخ المتاحة...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {availableDates.map((dateInfo, index) => {
                    const dateObj = new Date(dateInfo.date)
                    const arabicDate = getArabicDate(dateObj)
                    const status = getDateStatus(dateObj)
                    
                    return (
                      <button
                        key={index}
                        onClick={() => status.status === 'available' && handleDateSelect(dateInfo.date)}
                        disabled={status.status !== 'available'}
                        className={`group p-3 rounded-xl border text-center transition-all duration-300 ${
                          status.status === 'available'
                            ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md cursor-pointer transform hover:-translate-y-1'
                            : status.status === 'past'
                            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className={`text-xs font-semibold mb-1 ${
                          status.status === 'available' ? 'text-gray-600 group-hover:text-blue-600' : 'text-gray-400'
                        }`}>
                          {arabicDate.day}
                        </div>
                        <div className={`text-xl font-bold mb-1 ${
                          status.status === 'available' ? 'text-gray-900 group-hover:text-blue-700' : 'text-gray-400'
                        }`}>
                          {arabicDate.dayNumber}
                        </div>
                        <div className={`text-sm ${
                          status.status === 'available' ? 'text-gray-600 group-hover:text-blue-600' : 'text-gray-400'
                        }`}>
                          {arabicDate.month}
                        </div>
                        <div className={`text-xs font-medium mt-1 ${
                          status.status === 'available' 
                            ? 'text-blue-600' 
                            : status.status === 'past'
                            ? 'text-gray-400'
                            : 'text-red-400'
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

          {/* الخطوة 2: اختيار الوقت */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300"
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  رجوع
                </button>
                <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">اختر وقت الموعد</h2>
                <div className="w-16"></div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-blue-800">التاريخ المحدد:</span>
                  <span className="font-bold text-blue-900 mr-3">
                    {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                  <p className="text-gray-600">جاري تحميل الأوقات المتاحة...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {availableSlots.map((time, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelect(time)}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-center font-semibold text-gray-800 hover:text-blue-700 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد أوقات متاحة</h3>
                  <p className="text-gray-600 mb-6">لا توجد أوقات متاحة لهذا التاريخ.</p>
                  <button 
                    onClick={() => setStep(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    اختر تاريخ آخر
                  </button>
                </div>
              )}
            </div>
          )}

          {/* الخطوة 3: معلومات المريض */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300"
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  رجوع
                </button>
                <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">معلومات المريض</h2>
                <div className="w-16"></div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-blue-800">ملخص الحجز</span>
                </div>
                <p className="mt-2 text-blue-900 font-bold">
                  {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {selectedTime}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                      اسم المريض بالكامل *
                    </label>
                    <input
                      type="text"
                      id="patientName"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-400 text-right"
                      placeholder="أدخل اسمك الكامل"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-400 text-right"
                      placeholder="09XXXXXXXX"
                      required
                      pattern="[0-9+\-\s()]{10,20}"
                      title="يرجى إدخال رقم هاتف صحيح"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                      ملاحظات إضافية (اختياري)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-400 resize-none text-right"
                      placeholder="أي معلومات إضافية أو شكاوى أو طلبات خاصة..."
                      maxLength={500}
                    />
                    <div className="text-left text-sm text-gray-500 mt-1">
                      {formData.notes.length}/500 حرف
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-start">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -mr-1 ml-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري المعالجة...
                      </>
                    ) : (
                      'تأكيد الحجز'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* الخطوة 4: التأكيد */}
          {step === 4 && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تم تأكيد حجزك!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                سيتم إرسال تفاصيل الموعد إليك via رسالة SMS في أقرب وقت.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto text-right mb-8">
                <h3 className="font-bold text-gray-900 text-lg mb-4 text-center">تفاصيل الحجز</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">المريض:</span>
                    <span className="font-semibold text-gray-900">{formData.patientName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">الهاتف:</span>
                    <span className="font-semibold text-gray-900">{formData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">التاريخ:</span>
                    <span className="font-semibold text-gray-900 text-left">
                      {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">الوقت:</span>
                    <span className="font-semibold text-gray-900">{selectedTime}</span>
                  </div>
                  {formData.notes && (
                    <div className="pt-3">
                      <span className="text-gray-600 font-medium block mb-2">الملاحظات:</span>
                      <span className="text-gray-900 bg-white p-3 rounded-lg block border border-gray-200">
                        {formData.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  حجز موعد جديد
                </button>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  لأي تعديل أو إلغاء، يرجى الاتصال بالعيادة.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* بطاقات المعلومات */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">العنوان</h3>
            <p className="text-gray-600">مساكن برزة، دمشق</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">الاتصال</h3>
            <p className="text-gray-600">استخدم نظام الحجز الإلكتروني</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">ساعات العمل</h3>
            <p className="text-gray-600">الإثنين - الجمعة: 9:00 - 15:00</p>
          </div>
        </div>
      </main>

      {/* الفوتر */}
      <footer className="bg-white/90 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600">© 2024 عيادة برزة. جميع الحقوق محفوظة.</p>
            <p className="mt-1 text-gray-500 text-sm">مساكن برزة، دمشق</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Cairo font için CSS import
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      } else {
        throw new Error(response.data.message || 'Failed to fetch dates')
      }
    } catch (error) {
      console.error('خطأ في جلب التواريخ المتاحة:', error)
      // Fallback: Manuel tarih hesaplama
      const dates = []
      const currentDate = new Date(today)
      
      while (currentDate <= maxDate) {
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Cuma(5) ve Cumartesi(6) hariç
          dates.push({
            date: formatDate(new Date(currentDate)),
            available: true,
            availableSlots: 12
          })
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      setAvailableDates(dates)
      setMessage({ 
        type: 'error', 
        text: 'جاري استخدام التواريخ الافتراضية. قد لا تعكس الحجوزات الفعلية.' 
      })
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
      } else {
        throw new Error(response.data.message || 'Failed to fetch slots')
      }
    } catch (error) {
      console.error('خطأ في جلب الأوقات المتاحة:', error)
      // Fallback times if API fails
      const fallbackTimes = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30'
      ]
      setAvailableSlots(fallbackTimes)
      setMessage({ 
        type: 'error', 
        text: 'جاري استخدام الأوقات الافتراضية. يرجى التأكد من توفر الموعد.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
    setStep(2)
    setMessage({ type: '', text: '' })
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setStep(3)
    setMessage({ type: '', text: '' })
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
        // Refresh available dates after successful booking
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
    fetchAvailableDates()
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
    <div dir="rtl" className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${cairo.className}`}>
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-blue-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 -z-10"></div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  عيادة برزة
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  مساكن برزة، دمشق
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 space-x-reverse">
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-700">ساعات العمل</div>
                <div className="text-xs text-gray-500 flex items-center">
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  الإثنين - الجمعة: 9:00 - 15:00
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">القائمة</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">ساعات العمل</h3>
                  <p className="text-gray-600 text-sm">الإثنين - الجمعة: 9:00 - 15:00</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">العنوان</h3>
                  <p className="text-gray-600 text-sm">مساكن برزة، دمشق</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-1">
          <div className="inline-flex items-center space-x-2 space-x-reverse bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200 shadow-lg shadow-blue-500/5 mb-8">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">نظام الحجز الإلكتروني</span>
          </div>
          {/* <h1 className="text-5xl font-bold bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            احجز موعدك
            <span className="block text-3xl text-gray-600 mt-2 font-normal">بسهولة وسرعة</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            نظام حجز متطور يضمن لك تجربة سلسة وسريعة للحصول على أفضل الخدمات الطبية
          </p> */}
        </div>

        {/* Booking Process */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Progress Steps - Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sticky top-32">
              <div className="space-y-6">
                {[
                  { number: 1, title: 'اختر التاريخ', description: 'حدد التاريخ المناسب' },
                  { number: 2, title: 'اختر الوقت', description: 'اختر الوقت المفضل' },
                  { number: 3, title: 'المعلومات', description: 'أدخل بياناتك' },
                  { number: 4, title: 'التأكيد', description: 'تأكيد الحجز' }
                ].map((item, index) => (
                  <div key={item.number} className="flex items-start space-x-4 space-x-reverse group cursor-pointer">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      step >= item.number 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-110' 
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}>
                      {step > item.number ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        item.number
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-2">
                      <h3 className={`font-semibold transition-all duration-300 ${
                        step >= item.number ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                      }`}>
                        {item.title}
                      </h3>
                      <p className={`text-sm transition-all duration-300 ${
                        step >= item.number ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    {index < 3 && (
                      <div className={`h-8 w-0.5 transition-all duration-500 ${
                        step > item.number ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              {/* Alert Message */}
              {message.text && (
                <div className={`mb-8 p-6 rounded-2xl border-l-4 backdrop-blur-sm ${
                  message.type === 'success' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-400 text-emerald-700' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-400 text-rose-700'
                }`}>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                      message.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={message.type === 'success' 
                            ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                            : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          } 
                        />
                      </svg>
                    </div>
                    <span className="font-medium mr-3">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Step 1: Date Selection */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">اختر تاريخ الموعد</h2>
                    <p className="text-gray-600 text-lg">حدد التاريخ المناسب من بين التواريخ المتاحة أدناه</p>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center mb-6">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg">جاري تحميل التواريخ المتاحة...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {availableDates.map((dateInfo, index) => {
                        const dateObj = new Date(dateInfo.date)
                        const arabicDate = getArabicDate(dateObj)
                        const status = getDateStatus(dateObj)
                        
                        return (
                          <button
                            key={index}
                            onClick={() => status.status === 'available' && handleDateSelect(dateInfo.date)}
                            disabled={status.status !== 'available'}
                            className={`group p-4 rounded-2xl border-2 text-center transition-all duration-500 ${
                              status.status === 'available'
                                ? 'border-gray-200 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-xl cursor-pointer transform hover:-translate-y-2 hover:scale-105'
                                : status.status === 'past'
                                ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className={`text-xs font-semibold mb-2 transition-colors ${
                              status.status === 'available' ? 'text-gray-600 group-hover:text-blue-600' : 'text-gray-400'
                            }`}>
                              {arabicDate.day}
                            </div>
                            <div className={`text-2xl font-bold mb-2 transition-colors ${
                              status.status === 'available' ? 'text-gray-900 group-hover:text-blue-700' : 'text-gray-400'
                            }`}>
                              {arabicDate.dayNumber}
                            </div>
                            <div className={`text-sm transition-colors ${
                              status.status === 'available' ? 'text-gray-600 group-hover:text-blue-600' : 'text-gray-400'
                            }`}>
                              {arabicDate.month}
                            </div>
                            <div className={`text-xs font-semibold mt-3 px-2 py-1 rounded-full transition-all ${
                              status.status === 'available' 
                                ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' 
                                : status.status === 'past'
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-red-100 text-red-400'
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

              {/* Step 2: Time Selection */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-10">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300 group"
                    >
                      <svg className="w-5 h-5 ml-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      رجوع
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 text-center flex-1">اختر وقت الموعد</h2>
                    <div className="w-16"></div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center ml-4">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-800 block">التاريخ المحدد</span>
                        <span className="font-bold text-blue-900">
                          {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center mb-6">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg">جاري تحميل الأوقات المتاحة...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {availableSlots.map((time, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(time)}
                          className="group p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-500 text-center font-semibold text-gray-800 hover:text-blue-700 shadow-sm hover:shadow-2xl transform hover:-translate-y-2"
                        >
                          <span className="text-lg">{time}</span>
                          <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 mt-2"></div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">لا توجد أوقات متاحة</h3>
                      <p className="text-gray-600 mb-8 text-lg">عذراً، لا توجد أوقات متاحة لهذا التاريخ.</p>
                      <button 
                        onClick={() => setStep(1)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        اختر تاريخ آخر
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Patient Information */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-10">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300 group"
                    >
                      <svg className="w-5 h-5 ml-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      رجوع
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 text-center flex-1">معلومات المريض</h2>
                    <div className="w-16"></div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center ml-4">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-800 block">ملخص الحجز</span>
                        <span className="font-bold text-blue-900">
                          {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {selectedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                    <div className="space-y-8">
                      <div className="group">
                        <label htmlFor="patientName" className="block text-sm font-semibold text-gray-700 mb-3 text-right">
                          اسم المريض بالكامل *
                        </label>
                        <input
                          type="text"
                          id="patientName"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-500 bg-white text-gray-900 placeholder-gray-400 text-right hover:border-gray-300"
                          placeholder="أدخل اسمك الكامل"
                          required
                          minLength={2}
                          maxLength={100}
                        />
                      </div>
                      
                      <div className="group">
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-3 text-right">
                          رقم الهاتف *
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-500 bg-white text-gray-900 placeholder-gray-400 text-right hover:border-gray-300"
                          placeholder="09XXXXXXXX"
                          required
                          pattern="[0-9+\-\s()]{10,20}"
                          title="يرجى إدخال رقم هاتف صحيح"
                        />
                      </div>
                      
                      <div className="group">
                        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-3 text-right">
                          ملاحظات إضافية (اختياري)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-500 bg-white text-gray-900 placeholder-gray-400 resize-none text-right hover:border-gray-300"
                          placeholder="أي معلومات إضافية أو شكاوى أو طلبات خاصة..."
                          maxLength={500}
                        />
                        <div className="text-left text-sm text-gray-500 mt-2">
                          {formData.notes.length}/500 حرف
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-12 flex justify-start">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center group"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -mr-2 ml-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري المعالجة...
                          </>
                        ) : (
                          <>
                            تأكيد الحجز
                            <svg className="w-5 h-5 mr-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="text-center animate-fade-in">
                  <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl blur-xl opacity-30 -z-10"></div>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">تم تأكيد حجزك!</h2>
                  <p className="text-gray-600 text-lg mb-12 max-w-md mx-auto leading-relaxed">
                    تم تأكيد موعدك بنجاح. سيتم إرسال تفاصيل الموعد إليك عبر رسالة SMS في أقرب وقت.
                  </p>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-3xl p-8 max-w-2xl mx-auto text-right mb-12 shadow-lg">
                    <h3 className="font-bold text-gray-900 text-2xl mb-8 text-center">تفاصيل الحجز</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600 font-medium text-lg">المريض:</span>
                        <span className="font-semibold text-gray-900 text-xl">{formData.patientName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600 font-medium text-lg">الهاتف:</span>
                        <span className="font-semibold text-gray-900 text-xl">{formData.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600 font-medium text-lg">التاريخ:</span>
                        <span className="font-semibold text-gray-900 text-xl text-left">
                          {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600 font-medium text-lg">الوقت:</span>
                        <span className="font-semibold text-gray-900 text-xl">{selectedTime}</span>
                      </div>
                      {formData.notes && (
                        <div className="pt-6">
                          <span className="text-gray-600 font-medium text-lg block mb-4">الملاحظات:</span>
                          <span className="text-gray-900 bg-white p-5 rounded-2xl block border-2 border-gray-200 text-right leading-relaxed">
                            {formData.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <button
                      onClick={resetForm}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center group"
                    >
                      حجز موعد جديد
                      <svg className="w-5 h-5 mr-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <p className="text-gray-500 max-w-md mx-auto text-sm">
                      لأي تعديل أو إلغاء، يرجى الاتصال بالعيادة على الرقم المخصص.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: "العنوان",
              description: "مساكن برزة، دمشق",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              ),
              title: "الاتصال",
              description: "استخدم نظام الحجز الإلكتروني",
              gradient: "from-purple-500 to-purple-600"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "ساعات العمل",
              description: "الإثنين - الجمعة: 9:00 - 15:00",
              gradient: "from-emerald-500 to-emerald-600"
            }
          ].map((card, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-3xl p-8 text-center border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">© 2024 عيادة برزة. جميع الحقوق محفوظة.</p>
            <p className="mt-2 text-gray-500 text-sm">مساكن برزة، دمشق</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
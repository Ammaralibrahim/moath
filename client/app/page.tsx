'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import axios from 'axios'
import { Cairo } from 'next/font/google'

// Import components
import Header from './components/Header'
import ProgressIndicator from './components/ProgressIndicator'
import AlertMessage from './components/AlertMessage'
import MainContentCard from './components/MainContentCard'
import Step1DateSelection from './components/Step1DateSelection'
import Step2TimeSelection from './components/Step2TimeSelection'
import Step3PatientInfo from './components/Step3PatientInfo'
import Step4Confirmation from './components/Step4Confirmation'
import ClinicInfoCards from './components/ClinicInfoCards'
import Footer from './components/Footer'

// Import types and constants
import { 
  AvailableDate, 
  FormData, 
  Message, 
  API_BASE_URL,
  arabicDays,
  arabicMonths
} from './types/types'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

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
  const [slotAvailability, setSlotAvailability] = useState<{[key: string]: boolean}>({})

  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 60)

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Fetch available dates from API
  const fetchAvailableDates = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await axios.get<{ success: boolean; data: AvailableDate[]; message?: string }>(
        `${API_BASE_URL}/api/availability/available-dates`
      )
      if (response.data.success) {
        setAvailableDates(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch dates')
      }
    } catch (error) {
      console.error('خطأ في جلب التواريخ:', error)
      // Fallback dates - show ALL dates including Thursdays
      const dates: AvailableDate[] = []
      const currentDate = new Date(today)
      
      while (currentDate <= maxDate) {
        const dayOfWeek = currentDate.getDay()
        const dateStr = formatDate(new Date(currentDate))
        
        // تعيين حالة كل يوم
        let available = false
        let availableSlots = 0
        
        // الجمعة (5) والسبت (6) = عطلة
        if (dayOfWeek === 5 || dayOfWeek === 6) {
          available = false
          availableSlots = 0
        } 
        // الأحد (0) إلى الخميس (4) = أيام عمل (متاحة)
        else {
          available = true
          availableSlots = 11 // افتراضي 11 موعد متاح
        }
        
        dates.push({
          date: dateStr,
          available: available,
          availableSlots: availableSlots
        })
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      setAvailableDates(dates)
      
      setMessage({ 
        type: 'error', 
        text: 'تعذر الاتصال بالخادم. يتم عرض تواريخ افتراضية.' 
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

  const fetchAvailableSlots = async (date: string): Promise<void> => {
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      const response = await axios.get<{ success: boolean; data: string[]; message?: string }>(
        `${API_BASE_URL}/api/availability/available-slots?date=${date}`
      )
      
      if (response.data.success) {
        setAvailableSlots(response.data.data)
        
        if (response.data.data.length === 0) {
          setMessage({ 
            type: 'error', 
            text: 'لا توجد أوقات متاحة لهذا اليوم. يرجى اختيار يوم آخر.' 
          })
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch slots')
      }
    } catch (error) {
      console.error('خطأ في جلب الأوقات:', error)
      // Show fallback times but with proper messaging
      setAvailableSlots([])
      setMessage({ 
        type: 'error', 
        text: 'تعذر جلب الأوقات المتاحة. يرجى المحاولة مرة أخرى أو اختيار يوم آخر.' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Check specific slot availability before final submission
  const checkSlotAvailability = async (date: string, time: string): Promise<boolean> => {
    try {
      const response = await axios.get<{ success: boolean; data: { available: boolean } }>(
        `${API_BASE_URL}/api/availability/check-slot?date=${date}&time=${time}`
      )
      
      return response.data.success && response.data.data.available
    } catch (error) {
      console.error('خطأ في التحقق من توافر الوقت:', error)
      return false
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

    // Double-check slot availability before submitting
    const isSlotAvailable = await checkSlotAvailability(selectedDate, selectedTime)
    if (!isSlotAvailable) {
      setMessage({ 
        type: 'error', 
        text: 'عذراً، هذا الموعد لم يعد متاحاً. يرجى اختيار وقت آخر.' 
      })
      setStep(2) // Go back to time selection
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
        // Refresh availability data after successful booking
        fetchAvailableDates()
        if (selectedDate) {
          fetchAvailableSlots(selectedDate)
        }
      } else {
        throw new Error(response.data.message || 'فشل في حجز الموعد')
      }
    } catch (error) {
      console.error('خطأ في الحجز:', error)
      
      let errorMessage = 'حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.'
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = error.response.data.message || 'هذا الموعد محجوز مسبقاً.'
          } else {
            errorMessage = error.response.data.message || errorMessage
          }
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

  const handleBack = (): void => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div dir="rtl" className={`min-h-screen bg-white ${cairo.className}`} >
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 bg-white">
        <ProgressIndicator step={step} />
        
        <MainContentCard>
          <AlertMessage message={message} />
          
          {step === 1 && (
            <Step1DateSelection
              availableDates={availableDates}
              loading={loading}
              onDateSelect={handleDateSelect}
            />
          )}
          
          {step === 2 && (
            <Step2TimeSelection
              selectedDate={selectedDate}
              availableSlots={availableSlots}
              selectedTime={selectedTime}
              loading={loading}
              onTimeSelect={handleTimeSelect}
              onBack={handleBack}
            />
          )}
          
          {step === 3 && (
            <Step3PatientInfo
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              formData={formData}
              loading={loading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
          
          {step === 4 && (
            <Step4Confirmation
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              formData={formData}
              onReset={resetForm}
            />
          )}
        </MainContentCard>
        
        <ClinicInfoCards />
      </main>
      
      <Footer />
    </div>
  )
}
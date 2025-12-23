// app/page.tsx (or your main component)
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
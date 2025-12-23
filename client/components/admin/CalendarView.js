'use client'

import { useState } from 'react'
import { colors } from '@/components/shared/constants'
import { formatDate } from '@/components/shared/utils'

export default function CalendarView({ appointments }) {
  const [calendarDate, setCalendarDate] = useState(new Date())
  
  const appointmentsByDate = {}
  appointments.forEach(apt => {
    const dateStr = new Date(apt.appointmentDate).toISOString().split('T')[0]
    if (!appointmentsByDate[dateStr]) {
      appointmentsByDate[dateStr] = []
    }
    appointmentsByDate[dateStr].push(apt)
  })
  
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay()
  
  const days = []
  
  for (let i = 0; i < (firstDayOfMonth + 6) % 7; i++) {
    days.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayAppointments = appointmentsByDate[dateStr] || []
    
    days.push({
      date: currentDate,
      appointments: dayAppointments
    })
  }
  
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  return (
    <div className="bg-surface rounded-2xl border p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold" style={{ color: colors.text }}>عرض التقويم</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)))}
            className="p-2 rounded-xl hover:bg-surfaceLight transition-colors"
            style={{ color: colors.textLight }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold" style={{ color: colors.text }}>
            {calendarDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)))}
            className="p-2 rounded-xl hover:bg-surfaceLight transition-colors"
            style={{ color: colors.textLight }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold py-2" style={{ color: colors.textLight }}>
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-24 p-2 border rounded-xl ${day ? 'bg-surface' : 'bg-background'}`}
            style={{ borderColor: colors.border }}
          >
            {day && (
              <>
                <div className="text-right mb-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                    day.date.toDateString() === new Date().toDateString() ? 'bg-indigo-500 text-white' : ''
                  }`}>
                    {day.date.getDate()}
                  </span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {day.appointments.map(apt => (
                    <div
                      key={apt._id}
                      className="p-1 text-xs rounded-lg truncate cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ 
                        backgroundColor: apt.status === 'confirmed' 
                          ? colors.success + '40' 
                          : apt.status === 'pending'
                          ? colors.warning + '40'
                          : colors.error + '40',
                        color: colors.text
                      }}
                      onClick={() => console.log('View appointment', apt._id)}
                    >
                      <div className="font-medium truncate">{apt.patientName}</div>
                      <div className="truncate">{apt.appointmentTime}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
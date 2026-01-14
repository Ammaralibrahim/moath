// @/components/appointments/CalendarView.jsx
'use client'

import { useState, useMemo, memo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ar } from 'date-fns/locale'

const CalendarView = memo(({ appointments }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const appointmentsByDate = useMemo(() => {
    const map = new Map()
    appointments.forEach(apt => {
      if (!apt.appointmentDate) return
      const date = new Date(apt.appointmentDate)
      const dateKey = format(date, 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey).push(apt)
    })
    return map
  }, [appointments])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400'
      case 'pending': return 'bg-amber-500/20 text-amber-400'
      case 'cancelled': return 'bg-rose-500/20 text-rose-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100">عرض التقويم</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-gray-100 min-w-48 text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ar })}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayAppointments = appointmentsByDate.get(dateKey) || []
          
          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-28 p-2 rounded-xl border transition-all duration-200
                ${isToday(day) 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-gray-900/30 border-gray-800/50'
                }
                ${isSameMonth(day, currentDate) 
                  ? '' 
                  : 'opacity-40'
                }
                hover:border-gray-700/50 hover:bg-gray-800/30
              `}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-gray-400">
                    {format(day, 'd', { locale: ar })}
                  </div>
                  {dayAppointments.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt._id}
                      className={`px-2 py-1 text-xs rounded-lg truncate ${getStatusColor(apt.status)}`}
                      title={`${apt.patientName} - ${apt.appointmentTime}`}
                    >
                      <div className="font-medium truncate">{apt.patientName}</div>
                      <div className="truncate">{apt.appointmentTime}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-400 px-2">
                      +{dayAppointments.length - 3} أكثر
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-800/50">
        <div className="text-sm text-gray-400 mb-3">مفتاح الألوان:</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
            <span className="text-xs text-gray-300">مؤكد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
            <span className="text-xs text-gray-300">قيد الانتظار</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
            <span className="text-xs text-gray-300">ملغي</span>
          </div>
        </div>
      </div>
    </div>
  )
})

CalendarView.displayName = 'CalendarView'

export default CalendarView
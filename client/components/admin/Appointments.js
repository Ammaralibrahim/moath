'use client'

import { useState, useEffect } from 'react'
import AppointmentsTable from './AppointmentsTable'
import CalendarView from './CalendarView'
import Filters from './Filters'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('table')
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    patientName: '',
    phoneNumber: '',
    showPast: false
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.date) queryParams.append('date', filters.date)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.patientName) queryParams.append('patientName', filters.patientName)
      if (filters.phoneNumber) queryParams.append('phoneNumber', filters.phoneNumber)
      
      const data = await apiRequest(`/api/admin/appointments?${queryParams}`)
      
      if (data.success) {
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const filteredAppointments = () => {
    let filtered = [...appointments]
    
    if (!filters.showPast) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today
      })
    }
    
    return filtered
  }

  return (
    <div className="space-y-6">
      <Filters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={fetchAppointments}
      />
      
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium" style={{ color: colors.textLight }}>
          إجمالي النتائج: <span className="font-bold" style={{ color: colors.text }}>{filteredAppointments().length}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'table' 
                ? 'shadow-lg' 
                : 'hover:opacity-90'
            }`}
            style={viewMode === 'table' ? {
              background: colors.gradientPrimary,
              color: '#FFFFFF'
            } : {
              border: `1px solid ${colors.borderLight}`,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            جدول
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'calendar' 
                ? 'shadow-lg' 
                : 'hover:opacity-90'
            }`}
            style={viewMode === 'calendar' ? {
              background: colors.gradientPrimary,
              color: '#FFFFFF'
            } : {
              border: `1px solid ${colors.borderLight}`,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            تقويم
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : viewMode === 'table' ? (
        <AppointmentsTable appointments={filteredAppointments()} />
      ) : (
        <CalendarView appointments={filteredAppointments()} />
      )}
    </div>
  )
}
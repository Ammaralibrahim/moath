'use client'

import { useState, useEffect } from 'react'
import AppointmentsTable from './AppointmentsTable'
import CalendarView from './CalendarView'
import Filters from './Filters'
import AppointmentModal from './modals/AppointmentModal'
import { colors } from '@/components/shared/constants'
import { apiRequest, createAppointment, updateAppointment, deleteAppointment } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

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
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

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
      
      const data = await apiRequest(`/api/appointments?${queryParams}`)
      
      if (data.success) {
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('فشل في تحميل المواعيد')
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

  const handleSaveAppointment = async (appointmentData) => {
    try {
      setLoading(true)
      
      let data
      if (appointmentData._id) {
        data = await updateAppointment(appointmentData._id, appointmentData)
      } else {
        data = await createAppointment(appointmentData)
      }
      
      if (data.success) {
        fetchAppointments()
        setShowAppointmentModal(false)
        setSelectedAppointment(null)
        toast.success(appointmentData._id ? 'تم تحديث الموعد بنجاح' : 'تم إضافة الموعد بنجاح')
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error('فشل في حفظ الموعد')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      try {
        setLoading(true)
        const data = await deleteAppointment(appointmentId)
        
        if (data.success) {
          fetchAppointments()
          toast.success('تم حذف الموعد بنجاح')
        }
      } catch (error) {
        console.error('Error deleting appointment:', error)
        toast.error('فشل في حذف الموعد')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddNewAppointment = () => {
    setSelectedAppointment(null)
    setShowAppointmentModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>إدارة المواعيد</h1>
        <button
          onClick={handleAddNewAppointment}
          className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
          style={{ 
            background: colors.gradientPrimary,
            color: '#FFFFFF'
          }}
        >
          إضافة موعد جديد
        </button>
      </div>
      
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
        <AppointmentsTable 
          appointments={filteredAppointments()}
          onEdit={(appointment) => {
            setSelectedAppointment(appointment)
            setShowAppointmentModal(true)
          }}
          onDelete={handleDeleteAppointment}
        />
      ) : (
        <CalendarView appointments={filteredAppointments()} />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowAppointmentModal(false)
            setSelectedAppointment(null)
          }}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  )
}
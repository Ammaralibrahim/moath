// @/components/appointments/Appointments.jsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AppointmentsTable from './AppointmentsTable'
import CalendarView from './CalendarView'
import Filters from './Filters'
import AppointmentModal from './modals/AppointmentModal'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const Appointments = () => {
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

  const fetchAppointments = useCallback(async () => {
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
  }, [filters.date, filters.status, filters.patientName, filters.phoneNumber])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  const filteredAppointments = useMemo(() => {
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
  }, [appointments, filters.showPast])

  const handleSaveAppointment = useCallback(async (appointmentData) => {
    try {
      setLoading(true)
      
      const endpoint = appointmentData._id 
        ? `/api/appointments/${appointmentData._id}`
        : '/api/appointments'
      
      const method = appointmentData._id ? 'PUT' : 'POST'
      
      const data = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(appointmentData)
      })
      
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
  }, [fetchAppointments])

  const handleDeleteAppointment = useCallback(async (appointmentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      try {
        setLoading(true)
        const data = await apiRequest(`/api/appointments/${appointmentId}`, {
          method: 'DELETE'
        })
        
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
  }, [fetchAppointments])

  const handleAddNewAppointment = useCallback(() => {
    setSelectedAppointment(null)
    setShowAppointmentModal(true)
  }, [])

  const handleEditAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">إدارة المواعيد</h1>
          <p className="text-sm text-gray-400 mt-1">
            عرض وإدارة جميع مواعيد المرضى
          </p>
        </div>
        <button
          onClick={handleAddNewAppointment}
          className="px-4 py-2.5 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة موعد جديد
        </button>
      </div>
      
      {/* Filters */}
      <Filters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={fetchAppointments}
      />
      
      {/* View Controls */}
      <div className="flex items-center justify-between bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
        <div className="text-sm text-gray-300">
          إجمالي النتائج: <span className="font-bold text-gray-100">{filteredAppointments.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              viewMode === 'table' 
                ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-lg' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            عرض الجدول
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              viewMode === 'calendar' 
                ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-lg' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            عرض التقويم
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="جاري تحميل المواعيد..." />
      ) : viewMode === 'table' ? (
        <AppointmentsTable 
          appointments={filteredAppointments}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
        />
      ) : (
        <CalendarView appointments={filteredAppointments} />
      )}

      {/* Modal */}
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

export default Appointments
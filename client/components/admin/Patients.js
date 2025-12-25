'use client'

import { useState, useEffect } from 'react'
import PatientsTable from './PatientsTable'
import PatientModal from './modals/PatientModal'
import PatientViewModal from './modals/PatientViewModal'
import AppointmentModal from './modals/AppointmentModal'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    hasAppointments: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  })
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientAppointments, setPatientAppointments] = useState([])
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showPatientViewModal, setShowPatientViewModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [pagination.page, filters])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...filters
      }).toString()
      
      const data = await apiRequest(`/api/patients?${query}`)
      
      if (data.success) {
        setPatients(data.data || [])
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total
        })
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('فشل في تحميل بيانات المرضى')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientAppointments = async (patientId) => {
    if (!patientId) return
    
    try {
      setLoadingAppointments(true)
      const data = await apiRequest(`/api/appointments/patient/${patientId}`)
      
      if (data.success) {
        setPatientAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      // Hata durumunda boş array göster
      setPatientAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPagination({ ...pagination, page: 1 })
  }

  const handleSavePatient = async (patientData) => {
    try {
      setLoading(true)
      const method = patientData._id ? 'PUT' : 'POST'
      const url = patientData._id 
        ? `/api/patients/${patientData._id}`
        : '/api/patients'
      
      const data = await apiRequest(url, {
        method,
        body: JSON.stringify(patientData)
      })
      
      if (data.success) {
        toast.success(patientData._id ? 'تم تحديث بيانات المريض بنجاح' : 'تم إنشاء المريض بنجاح')
        fetchPatients()
        setShowPatientModal(false)
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error('Error saving patient:', error)
      toast.error('فشل في حفظ بيانات المريض')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المريض؟')) {
      try {
        setLoading(true)
        const data = await apiRequest(`/api/patients/${patientId}`, {
          method: 'DELETE'
        })
        
        if (data.success) {
          toast.success('تم حذف المريض بنجاح')
          fetchPatients()
        }
      } catch (error) {
        console.error('Error deleting patient:', error)
        toast.error('فشل في حذف المريض')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSaveAppointment = async (appointmentData) => {
    try {
      setLoading(true)
      const data = await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      })
      
      if (data.success) {
        toast.success('تم إضافة الموعد بنجاح')
        setShowAppointmentModal(false)
        
        // Eğer PatientViewModal açıksa randevuları yenile
        if (showPatientViewModal && selectedPatient) {
          fetchPatientAppointments(selectedPatient._id)
        }
        
        // Hastanın randevu sayısını güncellemek için listeyi yenile
        fetchPatients()
      }
    } catch (error) {
      console.error('Error adding appointment:', error)
      toast.error('فشل في إضافة الموعد')
    } finally {
      setLoading(false)
    }
  }

  // Hasta görüntüleme modalı açıldığında randevuları çek
  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    setShowPatientViewModal(true)
    await fetchPatientAppointments(patient._id)
  }

  // Hasta görüntüleme modalından gelen düzenleme isteği
  const handleEditFromViewModal = () => {
    setShowPatientViewModal(false)
    setShowPatientModal(true)
  }

  // Hasta görüntüleme modalından gelen randevu ekleme isteği
  const handleAddAppointmentFromViewModal = () => {
    setShowPatientViewModal(false)
    setShowAppointmentModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6 shadow-xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold" style={{ color: colors.text }}>إدارة المرضى</h3>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              إجمالي المرضى: <span className="font-semibold">{pagination.total}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedPatient(null)
              setShowPatientModal(true)
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
            style={{ 
              background: colors.gradientSuccess,
              color: '#FFFFFF'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إضافة مريض جديد
          </button>
        </div>

        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>البحث</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="ابحث باسم المريض أو رقم الهاتف"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textLight }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>الجنس</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
            >
              <option value="">الجميع</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>لديه مواعيد</label>
            <select
              value={filters.hasAppointments}
              onChange={(e) => handleFilterChange({ ...filters, hasAppointments: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
            >
              <option value="">الجميع</option>
              <option value="true">نعم</option>
              <option value="false">لا</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchPatients}
              className="w-full px-4 py-2.5 rounded-lg border text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ 
                background: colors.gradientPrimary,
                color: '#FFFFFF'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <PatientsTable 
          patients={patients}
          pagination={pagination}
          onPageChange={(page) => setPagination({...pagination, page})}
          onView={handleViewPatient}
          onEdit={(patient) => {
            setSelectedPatient(patient)
            setShowPatientModal(true)
          }}
          onDelete={handleDeletePatient}
        />
      )}

      {/* Patient Modal (Düzenleme/Ekleme) */}
      {showPatientModal && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientModal(false)
            setSelectedPatient(null)
          }}
          onSave={handleSavePatient}
        />
      )}

      {/* Patient View Modal */}
      {showPatientViewModal && selectedPatient && (
        <PatientViewModal
          patient={selectedPatient}
          appointments={patientAppointments}
          loadingAppointments={loadingAppointments}
          onClose={() => {
            setShowPatientViewModal(false)
            setSelectedPatient(null)
            setPatientAppointments([])
          }}
          onEdit={handleEditFromViewModal}
          onAddAppointment={handleAddAppointmentFromViewModal}
          onRefreshAppointments={() => fetchPatientAppointments(selectedPatient._id)}
        />
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && selectedPatient && (
        <AppointmentModal
          appointment={null}
          patient={selectedPatient}
          onClose={() => setShowAppointmentModal(false)}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  )
}
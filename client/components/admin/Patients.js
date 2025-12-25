'use client'

import { useState, useEffect, useCallback } from 'react'
import PatientsTable from './PatientsTable'
import PatientModal from './modals/PatientModal'
import PatientViewModal from './modals/PatientViewModal'
import AppointmentModal from './modals/AppointmentModal'
import { colors } from '@/components/shared/constants'
import { apiRequest, showMessage } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    hasAppointments: '',
    minAge: '',
    maxAge: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  })
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientAppointments, setPatientAppointments] = useState([])
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showPatientViewModal, setShowPatientViewModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  // Debounce için timer
  const [searchTimer, setSearchTimer] = useState(null)

  // İlk yükleme ve filtre değişikliklerinde hastaları getir
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients()
    }, searchTimer ? 500 : 0) // Sadece arama için debounce

    return () => clearTimeout(timer)
  }, [pagination.page, filters.gender, filters.hasAppointments, filters.minAge, filters.maxAge])

  // Arama için debounce
  useEffect(() => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    
    const timer = setTimeout(() => {
      fetchPatients()
    }, 300)
    
    setSearchTimer(timer)
    
    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      }).toString()
      
      const data = await apiRequest(`/api/patients?${query}`, {
        showSuccess: false,
        showError: true
      })
      
      if (data.success) {
        setPatients(data.data || [])
        setPagination(prev => ({
          ...prev,
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0
        }))
        
        if (initialLoad) {
          toast.success(`تم تحميل ${data.total || 0} مريض بنجاح`, {
            duration: 2000,
            position: 'top-center'
          })
          setInitialLoad(false)
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
      setPagination({
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 10
      })
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit, initialLoad])

  const fetchPatientAppointments = async (patientId) => {
    if (!patientId) return
    
    try {
      setLoadingAppointments(true)
      const data = await apiRequest(`/api/appointments/patient/${patientId}?limit=5`, {
        showSuccess: false,
        showError: true
      })
      
      if (data.success) {
        setPatientAppointments(data.data || [])
      } else {
        setPatientAppointments([])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setPatientAppointments([])
      toast.error('فشل في تحميل المواعيد', {
        duration: 3000,
        position: 'top-center'
      })
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
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
        body: JSON.stringify(patientData),
        showSuccess: true,
        successMessage: patientData._id 
          ? 'تم تحديث بيانات المريض بنجاح'
          : 'تم إنشاء المريض بنجاح',
        showError: true
      })
      
      if (data.success) {
        fetchPatients()
        setShowPatientModal(false)
        setSelectedPatient(null)
        
        // Eğer görüntüleme modalı açıksa, o hastayı güncelle
        if (showPatientViewModal && selectedPatient && selectedPatient._id === patientData._id) {
          setSelectedPatient(data.data || patientData)
        }
      }
    } catch (error) {
      console.error('Error saving patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المريض؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return
    }
    
    try {
      setLoading(true)
      const data = await apiRequest(`/api/patients/${patientId}`, {
        method: 'DELETE',
        showSuccess: true,
        successMessage: 'تم حذف المريض بنجاح',
        showError: true
      })
      
      if (data.success) {
        fetchPatients()
        
        // Eğer silinen hasta görüntüleniyorsa modalı kapat
        if (selectedPatient && selectedPatient._id === patientId) {
          setShowPatientViewModal(false)
          setSelectedPatient(null)
        }
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAppointment = async (appointmentData) => {
    try {
      setLoading(true)
      const data = await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          ...appointmentData,
          patientId: selectedPatient?._id
        }),
        showSuccess: true,
        successMessage: 'تم إضافة الموعد بنجاح',
        showError: true
      })
      
      if (data.success) {
        setShowAppointmentModal(false)
        
        // Randevuları güncelle
        if (selectedPatient) {
          await fetchPatientAppointments(selectedPatient._id)
        }
        
        // Hastalar listesini güncelle (randevu sayısı değişebilir)
        fetchPatients()
      }
    } catch (error) {
      console.error('Error adding appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPatient = async (patient) => {
    try {
      setSelectedPatient(patient)
      setShowPatientViewModal(true)
      await fetchPatientAppointments(patient._id)
    } catch (error) {
      console.error('Error viewing patient:', error)
      toast.error('فشل في تحميل بيانات المريض', {
        duration: 3000,
        position: 'top-center'
      })
    }
  }

  const handleEditFromViewModal = () => {
    setShowPatientViewModal(false)
    setShowPatientModal(true)
  }

  const handleAddAppointmentFromViewModal = () => {
    setShowPatientViewModal(false)
    setShowAppointmentModal(true)
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      gender: '',
      hasAppointments: '',
      minAge: '',
      maxAge: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
    toast.success('تم إعادة تعيين جميع الفلاتر', {
      duration: 2000,
      position: 'top-center'
    })
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return
    
    setPagination(prev => ({ ...prev, page }))
    toast.success(`تم التحرك إلى الصفحة ${page}`, {
      duration: 1000,
      position: 'top-center'
    })
  }

  const handleRefresh = () => {
    fetchPatients()
    toast.success('تم تحديث البيانات بنجاح', {
      duration: 2000,
      position: 'top-center'
    })
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Kontroller */}
      <div className="rounded-2xl border p-6 shadow-xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold" style={{ color: colors.text }}>إدارة المرضى</h3>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              إجمالي المرضى: <span className="font-semibold">{pagination.total}</span> | 
              الصفحة: <span className="font-semibold">{pagination.page}</span> من <span className="font-semibold">{pagination.totalPages}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
              style={{ 
                borderColor: colors.borderLight,
                color: colors.textLight,
                backgroundColor: colors.surfaceLight
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              تحديث
            </button>
            
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
        </div>

        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Arama */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>البحث</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
                placeholder="ابحث باسم المريض، رقم الهاتف أو البريد الإلكتروني"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textLight }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Cinsiyet Filtresi */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>الجنس</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
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
          
          {/* Randevu Filtresi */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>المواعيد</label>
            <select
              value={filters.hasAppointments}
              onChange={(e) => handleFilterChange('hasAppointments', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
            >
              <option value="">الجميع</option>
              <option value="true">لديه مواعيد</option>
              <option value="false">بدون مواعيد</option>
            </select>
          </div>

          {/* Yaş Filtresi - Minimum */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>العمر من</label>
            <input
              type="number"
              min="0"
              max="120"
              value={filters.minAge}
              onChange={(e) => handleFilterChange('minAge', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
              placeholder="0"
            />
          </div>

          {/* Yaş Filtresi - Maksimum */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>إلى</label>
            <input
              type="number"
              min="0"
              max="120"
              value={filters.maxAge}
              onChange={(e) => handleFilterChange('maxAge', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
              placeholder="120"
            />
          </div>
        </div>

        {/* Filtre Butonları */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>الفلاتر النشطة:</span>
            {Object.entries(filters).map(([key, value]) => (
              value && key !== 'search' ? (
                <span key={key} className="px-2 py-1 rounded-md text-xs" style={{ 
                  background: colors.surfaceLight,
                  color: colors.textLight 
                }}>
                  {key === 'gender' ? (value === 'male' ? 'ذكر' : 'أنثى') : 
                   key === 'hasAppointments' ? (value === 'true' ? 'لديه مواعيد' : 'بدون مواعيد') :
                   key === 'minAge' ? `من ${value} سنة` :
                   key === 'maxAge' ? `إلى ${value} سنة` : value}
                </span>
              ) : null
            ))}
            {filters.search && (
              <span className="px-2 py-1 rounded-md text-xs" style={{ 
                background: colors.surfaceLight,
                color: colors.textLight 
              }}>
                بحث: "{filters.search}"
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
              style={{ 
                borderColor: colors.borderLight,
                color: colors.textLight,
                backgroundColor: colors.surfaceLight
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              إعادة تعيين
            </button>
            
            <button
              onClick={() => fetchPatients()}
              className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
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

      {/* Yükleme Durumu */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <LoadingSpinner />
          <p className="text-sm" style={{ color: colors.textLight }}>جاري تحميل بيانات المرضى...</p>
        </div>
      ) : (
        <PatientsTable 
          patients={patients}
          pagination={pagination}
          onPageChange={handlePageChange}
          onView={handleViewPatient}
          onEdit={(patient) => {
            setSelectedPatient(patient)
            setShowPatientModal(true)
          }}
          onDelete={handleDeletePatient}
        />
      )}

      {/* Modals */}
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
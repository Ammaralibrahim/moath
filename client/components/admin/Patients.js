// @/components/patients/Patients.jsx
'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import PatientsTable from './PatientsTable'
import PatientModal from './modals/PatientModal'
import PatientViewModal from './modals/PatientViewModal'
import AppointmentModal from './modals/AppointmentModal'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import debounce from 'lodash/debounce'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    hasAppointments: '',
    minAge: '',
    maxAge: '',
    bloodType: '',
    hasChronicDiseases: '',
    hasTestResults: ''
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const initialLoadRef = useRef(true)
  const searchDebounceRef = useRef(null)

  // Memoized fetch function
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
      
      const data = await apiRequest(`/api/patients?${query}`)
      
      if (data.success) {
        setPatients(data.data || [])
        setPagination(prev => ({
          ...prev,
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0
        }))
        
        if (initialLoadRef.current) {
          toast.success(`تم تحميل ${data.total || 0} مريض`)
          initialLoadRef.current = false
        }
      } else {
        setPatients([])
        setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }))
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
      toast.error('فشل في تحميل بيانات المرضى')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
      fetchPatients()
    }, 300),
    [fetchPatients]
  )

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (key === 'search') {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
      searchDebounceRef.current = setTimeout(() => {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchPatients()
      }, 300)
    } else {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [fetchPatients])

  // Handle numeric filter changes
  const handleNumericFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Fetch data when filters change (except search)
  useEffect(() => {
    const hasNonSearchFilters = Object.entries(filters)
      .filter(([key]) => key !== 'search')
      .some(([_, value]) => value !== '')
    
    if (hasNonSearchFilters) {
      fetchPatients()
    }
  }, [filters.gender, filters.hasAppointments, filters.minAge, filters.maxAge, filters.bloodType, filters.hasChronicDiseases, filters.hasTestResults, fetchPatients])

  // Initial fetch
  useEffect(() => {
    fetchPatients()
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [fetchPatients])

  // Fetch patient appointments
  const fetchPatientAppointments = useCallback(async (patientId) => {
    if (!patientId) return
    
    try {
      setLoadingAppointments(true)
      const data = await apiRequest(`/api/appointments/patient/${patientId}?limit=5`)
      
      if (data.success) {
        setPatientAppointments(data.data || [])
      } else {
        setPatientAppointments([])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setPatientAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }, [])

  // Handle save patient
  const handleSavePatient = useCallback(async (patientData) => {
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
        await fetchPatients()
        setShowPatientModal(false)
        setSelectedPatient(null)
        
        if (showPatientViewModal && selectedPatient && selectedPatient._id === patientData._id) {
          const updatedPatient = { ...selectedPatient, ...patientData }
          setSelectedPatient(updatedPatient)
        }
        
        toast.success(patientData._id ? 'تم تحديث بيانات المريض' : 'تم إنشاء المريض')
      }
    } catch (error) {
      console.error('Error saving patient:', error)
      toast.error('فشل في حفظ بيانات المريض')
    } finally {
      setLoading(false)
    }
  }, [fetchPatients, selectedPatient, showPatientViewModal])

  // Handle delete patient
  const handleDeletePatient = useCallback(async (patientId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المريض وجميع مواعيده؟')) {
      return
    }
    
    try {
      setIsDeleting(true)
      const data = await apiRequest(`/api/patients/${patientId}`, {
        method: 'DELETE'
      })
      
      if (data.success) {
        await fetchPatients()
        setSelectedRows(prev => prev.filter(id => id !== patientId))
        
        if (selectedPatient && selectedPatient._id === patientId) {
          setShowPatientViewModal(false)
          setSelectedPatient(null)
          setPatientAppointments([])
        }
        
        toast.success(`تم حذف المريض`)
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      toast.error('فشل في حذف المريض')
    } finally {
      setIsDeleting(false)
    }
  }, [fetchPatients, selectedPatient])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.error('لم يتم اختيار أي مرضى للحذف')
      return
    }

    if (!window.confirm(`هل أنت متأكد من حذف ${selectedRows.length} مريض؟`)) {
      return
    }

    try {
      setIsDeleting(true)
      // Note: You might want to implement a bulk delete endpoint
      // For now, we'll delete one by one
      for (const patientId of selectedRows) {
        await apiRequest(`/api/patients/${patientId}`, {
          method: 'DELETE'
        })
      }
      
      await fetchPatients()
      setSelectedRows([])
      toast.success(`تم حذف ${selectedRows.length} مريض`)
    } catch (error) {
      console.error('Error bulk deleting patients:', error)
      toast.error('فشل في حذف المرضى')
    } finally {
      setIsDeleting(false)
    }
  }, [selectedRows, fetchPatients])

  // Handle save appointment
  const handleSaveAppointment = useCallback(async (appointmentData) => {
    try {
      setLoading(true)
      
      const data = await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          ...appointmentData,
          patientId: selectedPatient?._id || appointmentData.patientId
        })
      })
      
      if (data.success) {
        setShowAppointmentModal(false)
        
        if (selectedPatient) {
          await fetchPatientAppointments(selectedPatient._id)
        }
        
        await fetchPatients()
        toast.success('تم إضافة الموعد')
      }
    } catch (error) {
      console.error('Error adding appointment:', error)
      toast.error('فشل في إضافة الموعد')
    } finally {
      setLoading(false)
    }
  }, [selectedPatient, fetchPatientAppointments, fetchPatients])

  // Handle view patient
  const handleViewPatient = useCallback(async (patient) => {
    try {
      setSelectedPatient(patient)
      setShowPatientViewModal(true)
      await fetchPatientAppointments(patient._id)
    } catch (error) {
      console.error('Error viewing patient:', error)
      toast.error('فشل في تحميل بيانات المريض')
    }
  }, [fetchPatientAppointments])

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      gender: '',
      hasAppointments: '',
      minAge: '',
      maxAge: '',
      bloodType: '',
      hasChronicDiseases: '',
      hasTestResults: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
    toast.success('تم إعادة تعيين جميع الفلاتر')
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > pagination.totalPages) return
    setPagination(prev => ({ ...prev, page }))
  }, [pagination.totalPages])

  // Handle limit change
  const handleLimitChange = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '').length
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">إدارة المرضى</h1>
          <p className="text-sm text-gray-400 mt-1">
            إدارة سجلات المرضى وبياناتهم الصحية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPatients}
            disabled={loading}
            className="px-4 py-2.5 bg-gray-800/50 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
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
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إضافة مريض جديد
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="ابحث باسم المريض، رقم الهاتف أو البريد الإلكتروني"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">الجنس</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={loading}
            >
              <option value="">الجميع</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          
          {/* Blood Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">فصيلة الدم</label>
            <select
              value={filters.bloodType}
              onChange={(e) => handleFilterChange('bloodType', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={loading}
            >
              <option value="">الجميع</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Appointments Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">المواعيد</label>
            <select
              value={filters.hasAppointments}
              onChange={(e) => handleFilterChange('hasAppointments', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={loading}
            >
              <option value="">الجميع</option>
              <option value="true">لديه مواعيد</option>
              <option value="false">بدون مواعيد</option>
            </select>
          </div>

          {/* Chronic Diseases Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">الأمراض المزمنة</label>
            <select
              value={filters.hasChronicDiseases}
              onChange={(e) => handleFilterChange('hasChronicDiseases', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={loading}
            >
              <option value="">الجميع</option>
              <option value="true">لديه أمراض مزمنة</option>
              <option value="false">بدون أمراض مزمنة</option>
            </select>
          </div>

          {/* Test Results Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">الفحوصات</label>
            <select
              value={filters.hasTestResults}
              onChange={(e) => handleFilterChange('hasTestResults', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={loading}
            >
              <option value="">الجميع</option>
              <option value="true">لديه فحوصات</option>
              <option value="false">بدون فحوصات</option>
            </select>
          </div>

          {/* Age Range */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-2">العمر</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="120"
                value={filters.minAge}
                onChange={(e) => handleNumericFilterChange('minAge', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="من"
                disabled={loading}
              />
              <span className="text-gray-400 text-sm">-</span>
              <input
                type="number"
                min="0"
                max="120"
                value={filters.maxAge}
                onChange={(e) => handleNumericFilterChange('maxAge', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="إلى"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <span className="text-xs text-gray-400">
                {activeFiltersCount} فلتر نشط
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              disabled={loading || activeFiltersCount === 0}
              className="px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              إعادة تعيين
            </button>
            <button
              onClick={fetchPatients}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-800/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-400">{selectedRows.length}</span>
            </div>
            <span className="text-sm font-medium text-amber-300">
              تم اختيار {selectedRows.length} مريض
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-gradient-to-l from-rose-600 to-rose-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            حذف المختارين
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <LoadingSpinner message="جاري تحميل بيانات المرضى..." />
        </div>
      ) : (
        <PatientsTable 
          patients={patients}
          pagination={pagination}
          selectedRows={selectedRows}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onView={handleViewPatient}
          onEdit={(patient) => {
            setSelectedPatient(patient)
            setShowPatientModal(true)
          }}
          onDelete={handleDeletePatient}
          onSelectRow={(patientId) => {
            setSelectedRows(prev => 
              prev.includes(patientId) 
                ? prev.filter(id => id !== patientId)
                : [...prev, patientId]
            )
          }}
          onSelectAll={() => {
            setSelectedRows(prev => 
              prev.length === patients.length 
                ? [] 
                : patients.map(p => p._id)
            )
          }}
          disabled={isDeleting}
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
          onEdit={() => {
            setShowPatientViewModal(false)
            setTimeout(() => setShowPatientModal(true), 100)
          }}
          onAddAppointment={() => {
            setShowPatientViewModal(false)
            setTimeout(() => setShowAppointmentModal(true), 100)
          }}
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

export default Patients
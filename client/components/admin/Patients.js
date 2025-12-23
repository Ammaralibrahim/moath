'use client'

import { useState, useEffect } from 'react'
import PatientsTable from './PatientsTable'
import PatientModal from './modals/PatientModal'
import PatientViewModal from './modals/PatientViewModal'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
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
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showPatientViewModal, setShowPatientViewModal] = useState(false)

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
    } finally {
      setLoading(false)
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
        fetchPatients()
        setShowPatientModal(false)
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error('Error saving patient:', error)
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
          fetchPatients()
        }
      } catch (error) {
        console.error('Error deleting patient:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6 shadow-xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>إدارة المرضى</h3>
          <button
            onClick={() => {
              setSelectedPatient(null)
              setShowPatientModal(true)
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
            style={{ 
              background: colors.gradientSuccess,
              color: '#FFFFFF'
            }}
          >
            إضافة مريض جديد
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>البحث</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              style={{ 
                borderColor: colors.borderLight,
                backgroundColor: colors.background,
                color: colors.text
              }}
              placeholder="ابحث..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>الجنس</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
              style={{ 
                borderColor: colors.borderLight,
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
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
              style={{ 
                borderColor: colors.borderLight,
                backgroundColor: colors.background,
                color: colors.text
              }}
            >
              <option value="">الجميع</option>
              <option value="true">نعم</option>
              <option value="false">لا</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={fetchPatients}
          className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ 
            background: colors.gradientPrimary,
            color: '#FFFFFF'
          }}
        >
          تطبيق الفلاتر
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <PatientsTable 
          patients={patients}
          pagination={pagination}
          onPageChange={(page) => setPagination({...pagination, page})}
          onView={(patient) => {
            setSelectedPatient(patient)
            setShowPatientViewModal(true)
          }}
          onEdit={(patient) => {
            setSelectedPatient(patient)
            setShowPatientModal(true)
          }}
          onDelete={handleDeletePatient}
        />
      )}

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

      {showPatientViewModal && (
        <PatientViewModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientViewModal(false)
            setSelectedPatient(null)
          }}
        />
      )}
    </div>
  )
}
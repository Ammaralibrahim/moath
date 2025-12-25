'use client'

import { useState, useEffect, useCallback } from 'react'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { debounce } from 'lodash'

export default function PatientSearchModal({ onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const searchPatients = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setPatients([])
        return
      }

      try {
        setLoading(true)
        const data = await apiRequest(`/api/patients/search?query=${encodeURIComponent(term)}`, {
          showSuccess: false,
          showError: false
        })

        if (data.success) {
          setPatients(data.data || [])
        }
      } catch (error) {
        console.error('Error searching patients:', error)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    searchPatients(searchTerm)
    return () => searchPatients.cancel()
  }, [searchTerm, searchPatients])

  const handleSelect = (patient) => {
    setSelectedPatient(patient)
  }

  const handleConfirm = () => {
    if (selectedPatient) {
      onSelect(selectedPatient)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
          <h3 className="text-xl font-bold" style={{ color: colors.text }}>بحث عن مريض</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ color: colors.textLight }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
              placeholder="ابحث باسم المريض أو رقم الهاتف..."
              autoFocus
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: colors.textLight }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                background: colors.gradientPrimary,
                opacity: 0.1
              }}>
                <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: colors.textLight }}>
                {searchTerm ? 'لم يتم العثور على مرضى' : 'ابدأ بالبحث عن مريض'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient._id}
                  onClick={() => handleSelect(patient)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    selectedPatient?._id === patient._id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold" style={{ color: colors.text }}>
                        {patient.patientName}
                      </div>
                      <div className="text-sm mt-1" style={{ color: colors.textLight }}>
                        {patient.phoneNumber} | {patient.gender === 'male' ? 'ذكر' : 'أنثى'} | {patient.age} سنة
                      </div>
                      {patient.email && (
                        <div className="text-xs mt-1" style={{ color: colors.textLight }}>
                          {patient.email}
                        </div>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPatient?._id === patient._id 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPatient?._id === patient._id && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between" style={{ borderColor: colors.border }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ 
              borderColor: colors.borderLight,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPatient}
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: colors.gradientSuccess,
              color: '#FFFFFF'
            }}
          >
            تأكيد الاختيار
          </button>
        </div>
      </div>
    </div>
  )
}
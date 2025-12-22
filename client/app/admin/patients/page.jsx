'use client'

import { useState, useEffect, useCallback } from 'react' 
import { Cairo } from 'next/font/google'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function PatientsManagement() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: { min: '', max: '' },
    lastVisit: '',
    hasAppointments: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    withAppointments: 0,
    lastWeekVisits: 0
  })

  // Ultra Premium Dark Theme - Arka plan #181C14
  const colors = {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#06B6D4',
    secondaryDark: '#0891B2',
    accent: '#10B981',
    accentDark: '#059669',
    background: '#181C14',
    surface: '#242A1F',
    surfaceLight: '#2F3628',
    surfaceLighter: '#3B4432',
    text: '#F1F5F9',
    textLight: '#CBD5E1',
    textMuted: '#94A3B8',
    textDark: '#64748B',
    border: '#3B4432',
    borderLight: '#4A5440',
    success: '#10B981',
    successDark: '#059669',
    error: '#EF4444',
    errorDark: '#DC2626',
    warning: '#F59E0B',
    warningDark: '#D97706',
    info: '#0EA5E9',
    infoDark: '#0284C7',
    gradientPrimary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    gradientSuccess: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    gradientWarning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    gradientError: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
    gradientInfo: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
    maleGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    femaleGradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)'
  }

const fetchPatients = useCallback(async () => {
  try {
    setLoading(true)
    
    // Admin key'i environment'dan al
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123'
    
    // Query parametrelerini oluştur
    const params = new URLSearchParams({
      page: currentPage,
      limit: 10,
      search: searchTerm || ''
    })
    
    // Filtreleri ekle
    if (filters.gender) params.append('gender', filters.gender)
    if (filters.hasAppointments) {
      params.append('hasAppointments', filters.hasAppointments === 'with' ? 'true' : 'false')
    }
    if (filters.lastVisit) params.append('lastVisit', filters.lastVisit)
    if (filters.ageRange.min) params.append('minAge', filters.ageRange.min)
    if (filters.ageRange.max) params.append('maxAge', filters.ageRange.max)
    
    const response = await fetch(`${API_BASE_URL}/api/patients?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      setPatients(data.data || [])
      setTotalPages(data.totalPages || 1)
      setTotalPatients(data.total || 0)
      
      // İstatistikleri hesapla
      calculateStats(data.data || [])
    } else {
      throw new Error(data.message || 'Veri alınamadı')
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
    setMessage({ 
      type: 'error', 
      text: 'فشل في جلب بيانات المرضى. تأكد من تشغيل الخادم الخلفي.' 
    })
    setPatients([]) // Hata durumunda boş liste
  } finally {
    setLoading(false)
  }
}, [currentPage, searchTerm, filters])

useEffect(() => {
  fetchPatients()
  // calculateStats() kaldır - fetchPatients içinde çağrılıyor zaten
}, [fetchPatients])

// calculateStats fonksiyonunu bileşenin dışında tanımla
const calculateStats = (patientsList) => {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const newStats = {
    total: patientsList.length,
    male: 0,
    female: 0,
    withAppointments: 0,
    lastWeekVisits: 0
  }

  patientsList.forEach(patient => {
    if (patient.gender === 'male') newStats.male++
    if (patient.gender === 'female') newStats.female++
    if (patient.appointmentCount && patient.appointmentCount > 0) newStats.withAppointments++
    
    if (patient.lastVisit) {
      const lastVisitDate = new Date(patient.lastVisit)
      if (lastVisitDate >= oneWeekAgo) newStats.lastWeekVisits++
    }
  })

  setStats(newStats)
}

// Ayrıca, patients değiştiğinde istatistikleri güncellemek için bir useEffect daha ekleyin:
useEffect(() => {
  if (patients.length > 0) {
    calculateStats(patients)
  }
}, [patients])


const exportPatients = async () => {
  try {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123'
    
    const response = await fetch(`${API_BASE_URL}/api/patients/export`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      }
      })
      
      if (!response.ok) throw new Error('Failed to export')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `patients-backup-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setMessage({ type: 'success', text: 'تم تصدير بيانات المرضى بنجاح' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error exporting patients:', error)
      setMessage({ type: 'error', text: 'فشل في تصدير البيانات' })
    }
  }

  const backupDatabase = async () => {
  try {
    setMessage({ type: 'info', text: 'جاري إنشاء نسخة احتياطية...' })
    
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123'
    
    const response = await fetch(`${API_BASE_URL}/api/backup/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      }
    })
      
      if (!response.ok) throw new Error('Backup failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setMessage({ type: 'success', text: 'تم إنشاء نسخة احتياطية بنجاح' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Backup error:', error)
      setMessage({ type: 'error', text: 'فشل في إنشاء النسخة الاحتياطية' })
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      gender: '',
      ageRange: { min: '', max: '' },
      lastVisit: '',
      hasAppointments: ''
    })
  }

  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const selectAllRows = () => {
    if (selectedRows.length === patients.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(patients.map(p => p._id))
    }
  }

  const handleBulkDelete = async () => {
  if (!selectedRows.length) {
    setMessage({ type: 'error', text: 'لم يتم تحديد أي مرضى' })
    return
  }
  
  if (!confirm(`هل أنت متأكد من حذف ${selectedRows.length} مريض؟`)) return
  
  try {
    setLoading(true)
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123'
    
    // Bulk delete endpoint'ini kullan
    const response = await fetch(`${API_BASE_URL}/api/patients/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ patientIds: selectedRows })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Bulk delete failed')
    }
    
    const result = await response.json()
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message || `تم حذف ${selectedRows.length} مريض بنجاح` })
      setSelectedRows([])
      fetchPatients()
    } else {
      throw new Error(result.message || 'Bulk delete failed')
    }
    
    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  } catch (error) {
    console.error('Error bulk deleting:', error)
    setMessage({ type: 'error', text: error.message || 'فشل في حذف المرضى' })
  } finally {
    setLoading(false)
  }
}

  const GenderBadge = ({ gender }) => {
    const config = {
      male: { text: 'ذكر', gradient: colors.maleGradient, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      female: { text: 'أنثى', gradient: colors.femaleGradient, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a11 11 0 00-2.965-5.197M15 21c0 .552.45 1 1.007 1h7.986A1.001 1.001 0 0025 21c0-4.438-3.58-8.035-8-8.035s-8 3.597-8 8.035z' }
    }
    
    const { text, gradient, icon } = config[gender] || { 
      text: 'غير محدد', 
      gradient: colors.gradientInfo,
      icon: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 14a7 7 0 01-5-2.535V16a1 1 0 011-1h8a1 1 0 011 1v.465A7 7 0 0112 19z'
    }
    
    return (
      <span
        className="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1 cursor-default"
        style={{ 
          background: gradient,
          color: '#FFFFFF'
        }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
        {text}
      </span>
    )
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'غير معروف'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const Pagination = () => {
    const pages = []
    const maxVisible = 5
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-6">
        <div className="text-xs sm:text-sm" style={{ color: colors.textLight }}>
          عرض {patients.length} من {totalPatients} مريض
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl hover:bg-surfaceLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            style={{ color: colors.text }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {start > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-medium hover:bg-surfaceLight transition-colors shadow-sm cursor-pointer"
                style={{ color: colors.text }}
              >
                1
              </button>
              {start > 2 && <span style={{ color: colors.textLight }}>...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer ${
                currentPage === page ? 'shadow-lg' : ''
              }`}
              style={{ 
                background: currentPage === page ? colors.gradientPrimary : colors.surfaceLight,
                color: currentPage === page ? '#FFFFFF' : colors.text,
                border: currentPage === page ? 'none' : `1px solid ${colors.border}`
              }}
            >
              {page}
            </button>
          ))}
          
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span style={{ color: colors.textLight }}>...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-medium hover:bg-surfaceLight transition-colors shadow-sm cursor-pointer"
                style={{ color: colors.text }}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl hover:bg-surfaceLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            style={{ color: colors.text }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className={`min-h-screen ${cairo.className}`} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header style={{ 
        background: colors.gradientPrimary,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-black/10 transition-colors lg:hidden backdrop-blur-sm cursor-pointer"
                style={{ color: '#FFFFFF' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 cursor-default">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white cursor-default">إدارة المرضى المتقدمة</h1>
                  <p className="text-xs sm:text-sm font-medium text-white/90 cursor-default">نظام إدارة قاعدة بيانات المرضى</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={backupDatabase}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 sm:gap-2 hover:opacity-90 shadow-lg cursor-pointer"
                style={{ 
                  background: colors.gradientWarning,
                  color: '#FFFFFF'
                }}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <span className="hidden sm:inline">نسخة احتياطية</span>
              </button>
              <button
                onClick={exportPatients}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 sm:gap-2 hover:opacity-90 shadow-lg cursor-pointer"
                style={{ 
                  background: colors.gradientSuccess,
                  color: '#FFFFFF'
                }}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">تصدير البيانات</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-30
          w-64 sm:w-72
          transform transition-transform duration-300 ease-in-out lg:h-auto h-screen
          lg:translate-x-0 lg:shadow-none
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
        `} style={{ 
          backgroundColor: colors.surface,
          borderLeft: `1px solid ${colors.border}`,
          boxShadow: '16px 0 32px rgba(0, 0, 0, 0.25)'
        }}>
          <div className="p-4 sm:p-6 border-b" style={{ borderColor: colors.border }}>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>فلاتر البحث</h2>
          </div>
          
          <div className="p-3 sm:p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 cursor-default" style={{ color: colors.textLight }}>نوع البحث</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="all-patients"
                    name="search-type"
                    defaultChecked
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 cursor-pointer"
                  />
                  <label htmlFor="all-patients" className="text-sm cursor-pointer" style={{ color: colors.textLight }}>جميع المرضى</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="active-patients"
                    name="search-type"
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 cursor-pointer"
                  />
                  <label htmlFor="active-patients" className="text-sm cursor-pointer" style={{ color: colors.textLight }}>مرضى نشطين</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="inactive-patients"
                    name="search-type"
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 cursor-pointer"
                  />
                  <label htmlFor="inactive-patients" className="text-sm cursor-pointer" style={{ color: colors.textLight }}>غير نشطين</label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 cursor-default" style={{ color: colors.textLight }}>النوع</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceLight,
                  color: colors.text
                }}
              >
                <option value="">جميع الأنواع</option>
                <option value="male">ذكور فقط</option>
                <option value="female">إناث فقط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 cursor-default" style={{ color: colors.textLight }}>نطاق العمر</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="من"
                  value={filters.ageRange.min}
                  onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, min: e.target.value })}
                  className="px-3 py-2 rounded-lg border text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-text"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                />
                <input
                  type="number"
                  placeholder="إلى"
                  value={filters.ageRange.max}
                  onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, max: e.target.value })}
                  className="px-3 py-2 rounded-lg border text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-text"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 cursor-default" style={{ color: colors.textLight }}>آخر زيارة</label>
              <select
                value={filters.lastVisit}
                onChange={(e) => handleFilterChange('lastVisit', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceLight,
                  color: colors.text
                }}
              >
                <option value="">أي وقت</option>
                <option value="week">خلال أسبوع</option>
                <option value="month">خلال شهر</option>
                <option value="3months">خلال 3 أشهر</option>
                <option value="year">خلال سنة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 cursor-default" style={{ color: colors.textLight }}>المواعيد</label>
              <select
                value={filters.hasAppointments}
                onChange={(e) => handleFilterChange('hasAppointments', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceLight,
                  color: colors.text
                }}
              >
                <option value="">جميع المرضى</option>
                <option value="with">لديهم مواعيد</option>
                <option value="without">بدون مواعيد</option>
              </select>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                style={{ 
                  background: colors.gradientPrimary,
                  color: '#FFFFFF'
                }}
              >
                مسح الفلاتر
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-3 sm:p-4 mt-4 sm:mt-8">
            <div className="text-sm font-semibold mb-4 cursor-default" style={{ color: colors.textLight }}>إحصائيات سريعة</div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border shadow-sm cursor-default" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>الذكور</span>
                  <span className="font-bold text-lg" style={{ color: colors.primary }}>{stats.male}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>مرضى ذكور</div>
              </div>
              <div className="p-3 rounded-xl border shadow-sm cursor-default" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>الإناث</span>
                  <span className="font-bold text-lg" style={{ color: colors.error }}>{stats.female}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>مرضى إناث</div>
              </div>
              <div className="p-3 rounded-xl border shadow-sm cursor-default" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>نشطون</span>
                  <span className="font-bold text-lg" style={{ color: colors.success }}>{stats.withAppointments}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>لديهم مواعيد</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
          {/* Message Alert */}
          {message.text && (
            <div 
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-sm ${
                message.type === 'success' 
                  ? 'bg-emerald-900/30 border border-emerald-700/50' 
                  : message.type === 'error'
                  ? 'bg-rose-900/30 border border-rose-700/50'
                  : 'bg-amber-900/30 border border-amber-700/50'
              }`}
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${
                message.type === 'success' 
                  ? 'bg-emerald-500 text-emerald-100' 
                  : message.type === 'error'
                  ? 'bg-rose-500 text-rose-100'
                  : 'bg-amber-500 text-amber-100'
              }`}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={message.type === 'success' 
                      ? "M5 13l4 4L19 7" 
                      : message.type === 'error'
                      ? "M6 18L18 6M6 6l12 12"
                      : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    } 
                  />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold flex-1 ${
                message.type === 'success' ? 'text-emerald-200' : 
                message.type === 'error' ? 'text-rose-200' : 'text-amber-200'
              }`}>
                {message.text}
              </span>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: colors.textLight }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Search and Actions */}
          <div className="mb-4 sm:mb-6 rounded-2xl border p-3 sm:p-4 shadow-xl backdrop-blur-sm cursor-default" style={{ 
            borderColor: colors.border,
            backgroundColor: colors.surface
          }}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث باسم المريض، رقم الهاتف، أو العنوان..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm cursor-text"
                    style={{ 
                      borderColor: colors.borderLight,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5" style={{ color: colors.textLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button 
                  onClick={exportPatients}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  style={{ 
                    background: colors.gradientSuccess,
                    color: '#FFFFFF'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">تصدير</span>
                </button>
                
                <button className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  style={{ 
                    background: colors.gradientPrimary,
                    color: '#FFFFFF'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">إضافة مريض</span>
                </button>
                
                <button 
                  onClick={backupDatabase}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  style={{ 
                    background: colors.gradientWarning,
                    color: '#FFFFFF'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span className="hidden sm:inline">نسخة احتياطية</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
              <div className="p-3 rounded-xl border shadow-sm cursor-default" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: colors.text }}>إجمالي المرضى</span>
                  <span className="font-bold text-base sm:text-lg" style={{ color: colors.primary }}>{totalPatients}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>مرضى مسجلين</div>
              </div>
              
              <div className="p-3 rounded-xl border shadow-sm cursor-default" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: colors.text }}>مرضى نشطين</span>
                  <span className="font-bold text-base sm:text-lg" style={{ color: colors.success }}>{stats.withAppointments}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>لديهم مواعيد</div>
              </div>
              
              <div className="p-3 rounded-xl border shadow-sm cursor-default" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: colors.text }}>زيارات الأسبوع</span>
                  <span className="font-bold text-base sm:text-lg" style={{ color: colors.info }}>{stats.lastWeekVisits}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>زيارات حديثة</div>
              </div>
              
              <div className="p-3 rounded-xl border shadow-sm cursor-default" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: colors.text }}>متوسط العمر</span>
                  <span className="font-bold text-base sm:text-lg" style={{ color: colors.warning }}>
                    {patients.length > 0 
                      ? Math.round(patients.reduce((sum, p) => sum + calculateAge(p.birthDate), 0) / patients.length)
                      : 0}
                  </span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>سنة</div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium" style={{ color: colors.text }}>
                      تم تحديد {selectedRows.length} مريض
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                      style={{ 
                        background: colors.gradientError,
                        color: '#FFFFFF'
                      }}
                    >
                      حذف المحدد
                    </button>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border text-xs shadow-sm cursor-pointer"
                      style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    >
                      <option value="">إجراء جماعي...</option>
                      <option value="export">تصدير المحدد</option>
                      <option value="archive">أرشفة المحدد</option>
                      <option value="tag">إضافة تاج للمحدد</option>
                    </select>
                    <button
                      onClick={() => {
                        if (bulkAction === 'export') {
                          // Handle bulk export
                        }
                      }}
                      disabled={!bulkAction}
                      className="px-4 py-1.5 text-xs font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ 
                        background: colors.gradientSuccess,
                        color: '#FFFFFF'
                      }}
                    >
                      تطبيق
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Patients Table */}
          <div className="rounded-2xl border overflow-hidden shadow-xl backdrop-blur-sm cursor-default" style={{ 
            borderColor: colors.border,
            backgroundColor: colors.surface
          }}>
            <div className="p-4 sm:p-6 border-b" style={{ borderColor: colors.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.text }}>قائمة المرضى</h2>
                <div className="text-xs text-right cursor-default" style={{ color: colors.textMuted }}>
                  آخر تحديث: {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
                <p className="mt-4 font-medium cursor-default" style={{ color: colors.textMuted }}>جاري تحميل بيانات المرضى...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                  background: colors.gradientPrimary,
                  opacity: 0.1
                }}>
                  <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-base sm:text-lg font-bold mb-2 cursor-default" style={{ color: colors.text }}>لا توجد بيانات</div>
                <p className="font-medium cursor-default" style={{ color: colors.textLight }}>لم يتم العثور على مرضى متطابقين مع معايير البحث</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead style={{ 
                      backgroundColor: colors.surfaceLight,
                      backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)'
                    }}>
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold cursor-default" style={{ color: colors.textLight }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.length === patients.length && patients.length > 0}
                            onChange={selectAllRows}
                            className="rounded border-gray-600 bg-gray-700 text-blue-500 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold cursor-default" style={{ color: colors.textLight }}>المريض</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold cursor-default" style={{ color: colors.textLight }}>معلومات الاتصال</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold cursor-default" style={{ color: colors.textLight }}>المعلومات الشخصية</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold cursor-default" style={{ color: colors.textLight }}>الإحصائيات</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold cursor-default" style={{ color: colors.textLight }}>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: colors.border }}>
                      {patients.map((patient) => {
                        const age = calculateAge(patient.birthDate)
                        const lastVisit = patient.lastVisit 
                          ? new Date(patient.lastVisit)
                          : null
                        
                        const isRecentVisit = lastVisit 
                          ? (new Date() - lastVisit) / (1000 * 60 * 60 * 24) <= 7
                          : false
                        
                        return (
                          <tr 
                            key={patient._id} 
                            className="hover:bg-surfaceLight/50 transition-colors cursor-default"
                          >
                            <td className="px-4 sm:px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(patient._id)}
                                onChange={() => handleRowSelect(patient._id)}
                                className="rounded border-gray-600 bg-gray-700 text-blue-500 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 cursor-pointer"
                              />
                            </td>
                            
                            <td className="px-4 sm:px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                                  background: patient.gender === 'female' 
                                    ? colors.femaleGradient 
                                    : patient.gender === 'male'
                                    ? colors.maleGradient
                                    : colors.gradientPrimary
                                }}>
                                  <span className="font-bold text-sm text-white">
                                    {patient.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold cursor-default" style={{ color: colors.text }}>{patient.patientName}</div>
                                  <div className="text-xs mt-1 font-mono cursor-default" style={{ color: colors.textMuted }}>
                                    ID: {patient._id?.toString().slice(-8) || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-4 sm:px-6 py-4">
                              <div className="text-sm font-semibold cursor-default" style={{ color: colors.text }}>{patient.phoneNumber}</div>
                              {patient.emergencyContact && (
                                <div className="text-xs mt-1 flex items-center gap-1 cursor-default" style={{ color: colors.textLight }}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  الطوارئ: {patient.emergencyContact}
                                </div>
                              )}
                              {patient.address && (
                                <div className="text-xs mt-1 truncate max-w-[150px] cursor-default" style={{ color: colors.textMuted }}>
                                  {patient.address}
                                </div>
                              )}
                            </td>
                            
                            <td className="px-4 sm:px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" style={{ color: colors.textLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm cursor-default" style={{ color: colors.text }}>
                                    {patient.birthDate 
                                      ? new Date(patient.birthDate).toLocaleDateString('ar-EG')
                                      : 'غير محدد'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <GenderBadge gender={patient.gender} />
                                  <span className="text-xs font-medium px-2 py-1 rounded-full cursor-default" style={{ 
                                    backgroundColor: `${colors.info}20`,
                                    color: colors.info,
                                    border: `1px solid ${colors.info}40`
                                  }}>
                                    {age} سنة
                                  </span>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-4 sm:px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${isRecentVisit ? 'animate-pulse' : ''}`} 
                                    style={{ 
                                      backgroundColor: isRecentVisit ? colors.success : colors.textMuted 
                                    }}
                                  ></div>
                                  <span className="text-sm font-medium cursor-default" style={{ color: colors.text }}>
                                    {patient.appointmentCount || 0} موعد
                                  </span>
                                </div>
                                {patient.lastVisit && (
                                  <div className="text-xs cursor-default" style={{ color: colors.textLight }}>
                                    آخر زيارة: {new Date(patient.lastVisit).toLocaleDateString('ar-EG')}
                                    {isRecentVisit && (
                                      <span className="mr-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ 
                                        backgroundColor: `${colors.success}20`,
                                        color: colors.success
                                      }}>
                                        جديد
                                      </span>
                                    )}
                                  </div>
                                )}
                                {patient.medicalHistory && (
                                  <div className="text-xs cursor-default" style={{ color: colors.warning }}>
                                    <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    سجل طبي
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            <td className="px-4 sm:px-6 py-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedPatient(patient)
                                    setShowModal(true)
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                                  style={{ 
                                    background: colors.gradientPrimary,
                                    color: '#FFFFFF'
                                  }}
                                >
                                  عرض
                                </button>
                                <button className="p-1.5 rounded-lg hover:bg-surfaceLight transition-colors shadow-sm cursor-pointer"
                                  style={{ color: colors.success }}
                                  title="سجل الزيارات"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </button>
                                <button className="p-1.5 rounded-lg hover:bg-surfaceLight transition-colors shadow-sm cursor-pointer"
                                  style={{ color: colors.warning }}
                                  title="إرسال رسالة"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 sm:p-6 border-t" style={{ borderColor: colors.border }}>
                  <Pagination />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                  background: selectedPatient.gender === 'female' 
                    ? colors.femaleGradient 
                    : selectedPatient.gender === 'male'
                    ? colors.maleGradient
                    : colors.gradientPrimary
                }}>
                  <span className="font-bold text-white">
                    {selectedPatient.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>{selectedPatient.patientName}</h3>
                  <p className="text-sm mt-1 cursor-default" style={{ color: colors.textLight }}>
                    ID: {selectedPatient._id?.toString().slice(-12) || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-surfaceLight transition-colors cursor-pointer"
                style={{ color: colors.textLight }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceLight
                }}>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 cursor-default" style={{ color: colors.textLight }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    المعلومات الأساسية
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium cursor-default" style={{ color: colors.textLight }}>رقم الهاتف:</span>
                      <span className="text-sm font-semibold font-mono cursor-default" style={{ color: colors.text }}>{selectedPatient.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium cursor-default" style={{ color: colors.textLight }}>تاريخ الميلاد:</span>
                      <span className="text-sm font-semibold cursor-default" style={{ color: colors.text }}>
                        {selectedPatient.birthDate 
                          ? new Date(selectedPatient.birthDate).toLocaleDateString('ar-EG')
                          : 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium cursor-default" style={{ color: colors.textLight }}>العمر:</span>
                      <span className="text-sm font-semibold cursor-default" style={{ color: colors.text }}>
                        {calculateAge(selectedPatient.birthDate)} سنة
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium cursor-default" style={{ color: colors.textLight }}>الجنس:</span>
                      <GenderBadge gender={selectedPatient.gender} />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 rounded-xl border" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceLight
                }}>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 cursor-default" style={{ color: colors.textLight }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    معلومات الاتصال
                  </h4>
                  <div className="space-y-3">
                    {selectedPatient.emergencyContact && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium cursor-default" style={{ color: colors.textLight }}>جهة اتصال الطوارئ:</span>
                        <span className="text-sm font-semibold cursor-default" style={{ color: colors.text }}>{selectedPatient.emergencyContact}</span>
                      </div>
                    )}
                    {selectedPatient.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium cursor-default" style={{ color: colors.textLight }}>البريد الإلكتروني:</span>
                        <span className="text-sm font-semibold cursor-default" style={{ color: colors.text }}>{selectedPatient.email}</span>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div className="mt-3">
                        <span className="text-xs font-medium block mb-2 cursor-default" style={{ color: colors.textLight }}>العنوان:</span>
                        <p className="text-sm cursor-default" style={{ color: colors.text }}>{selectedPatient.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics & Medical Info */}
              <div className="space-y-4">
                {/* Statistics */}
                <div className="p-4 rounded-xl border" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceLight
                }}>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 cursor-default" style={{ color: colors.textLight }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    الإحصائيات
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg border" style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background
                    }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>
                        {selectedPatient.appointmentCount || 0}
                      </div>
                      <div className="text-xs cursor-default" style={{ color: colors.textLight }}>إجمالي المواعيد</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border" style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background
                    }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.success }}>
                        {selectedPatient.lastVisit ? 'نعم' : 'لا'}
                      </div>
                      <div className="text-xs cursor-default" style={{ color: colors.textLight }}>زيارات سابقة</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border" style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background
                    }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.warning }}>
                        {selectedPatient.medicalHistory ? 'نعم' : 'لا'}
                      </div>
                      <div className="text-xs cursor-default" style={{ color: colors.textLight }}>سجل طبي</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border" style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background
                    }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.info }}>
                        {selectedPatient.emergencyContact ? 'نعم' : 'لا'}
                      </div>
                      <div className="text-xs cursor-default" style={{ color: colors.textLight }}>جهة اتصال</div>
                    </div>
                  </div>
                  {selectedPatient.lastVisit && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium cursor-default" style={{ color: colors.textLight }}>آخر زيارة:</span>
                        <span className="text-sm font-semibold cursor-default" style={{ color: colors.text }}>
                          {new Date(selectedPatient.lastVisit).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical History */}
                {selectedPatient.medicalHistory && (
                  <div className="p-4 rounded-xl border" style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceLight
                  }}>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 cursor-default" style={{ color: colors.textLight }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      السجل الطبي
                    </h4>
                    <div className="p-3 rounded-lg" style={{ 
                      backgroundColor: colors.background
                    }}>
                      <p className="text-sm whitespace-pre-line cursor-default" style={{ color: colors.text }}>
                        {selectedPatient.medicalHistory}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes & Additional Info */}
            {(selectedPatient.notes || selectedPatient.allergies || selectedPatient.medications) && (
              <div className="mt-6 p-4 rounded-xl border" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <h4 className="text-sm font-semibold mb-4 cursor-default" style={{ color: colors.textLight }}>معلومات إضافية</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedPatient.allergies && (
                    <div>
                      <div className="text-xs font-medium mb-2 cursor-default" style={{ color: colors.textLight }}>الحساسية:</div>
                      <div className="text-sm cursor-default" style={{ color: colors.text }}>{selectedPatient.allergies}</div>
                    </div>
                  )}
                  {selectedPatient.medications && (
                    <div>
                      <div className="text-xs font-medium mb-2 cursor-default" style={{ color: colors.textLight }}>الأدوية:</div>
                      <div className="text-sm cursor-default" style={{ color: colors.text }}>{selectedPatient.medications}</div>
                    </div>
                  )}
                  {selectedPatient.notes && (
                    <div>
                      <div className="text-xs font-medium mb-2 cursor-default" style={{ color: colors.textLight }}>ملاحظات:</div>
                      <div className="text-sm cursor-default" style={{ color: colors.text }}>{selectedPatient.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                style={{ 
                  border: `1px solid ${colors.borderLight}`,
                  color: colors.textLight,
                  backgroundColor: colors.surfaceLight
                }}
              >
                إغلاق
              </button>
              <button className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                style={{ 
                  background: colors.gradientPrimary,
                  color: '#FFFFFF'
                }}
              >
                تعديل البيانات
              </button>
              <button className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                style={{ 
                  background: colors.gradientSuccess,
                  color: '#FFFFFF'
                }}
              >
                سجل الزيارات
              </button>
              <button className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                style={{ 
                  background: colors.gradientWarning,
                  color: '#FFFFFF'
                }}
              >
                إرسال تذكير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
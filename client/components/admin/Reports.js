// @/components/reports/Reports.jsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiRequest } from '@/components/shared/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    gender: 'all',
    minAge: '',
    maxAge: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [reportType, setReportType] = useState('appointments')

  // Memoized stats fetch
  const fetchSystemStats = useCallback(async () => {
    try {
      const data = await apiRequest('/api/reports/stats')
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching system stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchSystemStats()
  }, [fetchSystemStats])

  // Export functions with error handling
  const handleExportAppointmentsExcel = useCallback(async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status
      }).toString()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/appointments/excel?${queryParams}`,
        {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Generate filename
      const startDateStr = new Date(filters.startDate).toLocaleDateString('ar-EG').replace(/\//g, '-')
      const endDateStr = new Date(filters.endDate).toLocaleDateString('ar-EG').replace(/\//g, '-')
      const fileName = `appointments-${startDateStr}-to-${endDateStr}.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('تم تصدير المواعيد بنجاح')
    } catch (error) {
      console.error('Error exporting appointments:', error)
      toast.error('فشل في تصدير المواعيد')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleExportPatientsExcel = useCallback(async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams()
      if (filters.gender !== 'all') queryParams.append('gender', filters.gender)
      if (filters.minAge) queryParams.append('minAge', filters.minAge)
      if (filters.maxAge) queryParams.append('maxAge', filters.maxAge)
      if (filters.startDate) queryParams.append('registrationDate', filters.startDate)

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/patients/excel?${queryParams}`

      const response = await fetch(url, {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const blob = await response.blob()
      const urlObj = window.URL.createObjectURL(blob)
      
      const filtersText = []
      if (filters.gender !== 'all') filtersText.push(filters.gender === 'male' ? 'male' : 'female')
      if (filters.minAge) filtersText.push(`${filters.minAge}+`)
      if (filters.maxAge) filtersText.push(`${filters.maxAge}-`)
      const filterStr = filtersText.length > 0 ? `-${filtersText.join('-')}` : ''
      const fileName = `patients${filterStr}.xlsx`
      
      const a = document.createElement('a')
      a.href = urlObj
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(urlObj)
      document.body.removeChild(a)

      toast.success('تم تصدير المرضى بنجاح')
    } catch (error) {
      console.error('Error exporting patients:', error)
      toast.error('فشل في تصدير المرضى')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleExportMonthlyPerformance = useCallback(async () => {
    try {
      setLoading(true)
      
      const date = new Date(filters.startDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/performance/monthly?year=${year}&month=${month}`,
        {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const fileName = `monthly-performance-${year}-${String(month).padStart(2, '0')}.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('تم إنشاء تقرير الأداء الشهري')
    } catch (error) {
      console.error('Error generating monthly report:', error)
      toast.error('فشل في إنشاء التقرير الشهري')
    } finally {
      setLoading(false)
    }
  }, [filters.startDate])

  const handleExportPatientAnalysis = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/patients/analysis`,
        {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const fileName = `patient-analysis-${new Date().toISOString().split('T')[0]}.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('تم إنشاء تقرير تحليل المرضى')
    } catch (error) {
      console.error('Error generating patient analysis:', error)
      toast.error('فشل في إنشاء تحليل المرضى')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleExportUpcomingAppointments = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/appointments/upcoming`,
        {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const fileName = `upcoming-appointments.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('تم إنشاء تقرير المواعيد القادمة')
    } catch (error) {
      console.error('Error generating upcoming appointments:', error)
      toast.error('فشل في إنشاء تقرير المواعيد القادمة')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle export based on report type
  const handleExport = useCallback(() => {
    switch(reportType) {
      case 'appointments':
        return handleExportAppointmentsExcel()
      case 'patients':
        return handleExportPatientsExcel()
      case 'performance':
        return handleExportMonthlyPerformance()
      case 'analysis':
        return handleExportPatientAnalysis()
      case 'upcoming':
        return handleExportUpcomingAppointments()
      default:
        return handleExportAppointmentsExcel()
    }
  }, [reportType, handleExportAppointmentsExcel, handleExportPatientsExcel, handleExportMonthlyPerformance, handleExportPatientAnalysis, handleExportUpcomingAppointments])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'all',
      gender: 'all',
      minAge: '',
      maxAge: ''
    })
    toast.success('تم إعادة تعيين الفلاتر')
  }, [])

  // Memoized stats cards
  const statsCards = useMemo(() => {
    if (!stats) return null

    const cards = [
      {
        title: 'إجمالي المرضى',
        value: stats.totalPatients || 0,
        color: 'blue',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        details: [
          { label: 'ذكور', value: stats.malePatients || 0, color: 'blue-400' },
          { label: 'إناث', value: stats.femalePatients || 0, color: 'pink-400' }
        ]
      },
      {
        title: 'إجمالي المواعيد',
        value: stats.totalAppointments || 0,
        color: 'emerald',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        details: [
          { label: 'مؤكدة', value: stats.confirmedAppointments || 0, color: 'emerald-400' },
          { label: 'في الانتظار', value: stats.pendingAppointments || 0, color: 'amber-400' }
        ]
      },
      {
        title: 'مواعيد اليوم',
        value: stats.todayAppointments || 0,
        color: 'amber',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        title: 'النشاط الأخير',
        value: stats.lastWeekPatients || 0,
        subtitle: 'مريض جديد',
        color: 'indigo',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      }
    ]

    return cards
  }, [stats])

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">التقارير والإحصائيات</h1>
          <p className="text-sm text-gray-400 mt-1">
            تحليل شامل وإحصائيات تفصيلية لنظام العيادة
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-800/50 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-300">{card.title}</div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${card.color}-500/10 text-${card.color}-400`}>
                  {card.icon}
                </div>
              </div>
              <div className={`text-2xl font-bold mb-2 text-${card.color}-400`}>
                {card.value.toLocaleString('ar-EG')}
              </div>
              {card.subtitle && (
                <div className="text-xs text-gray-400">
                  {card.subtitle}
                </div>
              )}
              {card.details && (
                <div className="flex items-center gap-4 mt-3">
                  {card.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full bg-${detail.color}`}></div>
                      <span className="text-xs text-gray-400">
                        {detail.label}: {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-100">فلاتر البيانات</h3>
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              إعادة التعيين
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                حالة المواعيد
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">في الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                جنس المريض
              </label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">الكل</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                الحد الأدنى للعمر
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={filters.minAge}
                onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                placeholder="مثال: 18"
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                الحد الأقصى للعمر
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={filters.maxAge}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
                placeholder="مثال: 65"
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Reports Section */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">إعدادات التقرير</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                نوع التقرير
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="appointments">مواعيد</option>
                <option value="patients">مرضى</option>
                <option value="performance">أداء شهري</option>
                <option value="analysis">تحليل المرضى</option>
                <option value="upcoming">مواعيد قادمة</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                التاريخ
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            {reportType === 'performance' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  الشهر
                </label>
                <select
                  value={new Date(filters.startDate).getMonth() + 1}
                  onChange={(e) => {
                    const month = parseInt(e.target.value)
                    const newDate = new Date(filters.startDate)
                    newDate.setMonth(month - 1)
                    setFilters(prev => ({ ...prev, startDate: newDate.toISOString().split('T')[0] }))
                  }}
                  className="w-full px-4 py-2.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      شهر {month}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-end">
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    إنشاء تقرير Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-4">تصدير البيانات</h4>
            <div className="space-y-4">
              {/* Appointments Export */}
              <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-100">تصدير المواعيد</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {filters.startDate === filters.endDate 
                        ? `جميع المواعيد بتاريخ ${filters.startDate}`
                        : `جميع المواعيد من ${filters.startDate} إلى ${filters.endDate}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleExportAppointmentsExcel}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel (XLSX)
                </button>
              </div>
              
              {/* Patients Export */}
              <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-100">تصدير المرضى</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {filters.gender !== 'all' ? `مرضى ${filters.gender === 'male' ? 'الذكور' : 'الإناث'}` : 'جميع المرضى'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleExportPatientsExcel}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel (XLSX)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-4">إجراءات سريعة</h4>
            <div className="grid grid-cols-1 gap-4">
              {/* Monthly Performance */}
              <button
                onClick={handleExportMonthlyPerformance}
                className="p-4 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors duration-200 text-right flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-100">تقرير الأداء الشهري</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    تحليل أداء العيادة خلال شهر {new Date(filters.startDate).toLocaleDateString('ar-EG', { month: 'long' })}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </button>
              
              {/* Patient Analysis */}
              <button
                onClick={handleExportPatientAnalysis}
                className="p-4 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors duration-200 text-right flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-100">تحليل المرضى</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    إحصائيات تفصيلية عن جميع المرضى المسجلين
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </button>
              
              {/* Upcoming Appointments */}
              <button
                onClick={handleExportUpcomingAppointments}
                className="p-4 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors duration-200 text-right flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-100">تقرير المواعيد القادمة</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    عرض المواعيد المجدولة للأسبوع القادم
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="mt-6">
            <LoadingSpinner message="جاري معالجة طلبك، الرجاء الانتظار..." />
          </div>
        )}
        
        {/* Stats Summary */}
        {stats && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 mb-4">ملخص النظام</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-900/30 rounded-lg">
                <div className="text-xs text-gray-400">متوسط المواعيد/مريض</div>
                <div className="text-lg font-semibold text-blue-400">
                  {stats.averageAppointmentsPerPatient || '0.0'}
                </div>
              </div>
              <div className="p-3 bg-gray-900/30 rounded-lg">
                <div className="text-xs text-gray-400">معدل إكمال المواعيد</div>
                <div className="text-lg font-semibold text-emerald-400">
                  {stats.appointmentCompletionRate || '0.0'}%
                </div>
              </div>
              <div className="p-3 bg-gray-900/30 rounded-lg">
                <div className="text-xs text-gray-400">إجمالي الإيرادات</div>
                <div className="text-lg font-semibold text-amber-400">
                  {stats.totalRevenue ? `${stats.totalRevenue.toFixed(2)} TL` : '0.00 TL'}
                </div>
              </div>
              <div className="p-3 bg-gray-900/30 rounded-lg">
                <div className="text-xs text-gray-400">المرضى النشطين</div>
                <div className="text-lg font-semibold text-indigo-400">
                  {stats.activePatients || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import toast from 'react-hot-toast'
import { 
  IconDocumentArrowDown,
  IconCalendarDays,
  IconUsers,
  IconChartBar,
  IconClock,
  IconCalendar,
  IconArrowDownTray,
  IconDocumentText,
  IconChartPie,
  IconUserGroup,
  IconArrowTrendingUp,
  IconServer,
  IconFilter,
  IconChevronDown
} from '@/components/shared/icons'

export default function Reports() {
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
  const [reportType, setReportType] = useState('appointments') // تم التعديل

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const data = await apiRequest('/api/reports/stats')
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching system stats:', error)
    }
  }

  // components/admin/Reports.js - Fonksiyon güncelleme
  const handleExportAppointmentsExcel = async () => {
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
        let errorMessage = `HTTP Hatası: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // JSON parse hatası
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Dosya adını oluştur
      const startDateStr = new Date(filters.startDate).toLocaleDateString('tr-TR').replace(/\./g, '')
      const endDateStr = new Date(filters.endDate).toLocaleDateString('tr-TR').replace(/\./g, '')
      const statusText = filters.status === 'all' ? '' : `-${filters.status}`
      const fileName = `randevular-${startDateStr}-${endDateStr}${statusText}.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ تم تصدير المواعيد بنجاح (Excel)')
    } catch (error) {
      console.error('Error exporting appointments:', error)
      toast.error(error.message || '❌ فشل في تصدير المواعيد')
      
      // Sunucu hatası durumunda kullanıcıyı bilgilendir
      if (error.message.includes('500') || error.message.includes('Server')) {
        toast.error('✅ Sunucu hatası. Lütfen yöneticiye başvurun veya daha sonra tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExportPatientsExcel = async () => {
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
        if (response.status === 404) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Veri bulunamadı')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const urlObj = window.URL.createObjectURL(blob)
      
      // Dosya adını oluştur
      const filtersText = []
      if (filters.gender !== 'all') filtersText.push(filters.gender === 'male' ? 'erkek' : 'kadin')
      if (filters.minAge) filtersText.push(`${filters.minAge}+yas`)
      if (filters.maxAge) filtersText.push(`${filters.maxAge}-yas`)
      const filterStr = filtersText.length > 0 ? `-${filtersText.join('-')}` : ''
      const fileName = `hastalar${filterStr}-${new Date().toISOString().split('T')[0]}.xlsx`
      
      const a = document.createElement('a')
      a.href = urlObj
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(urlObj)
      document.body.removeChild(a)

      toast.success('✅ تم تصدير المرضى بنجاح (Excel)')
    } catch (error) {
      console.error('Error exporting patients:', error)
      toast.error(error.message || '❌ فشل في تصدير المرضى')
    } finally {
      setLoading(false)
    }
  }

  const handleExportMonthlyPerformance = async () => {
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
        if (response.status === 404) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Veri bulunamadı')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const fileName = `aylik-performans-raporu-${year}-${String(month).padStart(2, '0')}.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ تم إنشاء تقرير الأداء الشهري (Excel)')
    } catch (error) {
      console.error('Error generating monthly report:', error)
      toast.error(error.message || '❌ فشل في إنشاء التقرير الشهري')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPatientAnalysis = async () => {
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
        if (response.status === 404) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Veri bulunamadı')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const fileName = `hasta-analiz-raporu-${new Date().toISOString().split('T')[0]}.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ تم إنشاء تقرير تحليل المرضى (Excel)')
    } catch (error) {
      console.error('Error generating patient analysis:', error)
      toast.error(error.message || '❌ فشل في إنشاء تحليل المرضى')
    } finally {
      setLoading(false)
    }
  }

  const handleExportUpcomingAppointments = async () => {
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
        if (response.status === 404) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Veri bulunamadı')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const fileName = `gelecek-hafta-randevulari-${today}-${nextWeek}.xlsx`
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ تم إنشاء تقرير المواعيد القادمة (Excel)')
    } catch (error) {
      console.error('Error generating upcoming appointments:', error)
      toast.error(error.message || '❌ فشل في إنشاء تقرير المواعيد القادمة')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'all',
      gender: 'all',
      minAge: '',
      maxAge: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <IconChartBar className="w-10 h-10" style={{ color: colors.primary }} />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                التقارير والإحصائيات
              </h1>
              <p className="text-sm mt-1" style={{ color: colors.textLight }}>
                تحليل شامل وإحصائيات تفصيلية لنظام العيادة
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
          style={{ 
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text
          }}
        >
          <IconFilter className="w-4 h-4" />
          {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
          <IconChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: `1px solid ${colors.border}`
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold" style={{ color: colors.textLight }}>إجمالي المرضى</div>
                <IconUserGroup className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>
                {stats.totalPatients}
              </div>
              <div className="text-xs flex items-center gap-2" style={{ color: colors.textLight }}>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  ذكور: {stats.malePatients}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  إناث: {stats.femalePatients}
                </span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: `1px solid ${colors.border}`
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold" style={{ color: colors.textLight }}>إجمالي المواعيد</div>
                <IconCalendar className="w-8 h-8" style={{ color: colors.success }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.success }}>
                {stats.totalAppointments}
              </div>
              <div className="text-xs flex items-center gap-2" style={{ color: colors.textLight }}>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  مؤكدة: {stats.confirmedAppointments}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  في الانتظار: {stats.pendingAppointments}
                </span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
            border: `1px solid ${colors.border}`
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold" style={{ color: colors.textLight }}>مواعيد اليوم</div>
                <IconClock className="w-8 h-8" style={{ color: colors.warning }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.warning }}>
                {stats.todayAppointments}
              </div>
              <div className="text-xs" style={{ color: colors.textLight }}>
                {new Date().toLocaleDateString('ar-EG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl p-6 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
            border: `1px solid ${colors.border}`
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold" style={{ color: colors.textLight }}>النشاط الأخير</div>
                <IconArrowTrendingUp className="w-8 h-8" style={{ color: colors.info }} />
              </div>
              <div className="text-lg font-bold mb-1" style={{ color: colors.info }}>
                {stats.lastWeekPatients} مريض جديد
              </div>
              <div className="text-xs" style={{ color: colors.textLight }}>
                خلال الأسبوع الماضي
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="rounded-2xl border p-6" style={{ 
          borderColor: colors.border,
          backgroundColor: colors.surface,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.3) 100%)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: colors.text }}>
              <IconFilter className="w-5 h-5" />
              فلترة البيانات
            </h3>
            <button
              onClick={resetFilters}
              className="px-3 py-1 rounded-lg text-sm"
              style={{ 
                border: `1px solid ${colors.error}30`,
                backgroundColor: `${colors.error}10`,
                color: colors.error
              }}
            >
              إعادة التعيين
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                حالة المواعيد
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">في الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغي</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                جنس المريض
              </label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              >
                <option value="all">الكل</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                الحد الأدنى للعمر
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={filters.minAge}
                onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                placeholder="مثال: 18"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                الحد الأقصى للعمر
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={filters.maxAge}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
                placeholder="مثال: 65"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              />
            </div>
            
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                style={{ 
                  background: colors.gradientPrimary,
                  color: '#FFFFFF'
                }}
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Reports Section */}
      <div className="rounded-2xl border p-6 shadow-2xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface,
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)'
      }}>
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
            <IconServer className="w-5 h-5" />
            إعدادات التقرير
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                نوع التقرير
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              >
                <option value="appointments">مواعيد</option>
                <option value="patients">مرضى</option>
                <option value="performance">أداء شهري</option>
                <option value="analysis">تحليل المرضى</option>
                <option value="upcoming">مواعيد قادمة</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                التاريخ
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              />
            </div>
            
            {reportType === 'performance' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
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
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text
                  }}
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
                onClick={() => {
                  switch(reportType) {
                    case 'appointments':
                      handleExportAppointmentsExcel()
                      break
                    case 'patients':
                      handleExportPatientsExcel()
                      break
                    case 'performance':
                      handleExportMonthlyPerformance()
                      break
                    case 'analysis':
                      handleExportPatientAnalysis()
                      break
                    case 'upcoming':
                      handleExportUpcomingAppointments()
                      break
                    default:
                      handleExportAppointmentsExcel()
                  }
                }}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                style={{ 
                  background: colors.gradientPrimary,
                  color: '#FFFFFF'
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <IconChartPie className="w-4 h-4" />
                    إنشاء تقرير Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Export Options */}
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
              <IconDocumentArrowDown className="w-5 h-5" />
              تصدير البيانات
            </h4>
            <div className="space-y-4">
              {/* المواعيد */}
              <div className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <IconCalendar className="w-6 h-6" style={{ color: colors.primary }} />
                  <div>
                    <div className="font-semibold" style={{ color: colors.text }}>تصدير المواعيد</div>
                    <div className="text-sm" style={{ color: colors.textLight }}>
                      {filters.startDate === filters.endDate 
                        ? `جميع المواعيد بتاريخ ${filters.startDate}`
                        : `جميع المواعيد من ${filters.startDate} إلى ${filters.endDate}`}
                      {filters.status !== 'all' && ` - حالة: ${filters.status === 'pending' ? 'في الانتظار' : filters.status === 'confirmed' ? 'مؤكد' : filters.status === 'cancelled' ? 'ملغي' : 'مكتمل'}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleExportAppointmentsExcel}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  <IconDocumentText className="w-3 h-3" />
                  Excel (XLSX)
                </button>
              </div>
              
              {/* المرضى */}
              <div className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <IconUsers className="w-6 h-6" style={{ color: colors.success }} />
                  <div>
                    <div className="font-semibold" style={{ color: colors.text }}>تصدير المرضى</div>
                    <div className="text-sm" style={{ color: colors.textLight }}>
                      {filters.gender !== 'all' ? `مرضى ${filters.gender === 'male' ? 'الذكور' : 'الإناث'}` : 'جميع المرضى'}
                      {filters.minAge && ` - عمر ${filters.minAge}+`}
                      {filters.maxAge && ` - عمر حتى ${filters.maxAge}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleExportPatientsExcel}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  <IconDocumentText className="w-3 h-3" />
                  Excel (XLSX)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
              <IconChartBar className="w-5 h-5" />
              إجراءات سريعة
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleExportMonthlyPerformance}
                className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceLight,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
                }}
              >
                <div>
                  <div className="font-semibold mb-1" style={{ color: colors.text }}>تقرير الأداء الشهري</div>
                  <div className="text-sm" style={{ color: colors.textLight }}>
                    تحليل أداء العيادة خلال شهر {new Date(filters.startDate).toLocaleDateString('ar-EG', { month: 'long' })}
                  </div>
                </div>
                <IconChartPie className="w-5 h-5 group-hover:text-indigo-400 transition-colors" style={{ color: colors.primary }} />
              </button>
              
              <button
                onClick={handleExportPatientAnalysis}
                className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceLight,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                }}
              >
                <div>
                  <div className="font-semibold mb-1" style={{ color: colors.text }}>تحليل المرضى</div>
                  <div className="text-sm" style={{ color: colors.textLight }}>إحصائيات تفصيلية عن جميع المرضى المسجلين</div>
                </div>
                <IconUserGroup className="w-5 h-5 group-hover:text-emerald-400 transition-colors" style={{ color: colors.success }} />
              </button>
              
              <button
                onClick={handleExportUpcomingAppointments}
                className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceLight,
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)'
                }}
              >
                <div>
                  <div className="font-semibold mb-1" style={{ color: colors.text }}>تقرير المواعيد القادمة</div>
                  <div className="text-sm" style={{ color: colors.textLight }}>عرض المواعيد المجدولة للأسبوع القادم</div>
                </div>
                <IconArrowTrendingUp className="w-5 h-5 group-hover:text-amber-400 transition-colors" style={{ color: colors.warning }} />
              </button>
            </div>
            
            {/* Info Box */}
            <div className="mt-6 p-4 rounded-xl border" style={{ 
              borderColor: `${colors.info}30`,
              backgroundColor: `${colors.info}10`
            }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                  backgroundColor: colors.info,
                  color: '#FFFFFF'
                }}>
                  <IconServer className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: colors.text }}>ملاحظات هامة</div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    • جميع التقارير يتم إنشاؤها بصيغة Excel (XLSX) عالية الجودة
                    <br />
                    • يتم تحديث البيانات تلقائياً عند كل طلب تقرير
                    <br />
                    • أسماء الملفات تحتوي على تاريخ وفلاتر البحث
                    <br />
                    • جميع التقارير مشفرة ومحمية بموجب نظام الأمان
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="mt-6 p-4 rounded-xl text-center" style={{ 
            backgroundColor: colors.surfaceLight
          }}>
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
              <div className="mr-3 text-sm" style={{ color: colors.textLight }}>
                جاري معالجة طلبك، الرجاء الانتظار...
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Summary */}
        {stats && (
          <div className="mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
              <IconChartBar className="w-5 h-5" />
              ملخص النظام
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
                <div className="text-xs" style={{ color: colors.textLight }}>متوسط المواعيد/مريض</div>
                <div className="text-lg font-bold" style={{ color: colors.primary }}>
                  {stats.averageAppointmentsPerPatient || '0.0'}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.success}10` }}>
                <div className="text-xs" style={{ color: colors.textLight }}>معدل إكمال المواعيد</div>
                <div className="text-lg font-bold" style={{ color: colors.success }}>
                  {stats.appointmentCompletionRate || '0.0'}%
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.warning}10` }}>
                <div className="text-xs" style={{ color: colors.textLight }}>إجمالي الإيرادات</div>
                <div className="text-lg font-bold" style={{ color: colors.warning }}>
                  {stats.totalRevenue ? `${stats.totalRevenue.toFixed(2)} TL` : '0.00 TL'}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.info}10` }}>
                <div className="text-xs" style={{ color: colors.textLight }}>المرضى النشطين</div>
                <div className="text-lg font-bold" style={{ color: colors.info }}>
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
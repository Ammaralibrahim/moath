'use client'

import { useState, useEffect } from 'react'
import { Cairo } from 'next/font/google'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    patientName: '',
    phoneNumber: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    today: 0,
    weekly: 0,
    monthly: 0
  })
  const [analytics, setAnalytics] = useState({
    dailyStats: [],
    hourlyDistribution: [],
    weeklyTrends: [],
    monthlyStats: []
  })
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [view, setView] = useState('list')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch all data on component mount
  useEffect(() => {
    fetchAppointments()
    fetchStats()
    fetchAnalytics()
  }, [])

  // API helper function
  const apiRequest = async (url, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'x-admin-key': ADMIN_API_KEY,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  const fetchAppointments = async (queryParams = '') => {
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      const data = await apiRequest(`/api/admin/appointments${queryParams}`)
      
      if (data.success) {
        setAppointments(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch appointments')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setMessage({ type: 'error', text: 'فشل في جلب البيانات' })
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/api/admin/stats')
      if (data.success) {
        setStats(data.data || {
          total: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          today: 0,
          weekly: 0,
          monthly: 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        today: 0,
        weekly: 0,
        monthly: 0
      })
    }
  }

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest('/api/admin/analytics')
      if (data.success) {
        setAnalytics(data.data || {
          dailyStats: [],
          hourlyDistribution: [],
          weeklyTrends: [],
          monthlyStats: []
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setAnalytics({
        dailyStats: [],
        hourlyDistribution: [],
        weeklyTrends: [],
        monthlyStats: []
      })
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const queryParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) queryParams.append(k, v)
    })
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    fetchAppointments(queryString)
  }

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      const data = await apiRequest(`/api/admin/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: newStatus,
          notes: selectedAppointment?.notes || ''
        })
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم تحديث حالة الموعد بنجاح' })
        fetchAppointments()
        fetchStats()
        fetchAnalytics()
        setSelectedAppointment(null)
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      setMessage({ type: 'error', text: 'فشل في تحديث الحالة' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return
    
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      const data = await apiRequest(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE'
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم حذف الموعد بنجاح' })
        fetchAppointments()
        fetchStats()
        fetchAnalytics()
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 3000)
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      setMessage({ type: 'error', text: 'فشل في حذف الموعد' })
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (appointments.length === 0) {
      setMessage({ type: 'error', text: 'لا توجد بيانات للتصدير' })
      return
    }

    const headers = ['الاسم', 'الهاتف', 'التاريخ', 'الوقت', 'الحالة', 'ملاحظات', 'تاريخ الإنشاء']
    const csvData = appointments.map(apt => [
      apt.patientName,
      apt.phoneNumber,
      new Date(apt.appointmentDate).toLocaleDateString('ar-EG'),
      apt.appointmentTime,
      apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'pending' ? 'قيد الانتظار' : 'ملغى',
      apt.notes || '',
      new Date(apt.createdAt).toLocaleString('ar-EG')
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `appointments-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setMessage({ type: 'success', text: 'تم تصدير البيانات بنجاح' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // Modern Stats Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-1">{stats.total}</div>
          <div className="text-blue-100 text-sm">إجمالي المواعيد</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-1">{stats.pending}</div>
          <div className="text-amber-100 text-sm">قيد الانتظار</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-1">{stats.confirmed}</div>
          <div className="text-emerald-100 text-sm">مؤكد</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-1">{stats.cancelled}</div>
          <div className="text-rose-100 text-sm">ملغى</div>
        </div>
      </div>
    </div>
  )

  // Modern Daily Stats Component
  const DailyStatsChart = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">الإحصائيات اليومية</h3>
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>عدد المواعيد</span>
        </div>
      </div>
      <div className="space-y-4">
        {analytics.dailyStats.length > 0 ? (
          analytics.dailyStats.map((day, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 min-w-[120px]">
                {new Date(day.date).toLocaleDateString('ar-EG', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(day.count / Math.max(...analytics.dailyStats.map(d => d.count || 1))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 min-w-[60px] text-left">
                {day.count}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            لا توجد بيانات
          </div>
        )}
      </div>
    </div>
  )

  // Modern Hourly Distribution Component
  const HourlyDistribution = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">توزيع المواعيد حسب الساعة</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {analytics.hourlyDistribution.length > 0 ? (
          analytics.hourlyDistribution.map((hour, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100 group-hover:border-purple-300 transition-all duration-300">
                <div className="text-lg font-bold text-purple-600 mb-1">{hour.count}</div>
                <div className="text-xs text-gray-600 bg-white/50 rounded-full py-1 px-2">
                  {hour.time}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            لا توجد بيانات
          </div>
        )}
      </div>
    </div>
  )

  // Modern Status Pie Chart Component
  const StatusPieChart = () => {
    const total = stats.pending + stats.confirmed + stats.cancelled
    const pendingPercent = total > 0 ? (stats.pending / total) * 251.2 : 0
    const confirmedPercent = total > 0 ? (stats.confirmed / total) * 251.2 : 0
    const cancelledPercent = total > 0 ? (stats.cancelled / total) * 251.2 : 0

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">توزيع الحالات</h3>
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="relative w-48 h-48 mb-6 lg:mb-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {total > 0 && (
                <>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-amber-400"
                    strokeDasharray={`${pendingPercent} 251.2`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-emerald-500"
                    strokeDasharray={`${confirmedPercent} 251.2`}
                    strokeDashoffset={`${-pendingPercent}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-rose-500"
                    strokeDasharray={`${cancelledPercent} 251.2`}
                    strokeDashoffset={`${-(pendingPercent + confirmedPercent)}`}
                  />
                </>
              )}
              {total === 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-500">إجمالي</div>
              </div>
            </div>
          </div>
          <div className="space-y-4 min-w-[200px]">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">قيد الانتظار</div>
                <div className="text-xs text-gray-500">{((stats.pending / total) * 100 || 0).toFixed(1)}%</div>
              </div>
              <div className="text-lg font-bold text-gray-900">{stats.pending}</div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">مؤكد</div>
                <div className="text-xs text-gray-500">{((stats.confirmed / total) * 100 || 0).toFixed(1)}%</div>
              </div>
              <div className="text-lg font-bold text-gray-900">{stats.confirmed}</div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">ملغى</div>
                <div className="text-xs text-gray-500">{((stats.cancelled / total) * 100 || 0).toFixed(1)}%</div>
              </div>
              <div className="text-lg font-bold text-gray-900">{stats.cancelled}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${cairo.className}`}>
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">لوحة تحكم العيادة</h1>
                  <p className="text-sm text-gray-600">إدارة المواعيد والإحصائيات</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 space-x-reverse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>تصدير CSV</span>
              </button>
              <div className="hidden sm:flex items-center space-x-2 space-x-reverse text-sm text-gray-500 bg-white/50 px-3 py-2 rounded-lg border border-gray-200/60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Modern Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-30
          w-80 bg-white/90 backdrop-blur-xl border-l border-gray-200/60
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:shadow-none
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200/60">
              <h2 className="text-lg font-semibold text-gray-900">القائمة</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {[
                { id: 'list', name: 'قائمة المواعيد', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { id: 'analytics', name: 'الإحصائيات', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { id: 'calendar', name: 'التقويم', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-xl text-right transition-all duration-200 ${
                    view === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
              message.type === 'success' ? 'bg-green-50/80 text-green-700 border-green-200' : 
              message.type === 'error' ? 'bg-red-50/80 text-red-700 border-red-200' : 
              'bg-blue-50/80 text-blue-700 border-blue-200'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                {message.type === 'success' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {message.type === 'error' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <StatsCards />

          {/* View Content */}
          {view === 'list' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              {/* Modern Filters */}
              <div className="p-6 border-b border-gray-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البحث بالاسم</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.patientName}
                        onChange={(e) => handleFilterChange('patientName', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-600 text-gray-600 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="اسم المريض..."
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.phoneNumber}
                        onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-600 text-gray-600 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="رقم الهاتف..."
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-600 text-gray-600 text-gray-600 appearance-none focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                     
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-600 text-gray-600 focus:ring-blue-500 text-gray-600 focus:border-transparent transition-all duration-200 appearance-none"
                    >
                      <option value="">الكل</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Appointments Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">المريض</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الهاتف</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">التاريخ والوقت</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">ملاحظات</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200/60">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">{appointment.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(appointment.appointmentDate).toLocaleDateString('ar-EG')}
                          </div>
                          <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {appointment.status === 'confirmed' ? 'مؤكد' :
                             appointment.status === 'pending' ? 'قيد الانتظار' : 'ملغى'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {appointment.notes || '---'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => setSelectedAppointment(appointment)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                              title="تعديل"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment._id)}
                              className="text-rose-600 hover:text-rose-800 p-2 rounded-lg hover:bg-rose-50 transition-all duration-200"
                              title="حذف"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {appointments.length === 0 && !loading && (
                  <div className="text-center py-16 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div className="text-lg font-medium text-gray-900 mb-2">لا توجد مواعيد</div>
                    <p className="text-gray-600">لم يتم العثور على مواعيد متطابقة مع معايير البحث</p>
                  </div>
                )}
                
                {loading && (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="mt-4 text-sm text-gray-600">جاري تحميل البيانات...</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusPieChart />
                <HourlyDistribution />
              </div>
              <DailyStatsChart />
            </div>
          )}

          {view === 'calendar' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-8 text-center">
              <div className="max-w-md mx-auto">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">عرض التقويم</h3>
                <p className="text-gray-600 mb-6">سيتم إضافة عرض التقويم في تحديث قادم</p>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  تفعيل الإشعارات
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modern Edit Appointment Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/60">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">تعديل الموعد</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المريض</label>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900">
                    {selectedAppointment.patientName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الهاتف</label>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-mono">
                    {selectedAppointment.phoneNumber}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ والوقت</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString('ar-EG')} - {selectedAppointment.appointmentTime}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={selectedAppointment.status}
                  onChange={(e) => setSelectedAppointment({
                    ...selectedAppointment,
                    status: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border text-gray-600 border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-600 text-gray-600 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  value={selectedAppointment.notes || ''}
                  onChange={(e) => setSelectedAppointment({
                    ...selectedAppointment,
                    notes: e.target.value
                  })}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border text-gray-600 border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-600 text-gray-600 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="أضف ملاحظات هنا..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 space-x-reverse justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedAppointment._id, selectedAppointment.status)}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </div>
                ) : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
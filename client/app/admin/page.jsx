'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Cairo } from 'next/font/google'
import dynamic from 'next/dynamic'
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

// Dynamic imports
const DatePicker = dynamic(
  () => import('react-datepicker').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div className="w-full h-10 bg-gray-800 rounded-xl animate-pulse"></div>
  }
)

import "react-datepicker/dist/react-datepicker.css"

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'

export default function AdminPanel() {
  // States
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    patientName: '',
    phoneNumber: '',
    dateRange: {
      start: null,
      end: null
    }
  })
  const [patientFilters, setPatientFilters] = useState({
    search: '',
    gender: '',
    minAge: '',
    maxAge: '',
    hasAppointments: '',
    lastVisit: ''
  })
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    today: 0,
    upcoming: 0,
    past: 0,
    male: 0,
    female: 0,
    withAppointments: 0,
    activePatients: 0
  })
  const [systemStats, setSystemStats] = useState({
    database: {},
    backups: [],
    server: {}
  })
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedPatientRows, setSelectedPatientRows] = useState([])
  const [viewMode, setViewMode] = useState('table')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [bulkAction, setBulkAction] = useState('')
  const [showPastAppointments, setShowPastAppointments] = useState(false)
  const [showDateRange, setShowDateRange] = useState(false)
  const [activeFilter, setActiveFilter] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [newPatient, setNewPatient] = useState({
    patientName: '',
    phoneNumber: '',
    birthDate: '',
    gender: 'male',
    address: '',
    email: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    notes: ''
  })
  const [patientPage, setPatientPage] = useState(1)
  const [patientTotalPages, setPatientTotalPages] = useState(1)
  const [patientTotal, setPatientTotal] = useState(0)
  const [backupPage, setBackupPage] = useState(1)
  const [backupTotalPages, setBackupTotalPages] = useState(1)
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreConfirm, setRestoreConfirm] = useState(null)
  const [chartData, setChartData] = useState({
    appointments: null,
    patients: null,
    status: null
  })

  // Premium Dark Theme
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
    gradientInfo: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)'
  }

  // API Request Function
const apiRequest = useCallback(async (url, options = {}) => {
  try {
    const headers = {
      'x-admin-key': ADMIN_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    // DELETE methodunda body olmamalı
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include', // Cookies ve authorization için
      mode: 'cors', // CORS mode'u açıkça belirt
    };

    // DELETE isteklerinde body'yi kaldır
    if (options.method === 'DELETE') {
      delete fetchOptions.body;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

    // Network error kontrolü
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}${url}`,
        error: errorText
      });
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Network error durumunda retry mekanizması
    if (error.message.includes('Failed to fetch')) {
      setMessage({ 
        type: 'error', 
        text: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.' 
      });
    }
    
    throw error;
  }
}, []);

  // Initial Data Fetch
  useEffect(() => {
    fetchDashboardData()
    fetchPatients()
    fetchBackups()
    fetchSystemInfo()
  }, [])

  const fetchDashboardData = async () => {
  try {
    setLoading(true)
    
    // Fetch appointments
    const appointmentsRes = await apiRequest('/api/admin/appointments?limit=1000')
    if (appointmentsRes.success) {
      setAppointments(appointmentsRes.data || [])
      calculateAppointmentStats(appointmentsRes.data || [])
    }

    // Fetch basic patient counts instead of stats
    const patientsRes = await apiRequest('/api/patients?limit=1&page=1')
    if (patientsRes.success) {
      setStats(prev => ({
        ...prev,
        totalPatients: patientsRes.total || 0
      }))
    }

    // Get gender counts separately if needed
    try {
      const maleCount = await apiRequest('/api/patients?gender=male&limit=1&page=1')
      const femaleCount = await apiRequest('/api/patients?gender=female&limit=1&page=1')
      
      if (maleCount.success && femaleCount.success) {
        setStats(prev => ({
          ...prev,
          male: maleCount.total || 0,
          female: femaleCount.total || 0,
          withAppointments: prev.totalPatients, // يمكنك تحديث هذا لاحقًا
          activePatients: prev.totalPatients
        }))
      }
    } catch (genderError) {
      console.log('Error fetching gender stats:', genderError)
    }

    // Fetch system health
    try {
      const healthRes = await apiRequest('/api/health')
      if (healthRes.success) {
        // Update stats with health data
      }
    } catch (healthError) {
      console.log('Health check skipped:', healthError)
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    setMessage({ type: 'error', text: 'فشل في تحميل البيانات' })
  } finally {
    setLoading(false)
  }
}
  // Fetch Patients
  const fetchPatients = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page,
        limit: 10,
        ...patientFilters
      })

      const data = await apiRequest(`/api/patients?${queryParams}`)
      
      if (data.success) {
        setPatients(data.data || [])
        setPatientPage(data.page)
        setPatientTotalPages(data.totalPages)
        setPatientTotal(data.total)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setMessage({ type: 'error', text: 'فشل في جلب بيانات المرضى' })
    } finally {
      setLoading(false)
    }
  }

  // Fetch Backups
  const fetchBackups = async (page = 1) => {
    try {
      setBackupLoading(true)
      const data = await apiRequest(`/api/backup/list?page=${page}&limit=10`)
      
      if (data.success) {
        setBackups(data.data || [])
        setBackupPage(data.page)
        setBackupTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
      setMessage({ type: 'error', text: 'فشل في جلب النسخ الاحتياطية' })
    } finally {
      setBackupLoading(false)
    }
  }

  // Fetch System Info
  const fetchSystemInfo = async () => {
    try {
      const data = await apiRequest('/api/system/info')
      if (data.success) {
        setSystemStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching system info:', error)
    }
  }

  // Calculate Appointment Stats
  const calculateAppointmentStats = (appointmentsList) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const stats = {
      totalAppointments: appointmentsList.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      today: 0,
      upcoming: 0,
      past: 0
    }

    appointmentsList.forEach(apt => {
      if (apt.status === 'pending') stats.pending++
      if (apt.status === 'confirmed') stats.confirmed++
      if (apt.status === 'cancelled') stats.cancelled++
      
      const aptDate = new Date(apt.appointmentDate)
      const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate())
      
      if (aptDateOnly.getTime() === today.getTime()) {
        stats.today++
      } else if (aptDateOnly < today) {
        stats.past++
      } else {
        stats.upcoming++
      }
    })

    setStats(prev => ({ ...prev, ...stats }))
    prepareChartData(appointmentsList)
  }

  // Prepare Chart Data
  const prepareChartData = (appointmentsList) => {
    // Status Distribution
    const statusData = {
      labels: ['مؤكد', 'قيد الانتظار', 'ملغى'],
      datasets: [{
        data: [
          appointmentsList.filter(a => a.status === 'confirmed').length,
          appointmentsList.filter(a => a.status === 'pending').length,
          appointmentsList.filter(a => a.status === 'cancelled').length
        ],
        backgroundColor: [colors.success, colors.warning, colors.error],
        borderColor: [colors.successDark, colors.warningDark, colors.errorDark],
        borderWidth: 1
      }]
    }

    // Daily Appointments (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toLocaleDateString('ar-EG', { weekday: 'short' })
    }).reverse()

    const dailyCounts = last7Days.map(day => {
      return appointmentsList.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate.toLocaleDateString('ar-EG', { weekday: 'short' }) === day
      }).length
    })

    const dailyData = {
      labels: last7Days,
      datasets: [{
        label: 'المواعيد',
        data: dailyCounts,
        backgroundColor: colors.primaryLight + '40',
        borderColor: colors.primary,
        borderWidth: 2,
        tension: 0.4
      }]
    }

    setChartData({
      status: statusData,
      appointments: dailyData
    })
  }

  // Appointment Handlers
  const handleAppointmentStatusUpdate = async (appointmentId, newStatus, notes = '') => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/admin/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, notes })
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم تحديث حالة الموعد بنجاح' })
        fetchDashboardData()
        setSelectedAppointment(null)
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
      const data = await apiRequest(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE'
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم حذف الموعد بنجاح' })
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      setMessage({ type: 'error', text: 'فشل في حذف الموعد' })
    } finally {
      setLoading(false)
    }
  }

  // Patient Handlers
  const handleCreatePatient = async () => {
    try {
      setLoading(true)
      const data = await apiRequest('/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient)
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم إنشاء المريض بنجاح' })
        setNewPatient({
          patientName: '',
          phoneNumber: '',
          birthDate: '',
          gender: 'male',
          address: '',
          email: '',
          emergencyContact: '',
          medicalHistory: '',
          allergies: '',
          medications: '',
          notes: ''
        })
        setIsEditing(false)
        fetchPatients()
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error creating patient:', error)
      setMessage({ type: 'error', text: 'فشل في إنشاء المريض' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePatient = async () => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/patients/${selectedPatient._id}`, {
        method: 'PUT',
        body: JSON.stringify(selectedPatient)
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم تحديث بيانات المريض بنجاح' })
        setSelectedPatient(null)
        fetchPatients()
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating patient:', error)
      setMessage({ type: 'error', text: 'فشل في تحديث بيانات المريض' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePatient = async (patientId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟')) return
    
    try {
      setLoading(true)
      const data = await apiRequest(`/api/patients/${patientId}`, {
        method: 'DELETE'
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم حذف المريض بنجاح' })
        fetchPatients()
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      setMessage({ type: 'error', text: 'فشل في حذف المريض' })
    } finally {
      setLoading(false)
    }
  }

  // Backup Handlers
  const handleCreateBackup = async (type = 'full') => {
    try {
      setBackupLoading(true)
      const data = await apiRequest('/api/backup/create', {
        method: 'POST',
        body: JSON.stringify({ type })
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم إنشاء النسخة الاحتياطية بنجاح' })
        fetchBackups()
        fetchSystemInfo()
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      setMessage({ type: 'error', text: 'فشل في إنشاء النسخة الاحتياطية' })
    } finally {
      setBackupLoading(false)
    }
  }

  const handleRestoreBackup = async (backupId) => {
    try {
      setBackupLoading(true)
      const data = await apiRequest(`/api/backup/restore/${backupId}?clearExisting=true`, {
        method: 'POST'
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم استعادة النسخة الاحتياطية بنجاح' })
        setRestoreConfirm(null)
        fetchDashboardData()
        fetchPatients()
        fetchBackups()
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      setMessage({ type: 'error', text: 'فشل في استعادة النسخة الاحتياطية' })
    } finally {
      setBackupLoading(false)
    }
  }

  const handleDownloadBackup = async (backupId, filename) => {
    try {
      window.open(`${API_BASE_URL}/api/backup/download/${backupId}`, '_blank')
    } catch (error) {
      console.error('Error downloading backup:', error)
      setMessage({ type: 'error', text: 'فشل في تحميل النسخة الاحتياطية' })
    }
  }

  const handleDeleteBackup = async (backupId) => {
    if (!confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) return
    
    try {
      setBackupLoading(true)
      const data = await apiRequest(`/api/backup/${backupId}`, {
        method: 'DELETE'
      })
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم حذف النسخة الاحتياطية بنجاح' })
        fetchBackups()
        fetchSystemInfo()
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
      setMessage({ type: 'error', text: 'فشل في حذف النسخة الاحتياطية' })
    } finally {
      setBackupLoading(false)
    }
  }

  // Export Functions
  const exportAppointmentsToCSV = async () => {
    try {
      const data = await apiRequest('/api/admin/appointments?limit=10000')
      
      if (data.success && data.data.length > 0) {
        const headers = ['الاسم', 'الهاتف', 'التاريخ', 'الوقت', 'الحالة', 'ملاحظات', 'تاريخ الإنشاء']
        const csvData = data.data.map(apt => [
          apt.patientName,
          apt.phoneNumber,
          new Date(apt.appointmentDate).toLocaleDateString('ar-EG'),
          apt.appointmentTime,
          apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'pending' ? 'قيد الانتظار' : 'ملغى',
          apt.notes || 'لا توجد',
          new Date(apt.createdAt).toLocaleDateString('ar-EG')
        ])
        
        const csvContent = [headers, ...csvData]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n')
        
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `مواعيد-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        
        setMessage({ type: 'success', text: `تم تصدير ${data.data.length} موعد بنجاح` })
      }
    } catch (error) {
      console.error('Error exporting appointments:', error)
      setMessage({ type: 'error', text: 'فشل في تصدير المواعيد' })
    }
  }

  const exportPatientsToCSV = async () => {
    try {
      const data = await apiRequest('/api/patients/export?format=csv')
      
      if (data) {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `مرضى-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        
        setMessage({ type: 'success', text: 'تم تصدير بيانات المرضى بنجاح' })
      }
    } catch (error) {
      console.error('Error exporting patients:', error)
      setMessage({ type: 'error', text: 'فشل في تصدير بيانات المرضى' })
    }
  }

  // Filter Functions
  const FilteredAppointments = () => {
    let filtered = [...appointments]
    
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= filters.dateRange.start && aptDate <= filters.dateRange.end
      })
    } else if (filters.date) {
      filtered = filtered.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === new Date(filters.date).toDateString()
      )
    }
    
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status)
    }
    
    if (filters.patientName) {
      filtered = filtered.filter(apt => 
        apt.patientName?.toLowerCase().includes(filters.patientName.toLowerCase())
      )
    }
    
    if (filters.phoneNumber) {
      filtered = filtered.filter(apt => 
        apt.phoneNumber?.includes(filters.phoneNumber)
      )
    }
    
    if (!showPastAppointments) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today
      })
    }
    
    return filtered
  }

  // Component for Status Badge
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: colors.warning, text: 'قيد الانتظار', gradient: colors.gradientWarning },
      confirmed: { color: colors.success, text: 'مؤكد', gradient: colors.gradientSuccess },
      cancelled: { color: colors.error, text: 'ملغى', gradient: colors.gradientError }
    }
    
    const { color, text, gradient } = config[status] || config.pending
    
    return (
      <span
        className="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-default"
        style={{ 
          background: gradient,
          color: '#FFFFFF',
          border: `1px solid ${color}40`
        }}
      >
        {text}
      </span>
    )
  }

  // Calendar View Component
  const CalendarView = () => {
    const appointmentsByDate = {}
    FilteredAppointments().forEach(apt => {
      const dateStr = new Date(apt.appointmentDate).toISOString().split('T')[0]
      if (!appointmentsByDate[dateStr]) {
        appointmentsByDate[dateStr] = []
      }
      appointmentsByDate[dateStr].push(apt)
    })
    
    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay()
    
    const days = []
    
    for (let i = 0; i < (firstDayOfMonth + 6) % 7; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayAppointments = appointmentsByDate[dateStr] || []
      
      days.push({
        date: currentDate,
        appointments: dayAppointments
      })
    }
    
    return (
      <div className="bg-surface rounded-2xl border p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>عرض التقويم</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)))}
              className="p-2 rounded-xl hover:bg-surfaceLight transition-colors"
              style={{ color: colors.textLight }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-bold" style={{ color: colors.text }}>
              {calendarDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)))}
              className="p-2 rounded-xl hover:bg-surfaceLight transition-colors"
              style={{ color: colors.textLight }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
            <div key={day} className="text-center font-semibold py-2" style={{ color: colors.textLight }}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-24 p-2 border rounded-xl ${day ? 'bg-surface' : 'bg-background'}`}
              style={{ borderColor: colors.border }}
            >
              {day && (
                <>
                  <div className="text-right mb-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                      day.date.toDateString() === new Date().toDateString() ? 'bg-indigo-500 text-white' : ''
                    }`}>
                      {day.date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {day.appointments.map(apt => (
                      <div
                        key={apt._id}
                        className="p-1 text-xs rounded-lg truncate cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ 
                          backgroundColor: apt.status === 'confirmed' 
                            ? colors.success + '40' 
                            : apt.status === 'pending'
                            ? colors.warning + '40'
                            : colors.error + '40',
                          color: colors.text
                        }}
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <div className="font-medium truncate">{apt.patientName}</div>
                        <div className="truncate">{apt.appointmentTime}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate patient age
  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div dir="rtl" className={`min-h-screen ${cairo.className}`} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header style={{ 
        background: colors.gradientPrimary,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-black/10 transition-colors lg:hidden"
                style={{ color: '#FFFFFF' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">لوحة التحكم المتقدمة</h1>
                  <p className="text-sm font-medium text-white/90"> مركز الصواف للتصوير الشعاعي  -  إدارة شامل</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium text-white/80">عرض:</span>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    viewMode === 'table' 
                      ? 'bg-white text-indigo-600 shadow-lg' 
                      : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  جدول
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    viewMode === 'calendar' 
                      ? 'bg-white text-indigo-600 shadow-lg' 
                      : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  تقويم
                </button>
              </div>
              <button
                onClick={() => {
                  if (activeTab === 'patients') exportPatientsToCSV()
                  else exportAppointmentsToCSV()
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 hover:opacity-90 shadow-lg"
                style={{ 
                  background: colors.gradientSuccess,
                  color: '#FFFFFF'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                تصدير البيانات
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-30
          w-72
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:shadow-none h-screen lg:h-auto
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
        `} style={{ 
          backgroundColor: colors.surface,
          borderLeft: `1px solid ${colors.border}`
        }}>
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>القائمة الرئيسية</h2>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', name: 'لوحة التحكم', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'appointments', name: 'المواعيد', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { id: 'patients', name: 'المرضى', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'backup', name: 'النسخ الاحتياطي', icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' },
              { id: 'reports', name: 'التقارير', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'system', name: 'النظام', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
                  activeTab === item.id
                    ? 'font-semibold shadow-lg transform scale-[1.02]'
                    : 'font-medium hover:bg-surfaceLight'
                }`}
                style={{ 
                  background: activeTab === item.id ? colors.gradientPrimary : 'transparent',
                  color: activeTab === item.id ? '#FFFFFF' : colors.textLight
                }}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
          
          {/* Quick Stats */}
          <div className="p-4 mt-8">
            <div className="text-sm font-semibold mb-4" style={{ color: colors.textLight }}>ملخص سريع</div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>المواعيد</span>
                  <span className="font-bold text-lg" style={{ color: colors.primary }}>{stats.totalAppointments}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>إجمالي المواعيد</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>المرضى</span>
                  <span className="font-bold text-lg" style={{ color: colors.success }}>{stats.totalPatients}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>إجمالي المرضى</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>اليوم</span>
                  <span className="font-bold text-lg" style={{ color: colors.warning }}>{stats.today}</span>
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>مواعيد اليوم</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Message Alert */}
          {message.text && (
            <div 
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-sm ${
                message.type === 'success' 
                  ? 'bg-emerald-900/30 border border-emerald-700/50' 
                  : 'bg-rose-900/30 border border-rose-700/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'success' 
                  ? 'bg-emerald-500 text-emerald-100' 
                  : 'bg-rose-500 text-rose-100'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={message.type === 'success' 
                      ? "M5 13l4 4L19 7" 
                      : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    } 
                  />
                </svg>
              </div>
              <span className={`text-sm font-semibold flex-1 ${
                message.type === 'success' ? 'text-emerald-200' : 'text-rose-200'
              }`}>
                {message.text}
              </span>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="p-1 hover:opacity-70 transition-opacity"
                style={{ color: colors.textLight }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl border shadow-xl backdrop-blur-sm" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats.totalAppointments}</div>
                      <div className="text-sm font-medium mt-1" style={{ color: colors.textLight }}>إجمالي المواعيد</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                      background: colors.gradientPrimary
                    }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl border shadow-xl backdrop-blur-sm" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: colors.success }}>{stats.totalPatients}</div>
                      <div className="text-sm font-medium mt-1" style={{ color: colors.textLight }}>إجمالي المرضى</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                      background: colors.gradientSuccess
                    }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl border shadow-xl backdrop-blur-sm" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  backgroundImage: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: colors.warning }}>{stats.today}</div>
                      <div className="text-sm font-medium mt-1" style={{ color: colors.textLight }}>مواعيد اليوم</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                      background: colors.gradientWarning
                    }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl border shadow-xl backdrop-blur-sm" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  backgroundImage: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: colors.error }}>{stats.cancelled}</div>
                      <div className="text-sm font-medium mt-1" style={{ color: colors.textLight }}>مواعيد ملغاة</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                      background: colors.gradientError
                    }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartData.appointments && (
                  <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.surface
                  }}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>المواعيد خلال الأسبوع</h3>
                    <div className="h-64">
                      <Line 
                        data={chartData.appointments}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: { color: colors.textLight }
                            }
                          },
                          scales: {
                            x: {
                              grid: { color: colors.border },
                              ticks: { color: colors.textLight }
                            },
                            y: {
                              grid: { color: colors.border },
                              ticks: { color: colors.textLight }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {chartData.status && (
                  <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.surface
                  }}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>توزيع حالات المواعيد</h3>
                    <div className="h-64">
                      <Pie 
                        data={chartData.status}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: { color: colors.textLight }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Appointments */}
              <div className="rounded-2xl border shadow-xl" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}>
                <div className="p-6 border-b" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>أحدث المواعيد</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: colors.surfaceLight }}>
                      <tr>
                        <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>المريض</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>التاريخ</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الحالة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: colors.border }}>
                      {appointments.slice(0, 5).map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="px-6 py-3">
                            <div className="text-sm font-semibold" style={{ color: colors.text }}>{appointment.patientName}</div>
                            <div className="text-xs" style={{ color: colors.textLight }}>{appointment.phoneNumber}</div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-sm" style={{ color: colors.text }}>
                              {new Date(appointment.appointmentDate).toLocaleDateString('ar-EG')}
                            </div>
                            <div className="text-xs" style={{ color: colors.textLight }}>{appointment.appointmentTime}</div>
                          </td>
                          <td className="px-6 py-3">
                            <StatusBadge status={appointment.status} />
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => setSelectedAppointment(appointment)}
                              className="text-sm font-medium hover:opacity-80 transition-opacity"
                              style={{ color: colors.primary }}
                            >
                              عرض التفاصيل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>تصفية المواعيد</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>اسم المريض</label>
                    <input
                      type="text"
                      value={filters.patientName}
                      onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                      placeholder="ابحث بالاسم..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>رقم الهاتف</label>
                    <input
                      type="text"
                      value={filters.phoneNumber}
                      onChange={(e) => setFilters({ ...filters, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                      placeholder="ابحث بالهاتف..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>حالة الموعد</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                      style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    >
                      <option value="">جميع الحالات</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>تاريخ الموعد</label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setFilters({
                      date: '',
                      status: '',
                      patientName: '',
                      phoneNumber: '',
                      dateRange: { start: null, end: null }
                    })}
                    className="px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ 
                      borderColor: colors.borderLight,
                      color: colors.textLight,
                      backgroundColor: colors.surfaceLight
                    }}
                  >
                    مسح الفلاتر
                  </button>
                  <button
                    onClick={() => setShowPastAppointments(!showPastAppointments)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity ${
                      showPastAppointments ? 'active' : ''
                    }`}
                    style={{ 
                      borderColor: showPastAppointments ? colors.primary : colors.borderLight,
                      color: showPastAppointments ? colors.primary : colors.textLight,
                      backgroundColor: showPastAppointments ? `${colors.primary}15` : colors.surfaceLight
                    }}
                  >
                    {showPastAppointments ? 'إخفاء المنتهية' : 'عرض المنتهية'}
                  </button>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                    إجمالي النتائج: <span className="font-bold" style={{ color: colors.text }}>{FilteredAppointments().length}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      viewMode === 'table' 
                        ? 'shadow-lg' 
                        : 'hover:opacity-90'
                    }`}
                    style={viewMode === 'table' ? {
                      background: colors.gradientPrimary,
                      color: '#FFFFFF'
                    } : {
                      border: `1px solid ${colors.borderLight}`,
                      color: colors.textLight,
                      backgroundColor: colors.surfaceLight
                    }}
                  >
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    جدول
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      viewMode === 'calendar' 
                        ? 'shadow-lg' 
                        : 'hover:opacity-90'
                    }`}
                    style={viewMode === 'calendar' ? {
                      background: colors.gradientPrimary,
                      color: '#FFFFFF'
                    } : {
                      border: `1px solid ${colors.borderLight}`,
                      color: colors.textLight,
                      backgroundColor: colors.surfaceLight
                    }}
                  >
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    تقويم
                  </button>
                </div>
              </div>

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="rounded-2xl border overflow-hidden shadow-xl">
                  <div className="p-6 border-b" style={{ borderColor: colors.border }}>
                    <h3 className="text-lg font-bold" style={{ color: colors.text }}>قائمة المواعيد</h3>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
                      <p className="mt-4 font-medium" style={{ color: colors.textMuted }}>جاري تحميل البيانات...</p>
                    </div>
                  ) : FilteredAppointments().length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                        background: colors.gradientPrimary,
                        opacity: 0.1
                      }}>
                        <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="text-lg font-bold mb-2" style={{ color: colors.text }}>لا توجد مواعيد</div>
                      <p className="font-medium" style={{ color: colors.textLight }}>لم يتم العثور على مواعيد متطابقة مع معايير البحث</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead style={{ backgroundColor: colors.surfaceLight }}>
                          <tr>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>المريض</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الهاتف</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>التاريخ والوقت</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الحالة</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>ملاحظات</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: colors.border }}>
                          {FilteredAppointments().map((appointment) => (
                            <tr key={appointment._id}>
                              <td className="px-6 py-3">
                                <div className="text-sm font-semibold" style={{ color: colors.text }}>{appointment.patientName}</div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm font-mono font-medium" style={{ color: colors.text }}>{appointment.phoneNumber}</div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm font-semibold" style={{ color: colors.text }}>
                                  {new Date(appointment.appointmentDate).toLocaleDateString('ar-EG')}
                                </div>
                                <div className="text-sm font-medium" style={{ color: colors.textLight }}>{appointment.appointmentTime}</div>
                              </td>
                              <td className="px-6 py-3">
                                <StatusBadge status={appointment.status} />
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm max-w-xs truncate" style={{ color: colors.textLight }}>
                                  {appointment.notes || 'لا توجد ملاحظات'}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedAppointment(appointment)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                      background: colors.gradientPrimary,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    تعديل
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(appointment._id)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                      background: colors.gradientError,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Calendar View */}
              {viewMode === 'calendar' && <CalendarView />}
            </div>
          )}

          {/* Patients */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              {/* Patient Filters */}
              <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>إدارة المرضى</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
                    style={{ 
                      background: colors.gradientSuccess,
                      color: '#FFFFFF'
                    }}
                  >
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة مريض جديد
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.textLight }}>البحث بالاسم أو الهاتف</label>
                    <input
                      type="text"
                      value={patientFilters.search}
                      onChange={(e) => setPatientFilters({ ...patientFilters, search: e.target.value })}
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
                      value={patientFilters.gender}
                      onChange={(e) => setPatientFilters({ ...patientFilters, gender: e.target.value })}
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
                      value={patientFilters.hasAppointments}
                      onChange={(e) => setPatientFilters({ ...patientFilters, hasAppointments: e.target.value })}
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
                  onClick={() => fetchPatients(1)}
                  className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ 
                    background: colors.gradientPrimary,
                    color: '#FFFFFF'
                  }}
                >
                  تطبيق الفلاتر
                </button>
              </div>

              {/* Patients Table */}
              <div className="rounded-2xl border overflow-hidden shadow-xl">
                <div className="p-6 border-b" style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold" style={{ color: colors.text }}>قائمة المرضى</h3>
                    <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                      إجمالي: {patientTotal} مريض
                    </span>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
                    <p className="mt-4 font-medium" style={{ color: colors.textMuted }}>جاري تحميل البيانات...</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                      background: colors.gradientPrimary,
                      opacity: 0.1
                    }}>
                      <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-lg font-bold mb-2" style={{ color: colors.text }}>لا توجد بيانات</div>
                    <p className="font-medium" style={{ color: colors.textLight }}>لم يتم العثور على مرضى متطابقين مع معايير البحث</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead style={{ backgroundColor: colors.surfaceLight }}>
                          <tr>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>اسم المريض</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الهاتف</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>العمر</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الجنس</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>عدد المواعيد</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>آخر زيارة</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: colors.border }}>
                          {patients.map((patient) => (
                            <tr key={patient._id}>
                              <td className="px-6 py-3">
                                <div className="text-sm font-semibold" style={{ color: colors.text }}>{patient.patientName}</div>
                                {patient.email && (
                                  <div className="text-xs" style={{ color: colors.textLight }}>{patient.email}</div>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm font-mono font-medium" style={{ color: colors.text }}>{patient.phoneNumber}</div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm" style={{ color: colors.text }}>
                                  {patient.birthDate ? calculateAge(patient.birthDate) + ' سنة' : 'غير محدد'}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  patient.gender === 'male' 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-pink-500/20 text-pink-400'
                                }`}>
                                  {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm font-semibold" style={{ color: colors.text }}>
                                  {patient.appointmentCount || 0}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm" style={{ color: colors.textLight }}>
                                  {patient.lastVisit 
                                    ? new Date(patient.lastVisit).toLocaleDateString('ar-EG')
                                    : 'لا توجد'
                                  }
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedPatient(patient)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                      background: colors.gradientPrimary,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    عرض
                                  </button>
                                  <button
                                    onClick={() => handleDeletePatient(patient._id)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                      background: colors.gradientError,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="p-4 border-t" style={{ borderColor: colors.border }}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => fetchPatients(patientPage - 1)}
                          disabled={patientPage === 1}
                          className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                          style={{ 
                            borderColor: colors.borderLight,
                            color: colors.textLight,
                            backgroundColor: colors.surfaceLight
                          }}
                        >
                          السابق
                        </button>
                        <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                          الصفحة {patientPage} من {patientTotalPages}
                        </span>
                        <button
                          onClick={() => fetchPatients(patientPage + 1)}
                          disabled={patientPage === patientTotalPages}
                          className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                          style={{ 
                            borderColor: colors.borderLight,
                            color: colors.textLight,
                            backgroundColor: colors.surfaceLight
                          }}
                        >
                          التالي
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Backup System */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Backup Actions */}
              <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>النسخ الاحتياطي</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleCreateBackup('full')}
                    disabled={backupLoading}
                    className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right group"
                    style={{ 
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceLight,
                      backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <svg className="w-6 h-6 group-hover:text-indigo-400 transition-colors" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="font-semibold mb-1 group-hover:text-indigo-300 transition-colors" style={{ color: colors.text }}>نسخة احتياطية كاملة</div>
                    <div className="text-sm group-hover:text-indigo-200 transition-colors" style={{ color: colors.textMuted }}>جميع البيانات (مرضى + مواعيد)</div>
                  </button>
                  
                  <button
                    onClick={() => handleCreateBackup('patients')}
                    disabled={backupLoading}
                    className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right group"
                    style={{ 
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceLight,
                      backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <svg className="w-6 h-6 group-hover:text-emerald-400 transition-colors" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="font-semibold mb-1 group-hover:text-emerald-300 transition-colors" style={{ color: colors.text }}>نسخة المرضى فقط</div>
                    <div className="text-sm group-hover:text-emerald-200 transition-colors" style={{ color: colors.textMuted }}>بيانات المرضى فقط</div>
                  </button>
                  
                  <button
                    onClick={() => handleCreateBackup('appointments')}
                    disabled={backupLoading}
                    className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right group"
                    style={{ 
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceLight,
                      backgroundImage: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <svg className="w-6 h-6 group-hover:text-yellow-400 transition-colors" style={{ color: colors.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="font-semibold mb-1 group-hover:text-yellow-300 transition-colors" style={{ color: colors.text }}>نسخة المواعيد فقط</div>
                    <div className="text-sm group-hover:text-yellow-200 transition-colors" style={{ color: colors.textMuted }}>بيانات المواعيد فقط</div>
                  </button>
                </div>
              </div>

              {/* Backups List */}
              <div className="rounded-2xl border overflow-hidden shadow-xl">
                <div className="p-6 border-b" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>النسخ الاحتياطية السابقة</h3>
                </div>
                
                {backupLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
                    <p className="mt-4 font-medium" style={{ color: colors.textMuted }}>جاري تحميل البيانات...</p>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                      background: colors.gradientPrimary,
                      opacity: 0.1
                    }}>
                      <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-lg font-bold mb-2" style={{ color: colors.text }}>لا توجد نسخ احتياطية</div>
                    <p className="font-medium" style={{ color: colors.textLight }}>لم يتم إنشاء أي نسخ احتياطية بعد</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead style={{ backgroundColor: colors.surfaceLight }}>
                          <tr>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>اسم الملف</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>النوع</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الحجم</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>تاريخ الإنشاء</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الحالة</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: colors.border }}>
                          {backups.map((backup) => (
                            <tr key={backup._id}>
                              <td className="px-6 py-3">
                                <div className="text-sm font-semibold" style={{ color: colors.text }}>{backup.filename}</div>
                                <div className="text-xs" style={{ color: colors.textLight }}>
                                  {backup.recordCount} سجل
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  backup.type === 'full' 
                                    ? 'bg-indigo-500/20 text-indigo-400' 
                                    : backup.type === 'patients'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {backup.type === 'full' ? 'كاملة' : backup.type === 'patients' ? 'مرضى' : 'مواعيد'}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm" style={{ color: colors.text }}>
                                  {formatFileSize(backup.size)}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm" style={{ color: colors.text }}>
                                  {new Date(backup.backupDate).toLocaleDateString('ar-EG')}
                                </div>
                                <div className="text-xs" style={{ color: colors.textLight }}>
                                  {new Date(backup.backupDate).toLocaleTimeString('ar-EG')}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  backup.status === 'success' 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : backup.status === 'failed'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {backup.status === 'success' ? 'ناجحة' : backup.status === 'failed' ? 'فشلت' : 'قيد الانتظار'}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleDownloadBackup(backup._id, backup.filename)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                      background: colors.gradientInfo,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    تحميل
                                  </button>
                                  <button
                                    onClick={() => setRestoreConfirm(backup)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                      background: colors.gradientSuccess,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    استعادة
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBackup(backup._id)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                      background: colors.gradientError,
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="p-4 border-t" style={{ borderColor: colors.border }}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => fetchBackups(backupPage - 1)}
                          disabled={backupPage === 1}
                          className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                          style={{ 
                            borderColor: colors.borderLight,
                            color: colors.textLight,
                            backgroundColor: colors.surfaceLight
                          }}
                        >
                          السابق
                        </button>
                        <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                          الصفحة {backupPage} من {backupTotalPages}
                        </span>
                        <button
                          onClick={() => fetchBackups(backupPage + 1)}
                          disabled={backupPage === backupTotalPages}
                          className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                          style={{ 
                            borderColor: colors.borderLight,
                            color: colors.textLight,
                            backgroundColor: colors.surfaceLight
                          }}
                        >
                          التالي
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>التقارير والإحصائيات</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Report Options */}
                  <div>
                    <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>توليد التقارير</h4>
                    <div className="space-y-4">
                      <button className="w-full p-4 border rounded-xl hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group" style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surfaceLight,
                        backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
                      }}>
                        <div>
                          <div className="font-semibold mb-1" style={{ color: colors.text }}>تقرير المواعيد اليومية</div>
                          <div className="text-sm" style={{ color: colors.textMuted }}>تقرير مفصل بجميع مواعيد اليوم</div>
                        </div>
                        <svg className="w-5 h-5 group-hover:text-indigo-400 transition-colors" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={exportAppointmentsToCSV}
                        className="w-full p-4 border rounded-xl hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group"
                        style={{ 
                          borderColor: colors.borderLight,
                          backgroundColor: colors.surfaceLight,
                          backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                        }}
                      >
                        <div>
                          <div className="font-semibold mb-1" style={{ color: colors.text }}>تصدير جميع المواعيد</div>
                          <div className="text-sm" style={{ color: colors.textMuted }}>تصدير جميع المواعيد بتنسيق CSV</div>
                        </div>
                        <svg className="w-5 h-5 group-hover:text-emerald-400 transition-colors" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={exportPatientsToCSV}
                        className="w-full p-4 border rounded-xl hover:transform hover:scale-[1.02] transition-all text-right flex items-center justify-between group"
                        style={{ 
                          borderColor: colors.borderLight,
                          backgroundColor: colors.surfaceLight,
                          backgroundImage: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                        }}
                      >
                        <div>
                          <div className="font-semibold mb-1" style={{ color: colors.text }}>تصدير بيانات المرضى</div>
                          <div className="text-sm" style={{ color: colors.textMuted }}>تصدير جميع بيانات المرضى</div>
                        </div>
                        <svg className="w-5 h-5 group-hover:text-rose-400 transition-colors" style={{ color: colors.error }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Statistics Summary */}
                  <div>
                    <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>ملخص الإحصائيات</h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border" style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surfaceLight
                      }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium" style={{ color: colors.text }}>إجمالي المواعيد</div>
                            <div className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>{stats.totalAppointments}</div>
                          </div>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                            background: colors.gradientPrimary
                          }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl border" style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surfaceLight
                      }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium" style={{ color: colors.text }}>إجمالي المرضى</div>
                            <div className="text-2xl font-bold mt-1" style={{ color: colors.success }}>{stats.totalPatients}</div>
                          </div>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                            background: colors.gradientSuccess
                          }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl border" style={{ 
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surfaceLight
                      }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium" style={{ color: colors.text }}>مواعيد اليوم</div>
                            <div className="text-2xl font-bold mt-1" style={{ color: colors.warning }}>{stats.today}</div>
                          </div>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                            background: colors.gradientWarning
                          }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>معلومات النظام</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Database Info */}
                  <div>
                    <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>قاعدة البيانات</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                        <div className="text-sm font-medium" style={{ color: colors.textLight }}>اسم قاعدة البيانات</div>
                        <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.database?.name || 'N/A'}</div>
                      </div>
                      <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                        <div className="text-sm font-medium" style={{ color: colors.textLight }}>حجم البيانات</div>
                        <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                          {systemStats.database?.dataSize ? formatFileSize(systemStats.database.dataSize) : 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                        <div className="text-sm font-medium" style={{ color: colors.textLight }}>عدد المجموعات</div>
                        <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.database?.collections || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Server Info */}
                  <div>
                    <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>معلومات الخادم</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                        <div className="text-sm font-medium" style={{ color: colors.textLight }}>نظام التشغيل</div>
                        <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.server?.platform || 'N/A'}</div>
                      </div>
                      <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                        <div className="text-sm font-medium" style={{ color: colors.textLight }}>إصدار Node.js</div>
                        <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.server?.nodeVersion || 'N/A'}</div>
                      </div>
                      <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                        <div className="text-sm font-medium" style={{ color: colors.textLight }}>وقت التشغيل</div>
                        <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                          {systemStats.server?.uptime ? Math.floor(systemStats.server.uptime / 60) + ' دقائق' : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="rounded-2xl border p-6 shadow-xl" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>صحة النظام</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border text-center" style={{ 
                    borderColor: colors.success + '40',
                    backgroundColor: colors.success + '10'
                  }}>
                    <div className="text-2xl font-bold mb-2" style={{ color: colors.success }}>{stats.totalPatients}</div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>عدد المرضى</div>
                  </div>
                  
                  <div className="p-4 rounded-xl border text-center" style={{ 
                    borderColor: colors.primary + '40',
                    backgroundColor: colors.primary + '10'
                  }}>
                    <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>{stats.totalAppointments}</div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>عدد المواعيد</div>
                  </div>
                  
                  <div className="p-4 rounded-xl border text-center" style={{ 
                    borderColor: colors.warning + '40',
                    backgroundColor: colors.warning + '10'
                  }}>
                    <div className="text-2xl font-bold mb-2" style={{ color: colors.warning }}>{backups.length}</div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>النسخ الاحتياطية</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Appointment Edit Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl max-w-md w-full p-6 shadow-2xl" style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>تعديل الموعد</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 rounded-lg hover:bg-surfaceLight transition-colors"
                style={{ color: colors.textLight }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>المريض</label>
                <div className="px-4 py-2.5 rounded-lg border font-medium" style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceLight,
                  color: colors.text
                }}>
                  {selectedAppointment.patientName}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>الهاتف</label>
                <div className="px-4 py-2.5 rounded-lg border font-mono font-medium" style={{ 
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceLight,
                  color: colors.text
                }}>
                  {selectedAppointment.phoneNumber}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>الحالة</label>
                <select
                  value={selectedAppointment.status}
                  onChange={(e) => setSelectedAppointment({
                    ...selectedAppointment,
                    status: e.target.value
                  })}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-medium"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>ملاحظات</label>
                <textarea
                  value={selectedAppointment.notes || ''}
                  onChange={(e) => setSelectedAppointment({
                    ...selectedAppointment,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none font-medium"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                  placeholder="أضف ملاحظات هنا..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ 
                  border: `1px solid ${colors.borderLight}`,
                  color: colors.textLight,
                  backgroundColor: colors.surfaceLight
                }}
              >
                إلغاء
              </button>
              <button
                onClick={() => handleAppointmentStatusUpdate(selectedAppointment._id, selectedAppointment.status, selectedAppointment.notes)}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
                style={{ 
                  background: colors.gradientPrimary,
                  color: '#FFFFFF'
                }}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Edit/Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8" style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>إضافة مريض جديد</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg hover:bg-surfaceLight transition-colors"
                style={{ color: colors.textLight }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>اسم المريض *</label>
                <input
                  type="text"
                  value={newPatient.patientName}
                  onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>رقم الهاتف *</label>
                <input
                  type="tel"
                  value={newPatient.phoneNumber}
                  onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>تاريخ الميلاد</label>
                <input
                  type="date"
                  value={newPatient.birthDate}
                  onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>الجنس</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>العنوان</label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>ملاحظات طبية</label>
                <textarea
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  style={{ 
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceLight,
                    color: colors.text
                  }}
                  placeholder="التاريخ المرضي، الحساسية، الأدوية..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ 
                  border: `1px solid ${colors.borderLight}`,
                  color: colors.textLight,
                  backgroundColor: colors.surfaceLight
                }}
              >
                إلغاء
              </button>
              <button
                onClick={handleCreatePatient}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
                style={{ 
                  background: colors.gradientSuccess,
                  color: '#FFFFFF'
                }}
              >
                {loading ? 'جاري الحفظ...' : 'إنشاء المريض'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient View Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8" style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>تفاصيل المريض</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Navigate to patient's appointments
                    setActiveTab('appointments')
                    setFilters({ ...filters, phoneNumber: selectedPatient.phoneNumber })
                    setSelectedPatient(null)
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ 
                    background: colors.gradientInfo,
                    color: '#FFFFFF'
                  }}
                >
                  مواعيد المريض
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-1 rounded-lg hover:bg-surfaceLight transition-colors"
                  style={{ color: colors.textLight }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ borderColor: colors.borderLight }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textLight }}>المعلومات الشخصية</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.textLight }}>الاسم الكامل:</span>
                      <span className="text-sm font-semibold" style={{ color: colors.text }}>{selectedPatient.patientName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.textLight }}>رقم الهاتف:</span>
                      <span className="text-sm font-semibold font-mono" style={{ color: colors.text }}>{selectedPatient.phoneNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.textLight }}>العمر:</span>
                      <span className="text-sm font-semibold" style={{ color: colors.text }}>
                        {selectedPatient.birthDate ? calculateAge(selectedPatient.birthDate) + ' سنة' : 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.textLight }}>الجنس:</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        selectedPatient.gender === 'male' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-pink-500/20 text-pink-400'
                      }`}>
                        {selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>
                    {selectedPatient.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: colors.textLight }}>البريد الإلكتروني:</span>
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>{selectedPatient.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Medical Info */}
                <div className="p-4 rounded-xl border" style={{ borderColor: colors.borderLight }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textLight }}>المعلومات الطبية</h4>
                  <div className="space-y-2">
                    {selectedPatient.medicalHistory && (
                      <div>
                        <div className="text-sm mb-1" style={{ color: colors.textLight }}>التاريخ المرضي:</div>
                        <div className="text-sm" style={{ color: colors.text }}>{selectedPatient.medicalHistory}</div>
                      </div>
                    )}
                    {selectedPatient.allergies && (
                      <div>
                        <div className="text-sm mb-1" style={{ color: colors.textLight }}>الحساسية:</div>
                        <div className="text-sm" style={{ color: colors.text }}>{selectedPatient.allergies}</div>
                      </div>
                    )}
                    {selectedPatient.medications && (
                      <div>
                        <div className="text-sm mb-1" style={{ color: colors.textLight }}>الأدوية:</div>
                        <div className="text-sm" style={{ color: colors.text }}>{selectedPatient.medications}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Statistics & Actions */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ borderColor: colors.borderLight }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textLight }}>الإحصائيات</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.primary + '10' }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>{selectedPatient.appointmentCount || 0}</div>
                      <div className="text-xs" style={{ color: colors.textLight }}>عدد المواعيد</div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.success + '10' }}>
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.success }}>{selectedPatient.totalVisits || 0}</div>
                      <div className="text-xs" style={{ color: colors.textLight }}>الزيارات الكلية</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.textLight }}>آخر زيارة:</span>
                      <span className="text-sm font-semibold" style={{ color: colors.text }}>
                        {selectedPatient.lastVisit 
                          ? new Date(selectedPatient.lastVisit).toLocaleDateString('ar-EG')
                          : 'لا توجد'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm" style={{ color: colors.textLight }}>تاريخ التسجيل:</span>
                      <span className="text-sm font-semibold" style={{ color: colors.text }}>
                        {new Date(selectedPatient.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-4 rounded-xl border" style={{ borderColor: colors.borderLight }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textLight }}>الإجراءات</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // Edit patient
                        setNewPatient(selectedPatient)
                        setIsEditing(true)
                        setSelectedPatient(null)
                      }}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ 
                        background: colors.gradientPrimary,
                        color: '#FFFFFF'
                      }}
                    >
                      تعديل بيانات المريض
                    </button>
                    <button
                      onClick={() => handleDeletePatient(selectedPatient._id)}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ 
                        background: colors.gradientError,
                        color: '#FFFFFF'
                      }}
                    >
                      حذف المريض
                    </button>
                    <button
                      onClick={() => {
                        // Create new appointment for this patient
                        // You can implement this based on your appointment creation logic
                        setSelectedPatient(null)
                        setMessage({ type: 'info', text: 'سيتم إضافة وظيفة إنشاء موعد جديد قريباً' })
                      }}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ 
                        border: `1px solid ${colors.borderLight}`,
                        color: colors.textLight,
                        backgroundColor: colors.surfaceLight
                      }}
                    >
                      إنشاء موعد جديد
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl max-w-md w-full p-6 shadow-2xl" style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                background: colors.gradientWarning,
                opacity: 0.2
              }}>
                <svg className="w-8 h-8" style={{ color: colors.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>تأكيد استعادة النسخة الاحتياطية</h3>
              <p className="text-sm" style={{ color: colors.textLight }}>
                هل أنت متأكد من استعادة النسخة الاحتياطية؟<br />
                سيتم حذف جميع البيانات الحالية واستبدالها بالنسخة المحفوظة.
              </p>
            </div>
            
            <div className="flex gap-3 justify-center mt-8">
              <button
                onClick={() => setRestoreConfirm(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ 
                  border: `1px solid ${colors.borderLight}`,
                  color: colors.textLight,
                  backgroundColor: colors.surfaceLight
                }}
              >
                إلغاء
              </button>
              <button
                onClick={() => handleRestoreBackup(restoreConfirm._id)}
                disabled={backupLoading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
                style={{ 
                  background: colors.gradientError,
                  color: '#FFFFFF'
                }}
              >
                {backupLoading ? 'جاري الاستعادة...' : 'تأكيد الاستعادة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
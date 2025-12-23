'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
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
import StatsCards from './StatsCards'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import StatusBadge from '../ui/StatusBadge'


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

// Dynamic imports for charts
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), {
  ssr: false,
  loading: () => <div className="h-64 bg-surface rounded-xl animate-pulse"></div>
})

const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
  ssr: false,
  loading: () => <div className="h-64 bg-surface rounded-xl animate-pulse"></div>
})

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <div className="h-64 bg-surface rounded-xl animate-pulse"></div>
})

export default function Dashboard({ stats }) {
  const [appointments, setAppointments] = useState([])
  const [chartData, setChartData] = useState({
    appointments: null,
    status: null
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const appointmentsRes = await apiRequest('/api/admin/appointments?limit=1000')
      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data || [])
        prepareChartData(appointmentsRes.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

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

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      
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
                      onClick={() => console.log('View details')}
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
  )
}
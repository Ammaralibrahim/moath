// @/components/appointments/AppointmentsTable.jsx
'use client'

import { useMemo } from 'react'
import StatusBadge from '@/components/ui/StatusBadge'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

const AppointmentsTable = ({ appointments, onEdit, onDelete }) => {
  const formattedAppointments = useMemo(() => 
    appointments.map(apt => ({
      ...apt,
      formattedDate: apt.appointmentDate 
        ? format(new Date(apt.appointmentDate), 'dd MMMM yyyy', { locale: ar })
        : 'غير محدد'
    })), [appointments]
  )

  if (formattedAppointments.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600/10 to-blue-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">لا توجد مواعيد</h3>
        <p className="text-gray-400 text-sm">لم يتم العثور على مواعيد متطابقة مع معايير البحث</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'border-l-4 border-l-emerald-500'
      case 'pending': return 'border-l-4 border-l-amber-500'
      case 'cancelled': return 'border-l-4 border-l-rose-500'
      default: return 'border-l-4 border-l-gray-500'
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-gray-100">قائمة المواعيد</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/80">
            <tr>
              <th className="p-4 text-right text-sm font-medium text-gray-300">المريض</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">الهاتف</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">التاريخ والوقت</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">الحالة</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">ملاحظات</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {formattedAppointments.map((appointment) => (
              <tr 
                key={appointment._id} 
                className={`hover:bg-gray-800/30 transition-colors ${getStatusColor(appointment.status)}`}
              >
                <td className="p-4">
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-100">
                      {appointment.patientName || 'غير محدد'}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {appointment.age ? `العمر: ${appointment.age}` : 'بدون عمر'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-mono font-medium text-gray-100">
                    {appointment.phoneNumber || 'بدون رقم'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-100">
                      {appointment.formattedDate}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {appointment.appointmentTime || 'بدون وقت'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={appointment.status} />
                </td>
                <td className="p-4">
                  <div className="max-w-xs">
                    <div className="text-sm text-gray-300 truncate" title={appointment.notes || 'لا توجد ملاحظات'}>
                      {appointment.notes || 'لا توجد ملاحظات'}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(appointment)}
                      className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </button>
                    <button
                      onClick={() => onDelete(appointment._id)}
                      className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with pagination info */}
      <div className="p-4 border-t border-gray-800 text-sm text-gray-400 flex items-center justify-between">
        <div>
          عرض {Math.min(formattedAppointments.length, 10)} من {formattedAppointments.length} موعد
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            السابق
          </button>
          <span className="px-3 py-1 bg-gray-800 rounded-lg">1</span>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            التالي
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentsTable
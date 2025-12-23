'use client'

import { colors } from '@/components/shared/constants'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate } from '@/components/shared/utils'

export default function AppointmentsTable({ appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border overflow-hidden shadow-xl">
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
      </div>
    )
  }

  return (
    <div className="rounded-2xl border overflow-hidden shadow-xl">
      <div className="p-6 border-b" style={{ borderColor: colors.border }}>
        <h3 className="text-lg font-bold" style={{ color: colors.text }}>قائمة المواعيد</h3>
      </div>
      
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
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td className="px-6 py-3">
                  <div className="text-sm font-semibold" style={{ color: colors.text }}>{appointment.patientName}</div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-mono font-medium" style={{ color: colors.text }}>{appointment.phoneNumber}</div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-semibold" style={{ color: colors.text }}>
                    {formatDate(appointment.appointmentDate)}
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
                      onClick={() => console.log('Edit', appointment._id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                      style={{ 
                        background: colors.gradientPrimary,
                        color: '#FFFFFF'
                      }}
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => console.log('Delete', appointment._id)}
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
    </div>
  )
}
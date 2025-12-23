'use client'

import { colors } from '@/components/shared/constants'
import { calculateAge, formatDate } from '@/components/shared/utils'

export default function PatientsTable({ patients, pagination, onPageChange, onView, onEdit, onDelete }) {
  if (patients.length === 0) {
    return (
      <div className="rounded-2xl border overflow-hidden shadow-xl">
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
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border overflow-hidden shadow-xl">
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>قائمة المرضى</h3>
            <span className="text-sm font-medium" style={{ color: colors.textLight }}>
              إجمالي: {pagination.total} مريض
            </span>
          </div>
        </div>
        
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
                        ? formatDate(patient.lastVisit)
                        : 'لا توجد'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(patient)}
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                        style={{ 
                          background: colors.gradientPrimary,
                          color: '#FFFFFF'
                        }}
                      >
                        عرض
                      </button>
                      <button
                        onClick={() => onEdit(patient)}
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                        style={{ 
                          background: colors.gradientInfo,
                          color: '#FFFFFF'
                        }}
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => onDelete(patient._id)}
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
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
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
                الصفحة {pagination.page} من {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
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
        )}
      </div>
    </>
  )
}
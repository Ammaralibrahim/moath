'use client'

import { colors } from '@/components/shared/constants'
import { calculateAge, formatDate, formatPhoneNumber } from '@/components/shared/utils'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function PatientsTable({ patients, pagination, onPageChange, onView, onEdit, onDelete }) {
  const [selectedRows, setSelectedRows] = useState([])

  if (!patients || patients.length === 0) {
    return (
      <div className="rounded-2xl border overflow-hidden shadow-xl" style={{ borderColor: colors.border }}>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
            background: colors.gradientPrimary,
            opacity: 0.1
          }}>
            <svg className="w-10 h-10" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-lg font-bold mb-2" style={{ color: colors.text }}>لا توجد بيانات</div>
          <p className="font-medium mb-4" style={{ color: colors.textLight }}>لم يتم العثور على مرضى متطابقين مع معايير البحث</p>
          <button
            onClick={() => {
              toast.info('جرب تغيير معايير البحث أو إضافة مريض جديد', {
                duration: 3000,
                position: 'top-center'
              })
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{
              background: colors.gradientInfo,
              color: '#FFFFFF'
            }}
          >
            عرض النصائح
          </button>
        </div>
      </div>
    )
  }

  // Çoklu seçim işlemleri
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(patients.map(patient => patient._id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (patientId) => {
    setSelectedRows(prev => {
      if (prev.includes(patientId)) {
        return prev.filter(id => id !== patientId)
      } else {
        return [...prev, patientId]
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error('لم يتم اختيار أي مرضى للحذف', {
        duration: 3000,
        position: 'top-center'
      })
      return
    }

    if (window.confirm(`هل أنت متأكد من حذف ${selectedRows.length} مريض؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      selectedRows.forEach(patientId => {
        onDelete(patientId)
      })
      setSelectedRows([])
      toast.success(`تم بدء عملية حذف ${selectedRows.length} مريض`, {
        duration: 3000,
        position: 'top-center'
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Topbar */}
      {selectedRows.length > 0 && (
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ 
          background: colors.gradientWarning,
          borderColor: colors.border
        }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{selectedRows.length}</span>
            </div>
            <span className="text-sm font-semibold text-white">
              تم اختيار {selectedRows.length} مريض
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity bg-white/20 text-white"
          >
            حذف المختارين
          </button>
        </div>
      )}

      {/* Ana Tablo */}
      <div className="rounded-2xl border overflow-hidden shadow-xl">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: colors.border, backgroundColor: colors.surfaceLight }}>
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>قائمة المرضى</h3>
            <span className="text-sm px-2 py-1 rounded-md" style={{ 
              background: colors.surface,
              color: colors.textLight,
              borderColor: colors.border,
              borderWidth: '1px'
            }}>
              عرض {Math.min(pagination.limit, patients.length)} من {pagination.total}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: colors.textLight }}>
              <input
                type="checkbox"
                checked={selectedRows.length === patients.length && patients.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border"
                style={{ borderColor: colors.border }}
              />
              اختيار الكل
            </label>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead style={{ backgroundColor: colors.surfaceLight }}>
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight, width: '40px' }}>
                  #
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>اسم المريض</th>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الهاتف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>العمر</th>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>الجنس</th>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>المواعيد</th>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight }}>آخر زيارة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: colors.textLight, width: '150px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border }}>
              {patients.map((patient, index) => (
                <tr 
                  key={patient._id}
                  className={`hover:opacity-90 transition-opacity ${selectedRows.includes(patient._id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(patient._id)}
                        onChange={() => handleSelectRow(patient._id)}
                        className="w-4 h-4 rounded border"
                        style={{ borderColor: colors.border }}
                      />
                      <span className="text-sm font-mono" style={{ color: colors.textLight }}>
                        {((pagination.page - 1) * pagination.limit) + index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div 
                      className="text-sm font-semibold cursor-pointer hover:underline" 
                      style={{ color: colors.primary }}
                      onClick={() => onView(patient)}
                    >
                      {patient.patientName}
                    </div>
                    {patient.email && (
                      <div className="text-xs truncate max-w-[200px]" style={{ color: colors.textLight }}>
                        {patient.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-mono font-medium" style={{ color: colors.text }}>
                        {formatPhoneNumber(patient.phoneNumber)}
                      </div>
                      {patient.emergencyContact && (
                        <div className="text-xs" style={{ color: colors.textLight }}>
                          طوارئ: {patient.emergencyContact}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium" style={{ color: colors.text }}>
                        {patient.birthDate ? `${calculateAge(patient.birthDate)} سنة` : 'غير محدد'}
                      </div>
                      {patient.birthDate && (
                        <div className="text-xs" style={{ color: colors.textLight }}>
                          {new Date(patient.birthDate).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      patient.gender === 'male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {patient.gender === 'male' ? (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                          </svg>
                          ذكر
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          أنثى
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        (patient.appointmentCount || 0) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className="text-sm font-bold">{patient.appointmentCount || 0}</span>
                      </div>
                      <div className="text-xs" style={{ color: colors.textLight }}>
                        {patient.appointmentCount ? 'موعد' : 'لا يوجد'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm" style={{ 
                      color: patient.lastVisit ? colors.text : colors.textLight 
                    }}>
                      {patient.lastVisit 
                        ? formatDate(patient.lastVisit, true)
                        : 'لا توجد'
                      }
                    </div>
                    {patient.lastVisit && (
                      <div className="text-xs" style={{ color: colors.textLight }}>
                        منذ {calculateDaysAgo(patient.lastVisit)} يوم
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(patient)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
                        style={{ 
                          background: colors.gradientPrimary,
                          color: '#FFFFFF'
                        }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        عرض
                      </button>
                      <button
                        onClick={() => onEdit(patient)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
                        style={{ 
                          background: colors.gradientInfo,
                          color: '#FFFFFF'
                        }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        تعديل
                      </button>
                      <button
                        onClick={() => onDelete(patient._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
                        style={{ 
                          background: colors.gradientError,
                          color: '#FFFFFF'
                        }}
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
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: colors.textLight }}>
                  عدد الصفحات:
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    onPageChange(1)
                    // Limit değişikliği için parent component'i güncelle
                  }}
                  className="px-2 py-1 rounded border text-sm"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    borderColor: colors.borderLight,
                    color: colors.textLight,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  الأولى
                </button>
                
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    borderColor: colors.borderLight,
                    color: colors.textLight,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  السابق
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        style={pagination.page === pageNum ? {} : { color: colors.text }}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                    <>
                      <span className="px-2" style={{ color: colors.textLight }}>...</span>
                      <button
                        onClick={() => onPageChange(pagination.totalPages)}
                        className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-gray-100"
                        style={{ color: colors.text }}
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    borderColor: colors.borderLight,
                    color: colors.textLight,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  التالي
                </button>
                
                <button
                  onClick={() => onPageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    borderColor: colors.borderLight,
                    color: colors.textLight,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  الأخيرة
                </button>
              </div>
              
              <div className="text-sm" style={{ color: colors.textLight }}>
                الصفحة <span className="font-semibold">{pagination.page}</span> من <span className="font-semibold">{pagination.totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Yardımcı fonksiyon
function calculateDaysAgo(date) {
  const today = new Date()
  const lastVisit = new Date(date)
  const diffTime = Math.abs(today - lastVisit)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
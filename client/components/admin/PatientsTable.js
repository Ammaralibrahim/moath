// @/components/patients/PatientsTable.jsx
'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import StatusBadge from '@/components/ui/StatusBadge'

const PatientsTable = ({ 
  patients, 
  pagination, 
  selectedRows, 
  onPageChange, 
  onLimitChange, 
  onView, 
  onEdit, 
  onDelete, 
  onSelectRow, 
  onSelectAll,
  disabled 
}) => {
  const formattedPatients = useMemo(() => 
    patients.map(patient => ({
      ...patient,
      formattedBirthDate: patient.birthDate 
        ? format(new Date(patient.birthDate), 'dd/MM/yyyy', { locale: ar })
        : 'غير محدد',
      formattedLastVisit: patient.lastVisit
        ? format(new Date(patient.lastVisit), 'dd/MM/yyyy', { locale: ar })
        : 'لا توجد'
    })), [patients]
  )

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

  if (!formattedPatients || formattedPatients.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600/10 to-blue-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">لا توجد بيانات</h3>
        <p className="text-gray-400 text-sm">لم يتم العثور على مرضى متطابقين مع معايير البحث</p>
      </div>
    )
  }

  const getGenderBadge = (gender) => {
    if (gender === 'male') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          ذكر
        </span>
      )
    } else if (gender === 'female') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
          أنثى
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
        غير محدد
      </span>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-100">قائمة المرضى</h3>
          <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-lg">
            {pagination.total} إجمالي
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-300">
            <input
              type="checkbox"
              checked={selectedRows.length === patients.length && patients.length > 0}
              onChange={onSelectAll}
              disabled={disabled}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
            />
            اختيار الكل
          </label>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/80">
            <tr>
              <th className="p-4 text-right text-sm font-medium text-gray-300">#</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">اسم المريض</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">الهاتف</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">العمر</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">الجنس</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">فصيلة الدم</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">آخر زيارة</th>
              <th className="p-4 text-right text-sm font-medium text-gray-300">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {formattedPatients.map((patient, index) => (
              <tr 
                key={patient._id} 
                className={`transition-colors duration-200 ${
                  selectedRows.includes(patient._id) 
                    ? 'bg-blue-500/5 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-800/30'
                }`}
              >
                {/* Checkbox and Number */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(patient._id)}
                      onChange={() => onSelectRow(patient._id)}
                      disabled={disabled}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-400 font-mono">
                      {((pagination.page - 1) * pagination.limit) + index + 1}
                    </span>
                  </div>
                </td>
                
                {/* Patient Name */}
                <td className="p-4">
                  <div 
                    className="flex flex-col items-start cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => onView(patient)}
                  >
                    <span className="text-sm font-medium text-gray-100">
                      {patient.patientName || 'غير محدد'}
                    </span>
                    {patient.email && (
                      <span className="text-xs text-gray-400 mt-1 truncate max-w-[180px]">
                        {patient.email}
                      </span>
                    )}
                    {patient.chronicDiseases && patient.chronicDiseases.length > 0 && (
                      <div className="text-xs text-amber-400 mt-1">
                        {patient.chronicDiseases.length} مرض مزمن
                      </div>
                    )}
                  </div>
                </td>
                
                {/* Phone */}
                <td className="p-4">
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-100">
                      {patient.phoneNumber || 'بدون رقم'}
                    </span>
                    {patient.emergencyContact && (
                      <span className="text-xs text-gray-400 mt-1">
                        طوارئ: {patient.emergencyContact.name || 'بدون'}
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Age */}
                <td className="p-4">
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-100">
                      {patient.birthDate ? `${calculateAge(patient.birthDate)} سنة` : 'غير معروف'}
                    </span>
                    {patient.birthDate && (
                      <span className="text-xs text-gray-400">
                        {patient.formattedBirthDate}
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Gender */}
                <td className="p-4">
                  {getGenderBadge(patient.gender)}
                </td>
                
                {/* Blood Type */}
                <td className="p-4">
                  {patient.bloodType ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {patient.bloodType}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">غير معروف</span>
                  )}
                </td>
                
                {/* Last Visit */}
                <td className="p-4">
                  <div className="flex flex-col items-start">
                    <span className={`text-sm ${
                      patient.lastVisit ? 'text-gray-100' : 'text-gray-400'
                    }`}>
                      {patient.formattedLastVisit}
                    </span>
                    {patient.testResults && patient.testResults.length > 0 && (
                      <span className="text-xs text-blue-400 mt-1">
                        {patient.testResults.length} فحص
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Actions */}
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(patient)}
                      disabled={disabled}
                      className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      عرض
                    </button>
                    <button
                      onClick={() => onEdit(patient)}
                      disabled={disabled}
                      className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </button>
                    <button
                      onClick={() => onDelete(patient._id)}
                      disabled={disabled}
                      className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
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
      
      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">عرض</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-3 py-1.5 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-400">في كل صفحة</span>
          </div>
          
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              الأولى
            </button>
            
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              السابق
            </button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const pages = []
                const totalPages = pagination.totalPages
                const currentPage = pagination.page
                
                // Always show first page
                pages.push(
                  <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white'
                        : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    1
                  </button>
                )
                
                // Show ellipsis if needed
                if (currentPage > 3) {
                  pages.push(
                    <span key="ellipsis1" className="px-2 text-gray-400">
                      ...
                    </span>
                  )
                }
                
                // Show pages around current page
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                  if (i !== 1 && i !== totalPages) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === i
                            ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white'
                            : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        {i}
                      </button>
                    )
                  }
                }
                
                // Show ellipsis if needed
                if (currentPage < totalPages - 2) {
                  pages.push(
                    <span key="ellipsis2" className="px-2 text-gray-400">
                      ...
                    </span>
                  )
                }
                
                // Always show last page if there is more than one page
                if (totalPages > 1) {
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => onPageChange(totalPages)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white'
                          : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )
                }
                
                return pages
              })()}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              التالي
            </button>
            
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              الأخيرة
            </button>
          </div>
          
          {/* Page info */}
          <div className="text-sm text-gray-400">
            الصفحة <span className="font-semibold text-gray-300">{pagination.page}</span> من <span className="font-semibold text-gray-300">{pagination.totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientsTable
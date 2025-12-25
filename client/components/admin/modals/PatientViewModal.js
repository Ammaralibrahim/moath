'use client'

import { useState } from 'react'
import { colors } from '@/components/shared/constants'
import { calculateAge, formatDate } from '@/components/shared/utils'

export default function PatientViewModal({ 
  patient, 
  appointments = [], 
  loadingAppointments = false,
  onClose, 
  onEdit, 
  onAddAppointment,
  onRefreshAppointments 
}) {
  const [activeTab, setActiveTab] = useState('details')

  if (!patient) return null

  const formatDateDisplay = (date) => {
    return date ? formatDate(date) : 'غير محدد'
  }

  const calculateAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return 'غير محدد'
    return calculateAge(birthDate) + ' سنة'
  }

  // Tarihe göre sıralanmış randevular (en yeni önce)
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(b.appointmentDate) - new Date(a.appointmentDate)
  })

  // Geçmiş ve gelecek randevuları ayır
  const now = new Date()
  const pastAppointments = sortedAppointments.filter(app => 
    new Date(app.appointmentDate) < now
  )
  const upcomingAppointments = sortedAppointments.filter(app => 
    new Date(app.appointmentDate) >= now
  )

  // Duruma göre renk belirle
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد الانتظار' }
      case 'confirmed': return { bg: 'bg-green-100', text: 'text-green-800', label: 'مؤكد' }
      case 'completed': return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مكتمل' }
      case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'غير محدد' }
    }
  }

  // Seçenekler için veriler
  const patientDetails = {
    personal: [
      { label: 'الجنس', value: patient.gender === 'male' ? 'ذكر' : 'أنثى' },
      { label: 'العمر', value: calculateAgeFromBirthDate(patient.birthDate) },
      { label: 'تاريخ الميلاد', value: formatDateDisplay(patient.birthDate) },
      { label: 'الحالة الاجتماعية', value: patient.maritalStatus || 'غير محدد' },
    ],
    contact: [
      { label: 'رقم الهاتف', value: patient.phoneNumber, icon: '📱' },
      { label: 'البريد الإلكتروني', value: patient.email || 'غير محدد', icon: '📧' },
      { label: 'جهة اتصال الطوارئ', value: patient.emergencyContact || 'غير محدد', icon: '🆘' },
      { label: 'العنوان', value: patient.address || 'غير محدد', icon: '📍' },
    ],
    medical: [
      { label: 'التاريخ الطبي', value: patient.medicalHistory || 'لا يوجد تاريخ طبي مسجل', type: 'textarea' },
      { label: 'الحساسية', value: patient.allergies || 'لا توجد حساسية مسجلة', type: 'textarea' },
      { label: 'الأدوية الحالية', value: patient.medications || 'لا توجد أدوية مسجلة', type: 'textarea' },
      { label: 'ملاحظات إضافية', value: patient.notes || 'لا توجد ملاحظات إضافية', type: 'textarea' },
    ]
  }

  const renderAppointmentCard = (appointment, index) => {
    const status = getStatusColor(appointment.status)
    const appointmentDate = new Date(appointment.appointmentDate)
    const isPast = appointmentDate < now
    
    return (
      <div 
        key={appointment._id || index} 
        className="rounded-xl p-4 hover:scale-[1.01] transition-all" 
        style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`,
          opacity: isPast ? 0.85 : 1
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isPast ? 'bg-gray-400' : 'bg-green-500'}`} />
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {formatDateDisplay(appointment.appointmentDate)}
              </span>
              <span className="text-sm" style={{ color: colors.textLight }}>
                {appointment.appointmentTime}
              </span>
            </div>
            
            {appointment.notes && (
              <div className="text-xs mt-2 p-2 rounded" style={{ 
                backgroundColor: colors.background,
                color: colors.textLight
              }}>
                {appointment.notes.substring(0, 100)}
                {appointment.notes.length > 100 ? '...' : ''}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            {isPast ? (
              <span className="text-xs px-2 py-1 rounded" style={{ 
                backgroundColor: colors.gray + '20',
                color: colors.gray
              }}>
                منتهي
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded" style={{ 
                backgroundColor: colors.success + '20',
                color: colors.success
              }}>
                قادم
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: colors.border }}>
          <div className="text-xs" style={{ color: colors.textLight }}>
            تم الإنشاء: {formatDateDisplay(appointment.createdAt)}
          </div>
          <button
            className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
            style={{ 
              color: colors.primary,
              border: `1px solid ${colors.primary}`
            }}
          >
            التفاصيل
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[95vw] mx-auto my-4">
        <div className="rounded-2xl shadow-2xl max-h-[90vh] flex flex-col" style={{ 
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}>
          {/* Header - Fixed */}
          <div className="p-6 border-b flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                  background: colors.gradientSuccess
                }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: colors.text }}>{patient.patientName}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm" style={{ color: colors.textLight }}>
                      ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{patient._id?.substring(0, 8) || 'N/A'}</span>
                    </p>
                    <div className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ 
                      backgroundColor: patient.isActive ? colors.success + '20' : colors.error + '20',
                      color: patient.isActive ? colors.success : colors.error
                    }}>
                      {patient.isActive ? '🟢 نشط' : '🔴 غير نشط'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onEdit}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  تعديل
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity active:scale-95"
                  style={{ 
                    backgroundColor: colors.surfaceLight,
                    color: colors.textLight
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-6">
              {[
                { id: 'details', label: 'التفاصيل', icon: '👤' },
                { id: 'appointments', label: 'المواعيد', icon: '📅', count: appointments.length },
                { id: 'history', label: 'التاريخ الطبي', icon: '🏥' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id ? '' : 'hover:opacity-80'}`}
                  style={{
                    backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : colors.textLight
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 text-xs rounded-full" style={{ 
                      backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : colors.primary + '20',
                      color: activeTab === tab.id ? '#FFFFFF' : colors.primary
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Personal & Contact Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Personal Info Card */}
                  <div className="rounded-2xl p-5 shadow-sm" style={{ 
                    backgroundColor: colors.surfaceLight,
                    border: `1px solid ${colors.border}`
                  }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.primary }} />
                      <h4 className="font-semibold text-base" style={{ color: colors.text }}>المعلومات الشخصية</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {patientDetails.personal.map((item, index) => (
                        <div key={index}>
                          <div className="text-xs mb-1" style={{ color: colors.textLight }}>{item.label}</div>
                          <div className="text-sm font-semibold" style={{ color: colors.text }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info Card */}
                  <div className="rounded-2xl p-5 shadow-sm" style={{ 
                    backgroundColor: colors.surfaceLight,
                    border: `1px solid ${colors.border}`
                  }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.info }} />
                      <h4 className="font-semibold text-base" style={{ color: colors.text }}>معلومات الاتصال</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {patientDetails.contact.map((item, index) => (
                        <div key={index}>
                          <div className="text-xs mb-1 flex items-center gap-2" style={{ color: colors.textLight }}>
                            <span>{item.icon}</span>
                            {item.label}
                          </div>
                          <div className="text-sm font-semibold p-2 rounded-lg" style={{ 
                            backgroundColor: colors.background,
                            color: colors.text
                          }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Columns - Medical Info */}
                <div className="lg:col-span-2 space-y-6">
                  {patientDetails.medical.map((item, index) => (
                    <div key={index} className="rounded-2xl p-5 shadow-sm" style={{ 
                      backgroundColor: colors.surfaceLight,
                      border: `1px solid ${colors.border}`
                    }}>
                      <h4 className="font-semibold text-base mb-4" style={{ color: colors.text }}>{item.label}</h4>
                      <div className="text-sm whitespace-pre-line p-4 rounded-lg min-h-[120px]" style={{ 
                        backgroundColor: colors.background,
                        color: colors.text
                      }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-semibold text-lg" style={{ color: colors.text }}>مواعيد المريض</h4>
                    <p className="text-sm mt-1" style={{ color: colors.textLight }}>
                      إجمالي المواعيد: <span className="font-semibold">{appointments.length}</span> | 
                      قادمة: <span className="font-semibold text-green-600">{upcomingAppointments.length}</span> | 
                      منتهية: <span className="font-semibold text-gray-600">{pastAppointments.length}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onRefreshAppointments}
                      className="px-3 py-2 rounded-lg text-sm hover:opacity-90 transition-all flex items-center gap-2"
                      style={{ 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                        backgroundColor: colors.surfaceLight
                      }}
                      disabled={loadingAppointments}
                    >
                      <svg className={`w-4 h-4 ${loadingAppointments ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      تحديث
                    </button>
                    <button
                      onClick={onAddAppointment}
                      className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                      style={{ 
                        background: colors.gradientPrimary,
                        color: '#FFFFFF'
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      إضافة موعد جديد
                    </button>
                  </div>
                </div>

                {loadingAppointments ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p style={{ color: colors.textLight }}>جاري تحميل المواعيد...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12" style={{ color: colors.textLight }}>
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>لا توجد مواعيد مسجلة لهذا المريض</p>
                    <button
                      onClick={onAddAppointment}
                      className="mt-4 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                      style={{ 
                        color: colors.primary,
                        border: `1px solid ${colors.primary}`
                      }}
                    >
                      إضافة أول موعد
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* القادمة Upcoming Appointments */}
                    {upcomingAppointments.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <h5 className="font-semibold text-base" style={{ color: colors.text }}>
                            المواعيد القادمة ({upcomingAppointments.length})
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {upcomingAppointments.map((appointment, index) => 
                            renderAppointmentCard(appointment, index)
                          )}
                        </div>
                      </div>
                    )}

                    {/* المنتهية Past Appointments */}
                    {pastAppointments.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 rounded-full bg-gray-400" />
                          <h5 className="font-semibold text-base" style={{ color: colors.text }}>
                            المواعيد المنتهية ({pastAppointments.length})
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pastAppointments.map((appointment, index) => 
                            renderAppointmentCard(appointment, index)
                          )}
                        </div>
                      </div>
                    )}

                    {/* İstatistikler */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                      <div className="rounded-xl p-4 text-center" style={{ 
                        backgroundColor: colors.primary + '10',
                        border: `1px solid ${colors.primary}30`
                      }}>
                        <div className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>
                          {appointments.length}
                        </div>
                        <div className="text-xs" style={{ color: colors.textLight }}>إجمالي المواعيد</div>
                      </div>
                      
                      <div className="rounded-xl p-4 text-center" style={{ 
                        backgroundColor: colors.success + '10',
                        border: `1px solid ${colors.success}30`
                      }}>
                        <div className="text-2xl font-bold mb-1" style={{ color: colors.success }}>
                          {upcomingAppointments.length}
                        </div>
                        <div className="text-xs" style={{ color: colors.textLight }}>قادمة</div>
                      </div>
                      
                      <div className="rounded-xl p-4 text-center" style={{ 
                        backgroundColor: colors.warning + '10',
                        border: `1px solid ${colors.warning}30`
                      }}>
                        <div className="text-2xl font-bold mb-1" style={{ color: colors.warning }}>
                          {appointments.filter(a => a.status === 'pending').length}
                        </div>
                        <div className="text-xs" style={{ color: colors.textLight }}>قيد الانتظار</div>
                      </div>
                      
                      <div className="rounded-xl p-4 text-center" style={{ 
                        backgroundColor: colors.gray + '10',
                        border: `1px solid ${colors.gray}30`
                      }}>
                        <div className="text-2xl font-bold mb-1" style={{ color: colors.gray }}>
                          {pastAppointments.length}
                        </div>
                        <div className="text-xs" style={{ color: colors.textLight }}>منتهية</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h4 className="font-semibold text-lg mb-6" style={{ color: colors.text }}>السجل الطبي الكامل</h4>
                <div className="space-y-4">
                  {patientDetails.medical.map((item, index) => (
                    <div key={index} className="rounded-xl p-4" style={{ 
                      backgroundColor: colors.surfaceLight,
                      border: `1px solid ${colors.border}`
                    }}>
                      <h5 className="font-semibold text-sm mb-2" style={{ color: colors.text }}>{item.label}</h5>
                      <p className="text-sm whitespace-pre-line" style={{ color: colors.textLight }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 border-t flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ 
                  background: colors.gradientPrimary,
                  color: '#FFFFFF'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إغلاق
              </button>
              
              <div className="flex-1 grid grid-cols-2 gap-3">
                <button
                  onClick={onEdit}
                  className="px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  تعديل البيانات
                </button>
                
                <button
                  onClick={onAddAppointment}
                  className="px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    backgroundColor: colors.surfaceLight
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  إضافة موعد
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
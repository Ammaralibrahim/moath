'use client'

import { useState, useEffect, useCallback } from 'react'
import { colors } from '@/components/shared/constants'
import { calculateAge, formatDate, formatPhoneNumber } from '@/components/shared/utils'

export default function PatientViewModal({ 
  patient, 
  appointments = [], 
  loadingAppointments = false,
  onClose, 
  onEdit, 
  onAddAppointment,
  onRefreshAppointments 
}) {
  const [activeTab, setActiveTab] = useState('demographic')
  const [isLoading, setIsLoading] = useState(false)

  if (!patient) return null

  const formatDateDisplay = (date) => {
    if (!date) return 'غير محدد'
    try {
      return formatDate(date)
    } catch (error) {
      return 'غير محدد'
    }
  }

  const calculateAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return 'غير محدد'
    try {
      const age = calculateAge(birthDate)
      return `${age} سنة`
    } catch (error) {
      return 'غير محدد'
    }
  }

  const calculateBMI = (weight, height) => {
    if (!weight || !height || height === 0) return null
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  const getBMICategory = (bmi) => {
    if (!bmi) return null
    if (bmi < 18.5) return { label: 'نحيف', color: colors.warning }
    if (bmi < 25) return { label: 'طبيعي', color: colors.success }
    if (bmi < 30) return { label: 'وزن زائد', color: colors.warning }
    return { label: 'سمين', color: colors.error }
  }

  // Tarihe göre sıralanmış randevular (en yeni önce)
  const sortedAppointments = [...appointments].sort((a, b) => {
    try {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate)
    } catch (error) {
      return 0
    }
  })

  // Geçmiş ve gelecek randevuları ayır
  const now = new Date()
  const pastAppointments = sortedAppointments.filter(app => {
    try {
      return new Date(app.appointmentDate) < now
    } catch (error) {
      return false
    }
  })
  const upcomingAppointments = sortedAppointments.filter(app => {
    try {
      return new Date(app.appointmentDate) >= now
    } catch (error) {
      return false
    }
  })

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

  const renderAppointmentCard = useCallback((appointment, index) => {
    const status = getStatusColor(appointment.status)
    let appointmentDate
    let isPast = false
    
    try {
      appointmentDate = new Date(appointment.appointmentDate)
      isPast = appointmentDate < now
    } catch (error) {
      appointmentDate = null
      isPast = false
    }

    return (
      <div 
        key={appointment._id || index} 
        className="rounded-xl p-4 hover:scale-[1.01] transition-all duration-300" 
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
                {appointment.appointmentTime || 'غير محدد'}
              </span>
            </div>
            
            {appointment.diagnosis && (
              <div className="text-xs mt-2 p-2 rounded" style={{ 
                backgroundColor: colors.background,
                color: colors.text
              }}>
                <strong>التشخيص:</strong> {appointment.diagnosis.substring(0, 80)}
                {appointment.diagnosis.length > 80 ? '...' : ''}
              </div>
            )}
            
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
            onClick={() => {
              // Burada randevu detaylarına yönlendirme yapılabilir
              console.log('View appointment details:', appointment._id)
            }}
          >
            التفاصيل
          </button>
        </div>
      </div>
    )
  }, [now])

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose()
    }
  }, [isLoading, onClose])

  const handleEdit = useCallback(() => {
    if (!isLoading) {
      onEdit()
    }
  }, [isLoading, onEdit])

  const handleAddAppointment = useCallback(() => {
    if (!isLoading) {
      onAddAppointment()
    }
  }, [isLoading, onAddAppointment])

  const handleRefreshAppointments = useCallback(async () => {
    if (!isLoading && !loadingAppointments) {
      setIsLoading(true)
      try {
        await onRefreshAppointments()
      } catch (error) {
        console.error('Error refreshing appointments:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [isLoading, loadingAppointments, onRefreshAppointments])

  const renderDemographicTab = () => (
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
            <div>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>رقم الملف</div>
              <div className="text-sm font-semibold font-mono p-2 rounded-lg" style={{ 
                backgroundColor: colors.background,
                color: colors.primary
              }}>
                {patient.patientId || 'غير محدد'}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>الجنس</div>
              <div className="text-sm font-semibold" style={{ color: colors.text }}>
                {patient.gender === 'male' ? 'ذكر' : patient.gender === 'female' ? 'أنثى' : 'غير محدد'}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>العمر</div>
              <div className="text-sm font-semibold" style={{ color: colors.text }}>
                {calculateAgeFromBirthDate(patient.birthDate)}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>تاريخ الميلاد</div>
              <div className="text-sm font-semibold" style={{ color: colors.text }}>
                {formatDateDisplay(patient.birthDate)}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>فصيلة الدم</div>
              <div className="text-sm font-semibold" style={{ color: colors.text }}>
                {patient.bloodType || 'غير معروف'}
              </div>
            </div>
            {patient.weight && patient.height && (
              <div>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>مؤشر كتلة الجسم (BMI)</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold" style={{ color: colors.text }}>
                    {calculateBMI(patient.weight, patient.height)}
                  </div>
                  {getBMICategory(calculateBMI(patient.weight, patient.height)) && (
                    <div className="text-xs px-2 py-1 rounded" style={{ 
                      backgroundColor: getBMICategory(calculateBMI(patient.weight, patient.height)).color + '20',
                      color: getBMICategory(calculateBMI(patient.weight, patient.height)).color
                    }}>
                      {getBMICategory(calculateBMI(patient.weight, patient.height)).label}
                    </div>
                  )}
                </div>
              </div>
            )}
            {patient.bmi && (
              <div>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>مؤشر كتلة الجسم (محسوب)</div>
                <div className="text-sm font-semibold" style={{ color: colors.text }}>
                  {patient.bmi.toFixed(1)}
                </div>
              </div>
            )}
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
            <div>
              <div className="text-xs mb-1 flex items-center gap-2" style={{ color: colors.textLight }}>
                <span>📱</span>
                رقم الهاتف
              </div>
              <div className="text-sm font-semibold p-2 rounded-lg" style={{ 
                backgroundColor: colors.background,
                color: colors.text
              }}>
                {formatPhoneNumber(patient.phoneNumber) || 'غير محدد'}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1 flex items-center gap-2" style={{ color: colors.textLight }}>
                <span>📧</span>
                البريد الإلكتروني
              </div>
              <div className="text-sm font-semibold p-2 rounded-lg" style={{ 
                backgroundColor: colors.background,
                color: colors.text
              }}>
                {patient.email || 'غير محدد'}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1 flex items-center gap-2" style={{ color: colors.textLight }}>
                <span>📍</span>
                العنوان
              </div>
              <div className="text-sm p-2 rounded-lg" style={{ 
                backgroundColor: colors.background,
                color: colors.text
              }}>
                {patient.address || 'غير محدد'}
              </div>
            </div>
            {patient.nationalAddress && (
              <div>
                <div className="text-xs mb-1 flex items-center gap-2" style={{ color: colors.textLight }}>
                  <span>🏠</span>
                  العنوان الوطني
                </div>
                <div className="text-sm p-2 rounded-lg" style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}>
                  {patient.nationalAddress.street && <div>{patient.nationalAddress.street}</div>}
                  {patient.nationalAddress.district && <div>الحي: {patient.nationalAddress.district}</div>}
                  {patient.nationalAddress.city && <div>المدينة: {patient.nationalAddress.city}</div>}
                  {patient.nationalAddress.postalCode && <div>الرمز البريدي: {patient.nationalAddress.postalCode}</div>}
                  {patient.nationalAddress.buildingNumber && <div>رقم المبنى: {patient.nationalAddress.buildingNumber}</div>}
                  {patient.nationalAddress.additionalNumber && <div>الرقم الإضافي: {patient.nationalAddress.additionalNumber}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Registration Info Card */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.success }} />
            <h4 className="font-semibold text-base" style={{ color: colors.text }}>معلومات التسجيل</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: colors.textLight }}>تاريخ التسجيل</span>
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {formatDateDisplay(patient.registrationDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: colors.textLight }}>آخر زيارة</span>
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {formatDateDisplay(patient.lastVisitDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: colors.textLight }}>إجمالي الزيارات</span>
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {patient.totalVisits || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: colors.textLight }}>عدد المواعيد</span>
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {patient.appointmentCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: colors.textLight }}>آخر زيارة طبيب</span>
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {formatDateDisplay(patient.lastDoctorVisit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: colors.textLight }}>آخر فحص</span>
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {formatDateDisplay(patient.lastTestDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Columns - Medical Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Medical Summary Card */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <h4 className="font-semibold text-base mb-4" style={{ color: colors.text }}>التاريخ الطبي الموجز</h4>
          <div className="text-sm whitespace-pre-line p-4 rounded-lg min-h-[120px]" style={{ 
            backgroundColor: colors.background,
            color: colors.text
          }}>
            {patient.medicalSummary || 'لا يوجد تاريخ طبي مسجل'}
          </div>
        </div>

        {/* Allergies Card */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <h4 className="font-semibold text-base mb-4" style={{ color: colors.text }}>الحساسيات</h4>
          <div className="text-sm whitespace-pre-line p-4 rounded-lg min-h-[120px]" style={{ 
            backgroundColor: colors.background,
            color: colors.text
          }}>
            {patient.allergies || 'لا توجد حساسيات مسجلة'}
          </div>
        </div>

        {/* Medications Card */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <h4 className="font-semibold text-base mb-4" style={{ color: colors.text }}>الأدوية الحالية</h4>
          <div className="text-sm whitespace-pre-line p-4 rounded-lg min-h-[120px]" style={{ 
            backgroundColor: colors.background,
            color: colors.text
          }}>
            {patient.currentMedications || 'لا توجد أدوية مسجلة'}
          </div>
        </div>

        {/* Vital Signs Card */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <h4 className="font-semibold text-base mb-4" style={{ color: colors.text }}>القياسات الحيوية</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>الوزن</div>
              <div className="text-lg font-bold" style={{ color: colors.primary }}>
                {patient.weight ? `${patient.weight} كجم` : 'غير محدد'}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>الطول</div>
              <div className="text-lg font-bold" style={{ color: colors.primary }}>
                {patient.height ? `${patient.height} سم` : 'غير محدد'}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>مؤشر كتلة الجسم</div>
              <div className="text-lg font-bold" style={{ color: colors.primary }}>
                {patient.bmi ? patient.bmi.toFixed(1) : calculateBMI(patient.weight, patient.height) || 'غير محدد'}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>فصيلة الدم</div>
              <div className="text-lg font-bold" style={{ color: colors.primary }}>
                {patient.bloodType || 'غير معروف'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReferralTab = () => (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg mb-6" style={{ color: colors.text }}>مصادر الإحالة</h4>
      
      {(!patient.referralSources || patient.referralSources.length === 0) ? (
        <div className="text-center py-12" style={{ color: colors.textLight }}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p>لا توجد مصادر إحالة مسجلة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patient.referralSources.map((source, index) => (
            <div key={index} className="rounded-xl p-5" style={{ 
              backgroundColor: colors.surfaceLight,
              border: `1px solid ${colors.border}`
            }}>
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-base" style={{ color: colors.text }}>
                  مصدر الإحالة #{index + 1}
                </h5>
                <span className="text-xs px-2 py-1 rounded" style={{ 
                  backgroundColor: colors.primary + '10',
                  color: colors.primary
                }}>
                  {source.referralDate ? formatDateDisplay(source.referralDate) : 'غير محدد'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {source.doctorName && (
                  <div>
                    <span className="text-xs" style={{ color: colors.textLight }}>اسم الطبيب:</span>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {source.doctorName}
                    </div>
                  </div>
                )}
                
                {source.clinicName && (
                  <div>
                    <span className="text-xs" style={{ color: colors.textLight }}>اسم العيادة:</span>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {source.clinicName}
                    </div>
                  </div>
                )}
                
                {source.specialty && (
                  <div>
                    <span className="text-xs" style={{ color: colors.textLight }}>التخصص:</span>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {source.specialty}
                    </div>
                  </div>
                )}
                
                {source.contactNumber && (
                  <div>
                    <span className="text-xs" style={{ color: colors.textLight }}>رقم الاتصال:</span>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {source.contactNumber}
                    </div>
                  </div>
                )}
                
                {source.email && (
                  <div>
                    <span className="text-xs" style={{ color: colors.textLight }}>البريد الإلكتروني:</span>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {source.email}
                    </div>
                  </div>
                )}
                
                {source.notes && (
                  <div className="md:col-span-2">
                    <span className="text-xs" style={{ color: colors.textLight }}>ملاحظات:</span>
                    <div className="text-sm mt-1 p-2 rounded-lg" style={{ 
                      backgroundColor: colors.background,
                      color: colors.text
                    }}>
                      {source.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderInsuranceTab = () => (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg mb-6" style={{ color: colors.text }}>بيانات التأمين</h4>
      
      {!patient.insurance || !patient.insurance.companyName ? (
        <div className="text-center py-12" style={{ color: colors.textLight }}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p>لا توجد بيانات تأمين مسجلة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insurance Details Card */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ 
            backgroundColor: colors.surfaceLight,
            border: `1px solid ${colors.border}`
          }}>
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold text-base" style={{ color: colors.text }}>تفاصيل التأمين</h5>
              <span className={`px-2 py-1 rounded text-xs ${patient.insurance.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {patient.insurance.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>شركة التأمين</div>
                <div className="text-sm font-semibold p-2 rounded-lg" style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}>
                  {patient.insurance.companyName}
                </div>
              </div>
              
              <div>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>رقم البوليصة</div>
                <div className="text-sm font-semibold p-2 rounded-lg" style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}>
                  {patient.insurance.policyNumber || 'غير محدد'}
                </div>
              </div>
              
              <div>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>نسبة التغطية</div>
                <div className="text-sm font-semibold p-2 rounded-lg" style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}>
                  {patient.insurance.coveragePercentage ? `${patient.insurance.coveragePercentage}%` : 'غير محدد'}
                </div>
              </div>
              
              <div>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>تاريخ انتهاء الصلاحية</div>
                <div className="text-sm font-semibold p-2 rounded-lg" style={{ 
                  backgroundColor: colors.background,
                  color: colors.text
                }}>
                  {patient.insurance.expiryDate ? formatDateDisplay(patient.insurance.expiryDate) : 'غير محدد'}
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Notes Card */}
          {patient.insurance.notes && (
            <div className="rounded-2xl p-5 shadow-sm" style={{ 
              backgroundColor: colors.surfaceLight,
              border: `1px solid ${colors.border}`
            }}>
              <h5 className="font-semibold text-base mb-4" style={{ color: colors.text }}>ملاحظات التأمين</h5>
              <div className="text-sm whitespace-pre-line p-4 rounded-lg" style={{ 
                backgroundColor: colors.background,
                color: colors.text
              }}>
                {patient.insurance.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderTestResultsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-semibold text-lg" style={{ color: colors.text }}>نتائج الفحوصات</h4>
        <div className="text-sm" style={{ color: colors.textLight }}>
          إجمالي الفحوصات: <span className="font-semibold">{patient.testResults?.length || 0}</span>
        </div>
      </div>

      {(!patient.testResults || patient.testResults.length === 0) ? (
        <div className="text-center py-12" style={{ color: colors.textLight }}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>لا توجد نتائج فحوصات مسجلة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patient.testResults.map((test, index) => (
            <div key={index} className="rounded-xl p-4" style={{ 
              backgroundColor: colors.surfaceLight,
              border: `1px solid ${colors.border}`
            }}>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-base" style={{ color: colors.text }}>
                  {test.testName || 'فحص غير مسمى'}
                </h5>
                <span className="text-xs px-2 py-1 rounded" style={{ 
                  backgroundColor: colors.primary + '10',
                  color: colors.primary
                }}>
                  {test.testDate ? formatDateDisplay(test.testDate) : 'غير محدد'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs" style={{ color: colors.textLight }}>النتيجة:</span>
                  <div className="text-sm font-medium" style={{ color: colors.text }}>
                    {test.result || 'غير متوفر'}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs" style={{ color: colors.textLight }}>المعدل الطبيعي:</span>
                  <div className="text-sm font-medium" style={{ color: colors.text }}>
                    {test.normalRange || 'غير محدد'}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs" style={{ color: colors.textLight }}>الوحدة:</span>
                  <div className="text-sm font-medium" style={{ color: colors.text }}>
                    {test.unit || 'غير محددة'}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs" style={{ color: colors.textLight }}>المختبر:</span>
                  <div className="text-sm font-medium" style={{ color: colors.text }}>
                    {test.labName || 'غير محدد'}
                  </div>
                </div>
                
                {test.notes && (
                  <div className="md:col-span-2">
                    <span className="text-xs" style={{ color: colors.textLight }}>ملاحظات:</span>
                    <div className="text-sm" style={{ color: colors.text }}>
                      {test.notes}
                    </div>
                  </div>
                )}
                
                {test.fileUrl && (
                  <div className="md:col-span-2">
                    <a 
                      href={test.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      عرض الملف
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderChronicDiseasesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-semibold text-lg" style={{ color: colors.text }}>الأمراض المزمنة</h4>
        <div className="text-sm" style={{ color: colors.textLight }}>
          إجمالي الأمراض: <span className="font-semibold">{patient.chronicDiseases?.length || 0}</span>
        </div>
      </div>

      {(!patient.chronicDiseases || patient.chronicDiseases.length === 0) ? (
        <div className="text-center py-12" style={{ color: colors.textLight }}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>لا توجد أمراض مزمنة مسجلة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patient.chronicDiseases.map((disease, index) => (
            <div key={index} className="rounded-xl p-5" style={{ 
              backgroundColor: colors.surfaceLight,
              border: `1px solid ${colors.border}`
            }}>
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-base" style={{ color: colors.text }}>
                  {disease.diseaseName}
                </h5>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    disease.severity === 'شديد' ? 'bg-red-100 text-red-800' :
                    disease.severity === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {disease.severity}
                  </span>
                  <span className="px-2 py-1 rounded text-xs" style={{ 
                    backgroundColor: colors.primary + '10',
                    color: colors.primary
                  }}>
                    {disease.currentStatus}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs" style={{ color: colors.textLight }}>تاريخ التشخيص:</span>
                  <div className="text-sm font-medium" style={{ color: colors.text }}>
                    {disease.diagnosisDate ? formatDateDisplay(disease.diagnosisDate) : 'غير محدد'}
                  </div>
                </div>
                
                {disease.notes && (
                  <div className="md:col-span-2">
                    <span className="text-xs" style={{ color: colors.textLight }}>ملاحظات:</span>
                    <div className="text-sm mt-1 p-2 rounded-lg" style={{ 
                      backgroundColor: colors.background,
                      color: colors.text
                    }}>
                      {disease.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderDoctorSuggestionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-semibold text-lg" style={{ color: colors.text }}>التوصيات الطبية</h4>
        <div className="text-sm" style={{ color: colors.textLight }}>
          آخر تحديث: {patient.lastDoctorVisit ? formatDateDisplay(patient.lastDoctorVisit) : 'غير محدد'}
        </div>
      </div>

      {!patient.doctorSuggestions ? (
        <div className="text-center py-12" style={{ color: colors.textLight }}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p>لا توجد توصيات طبية مسجلة</p>
        </div>
      ) : (
        <div className="rounded-xl p-6" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: colors.text }}>
            {patient.doctorSuggestions}
          </div>
        </div>
      )}
    </div>
  )

  const renderAppointmentsTab = () => (
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
            onClick={handleRefreshAppointments}
            disabled={isLoading || loadingAppointments}
            className="px-3 py-2 rounded-lg text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              border: `1px solid ${colors.border}`,
              color: colors.text,
              backgroundColor: colors.surfaceLight
            }}
          >
            <svg className={`w-4 h-4 ${loadingAppointments ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
          <button
            onClick={handleAddAppointment}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={handleAddAppointment}
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
  )

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
                  <h2 className="text-xl font-bold" style={{ color: colors.text }}>{patient.patientName || 'غير معروف'}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm" style={{ color: colors.textLight }}>
                      رقم الملف: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{patient.patientId || 'N/A'}</span>
                    </p>
                    <div className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ 
                      backgroundColor: patient.isActive !== false ? colors.success + '20' : colors.error + '20',
                      color: patient.isActive !== false ? colors.success : colors.error
                    }}>
                      {patient.isActive !== false ? '🟢 نشط' : '🔴 غير نشط'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex space-x-1 mt-6 overflow-x-auto">
              {[
                { id: 'demographic', label: 'البيانات الأساسية', icon: '👤' },
                { id: 'referral', label: 'الإحالة', icon: '🏥', count: patient.referralSources?.length || 0 },
                { id: 'insurance', label: 'التأمين', icon: '🛡️' },
                { id: 'appointments', label: 'المواعيد', icon: '📅', count: appointments.length },
                { id: 'tests', label: 'الفحوصات', icon: '🧪', count: patient.testResults?.length || 0 },
                { id: 'chronic', label: 'الأمراض المزمنة', icon: '📋', count: patient.chronicDiseases?.length || 0 },
                { id: 'suggestions', label: 'التوصيات', icon: '💡' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? '' : 'hover:opacity-80'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
            {activeTab === 'demographic' && renderDemographicTab()}
            {activeTab === 'referral' && renderReferralTab()}
            {activeTab === 'insurance' && renderInsuranceTab()}
            {activeTab === 'appointments' && renderAppointmentsTab()}
            {activeTab === 'tests' && renderTestResultsTab()}
            {activeTab === 'chronic' && renderChronicDiseasesTab()}
            {activeTab === 'suggestions' && renderDoctorSuggestionsTab()}
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 border-t flex-shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={handleAddAppointment}
                  disabled={isLoading}
                  className="px-4 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
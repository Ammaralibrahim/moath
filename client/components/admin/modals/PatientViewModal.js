'use client'

import { colors } from '@/components/shared/constants'
import { calculateAge, formatDate } from '@/components/shared/utils'

export default function PatientViewModal({ patient, onClose }) {
  if (!patient) return null

  const formatDateDisplay = (date) => {
    return date ? formatDate(date) : 'غير محدد'
  }

  const calculateAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return 'غير محدد'
    return calculateAge(birthDate) + ' سنة'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8" style={{ 
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`
      }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>تفاصيل المريض</h3>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              ID: {patient._id || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surfaceLight transition-colors"
            style={{ color: colors.textLight }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Kolon: Temel Bilgiler */}
          <div className="space-y-6">
            {/* Temel Bilgiler Kartı */}
            <div className="rounded-xl border p-4" style={{ borderColor: colors.borderLight }}>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: colors.text }}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                المعلومات الأساسية
              </h4>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>اسم المريض:</span>
                  <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{patient.patientName}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>رقم الهاتف:</span>
                  <p className="text-sm font-mono font-semibold mt-1" style={{ color: colors.text }}>{patient.phoneNumber}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>البريد الإلكتروني:</span>
                  <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{patient.email || 'غير محدد'}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>الجنس:</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium inline-block mt-1 ${
                    patient.gender === 'male' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-pink-500/20 text-pink-400'
                  }`}>
                    {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>تاريخ الميلاد:</span>
                  <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                    {patient.birthDate ? formatDate(patient.birthDate) : 'غير محدد'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>العمر:</span>
                  <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                    {calculateAgeFromBirthDate(patient.birthDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="rounded-xl border p-4" style={{ borderColor: colors.borderLight }}>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: colors.text }}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                معلومات الاتصال
              </h4>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>جهة اتصال الطوارئ:</span>
                  <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                    {patient.emergencyContact || 'غير محدد'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium" style={{ color: colors.textLight }}>العنوان:</span>
                  <p className="text-sm mt-1" style={{ color: colors.text }}>
                    {patient.address || 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Tıbbi Bilgiler */}
          <div className="space-y-6">
            {/* Tıbbi Geçmiş */}
            <div className="rounded-xl border p-4" style={{ borderColor: colors.borderLight }}>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: colors.text }}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                التاريخ الطبي
              </h4>
              <p className="text-sm whitespace-pre-line" style={{ color: colors.text }}>
                {patient.medicalHistory || 'لا يوجد تاريخ طبي مسجل'}
              </p>
            </div>

            {/* Alerjiler */}
            <div className="rounded-xl border p-4" style={{ borderColor: colors.borderLight }}>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: colors.text }}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                الحساسية
              </h4>
              <p className="text-sm whitespace-pre-line" style={{ color: colors.text }}>
                {patient.allergies || 'لا توجد حساسية مسجلة'}
              </p>
            </div>

            {/* İlaçlar */}
            <div className="rounded-xl border p-4" style={{ borderColor: colors.borderLight }}>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: colors.text }}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                الأدوية الحالية
              </h4>
              <p className="text-sm whitespace-pre-line" style={{ color: colors.text }}>
                {patient.medications || 'لا توجد أدوية مسجلة'}
              </p>
            </div>

            {/* Notlar */}
            <div className="rounded-xl border p-4" style={{ borderColor: colors.borderLight }}>
              <h4 className="font-semibold mb-4 flex items-center" style={{ color: colors.text }}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ملاحظات إضافية
              </h4>
              <p className="text-sm whitespace-pre-line" style={{ color: colors.text }}>
                {patient.notes || 'لا توجد ملاحظات إضافية'}
              </p>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border p-4 text-center" style={{ borderColor: colors.borderLight }}>
            <div className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>
              {patient.appointmentCount || 0}
            </div>
            <div className="text-sm" style={{ color: colors.textLight }}>عدد المواعيد</div>
          </div>
          
          <div className="rounded-xl border p-4 text-center" style={{ borderColor: colors.borderLight }}>
            <div className="text-2xl font-bold mb-1" style={{ color: colors.success }}>
              {patient.totalVisits || 0}
            </div>
            <div className="text-sm" style={{ color: colors.textLight }}>إجمالي الزيارات</div>
          </div>
          
          <div className="rounded-xl border p-4 text-center" style={{ borderColor: colors.borderLight }}>
            <div className="text-2xl font-bold mb-1" style={{ color: patient.isActive ? colors.success : colors.error }}>
              {patient.isActive ? 'نشط' : 'غير نشط'}
            </div>
            <div className="text-sm" style={{ color: colors.textLight }}>الحالة</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.border }}>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ 
                background: colors.gradientPrimary,
                color: '#FFFFFF'
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
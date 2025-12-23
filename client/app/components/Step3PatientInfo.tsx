// components/Step3PatientInfo.tsx
'use client'

import React, { ChangeEvent, FormEvent } from 'react';
import { FormData, colors } from '../types/types';

interface Step3PatientInfoProps {
  selectedDate: string;
  selectedTime: string;
  formData: FormData;
  loading: boolean;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
}

const Step3PatientInfo: React.FC<Step3PatientInfoProps> = ({
  selectedDate,
  selectedTime,
  formData,
  loading,
  onInputChange,
  onSubmit,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="relative mb-10">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={onBack}
              className="group flex items-center gap-3 text-sm font-medium px-5 py-3 rounded-2xl hover:bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-gray-200/50"
              style={{ color: colors.text }}
            >
              <svg 
                className="w-4 h-4 transform rotate-180 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
              <span className="hidden sm:inline">رجوع</span>
            </button>
            
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="inline-flex flex-col items-center justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-12 bg-gradient-to-r from-gray-300/0 via-gray-300 to-gray-300/0"></div>
                  <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 shadow-sm" style={{ color: colors.primary }}>
                    الخطوة 3 من 3
                  </span>
                  <div className="h-px w-12 bg-gradient-to-r from-gray-300/0 via-gray-300 to-gray-300/0"></div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  معلومات المريض
                </h2>
                <p className="text-sm text-gray-500 max-w-md">
                  أكمل بياناتك للتأكيد النهائي للحجز
                </p>
              </div>
            </div>
          </div>
          
          {/* Selected Time Display */}
          {/* <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative backdrop-blur-sm bg-white/50 border border-white/70 rounded-3xl p-6 shadow-xl shadow-blue-500/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">الموعد المحدد</p>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(selectedDate).toLocaleDateString('ar-EG', { 
                          weekday: 'long', 
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">الساعة {selectedTime}</p>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  <div className="h-12 w-px bg-gradient-to-b from-gray-300/0 via-gray-300 to-gray-300/0"></div>
                </div>
                
                <div className="text-center sm:text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">الحالة</p>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-emerald-700">متاح للتأكيد</span>
                  </span>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Form */}
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          
          <form onSubmit={onSubmit} className="relative space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Patient Name */}
              <div className="space-y-2 group">
                <label className="block text-sm font-medium mb-2 px-1" style={{ color: colors.text }}>
                  <span className="flex items-center gap-2">
                    اسم المريض
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={onInputChange}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 group-hover:border-blue-300/50 shadow-sm hover:shadow-md"
                    style={{ 
                      borderColor: 'rgba(209, 213, 219, 0.5)',
                      color: colors.text
                    }}
                    placeholder="أدخل الاسم الكامل"
                    required
                  />
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2 group">
                <label className="block text-sm font-medium mb-2 px-1" style={{ color: colors.text }}>
                  <span className="flex items-center gap-2">
                    رقم الهاتف
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={onInputChange}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 group-hover:border-blue-300/50 shadow-sm hover:shadow-md"
                    style={{ 
                      borderColor: 'rgba(209, 213, 219, 0.5)',
                      color: colors.text
                    }}
                    placeholder="+963 9XX XXX XXX"
                    required
                  />
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 group">
              <label className="block text-sm font-medium mb-2 px-1" style={{ color: colors.text }}>
                <span className="flex items-center gap-2">
                  ملاحظات إضافية
                  <span className="text-xs font-normal text-gray-500">(اختياري)</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute top-4 right-4 flex items-start pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={onInputChange}
                  rows={4}
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 group-hover:border-blue-300/50 resize-none shadow-sm hover:shadow-md"
                  style={{ 
                    borderColor: 'rgba(209, 213, 219, 0.5)',
                    color: colors.text
                  }}
                  placeholder="أي معلومات إضافية، نوع التصوير المطلوب، أعراض أو ملاحظات خاصة..."
                />
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
              <p className="text-xs text-gray-500 px-1">
                يمكنك إضافة تفاصيل إضافية تساعد الفريق الطبي على تقديم خدمة أفضل
              </p>
            </div>

            {/* Terms & Submit */}
            <div className="pt-8 space-y-6">
              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50">
                <div className="flex items-center h-6">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-700 leading-tight">
                  أوافق على 
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium mx-1 underline underline-offset-2 decoration-blue-300/50">
                    الشروط والأحكام
                  </a>
                  و
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium mx-1 underline underline-offset-2 decoration-blue-300/50">
                    سياسة الخصوصية
                  </a>
                  للمركز. وأقر بصحة المعلومات المقدمة
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-600/40"
              >
                {/* Shine Effect */}
                <span className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                
                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>جاري تأكيد الحجز...</span>
                    </>
                  ) : (
                    <>
                      <span>تأكيد الحجز النهائي</span>
                      <svg className="w-5 h-5 transform  group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              {/* Security Notice */}
              <div className="text-center">
                <p className="text-xs text-gray-500 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>جميع بياناتك محمية ومشفرة وفق أعلى معايير الأمان</span>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            {/* <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-700 transition-colors">الدعم الفني</a>
              <div className="h-4 w-px bg-gray-300"></div>
              <a href="#" className="hover:text-gray-700 transition-colors">الأسئلة الشائعة</a>
            </div> */}
            <div className="text-center">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                نظام حجز آمن وموثوق © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3PatientInfo;
// components/Step4Confirmation.tsx
'use client'

import React from 'react';
import { FormData, colors, CLINIC_INFO } from '../types/types';

interface Step4ConfirmationProps {
  selectedDate: string;
  selectedTime: string;
  formData: FormData;
  onReset: () => void;
}

const Step4Confirmation: React.FC<Step4ConfirmationProps> = ({
  selectedDate,
  selectedTime,
  formData,
  onReset
}) => {
  return (
    <div className="text-center py-6 max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-green-200">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold mb-3 text-gray-800">تم تأكيد الحجز!</h2>
      <p className="text-base mb-6 max-w-md mx-auto text-gray-600 leading-relaxed">
        تم تأكيد حجز موعدك بنجاح. سيتم الاتصال بك على الرقم 
        <span className="font-semibold text-gray-800 mx-1">{formData.phoneNumber}</span> 
        لتأكيد التفاصيل النهائية.
      </p>
      
      <div className="bg-white rounded-xl p-5 mb-8 text-right max-w-md mx-auto border border-gray-300 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 border-gray-200">تفاصيل الحجز</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">المريض:</span>
            <span className="font-semibold text-gray-800">{formData.patientName}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">التاريخ:</span>
            <span className="font-semibold text-gray-800">
              {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">الوقت:</span>
            <span className="font-semibold text-gray-800">{selectedTime}</span>
          </div>
          {formData.notes && (
            <div className="pt-3">
              <span className="font-medium text-gray-600 block mb-1">ملاحظات:</span>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-right">
                {formData.notes}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Clinic Info */}
      <div className="bg-blue-50 rounded-xl p-5 mb-8 text-right max-w-md mx-auto border border-blue-200">
        <h4 className="text-lg font-bold mb-3 text-gray-800">معلومات المركز</h4>
        <div className="space-y-2 text-right">
          <p className="text-gray-700 flex items-center gap-2 justify-end">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            الهاتف: {CLINIC_INFO.phone}
          </p>
          <p className="text-gray-700 flex items-center gap-2 justify-end">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            العنوان: {CLINIC_INFO.address}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={onReset}
          className="px-8 py-3.5 rounded-lg font-medium text-white hover:bg-blue-600 transition-all duration-200 w-full sm:w-auto"
          style={{ 
            backgroundColor: colors.primary,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}
        >
          حجز موعد جديد
        </button>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          لتعديل أو إلغاء الموعد، يرجى الاتصال على 
          <span className="font-semibold text-gray-800 mx-1">{CLINIC_INFO.phone}</span> 
          قبل 24 ساعة من الموعد المحدد.
        </p>
      </div>
      
      {/* Reminder */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-2 justify-center">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-gray-700">
            يرجى الحضور قبل الموعد بـ 15 دقيقة مع إحضار المستندات المطلوبة
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step4Confirmation;
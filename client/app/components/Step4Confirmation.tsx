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
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: colors.text }}>تم تأكيد الحجز!</h2>
      <p className="text-sm sm:text-base mb-6 max-w-md mx-auto" style={{ color: colors.textLight }}>
        سنقوم بالاتصال بك على الرقم <span className="font-semibold" style={{ color: colors.text }}>{formData.phoneNumber}</span> لتأكيد الموعد
      </p>
      
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-right max-w-md mx-auto border" style={{ borderColor: colors.border }}>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: colors.border }}>
            <span className="font-medium text-sm" style={{ color: colors.textLight }}>المريض:</span>
            <span className="font-semibold" style={{ color: colors.text }}>{formData.patientName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: colors.border }}>
            <span className="font-medium text-sm" style={{ color: colors.textLight }}>التاريخ:</span>
            <span className="font-semibold" style={{ color: colors.text }}>
              {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm" style={{ color: colors.textLight }}>الوقت:</span>
            <span className="font-semibold" style={{ color: colors.text }}>{selectedTime}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          حجز موعد جديد
        </button>
        <p className="text-xs" style={{ color: colors.textLight }}>
          لتعديل أو إلغاء الموعد، يرجى الاتصال على {CLINIC_INFO.phone}
        </p>
      </div>
    </div>
  );
};

export default Step4Confirmation;
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
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          style={{ color: colors.primary }}
        >
          <svg className="w-3 h-3 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          رجوع
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: colors.text }}>معلومات المريض</h2>
          <p className="text-sm sm:text-base" style={{ color: colors.textLight }}>
            {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })} - {selectedTime}
          </p>
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            اسم المريض *
          </label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={onInputChange}
            className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الاسم الكامل"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            رقم الهاتف *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onInputChange}
            className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="+963 XX XXX XXXX"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            ملاحظات (اختياري)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={onInputChange}
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="أي معلومات إضافية أو نوع التصوير المطلوب..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.primary }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري الحفظ...
            </span>
          ) : (
            'تأكيد الحجز'
          )}
        </button>
      </form>
    </div>
  );
};

export default Step3PatientInfo;
// components/Step2TimeSelection.tsx
'use client'

import React from 'react';
import { colors } from '../types/types';

interface Step2TimeSelectionProps {
  selectedDate: string;
  availableSlots: string[];
  selectedTime: string;
  loading: boolean;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

const Step2TimeSelection: React.FC<Step2TimeSelectionProps> = ({
  selectedDate,
  availableSlots,
  selectedTime,
  loading,
  onTimeSelect,
  onBack
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
        <p className="mt-3 text-sm" style={{ color: colors.textLight }}>جاري تحميل الأوقات...</p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6" style={{ color: colors.textLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>لا توجد أوقات متاحة</h3>
        <p className="mb-4 text-sm" style={{ color: colors.textLight }}>عذراً، جميع المواعيد مكتملة لهذا التاريخ.</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          اختر تاريخ آخر
        </button>
      </div>
    );
  }

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
          <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: colors.text }}>اختر وقت الموعد</h2>
          <p className="text-sm sm:text-base" style={{ color: colors.textLight }}>
            {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {availableSlots.map((time, index) => (
          <button
            key={index}
            onClick={() => onTimeSelect(time)}
            className={`p-3 rounded-lg border text-center transition-all duration-200 font-medium ${
              selectedTime === time
                ? 'bg-blue-50 border-blue-300 shadow-sm'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
            style={{ 
              borderColor: selectedTime === time ? colors.primary : colors.border,
              backgroundColor: selectedTime === time ? colors.primaryLight : colors.background,
              color: selectedTime === time ? colors.primary : colors.text
            }}
          >
            <span className="text-base">{time}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step2TimeSelection;
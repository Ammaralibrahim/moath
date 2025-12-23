// components/Step1DateSelection.tsx
'use client'

import React from 'react';
import { AvailableDate, DateStatus, colors, arabicDays, arabicMonths } from '../types/types';

interface Step1DateSelectionProps {
  availableDates: AvailableDate[];
  loading: boolean;
  onDateSelect: (date: string) => void;
}

const Step1DateSelection: React.FC<Step1DateSelectionProps> = ({ 
  availableDates, 
  loading, 
  onDateSelect 
}) => {
  const today = new Date();
  
  const getArabicDate = (date: Date) => {
    const day = arabicDays[date.getDay()];
    const dayNumber = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    return { day, dayNumber, month, year };
  };

  const getDateStatus = (dateObj: Date): DateStatus => {
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    
    if (dateObj < todayObj) {
      return { status: 'past', text: 'منتهي' };
    }
    
    const availableDate = availableDates.find(d => {
      const dateStr = dateObj.toISOString().split('T')[0];
      return d.date === dateStr;
    });
    
    if (!availableDate || !availableDate.available) {
      return { status: 'unavailable', text: 'غير متاح' };
    }
    
    if (availableDate.availableSlots === 0) {
      return { status: 'full', text: 'مكتمل' };
    }
    
    return { status: 'available', text: 'متاح' };
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
        <p className="mt-3 text-sm" style={{ color: colors.textLight }}>جاري تحميل التواريخ...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: colors.text }}>اختر تاريخ الموعد</h2>
        <p className="text-sm sm:text-base" style={{ color: colors.textLight }}>التواريخ المتاحة خلال 60 يوم</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {availableDates.slice(0, 30).map((dateInfo, index) => {
          const dateObj = new Date(dateInfo.date);
          const arabicDate = getArabicDate(dateObj);
          const status = getDateStatus(dateObj);
          const isToday = dateObj.toDateString() === today.toDateString();
          
          return (
            <button
              key={index}
              onClick={() => status.status === 'available' && onDateSelect(dateInfo.date)}
              disabled={status.status !== 'available'}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                status.status === 'available'
                  ? 'hover:shadow-md cursor-pointer border-gray-200 hover:border-blue-400 hover:shadow-blue-50'
                  : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
              } ${isToday ? 'ring-2 ring-blue-200' : ''}`}
              style={{
                borderColor: status.status === 'available' ? colors.border : '#EDF2F7',
                backgroundColor: status.status === 'available' ? colors.background : '#F7FAFC'
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ 
                color: status.status === 'available' ? colors.textLight : colors.textLight
              }}>
                {arabicDate.day}
              </div>
              <div className={`text-lg font-bold mb-1 ${
                isToday ? 'text-blue-600' : ''
              }`} style={{ 
                color: status.status === 'available' ? colors.text : colors.textLight
              }}>
                {arabicDate.dayNumber}
              </div>
              <div className="text-xs" style={{ 
                color: status.status === 'available' ? colors.textLight : colors.textLight
              }}>
                {arabicDate.month}
              </div>
              <div className={`text-xs font-semibold mt-2 px-2 py-1 rounded-full ${
                status.status === 'available' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {status.text}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step1DateSelection;
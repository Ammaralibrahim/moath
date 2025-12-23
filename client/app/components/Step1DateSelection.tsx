// components/Step1DateSelection.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { AvailableDate, DateStatus, colors, arabicDays, arabicMonths } from '../types/types';

interface Step1DateSelectionProps {
  availableDates: AvailableDate[];
  loading: boolean;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const Step1DateSelection: React.FC<Step1DateSelectionProps> = ({ 
  availableDates, 
  loading, 
  onDateSelect,
  selectedDate
}) => {
  const today = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  const getArabicDate = (date: Date) => {
    const day = arabicDays[date.getDay()];
    const dayNumber = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    return { day, dayNumber, month, year };
  };

  const getDateStatus = (dateObj: Date, availableSlots: number): DateStatus => {
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    
    if (dateObj < todayObj) {
      return { status: 'past', text: 'منتهي', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    const availableDate = availableDates.find(d => {
      const dateStr = dateObj.toISOString().split('T')[0];
      return d.date === dateStr;
    });
    
    if (!availableDate || !availableDate.available) {
      return { status: 'unavailable', text: 'غير متاح', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    if (availableSlots === 0) {
      return { status: 'full', text: 'مكتمل', color: 'text-red-600', bg: 'bg-red-100' };
    }
    
    const percentage = availableSlots / (availableDate.totalSlots || 11);
    let statusText = `${availableSlots} مواعيد متبقية`;
    
    if (percentage < 0.3) {
      statusText = 'آخر أماكن';
    } else if (percentage < 0.5) {
      statusText = 'شبه ممتلئ';
    }
    
    return { 
      status: 'available', 
      text: statusText, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    };
  };

  // Group dates by month
  const groupedDates = availableDates.slice(0, 60).reduce((groups, dateInfo) => {
    const date = new Date(dateInfo.date);
    const monthYear = `${arabicMonths[date.getMonth()]} ${date.getFullYear()}`;
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(dateInfo);
    return groups;
  }, {} as Record<string, AvailableDate[]>);

  const months = Object.keys(groupedDates);
  
  // Filter dates for current month
  const currentMonthDates = months[currentMonthIndex] ? groupedDates[months[currentMonthIndex]] : [];

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="relative inline-block">
          <div className="w-12 h-12 border-[3px] border-t-transparent rounded-full animate-spin" 
               style={{ borderColor: colors.primary }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium" style={{ color: colors.textLight }}>جاري تحميل التواريخ المتاحة...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
          اختر تاريخ الموعد
        </h2>
        <p className="text-sm sm:text-base font-medium mb-6 text-gray-600">
          اختر من بين التواريخ المتاحة خلال 60 يوم القادمة
        </p>
        
        {/* Month Navigation */}
        {months.length > 1 && (
          <div className="flex items-center justify-between max-w-md mx-auto mb-6 bg-white p-2 rounded-2xl shadow border border-gray-200">
            <button
              onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
              disabled={currentMonthIndex === 0}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ color: colors.primary }}
            >
              <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-lg text-gray-800">
                {months[currentMonthIndex] || 'جاري التحميل'}
              </span>
            </div>
            
            <button
              onClick={() => setCurrentMonthIndex(prev => Math.min(months.length - 1, prev + 1))}
              disabled={currentMonthIndex === months.length - 1}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ color: colors.primary }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-gray-700">متاح</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs font-medium text-gray-700">مكتمل</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-300">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-xs font-medium text-gray-700">غير متاح</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-gray-700">اليوم</span>
          </div>
        </div>
      </div>
      
      {/* Dates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-8">
        {currentMonthDates.map((dateInfo, index) => {
          const dateObj = new Date(dateInfo.date);
          const arabicDate = getArabicDate(dateObj);
          const status = getDateStatus(dateObj, dateInfo.availableSlots || 0);
          const isToday = dateObj.toDateString() === today.toDateString();
          const isAvailable = status.status === 'available';
          const isSelected = selectedDate === dateInfo.date;
          
          return (
            <button
              key={index}
              onClick={() => isAvailable && onDateSelect(dateInfo.date)}
              disabled={!isAvailable}
              className={`
                relative p-4 rounded-2xl text-center transition-all duration-300
                border-2 transform hover:-translate-y-1 active:scale-95 overflow-hidden
                ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                ${isAvailable 
                  ? 'hover:shadow-md cursor-pointer' 
                  : 'opacity-80 cursor-not-allowed'
                }
              `}
              style={{
                borderColor: isAvailable 
                  ? (isSelected ? colors.primary : '#E5E7EB') 
                  : '#D1D5DB',
                backgroundColor: isAvailable 
                  ? (isSelected 
                    ? colors.primary 
                    : isToday 
                      ? '#EFF6FF'
                      : '#FFFFFF') 
                  : '#F3F4F6',
                boxShadow: isSelected 
                  ? '0 4px 12px rgba(37, 99, 235, 0.2)'
                  : isAvailable 
                    ? '0 1px 3px rgba(0,0,0,0.08)' 
                    : 'none',
              }}
            >
              {/* Today Indicator */}
              {isToday && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></div>
              )}
              
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {/* Day Name */}
              <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ 
                color: isAvailable 
                  ? (isSelected ? '#FFFFFF' : '#6B7280') 
                  : '#9CA3AF'
              }}>
                {arabicDate.day}
              </div>
              
              {/* Day Number */}
              <div className={`
                text-2xl font-bold mb-1 leading-none
                ${isToday && !isSelected ? 'text-blue-600' : ''}
              `} style={{ 
                color: isAvailable 
                  ? (isSelected ? '#FFFFFF' : '#1F2937')
                  : '#6B7280'
              }}>
                {arabicDate.dayNumber}
              </div>
              
              {/* Month */}
              <div className="text-xs font-medium mb-3" style={{ 
                color: isAvailable 
                  ? (isSelected ? 'rgba(255,255,255,0.9)' : '#6B7280') 
                  : '#9CA3AF'
              }}>
                {arabicDate.month}
              </div>
              
              {/* Status Badge - Only show for non-available dates */}
              {status.status !== 'available' && (
                <div className={`
                  text-xs font-semibold px-3 py-1.5 rounded-full transition-all mb-2
                  ${isSelected ? 'bg-white text-blue-600' : status.bg}
                `} style={{ 
                  color: isSelected ? colors.primary : status.color
                }}>
                  {status.text}
                </div>
              )}
              
              {/* Slots Info - Show for available dates */}
              {isAvailable && dateInfo.availableSlots > 0 && (
                <div className="absolute bottom-2 left-0 right-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                       style={{ 
                         backgroundColor: isSelected 
                           ? 'rgba(255,255,255,0.9)' 
                           : '#EFF6FF',
                         color: isSelected ? colors.primary : colors.primary,
                         borderColor: isSelected ? 'rgba(255,255,255,0.3)' : '#BFDBFE'
                       }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {dateInfo.availableSlots} مواعيد متبقية 
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
    
      {/* Selected Date Summary */}
      {selectedDate && (
        <div className="mt-8 p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-blue-300 flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">التاريخ المختار</div>
                <div className="text-lg font-bold text-gray-800">
                  {new Date(selectedDate).toLocaleDateString('ar-EG', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() => onDateSelect('')}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-white transition-colors border border-gray-300"
            >
              تغيير
            </button>
          </div>
        </div>
      )}
      
      {/* إضافة CSS للـ animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Step1DateSelection;
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
  onNext?: () => void;
}

const Step2TimeSelection: React.FC<Step2TimeSelectionProps> = ({
  selectedDate,
  availableSlots,
  selectedTime,
  loading,
  onTimeSelect,
  onBack,
  onNext
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }}></div>
        <p className="mt-4 text-sm text-gray-600">جاري تحميل الأوقات المتاحة...</p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4 border border-red-200">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">لا توجد أوقات متاحة</h3>
        <p className="mb-6 text-sm max-w-sm mx-auto leading-relaxed text-gray-600">
          عذراً، جميع المواعيد مكتملة لهذا التاريخ.
          <br />
          يمكنك اختيار يوم آخر للحصول على موعد.
        </p>
        <button 
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-medium text-white hover:bg-blue-600 transition-all duration-200"
          style={{ 
            backgroundColor: colors.primary,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}
        >
          اختر تاريخ آخر
        </button>
      </div>
    );
  }

  // Generate all possible hourly slots (8:00 - 18:00)
  const allTimeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    allTimeSlots.push(time);
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="relative mb-8">
        <button 
          onClick={onBack}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 border border-gray-300"
          style={{ 
            color: colors.primary,
            backgroundColor: '#FFFFFF'
          }}
        >
          <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          رجوع
        </button>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
            اختر وقت الموعد
          </h2>
          <div className="inline-flex flex-col items-center">
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {new Date(selectedDate).toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="mt-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {availableSlots.length} وقت متاح من {allTimeSlots.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-blue-300 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">مواعيد العمل: من 8:00 صباحاً إلى 6:00 مساءً</p>
            <p className="text-xs mt-0.5 text-gray-600">كل موعد يستغرق ساعة واحدة</p>
          </div>
        </div>
      </div>
      
      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {allTimeSlots.map((time, index) => {
          const isAvailable = availableSlots.includes(time);
          const isSelected = selectedTime === time;
          
          return (
            <button
              key={index}
              onClick={() => isAvailable && onTimeSelect(time)}
              disabled={!isAvailable}
              className={`
                relative p-4 rounded-xl text-center transition-all duration-200 border-2
                ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                ${isAvailable 
                  ? 'hover:shadow-md cursor-pointer' 
                  : 'opacity-70 cursor-not-allowed'
                }
              `}
              style={{
                borderColor: isAvailable 
                  ? (isSelected ? colors.primary : '#E5E7EB') 
                  : '#E5E7EB',
                backgroundColor: isAvailable 
                  ? (isSelected 
                    ? colors.primary 
                    : '#FFFFFF') 
                  : '#F9FAFB',
                boxShadow: isSelected 
                  ? '0 4px 12px rgba(37, 99, 235, 0.2)'
                  : 'none',
              }}
            >
              {/* Status Badge */}
              <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                isSelected 
                  ? 'bg-white text-blue-600 border-blue-200' 
                  : isAvailable 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-100 text-red-600 border-gray-300'
              }`}>
                {isAvailable ? 'متاح' : 'تم الحجز'}
              </div>
              
              {/* Time Display */}
              <div className={`text-xl font-bold mb-1 ${
                isSelected ? 'text-white' : isAvailable ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {time}
              </div>
              
              {/* Period Indicator */}
              <div className={`text-xs font-medium ${
                isSelected ? 'text-blue-100' : isAvailable ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {parseInt(time.split(':')[0]) >= 12 ? 'مساءً' : 'صباحاً'}
              </div>
              
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Selected Time Summary */}
      {selectedTime && (
        <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-blue-300 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">الوقت المختار</div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold text-gray-800">{selectedTime}</div>
                  <div className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                    مؤكد
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onTimeSelect('')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-gray-700"
              >
                تغيير الوقت
              </button>
              
              {onNext && (
                <button
                  onClick={onNext}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium text-white hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: colors.primary,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  تأكيد والمتابعة
                  <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
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

export default Step2TimeSelection;
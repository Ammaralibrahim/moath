'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { AvailableDate, DateStatus, colors } from '../types/types';

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
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // إعادة today إلى حالته الافتراضية
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const getArabicDateInfo = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = arabicDays[date.getDay()];
    const dayNumber = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    return { day, dayNumber, month, year };
  };

  const getDaysDifference = (targetDate: Date): number => {
    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDateObj = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const timeDiff = targetDateObj.getTime() - todayObj.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getDateStatus = (dateObj: Date, dateInfo?: AvailableDate): DateStatus => {
    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDateObj = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const daysDiff = getDaysDifference(dateObj);
    
    if (targetDateObj < todayObj) {
      return { status: 'past', text: 'منتهي', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return { status: 'holiday', text: 'عطلة', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    if (!dateInfo) {
      return { 
        status: 'unavailable', 
        text: 'غير متاح', 
        color: 'text-gray-500', 
        bg: 'bg-gray-100' 
      };
    }
    
    if (!dateInfo.available) {
      return { status: 'unavailable', text: 'غير متاح', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    const availableSlots = dateInfo.availableSlots || 0;
    if (availableSlots === 0) {
      return { status: 'full', text: 'مكتمل', color: 'text-red-600', bg: 'bg-red-100' };
    }
    
    let statusText = '';
    if (daysDiff === 0) {
      statusText = 'اليوم';
    } else if (daysDiff === 1) {
      statusText = 'بعد يوم';
    } else if (daysDiff === 2) {
      statusText = 'بعد يومين';
    } else if (daysDiff <= 10) {
      statusText = `بعد ${daysDiff} أيام`;
    } else {
      statusText = `بعد ${daysDiff} يوم`;
    }
    
    return { 
      status: 'available', 
      text: statusText, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    };
  };

  const filteredAndSortedDates = useMemo(() => {
    const allDates = [...availableDates];
    
    return allDates.filter(date => {
      const dateObj = new Date(date.date);
      const status = getDateStatus(dateObj, date);
      return status.status === 'available';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 60);
  }, [availableDates]);

  const groupedByMonth = useMemo(() => {
    const grouped: { [key: string]: AvailableDate[] } = {};
    
    filteredAndSortedDates.forEach(date => {
      const dateObj = new Date(date.date);
      const monthYear = `${dateObj.getMonth()}-${dateObj.getFullYear()}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(date);
    });
    
    return grouped;
  }, [filteredAndSortedDates]);

  const displayMonths = useMemo(() => {
    const monthKeys = Object.keys(groupedByMonth);
    
    if (monthKeys.length === 0 || currentMonthIndex >= monthKeys.length) {
      return [];
    }
    
    const currentMonthKey = monthKeys[currentMonthIndex];
    return groupedByMonth[currentMonthKey] || [];
  }, [groupedByMonth, currentMonthIndex]);

  const getCurrentMonthName = (): string => {
    if (displayMonths.length === 0) return '';
    
    const firstDate = new Date(displayMonths[0].date);
    return arabicMonths[firstDate.getMonth()];
  };

  const getCurrentYear = (): number => {
    if (displayMonths.length === 0) return new Date().getFullYear();
    
    const firstDate = new Date(displayMonths[0].date);
    return firstDate.getFullYear();
  };

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
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
          اختر تاريخ الموعد
        </h2>
        <p className="text-sm sm:text-base font-medium mb-6 text-gray-600">
          اختر من بين التواريخ المتاحة خلال 60 يوم القادمة
        </p>
        
        <div className="flex items-center justify-between max-w-md mx-auto mb-8 bg-white p-2 rounded-2xl shadow border border-gray-200">
          <button
            onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
            disabled={currentMonthIndex === 0}
            className="p-3 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            style={{ color: colors.primary }}
          >
            <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
              <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-gray-800">
                {getCurrentMonthName()} {getCurrentYear()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {displayMonths.length} تاريخ متاح
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentMonthIndex(prev => prev + 1)}
            disabled={currentMonthIndex >= Object.keys(groupedByMonth).length - 1}
            className="p-3 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            style={{ color: colors.primary }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {displayMonths.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {displayMonths.map((dateInfo) => {
              const arabicDate = getArabicDateInfo(dateInfo.date);
              const dateObj = new Date(dateInfo.date);
              const status = getDateStatus(dateObj, dateInfo);
              // إعادة isToday إلى حالته الافتراضية باستخدام today المحفوظ
              const isToday = dateObj.toDateString() === today.toDateString();
              const isSelected = selectedDate === dateInfo.date;
              const availableSlots = dateInfo.availableSlots || 0;
              const totalSlots = dateInfo.totalSlots || 11;
              const percentage = Math.round((availableSlots / totalSlots) * 100);
              
              return (
                <div
                  key={dateInfo.date}
                  className={`
                    relative rounded-2xl transition-all duration-300 border-2
                    ${isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-200 ring-offset-2 transform scale-[1.02]' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                    }
                    ${isToday ? 'border-blue-300' : ''}
                    overflow-hidden
                  `}
                  style={{
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    boxShadow: isSelected 
                      ? '0 10px 25px rgba(59, 130, 246, 0.15)' 
                      : '0 4px 6px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {isToday && (
                    <div className="absolute top-1 right-1 z-10">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        <span className="text-[10px]  text-white">اليوم</span>
                      </div>
                    </div>
                  )}
                  
                  {isSelected && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => onDateSelect(dateInfo.date)}
                    className="w-full text-right p-5"
                  >
                    {/* التاريخ واليوم */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-left">
                        <div className="text-2xl font-bold text-gray-800">
                          {arabicDate.dayNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {arabicDate.month}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-lg font-semibold text-gray-800">
                          {arabicDate.day}
                        </div>
                        <div className="text-xs text-gray-500">
                          {arabicDate.year}
                        </div>
                      </div>
                    </div>
                    
                    {/* الخط الفاصل */}
                    <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mb-4"></div>
                    
                    {/* معلومات المواعيد */}
                    <div className="space-y-4">
                      {/* الصف الأول: المواعيد المتاحة */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            {/* <div className="text-base font-bold text-gray-800"></div> */}
                            <div className="text-xs font-medium text-gray-600" ><span className="text-base font-bold text-gray-800">{availableSlots}</span> موعد متاح  </div>
                          </div>
                        </div>
                        
                        {/* البادج الزرقاء */}
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.text}
                        </div>
                      </div>
                      
                      {/* شريط التقدم */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>نسبة الإشغال</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* مؤشر التحويم/الاختيار */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${isSelected ? 'from-blue-500 to-blue-600' : 'from-transparent to-transparent'} transition-all duration-300`}></div>
                  </button>
                </div>
              );
            })}
          </div>
          
          {selectedDate && (
            <div className="mb-8">
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white border-2 border-blue-300 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">التاريخ المختار</div>
                      <div className="text-xl font-bold text-gray-800">
                        {new Date(selectedDate).toLocaleDateString('ar-EG', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getArabicDateInfo(selectedDate).day} الموافق {getArabicDateInfo(selectedDate).dayNumber} {getArabicDateInfo(selectedDate).month}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDateSelect('')}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200 border border-gray-300 hover:shadow-md"
                  >
                    تغيير التاريخ
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">الخطوة التالية:</span> اختر الوقت المناسب للموعد بعد تأكيد التاريخ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد مواعيد متاحة</h3>
            <p className="text-gray-600 mb-6">
              عذراً، لا توجد مواعيد متاحة في هذا الشهر. الرجاء اختيار شهر آخر أو المحاولة لاحقاً.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCurrentMonthIndex(0)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
              >
                العودة للشهر الحالي
              </button>
              <button
                onClick={() => setCurrentMonthIndex(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm"
              >
                الشهر التالي
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {filteredAndSortedDates.length}
            </div>
            <div className="text-sm text-gray-600">يوم متاح</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {Object.keys(groupedByMonth).length}
            </div>
            <div className="text-sm text-gray-600">أشهر متاحة</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {filteredAndSortedDates.reduce((sum, date) => sum + (date.availableSlots || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">موعد متبقي</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              60
            </div>
            <div className="text-sm text-gray-600">أقصى مدة للحجز</div>
          </div>
        </div>
        
        <div className="rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-300 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0 0h-1m1 0v4m0 0v4h-1m4-8h1m-1 4h1m-7 4h.01M9 16h.01M9 12h.01M9 8h.01M9 4h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2">معلومات هامة</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                  <span>أيام العمل: <span className="font-semibold text-green-700">الأحد إلى الخميس</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                  <span>أيام العطلة: <span className="font-semibold text-red-600">الجمعة والسبت</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                  <span>يمكنك اختيار الوقت المناسب بعد تأكيد التاريخ</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                  <span>يتم تأكيد الحجز بعد الاتصال بك للتأكيد</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Step1DateSelection;
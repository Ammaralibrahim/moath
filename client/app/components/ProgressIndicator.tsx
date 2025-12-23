// components/ProgressIndicator.tsx
'use client'

import React from 'react';
import { colors } from '../types/types';

interface ProgressIndicatorProps {
  step: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ step }) => {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center justify-center gap-4 sm:gap-8 mb-3">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div 
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step >= stepNumber 
                  ? 'text-white shadow-lg' 
                  : 'border-2'
              }`}
              style={{ 
                backgroundColor: step >= stepNumber ? colors.primary : 'transparent',
                borderColor: step < stepNumber ? colors.border : 'transparent',
                color: step < stepNumber ? colors.textLight : 'white'
              }}
            >
              {step > stepNumber ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="font-semibold text-sm sm:text-base">{stepNumber}</span>
              )}
            </div>
            {stepNumber < 4 && (
              <div 
                className="w-8 sm:w-16 h-0.5 mx-1 sm:mx-2"
                style={{ 
                  backgroundColor: step > stepNumber ? colors.primary : colors.border 
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-center">
        <span style={{ 
          color: step >= 1 ? colors.text : colors.textLight,
          fontWeight: step >= 1 ? '600' : '400'
        }}>التاريخ</span>
        <span style={{ 
          color: step >= 2 ? colors.text : colors.textLight,
          fontWeight: step >= 2 ? '600' : '400'
        }}>الوقت</span>
        <span style={{ 
          color: step >= 3 ? colors.text : colors.textLight,
          fontWeight: step >= 3 ? '600' : '400'
        }}>المعلومات</span>
        <span style={{ 
          color: step >= 4 ? colors.text : colors.textLight,
          fontWeight: step >= 4 ? '600' : '400'
        }}>التأكيد</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
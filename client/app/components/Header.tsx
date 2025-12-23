// components/Header.tsx
'use client'

import React from 'react';
import { CLINIC_INFO, colors } from '../types/types';

// interface HeaderProps {
//   // Props gerekirse buraya
// }

const Header = () => {
  return (
    <header style={{ 
      backgroundColor: colors.background, 
      borderBottom: `1px solid ${colors.border}`,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Clinic Logo */}
            <div style={{ 
              backgroundColor: colors.primary,
              background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
            }} className="w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">{CLINIC_INFO.logoText}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: colors.text }}>{CLINIC_INFO.name}</h1>
              <p className="text-xs" style={{ color: colors.primary }}>{CLINIC_INFO.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>الاثنين - الخميس: 8 ص - 7 م</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
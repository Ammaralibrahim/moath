// components/ClinicInfoCards.tsx
'use client'

import React from 'react';
import { CLINIC_INFO, colors } from '../types/types';

const ClinicInfoCards: React.FC = () => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${colors.primary}15` }}>
            <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm" style={{ color: colors.text }}>العنوان</h3>
            <p className="text-xs" style={{ color: colors.textLight }}>{CLINIC_INFO.address}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${colors.accent}15` }}>
            <svg className="w-5 h-5" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm" style={{ color: colors.text }}>الاتصال</h3>
            <p className="text-xs" style={{ color: colors.textLight }}>{CLINIC_INFO.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${colors.secondary}15` }}>
            <svg className="w-5 h-5" style={{ color: colors.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm" style={{ color: colors.text }}>ساعات العمل</h3>
            <p className="text-xs" style={{ color: colors.textLight }}>{CLINIC_INFO.workingHours.weekdays}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicInfoCards;
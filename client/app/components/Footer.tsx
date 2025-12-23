// components/Footer.tsx
'use client'

import React from 'react';
import { CLINIC_INFO, colors } from '../types/types';

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 py-4 border-t" style={{ 
      borderColor: colors.border, 
      backgroundColor: colors.surface 
    }}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs" style={{ color: colors.textLight }}>
          © 2024 {CLINIC_INFO.name}. جميع الحقوق محفوظة.
        </p>
        <p className="text-xs mt-1" style={{ color: colors.textLight }}>
          نظام الحجز الإلكتروني - {CLINIC_INFO.address}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
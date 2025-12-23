// components/MainContentCard.tsx
'use client'

import React from 'react';
import { colors } from '../types/types';

interface MainContentCardProps {
  children: React.ReactNode;
}

const MainContentCard: React.FC<MainContentCardProps> = ({ children }) => {
  return (
    <div style={{ 
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      padding: '24px',
      border: `1px solid ${colors.border}`,
      marginBottom: '32px'
    }}>
      {children}
    </div>
  );
};

export default MainContentCard;
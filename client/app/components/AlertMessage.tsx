// components/AlertMessage.tsx
'use client'

import React from 'react';
import { Message } from '../types/types';

interface AlertMessageProps {
  message: Message;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ message }) => {
  if (!message.text) return null;

  return (
    <div 
      className={`mb-6 p-3 rounded-lg flex items-center gap-3 ${
        message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d={message.type === 'success' 
              ? "M5 13l4 4L19 7" 
              : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            } 
          />
        </svg>
      </div>
      <span className={`text-sm font-medium ${
        message.type === 'success' ? 'text-green-800' : 'text-red-800'
      }`}>
        {message.text}
      </span>
    </div>
  );
};

export default AlertMessage;
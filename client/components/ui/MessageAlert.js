'use client'

import { colors } from '@/components/shared/constants'

export default function MessageAlert({ message, setMessage }) {
  if (!message.text) return null

  return (
    <div 
      className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-sm ${
        message.type === 'success' 
          ? 'bg-emerald-900/30 border border-emerald-700/50' 
          : 'bg-rose-900/30 border border-rose-700/50'
      }`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.type === 'success' 
          ? 'bg-emerald-500 text-emerald-100' 
          : 'bg-rose-500 text-rose-100'
      }`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d={message.type === 'success' 
              ? "M5 13l4 4L19 7" 
              : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            } 
          />
        </svg>
      </div>
      <span className={`text-sm font-semibold flex-1 ${
        message.type === 'success' ? 'text-emerald-200' : 'text-rose-200'
      }`}>
        {message.text}
      </span>
      <button
        onClick={() => setMessage({ type: '', text: '' })}
        className="p-1 hover:opacity-70 transition-opacity"
        style={{ color: colors.textLight }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
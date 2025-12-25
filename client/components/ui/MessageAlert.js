'use client'

import { useState, useEffect, useRef } from 'react'
import { colors } from '@/components/shared/constants'
import { motion, AnimatePresence } from 'framer-motion'

export default function MessageAlert({ message, setMessage }) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const progressInterval = useRef(null)

  useEffect(() => {
    if (message.text) {
      setIsVisible(true)
      setProgress(100)
      
      // Progress bar için interval
      if (progressInterval.current) clearInterval(progressInterval.current)
      
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            handleClose()
            return 0
          }
          return prev - 0.2
        })
      }, 10)

      // Otomatik kapanma
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return () => {
        clearTimeout(timer)
        if (progressInterval.current) clearInterval(progressInterval.current)
      }
    } else {
      setIsVisible(false)
    }
  }, [message])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setMessage({ type: '', text: '', description: '' })
      setProgress(100)
    }, 300)
  }

  const getMessageConfig = (type) => {
    const configs = {
      success: {
        bgColor: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-900/5',
        borderColor: 'border-emerald-200 dark:border-emerald-700/30',
        iconColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        glowColor: 'from-emerald-500/20 to-emerald-600/10'
      },
      error: {
        bgColor: 'bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/10 dark:to-rose-900/5',
        borderColor: 'border-rose-200 dark:border-rose-700/30',
        iconColor: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z',
        glowColor: 'from-rose-500/20 to-rose-600/10'
      },
      warning: {
        bgColor: 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/5',
        borderColor: 'border-amber-200 dark:border-amber-700/30',
        iconColor: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z',
        glowColor: 'from-amber-500/20 to-amber-600/10'
      },
      info: {
        bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/5',
        borderColor: 'border-blue-200 dark:border-blue-700/30',
        iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        glowColor: 'from-blue-500/20 to-blue-600/10'
      }
    }

    return configs[type] || {
      bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/10 dark:to-gray-900/5',
      borderColor: 'border-gray-200 dark:border-gray-700/30',
      iconColor: 'bg-gradient-to-br from-gray-500 to-gray-600 text-white',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      glowColor: 'from-gray-500/20 to-gray-600/10'
    }
  }

  const config = getMessageConfig(message.type)

  const getTitle = (type) => {
    const titles = {
      success: 'Başarılı',
      error: 'Hata',
      warning: 'Uyarı',
      info: 'Bilgi'
    }
    return titles[type] || 'Mesaj'
  }

  if (!message.text || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${config.glowColor} blur-xl opacity-50 rounded-2xl`} />
          
          {/* Main card */}
          <div className={`relative backdrop-blur-xl rounded-2xl overflow-hidden border ${config.borderColor} ${config.bgColor} shadow-2xl shadow-black/5 dark:shadow-black/20`}>
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
                className={`h-full bg-gradient-to-r ${config.iconColor.replace('bg-gradient-to-br', '')}`}
              />
            </div>

            <div className="p-5 flex items-start gap-4">
              {/* Icon container */}
              <div className="relative">
                <div className={`relative z-10 w-10 h-10 rounded-xl ${config.iconColor} flex items-center justify-center shadow-lg`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={config.icon} />
                  </svg>
                </div>
                {/* Icon glow */}
                <div className={`absolute inset-0 ${config.iconColor.replace('bg-gradient-to-br', 'bg-gradient-to-br')} blur opacity-50 rounded-xl`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                    {getTitle(message.type)}
                  </h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/30 text-gray-600 dark:text-gray-300">
                    {message.type.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
                  {message.text}
                </p>
                
                {message.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    {message.description}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="group relative w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/20 rounded-xl transition-all duration-200 ml-2"
                aria-label="Kapat"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl blur-sm group-hover:blur-md transition-all" />
                <svg 
                  className="relative w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Action buttons (optional) */}
            <div className="px-5 pb-4 pt-2 border-t border-white/10 dark:border-black/10">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleClose}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/50 dark:bg-black/30 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-black/50 transition-all duration-200"
                >
                  تم
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
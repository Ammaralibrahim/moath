// @/components/ui/ErrorBoundary.js
'use client'

import { Component } from 'react'
import { colors } from '@/components/shared/constants'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl p-6 border text-center" style={{ 
          borderColor: colors.error,
          backgroundColor: `${colors.error}10`
        }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
            backgroundColor: `${colors.error}20`
          }}>
            <svg className="w-8 h-8" style={{ color: colors.error }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: colors.error }}>حدث خطأ</h3>
          <p className="text-sm mb-4" style={{ color: colors.textLight }}>
            {this.state.error?.message || 'حدث خطأ غير معروف'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ 
              background: colors.gradientPrimary,
              color: '#FFFFFF'
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
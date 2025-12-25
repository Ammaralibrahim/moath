// @/components/shared/api.js
import { API_BASE_URL, ADMIN_API_KEY } from './constants'
import toast from 'react-hot-toast'

let lastRequestTime = 0
const REQUEST_DELAY = 1000

// Arapça hata mesajları
const ARABIC_ERROR_MESSAGES = {
  NETWORK_ERROR: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
  TIMEOUT_ERROR: 'انتهت مهلة الطلب. الخادم مشغول حاليًا، يرجى المحاولة مرة أخرى لاحقًا.',
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات. يرجى التحقق من المعلومات المدخلة.',
  NOT_FOUND: 'البيانات المطلوبة غير موجودة.',
  SERVER_ERROR: 'خطأ في الخادم الداخلي. يرجى المحاولة مرة أخرى لاحقًا.',
  UNAUTHORIZED: 'غير مصرح لك بالوصول إلى هذه البيانات.',
  FORBIDDEN: 'ليس لديك الصلاحية للقيام بهذا الإجراء.',
  DUPLICATE_ENTRY: 'هذه البيانات موجودة مسبقًا في النظام.',
  APPOINTMENT_CONFLICT: 'هناك تعارض في المواعيد. يرجى اختيار وقت آخر.',
  PATIENT_HAS_APPOINTMENTS: 'لا يمكن حذف المريض لأنه لديه مواعيد مرتبطة.',
  INVALID_DATE: 'تاريخ غير صالح. يرجى التحقق من التاريخ المدخل.',
  REQUIRED_FIELD: 'هذا الحقل مطلوب.',
  INVALID_PHONE: 'رقم الهاتف غير صالح.',
  INVALID_EMAIL: 'البريد الإلكتروني غير صالح.',
  DATA_TOO_LARGE: 'حجم البيانات كبير جدًا.',
  RATE_LIMIT: 'لقد تجاوزت عدد المحاولات المسموح بها. يرجى الانتظار قليلاً.',
}

// Arapça نجاح رسائل
const ARABIC_SUCCESS_MESSAGES = {
  PATIENT_CREATED: 'تم إنشاء المريض بنجاح.',
  PATIENT_UPDATED: 'تم تحديث بيانات المريض بنجاح.',
  PATIENT_DELETED: 'تم حذف المريض بنجاح.',
  APPOINTMENT_CREATED: 'تم إنشاء الموعد بنجاح.',
  APPOINTMENT_UPDATED: 'تم تحديث الموعد بنجاح.',
  APPOINTMENT_DELETED: 'تم حذف الموعد بنجاح.',
  APPOINTMENT_STATUS_UPDATED: 'تم تحديث حالة الموعد بنجاح.',
  DATA_LOADED: 'تم تحميل البيانات بنجاح.',
  OPERATION_SUCCESS: 'تمت العملية بنجاح.',
  FILE_DOWNLOADED: 'تم تحميل الملف بنجاح.',
}

class ApiError extends Error {
  constructor(message, code, status, data, headers) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.data = data
    this.headers = headers
    this.timestamp = new Date().toISOString()
    this.retryAfter = headers?.get('retry-after') || headers?.['retry-after']
  }
}

class NetworkError extends Error {
  constructor(message, originalError) {
    super(message)
    this.name = 'NetworkError'
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TimeoutError'
    this.timestamp = new Date().toISOString()
  }
}

// Mesaj gösterme yardımcı fonksiyonu
export const showMessage = (type, messageKey, customMessage = '') => {
  const message = customMessage || ARABIC_ERROR_MESSAGES[messageKey] || messageKey
  
  if (type === 'success') {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#10B981',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
      icon: '✅',
    })
  } else if (type === 'error') {
    toast.error(message, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
      icon: '❌',
    })
  } else if (type === 'info') {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#3B82F6',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
      icon: 'ℹ️',
    })
  } else if (type === 'loading') {
    return toast.loading(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#F59E0B',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
    })
  }
}

// Ana API istek fonksiyonu - Güncellenmiş versiyon
export const apiRequest = async (url, options = {}) => {
  const {
    timeout = 30000,
    headers = {},
    showSuccess = false,
    successMessage = '',
    showError = true,
    ...restOptions
  } = options

  const controller = new AbortController()
  const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null
  let toastId = null

  try {
    // Loading mesajı göster
    toastId = showMessage('loading', 'جاري المعالجة...')

    // Rate limiting kontrolü
    const now = Date.now()
    if (now - lastRequestTime < REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - (now - lastRequestTime)))
    }
    lastRequestTime = Date.now()

    // URL kontrolü
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
    
    const response = await fetch(fullUrl, {
      headers: {
        'x-admin-key': ADMIN_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'ar',
        ...headers,
      },
      credentials: 'include',
      signal: controller.signal,
      ...restOptions,
    })

    if (timeoutId) clearTimeout(timeoutId)
    if (toastId) toast.dismiss(toastId)

    if (!response.ok) {
      let errorMessage = ARABIC_ERROR_MESSAGES.SERVER_ERROR
      let errorData = null
      let errorCode = 'HTTP_ERROR'

      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json()
          
          // Sunucudan gelen Arapça hata mesajını kullan
          if (errorData.message) {
            errorMessage = errorData.message
          }
          
          // Özel hata kodları için mesaj eşleştirme
          if (errorData.error?.code && ARABIC_ERROR_MESSAGES[errorData.error.code]) {
            errorMessage = ARABIC_ERROR_MESSAGES[errorData.error.code]
          }
          
          errorCode = errorData.error?.code || 'HTTP_ERROR'
        } else {
          errorMessage = await response.text()
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError)
      }

      // HTTP durum kodlarına göre mesaj belirle
      if (response.status === 404) {
        errorMessage = ARABIC_ERROR_MESSAGES.NOT_FOUND
      } else if (response.status === 401) {
        errorMessage = ARABIC_ERROR_MESSAGES.UNAUTHORIZED
      } else if (response.status === 403) {
        errorMessage = ARABIC_ERROR_MESSAGES.FORBIDDEN
      } else if (response.status === 400) {
        errorMessage = errorMessage || ARABIC_ERROR_MESSAGES.VALIDATION_ERROR
      } else if (response.status === 409) {
        errorMessage = ARABIC_ERROR_MESSAGES.DUPLICATE_ENTRY
      } else if (response.status === 429) {
        errorMessage = ARABIC_ERROR_MESSAGES.RATE_LIMIT
      }

      if (showError) {
        showMessage('error', errorCode, errorMessage)
      }

      throw new ApiError(
        errorMessage,
        errorCode,
        response.status,
        errorData,
        response.headers
      )
    }

    // Response tipine göre işle
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      if (data.success === false) {
        const errorMsg = data.message || ARABIC_ERROR_MESSAGES.OPERATION_FAILED
        
        if (showError) {
          showMessage('error', data.error?.code || 'OPERATION_FAILED', errorMsg)
        }
        
        throw new ApiError(
          errorMsg,
          data.error?.code || 'OPERATION_FAILED',
          response.status,
          data,
          response.headers
        )
      }
      
      // Başarı mesajı göster
      if (showSuccess) {
        showMessage('success', '', successMessage || ARABIC_SUCCESS_MESSAGES.OPERATION_SUCCESS)
      }
      
      return data
    } else {
      // Diğer türler için
      const result = await response.text()
      
      if (showSuccess) {
        showMessage('success', '', successMessage || ARABIC_SUCCESS_MESSAGES.OPERATION_SUCCESS)
      }
      
      return result
    }

  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    if (toastId) toast.dismiss(toastId)

    if (error.name === 'AbortError') {
      if (showError) {
        showMessage('error', 'TIMEOUT_ERROR')
      }
      throw new TimeoutError(ARABIC_ERROR_MESSAGES.TIMEOUT_ERROR)
    }

    if (error.name === 'NetworkError' || error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      if (showError) {
        showMessage('error', 'NETWORK_ERROR')
      }
      throw new NetworkError(ARABIC_ERROR_MESSAGES.NETWORK_ERROR, error)
    }

    if (error instanceof ApiError) {
      // ApiError zaten mesaj gösterdi, tekrar göstermeye gerek yok
      throw error
    }

    console.error('API İstek Hatası:', error)
    
    if (showError) {
      showMessage('error', 'SERVER_ERROR', error.message)
    }
    
    const enhancedError = new Error(error.message || ARABIC_ERROR_MESSAGES.SERVER_ERROR)
    enhancedError.originalError = error
    enhancedError.name = error.name || 'UnknownError'
    enhancedError.status = 500
    throw enhancedError
  }
}

// Yardımcı API fonksiyonları - Mesaj desteği ile
export const getPatientAppointments = async (patientId, options = {}) => {
  return await apiRequest(`/api/appointments/patient/${patientId}`, {
    showSuccess: false,
    showError: true,
    ...options
  })
}

export const createAppointment = async (appointmentData, options = {}) => {
  return await apiRequest('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.APPOINTMENT_CREATED,
    showError: true,
    ...options
  })
}

export const updateAppointment = async (appointmentId, appointmentData, options = {}) => {
  return await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData),
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.APPOINTMENT_UPDATED,
    showError: true,
    ...options
  })
}

export const deleteAppointment = async (appointmentId, options = {}) => {
  return await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'DELETE',
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.APPOINTMENT_DELETED,
    showError: true,
    ...options
  })
}

// Hata yönetimi için yardımcı fonksiyonlar
export const errorHandlers = {
  handleApiError: (error, fallbackMessage = ARABIC_ERROR_MESSAGES.SERVER_ERROR) => {
    if (error instanceof ApiError) {
      return {
        message: error.message,
        code: error.code,
        status: error.status,
        data: error.data,
        timestamp: error.timestamp,
        retryAfter: error.retryAfter
      }
    } else if (error instanceof NetworkError) {
      return {
        message: ARABIC_ERROR_MESSAGES.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        originalError: error.originalError?.message,
      }
    } else if (error instanceof TimeoutError) {
      return {
        message: ARABIC_ERROR_MESSAGES.TIMEOUT_ERROR,
        code: 'TIMEOUT_ERROR',
      }
    } else {
      return {
        message: fallbackMessage,
        code: 'UNKNOWN_ERROR',
        originalError: error.message,
      }
    }
  },

  isNetworkError: (error) => error instanceof NetworkError,
  isTimeoutError: (error) => error instanceof TimeoutError,
  isApiError: (error) => error instanceof ApiError,
  isRateLimitError: (error) => {
    return error instanceof ApiError && (error.status === 429 || error.code === 'RATE_LIMIT')
  }
}

export default apiRequest
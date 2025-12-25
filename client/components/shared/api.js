// @/components/shared/api.js
import { API_BASE_URL, ADMIN_API_KEY } from './constants'

let lastRequestTime = 0
const REQUEST_DELAY = 1000 // 1 saniye

// Özel hata sınıfları
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

// Request Queue sistemi
const requestQueue = []
let isProcessing = false

const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return
  isProcessing = true
  
  while (requestQueue.length > 0) {
    const { requestFn, resolve, reject } = requestQueue.shift()
    
    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    }
    
    // İstekler arasında kısa bir bekleme
    if (requestQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  isProcessing = false
}

// Ana API istek fonksiyonu
export const apiRequest = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const requestFn = async () => {
      const {
        timeout = 30000,
        headers = {},
        ...restOptions
      } = options

      const controller = new AbortController()
      const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null

      try {
        // Rate limiting kontrolü
        const now = Date.now()
        if (now - lastRequestTime < REQUEST_DELAY) {
          await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - (now - lastRequestTime)))
        }
        lastRequestTime = Date.now()

        // URL kontrolü
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
        
        console.log('API Request to:', fullUrl)
        
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

        if (!response.ok) {
          let errorMessage = `HTTP hatası! durum: ${response.status}`
          let errorData = null

          try {
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              errorData = await response.json()
              if (errorData.message) {
                errorMessage = errorData.message
              }
            } else {
              errorMessage = await response.text()
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError)
          }

          throw new ApiError(
            errorMessage,
            'HTTP_ERROR',
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
            throw new ApiError(
              data.message || 'İşlem başarısız oldu',
              data.error?.code || 'OPERATION_FAILED',
              response.status,
              data,
              response.headers
            )
          }
          
          return data
        } else if (contentType && (
          contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
          contentType.includes('application/pdf')
        )) {
          // Binary response için blob döndür
          return await response.blob()
        } else {
          // Diğer türler için text
          return await response.text()
        }

      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId)

        if (error.name === 'AbortError') {
          throw new TimeoutError(`İstek zaman aşımına uğradı (${timeout}ms)`)
        }

        if (error.name === 'NetworkError' || error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          throw new NetworkError('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.', error)
        }

        if (error instanceof ApiError) {
          throw error
        }

        console.error('API İstek Hatası:', error)
        
        const enhancedError = new Error(error.message || 'Bilinmeyen bir hata oluştu')
        enhancedError.originalError = error
        enhancedError.name = error.name || 'UnknownError'
        enhancedError.status = 500
        throw enhancedError
      }
    }

    requestQueue.push({ requestFn, resolve, reject })
    processQueue()
  })
}

// Retry mekanizması - Exponential Backoff ile
export const retryApiRequest = async (requestFn, maxRetries = 3, initialDelay = 1000) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      const shouldRetry = 
        error.name === 'NetworkError' ||
        error.name === 'TimeoutError' ||
        (error.name === 'ApiError' && (
          error.status === 429 ||
          error.status === 503 ||
          error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('Failed to fetch')
        ))
      
      if (shouldRetry && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i) // Exponential backoff
        console.log(`Retrying request... Attempt ${i + 1} of ${maxRetries} in ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000)) // Jitter ekle
        continue
      }
      
      throw error
    }
  }
  
  throw lastError
}

// HASTA RANDEVULARI İÇİN ÖZEL FONKSİYONLAR

/**
 * Belirli bir hastaya ait randevuları getirir
 * @param {string} patientId - Hasta ID'si
 * @param {Object} options - Ek seçenekler
 * @param {string} options.status - Randevu durumu (optional, pending, confirmed, completed, cancelled)
 * @param {string} options.sort - Sıralama (asc, desc)
 * @param {number} options.limit - Limit sayısı
 * @param {number} options.page - Sayfa numarası
 * @returns {Promise<Object>} - Randevu listesi
 */
export const getPatientAppointments = async (patientId, options = {}) => {
  const queryParams = new URLSearchParams();
  
  if (options.status) queryParams.append('status', options.status);
  if (options.sort) queryParams.append('sort', options.sort);
  if (options.limit) queryParams.append('limit', options.limit);
  if (options.page) queryParams.append('page', options.page);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `/api/appointments/patient/${patientId}?${queryString}`
    : `/api/appointments/patient/${patientId}`;
  
  return await apiRequest(url);
};

/**
 * Yeni randevu oluşturur
 * @param {Object} appointmentData - Randevu verileri
 * @returns {Promise<Object>} - Oluşturulan randevu
 */
export const createAppointment = async (appointmentData) => {
  return await apiRequest('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  })
}

/**
 * Randevu günceller
 * @param {string} appointmentId - Randevu ID'si
 * @param {Object} appointmentData - Güncellenecek veriler
 * @returns {Promise<Object>} - Güncellenen randevu
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  return await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData)
  })
}

/**
 * Randevu siler
 * @param {string} appointmentId - Randevu ID'si
 * @returns {Promise<Object>} - Silme sonucu
 */
export const deleteAppointment = async (appointmentId) => {
  return await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'DELETE'
  })
}

/**
 * Randevu durumunu günceller
 * @param {string} appointmentId - Randevu ID'si
 * @param {string} status - Yeni durum
 * @returns {Promise<Object>} - Güncellenen randevu
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  return await apiRequest(`/api/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

// Rapor indirme fonksiyonu
export const downloadReport = async (url, fileName, options = {}) => {
  try {
    const blob = await apiRequest(url, {
      ...options,
      headers: {
        ...options.headers,
        'Accept': '*/*'
      }
    })
    
    if (!(blob instanceof Blob)) {
      throw new Error('Geçersiz dosya tipi')
    }
    
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName || `report_${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(downloadUrl)
    document.body.removeChild(a)
    
    return { success: true, fileName: a.download }
  } catch (error) {
    console.error('Rapor indirme hatası:', error)
    throw error
  }
}

export const getFilteredPatientAppointments = async (patientId, filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams.append(key, filters[key]);
    }
  });
  
  const url = `/api/appointments/patient/${patientId}/filtered?${queryParams.toString()}`;
  return await apiRequest(url);
};


export const getTodaysAppointments = async () => {
  return await apiRequest('/api/appointments/today');
};


// Yaklaşan randevuları getirme
export const getUpcomingAppointments = async (days = 7) => {
  return await apiRequest(`/api/appointments/upcoming?days=${days}`);
};

// Randevu istatistikleri
export const getAppointmentStats = async (patientId = null) => {
  const url = patientId 
    ? `/api/appointments/stats?patientId=${patientId}`
    : '/api/appointments/stats';
  
  return await apiRequest(url);
};

// Hata yönetimi için yardımcı fonksiyonlar
export const errorHandlers = {
  handleApiError: (error, fallbackMessage = 'Bir hata oluştu') => {
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
        message: 'Sunucu şu anda meşgul veya bağlantı hatası var. Lütfen birkaç saniye bekleyip tekrar deneyin.',
        code: 'NETWORK_ERROR',
        originalError: error.originalError?.message,
      }
    } else if (error instanceof TimeoutError) {
      return {
        message: 'İstek zaman aşımına uğradı. Sunucu yoğun olabilir, lütfen tekrar deneyin.',
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
    return error instanceof ApiError && (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED')
  }
}

export default apiRequest
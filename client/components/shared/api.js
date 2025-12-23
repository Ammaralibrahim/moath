import { API_BASE_URL, ADMIN_API_KEY } from './constants'

export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'x-admin-key': ADMIN_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'same-origin',
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}
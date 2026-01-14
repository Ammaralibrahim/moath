// @/components/ui/LoadingSpinner.jsx
'use client'

const LoadingSpinner = ({ message = 'جاري تحميل البيانات...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-gray-700"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-gray-400 font-medium">{message}</p>
    </div>
  )
}

export default LoadingSpinner
'use client'

import { useState, useEffect } from 'react'
import BackupTable from './BackupTable'
import RestoreModal from './modals/RestoreModal'
import { colors } from '@/components/shared/constants'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Backup() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  })
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)

  useEffect(() => {
    fetchBackups()
  }, [pagination.page])

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup/list?page=${pagination.page}&limit=10`)
      
      if (data.success) {
        setBackups(data.data || [])
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total
        })
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async (type = 'full') => {
    try {
      setLoading(true)
      const data = await apiRequest('/api/backup/create', {
        method: 'POST',
        body: JSON.stringify({ type })
      })
      
      if (data.success) {
        console.log('Backup created successfully')
        fetchBackups()
      }
    } catch (error) {
      console.error('Error creating backup:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (backupId, filename) => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup/download/${backupId}`)
      
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading backup:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (backupId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
      try {
        setLoading(true)
        const data = await apiRequest(`/api/backup/${backupId}`, {
          method: 'DELETE'
        })
        
        if (data.success) {
          fetchBackups()
        }
      } catch (error) {
        console.error('Error deleting backup:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRestore = (backup) => {
    setSelectedBackup(backup)
    setShowRestoreModal(true)
  }

  const confirmRestore = async (backup) => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup/restore/${backup._id}`, {
        method: 'POST'
      })
      
      if (data.success) {
        console.log('Backup restored successfully')
        setShowRestoreModal(false)
        setSelectedBackup(null)
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Backup Actions */}
      <div className="rounded-2xl border p-6 shadow-xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>النسخ الاحتياطي</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleCreateBackup('full')}
            disabled={loading}
            className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.surfaceLight,
              backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <svg className="w-6 h-6 group-hover:text-indigo-400 transition-colors" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-semibold mb-1 group-hover:text-indigo-300 transition-colors" style={{ color: colors.text }}>نسخة احتياطية كاملة</div>
            <div className="text-sm group-hover:text-indigo-200 transition-colors" style={{ color: colors.textMuted }}>جميع البيانات (مرضى + مواعيد)</div>
          </button>
          
          <button
            onClick={() => handleCreateBackup('patients')}
            disabled={loading}
            className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.surfaceLight,
              backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <svg className="w-6 h-6 group-hover:text-emerald-400 transition-colors" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="font-semibold mb-1 group-hover:text-emerald-300 transition-colors" style={{ color: colors.text }}>نسخة المرضى فقط</div>
            <div className="text-sm group-hover:text-emerald-200 transition-colors" style={{ color: colors.textMuted }}>بيانات المرضى فقط</div>
          </button>
          
          <button
            onClick={() => handleCreateBackup('appointments')}
            disabled={loading}
            className="p-4 rounded-xl border hover:transform hover:scale-[1.02] transition-all text-right group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.surfaceLight,
              backgroundImage: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <svg className="w-6 h-6 group-hover:text-yellow-400 transition-colors" style={{ color: colors.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="font-semibold mb-1 group-hover:text-yellow-300 transition-colors" style={{ color: colors.text }}>نسخة المواعيد فقط</div>
            <div className="text-sm group-hover:text-yellow-200 transition-colors" style={{ color: colors.textMuted }}>بيانات المواعيد فقط</div>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <BackupTable 
          backups={backups}
          pagination={pagination}
          onPageChange={(page) => setPagination({...pagination, page})}
          onDownload={handleDownload}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )}

      {showRestoreModal && (
        <RestoreModal
          backup={selectedBackup}
          onClose={() => {
            setShowRestoreModal(false)
            setSelectedBackup(null)
          }}
          onConfirm={confirmRestore}
        />
      )}
    </div>
  )
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import PremiumBackupList from './backup/BackupList'
import PremiumCreateBackupModal from './backup/modals/CreateBackupModal'
import PremiumRestoreModal from './backup/modals/RestoreModal'
import { colors } from '@/components/shared/constants'
import { 
  IconDatabase, 
  IconShieldCheck,
  IconCloudArrowDown
} from '@/components/shared/icons'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Backup() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup?page=${pagination.page}&limit=${pagination.limit}`)
      
      if (data.success) {
        setBackups(data.data || [])
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
      toast.error('فشل في تحميل النسخ الاحتياطية')
      setBackups([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit])

  useEffect(() => {
    fetchBackups()
  }, [fetchBackups])

  const handleCreateBackup = async (backupData) => {
    try {
      setLoading(true)
      const data = await apiRequest('/api/backup', {
        method: 'POST',
        body: JSON.stringify(backupData),
        successMessage: 'تم إنشاء النسخ الاحتياطي بنجاح'
      })
      
      if (data.success) {
        await fetchBackups()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('فشل في إنشاء النسخ الاحتياطي')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا النسخ الاحتياطي؟')) return

    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup/${backupId}`, {
        method: 'DELETE',
        successMessage: 'تم حذف النسخ الاحتياطي بنجاح'
      })
      
      if (data.success) {
        await fetchBackups()
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
      toast.error('فشل في حذف النسخ الاحتياطي')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBackup = async (backup) => {
    try {
      setLoading(true)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(
        `${apiUrl}/api/backup/${backup._id}/download`,
        {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123'
          }
        }
      )

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backup.filename.replace('.backup', '') + '.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('📥 بدأ تحميل النسخ الاحتياطي')
    } catch (error) {
      console.error('Error downloading backup:', error)
      toast.error('❌ فشل في تحميل النسخ الاحتياطي')
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreBackup = (backup) => {
    setSelectedBackup(backup)
    setShowRestoreModal(true)
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconShieldCheck className="w-10 h-10" style={{ color: colors.primary }} />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              نظام النسخ الاحتياطي
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              نظام حماية متكامل لبياناتك
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
          className="px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 group disabled:opacity-50"
          style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#FFFFFF'
          }}
        >
          <IconCloudArrowDown className="w-5 h-5 group-hover:rotate-180 transition-transform" />
          إنشاء نسخة احتياطية جديدة
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
          <div>
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>النسخ الاحتياطية</h3>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              جميع النسخ الاحتياطية المخزنة
            </p>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full" style={{ 
            backgroundColor: colors.surfaceLight,
            color: colors.textLight
          }}>
            {pagination.total} نسخة
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <PremiumBackupList 
            backups={backups}
            pagination={pagination}
            onDelete={handleDeleteBackup}
            onDownload={handleDownloadBackup}
            onRestore={handleRestoreBackup}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {showCreateModal && (
        <PremiumCreateBackupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBackup}
          loading={loading}
        />
      )}

      {showRestoreModal && selectedBackup && (
        <PremiumRestoreModal
          backup={selectedBackup}
          onClose={() => {
            setShowRestoreModal(false)
            setSelectedBackup(null)
          }}
          onRestore={fetchBackups}
          loading={loading}
        />
      )}
    </div>
  )
}
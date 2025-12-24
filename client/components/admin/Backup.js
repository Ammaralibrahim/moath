'use client'

import { useState, useEffect } from 'react'
import PremiumBackupStats from './backup/BackupStats'
import PremiumBackupList from './backup/BackupList'
import PremiumCreateBackupModal from './backup/modals/CreateBackupModal'
import PremiumRestoreModal from './backup/modals/RestoreModal'
import BackupSettings from './backup/BackupSettings'
import BackupHealth from './backup/BackupHealth'
import { colors } from '@/components/shared/constants'
import { 
  IconDatabase, 
  IconCog, 
  IconHeart,
  IconShieldCheck,
  IconCloudArrowDown
} from '@/components/shared/icons'
import { apiRequest } from '@/components/shared/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Backup() {
  const [backups, setBackups] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [activeTab, setActiveTab] = useState('backups')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })

  useEffect(() => {
    fetchBackups()
    fetchStats()
  }, [pagination.page])

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup?page=${pagination.page}&limit=${pagination.limit}`)
      
      if (data.success) {
        setBackups(data.data || [])
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
      toast.error('❌ فشل في تحميل النسخ الاحتياطية')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/api/backup/stats')
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching backup stats:', error)
    }
  }

  const handleCreateBackup = async (backupData) => {
    try {
      setLoading(true)
      const data = await apiRequest('/api/backup', {
        method: 'POST',
        body: JSON.stringify(backupData)
      })
      
      if (data.success) {
        toast.success('✅ تم إنشاء النسخ الاحتياطي بنجاح', {
          duration: 4000,
          position: 'top-right'
        })
        fetchBackups()
        fetchStats()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('❌ فشل في إنشاء النسخ الاحتياطي')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا النسخ الاحتياطي؟')) return

    try {
      setLoading(true)
      const data = await apiRequest(`/api/backup/${backupId}`, {
        method: 'DELETE'
      })
      
      if (data.success) {
        toast.success('🗑️ تم حذف النسخ الاحتياطي بنجاح')
        fetchBackups()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
      toast.error('❌ فشل في حذف النسخ الاحتياطي')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBackup = async (backup) => {
    try {
      setLoading(true)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(
        `${apiUrl}/api/backup/${backup._id}/download`,
        {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin123',
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backup.filename.replace('.enc', '') + '.json'
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

  const renderContent = () => {
    switch (activeTab) {
      case 'backups':
        return (
          <div className="space-y-6">
            {stats && <PremiumBackupStats stats={stats} />}
            
            <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ 
              borderColor: colors.border,
              backgroundColor: colors.surface,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>النسخ الاحتياطية</h3>
                  <p className="text-sm mt-1" style={{ color: colors.textLight }}>
                    جميع النسخ الاحتياطية المخزنة محلياً
                  </p>
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
          </div>
        )
      
      case 'settings':
        return <BackupSettings />
      
      case 'health':
        return <BackupHealth stats={stats} backups={backups} />
      
      default:
        return (
          <div className="space-y-6">
            {stats && <PremiumBackupStats stats={stats} />}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <IconShieldCheck className="w-10 h-10" style={{ color: colors.primary }} />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                نظام النسخ الاحتياطي
              </h1>
              <p className="text-sm mt-1" style={{ color: colors.textLight }}>
                نظام حماية متكامل لبياناتك مع تشفير AES-256 ومتابعة ذكية
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 group"
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#FFFFFF'
            }}
          >
            <IconCloudArrowDown className="w-5 h-5 group-hover:rotate-180 transition-transform" />
            إنشاء نسخة احتياطية جديدة
          </button>
        </div>
      </div>

      {/* Premium Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl" style={{ 
        backgroundColor: colors.surfaceLight,
        border: `1px solid ${colors.border}`
      }}>
        {[
          { id: 'backups', label: 'النسخ الاحتياطية', icon: IconDatabase },
          { id: 'settings', label: 'الإعدادات', icon: IconCog },
          { id: 'health', label: 'صحة النظام', icon: IconHeart }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === tab.id ? 'shadow-lg' : 'hover:opacity-90'
            }`}
            style={activeTab === tab.id ? {
              background: colors.gradientPrimary,
              color: '#FFFFFF',
              transform: 'translateY(-2px)'
            } : {
              color: colors.textLight
            }}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Premium Modals */}
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
'use client'

import { colors } from '@/components/shared/constants'
import { formatFileSize } from '@/components/shared/utils'

export default function System({ systemStats }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6 shadow-xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>معلومات النظام</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Info */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>قاعدة البيانات</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm font-medium" style={{ color: colors.textLight }}>اسم قاعدة البيانات</div>
                <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.database?.name || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm font-medium" style={{ color: colors.textLight }}>حجم البيانات</div>
                <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                  {systemStats.database?.dataSize ? formatFileSize(systemStats.database.dataSize) : 'N/A'}
                </div>
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm font-medium" style={{ color: colors.textLight }}>عدد المجموعات</div>
                <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.database?.collections || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Server Info */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>معلومات الخادم</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm font-medium" style={{ color: colors.textLight }}>نظام التشغيل</div>
                <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.server?.platform || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm font-medium" style={{ color: colors.textLight }}>إصدار Node.js</div>
                <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>{systemStats.server?.nodeVersion || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm font-medium" style={{ color: colors.textLight }}>وقت التشغيل</div>
                <div className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                  {systemStats.server?.uptime ? Math.floor(systemStats.server.uptime / 60) + ' دقائق' : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-2xl border p-6 shadow-xl" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>صحة النظام</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border text-center" style={{ 
            borderColor: colors.success + '40',
            backgroundColor: colors.success + '10'
          }}>
            <div className="text-2xl font-bold mb-2" style={{ color: colors.success }}>{systemStats.totalPatients || 0}</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>عدد المرضى</div>
          </div>
          
          <div className="p-4 rounded-xl border text-center" style={{ 
            borderColor: colors.primary + '40',
            backgroundColor: colors.primary + '10'
          }}>
            <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>{systemStats.totalAppointments || 0}</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>عدد المواعيد</div>
          </div>
          

        </div>
      </div>
    </div>
  )
}
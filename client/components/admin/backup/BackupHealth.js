'use client'

import { colors } from '@/components/shared/constants'

export default function BackupHealth({ stats, backups }) {
  const getHealthScore = () => {
    if (!stats) return 85;
    
    let score = 0;
    
    // Backup success rate
    if (stats.total > 0) {
      const successRate = (stats.successful / stats.total) * 100;
      score += successRate * 0.3;
    }
    
    // Recent backups
    if (stats.recent && stats.recent.length > 0) {
      const recentBackups = stats.recent.filter(b => 
        new Date(b.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      score += (recentBackups.length > 0 ? 40 : 0);
    }
    
    // Storage health
    const storageHealth = stats.totalSize < 1024 * 1024 * 1024 ? 30 : 20; // Less than 1GB
    score += storageHealth;
    
    return Math.min(Math.round(score), 100);
  };

  const healthScore = getHealthScore();
  
  const getHealthColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthMessage = (score) => {
    if (score >= 80) return 'صحة النظام ممتازة';
    if (score >= 60) return 'صحة النظام جيدة';
    if (score >= 40) return 'صحة النظام متوسطة';
    return 'صحة النظام بحاجة للتحسين';
  };

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <div className="rounded-2xl border p-6" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface,
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)'
      }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>صحة نظام النسخ الاحتياطي</h3>
            <p className="text-sm mt-1" style={{ color: colors.textLight }}>
              تقييم شامل لصحة وموثوقية نظام النسخ الاحتياطي
            </p>
          </div>
          <div className="text-3xl font-bold" style={{ color: getHealthColor(healthScore) }}>
            {healthScore}%
          </div>
        </div>
        
        <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceLight }}>
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ 
              width: `${healthScore}%`,
              background: `linear-gradient(90deg, ${getHealthColor(healthScore)} 0%, ${getHealthColor(healthScore)}99 100%)`
            }}
          ></div>
        </div>
        <div className="text-sm mt-2 text-center font-medium" style={{ color: getHealthColor(healthScore) }}>
          {getHealthMessage(healthScore)}
        </div>
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-6" style={{ 
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xl">✅</div>
            </div>
            <div>
              <div className="font-bold" style={{ color: colors.text }}>معدل النجاح</div>
              <div className="text-sm" style={{ color: colors.textLight }}>النسخ الناجحة</div>
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: colors.success }}>
            {stats?.successful || 0}/{stats?.total || 0}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ 
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xl">⏰</div>
            </div>
            <div>
              <div className="font-bold" style={{ color: colors.text }}>آخر نسخة</div>
              <div className="text-sm" style={{ color: colors.textLight }}>تاريخ أحدث نسخة</div>
            </div>
          </div>
          <div className="text-lg font-bold" style={{ color: colors.text }}>
            {stats?.recent?.[0] ? 
              new Date(stats.recent[0].createdAt).toLocaleDateString('ar-EG') : 
              'لا توجد'
            }
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ 
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xl">💾</div>
            </div>
            <div>
              <div className="font-bold" style={{ color: colors.text }}>مساحة التخزين</div>
              <div className="text-sm" style={{ color: colors.textLight }}>الحجم الإجمالي</div>
            </div>
          </div>
          <div className="text-lg font-bold" style={{ color: colors.text }}>
            {stats ? formatBytes(stats.totalSize) : '0 Bytes'}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ 
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
              border: `1px solid ${colors.border}`
            }}>
              <div className="text-xl">🔒</div>
            </div>
            <div>
              <div className="font-bold" style={{ color: colors.text }}>التشفير</div>
              <div className="text-sm" style={{ color: colors.textLight }}>مستوى الأمان</div>
            </div>
          </div>
          <div className="text-lg font-bold" style={{ color: colors.success }}>
            AES-256 🔒
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border p-6" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>توصيات الصيانة</h3>
        <div className="space-y-3">
          {healthScore < 80 && (
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ 
              backgroundColor: colors.surfaceLight,
              border: `1px solid ${colors.warning}30`
            }}>
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="font-medium" style={{ color: colors.text }}>إنشاء نسخة احتياطية جديدة</div>
                <div className="text-sm" style={{ color: colors.textLight }}>من المستحسن إنشاء نسخة احتياطية أسبوعية</div>
              </div>
            </div>
          )}
          
          <div className="p-4 rounded-xl flex items-center gap-3" style={{ 
            backgroundColor: colors.surfaceLight,
            border: `1px solid ${colors.info}30`
          }}>
            <div className="text-2xl">💡</div>
            <div>
              <div className="font-medium" style={{ color: colors.text }}>فحص النسخ القديمة</div>
              <div className="text-sm" style={{ color: colors.textLight }}>احذف النسخ الأقدم من 30 يوماً لتوفير المساحة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Yardımcı fonksiyon
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
'use client'

import { useState } from 'react'
import { colors } from '@/components/shared/constants'

export default function BackupSettings() {
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    encryption: true,
    notification: true,
    maxBackups: 100,
    backupTime: '02:00'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // Burada localStorage'a kaydedebiliriz veya API'ye gönderebiliriz
    localStorage.setItem('backupSettings', JSON.stringify(settings));
    alert('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>إعدادات النسخ الاحتياطي</h3>
        
        <div className="space-y-6">
          {/* النسخ التلقائي */}
          <div className="p-4 rounded-xl border" style={{ 
            borderColor: colors.border,
            backgroundColor: colors.surfaceLight
          }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold" style={{ color: colors.text }}>النسخ الاحتياطي التلقائي</div>
                <div className="text-sm" style={{ color: colors.textLight }}>إنشاء نسخ احتياطية تلقائية بانتظام</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="autoBackup"
                  checked={settings.autoBackup}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer bg-gray-700 peer-checked:bg-green-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            
            {settings.autoBackup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                    التكرار
                  </label>
                  <select
                    name="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg text-sm"
                    style={{ 
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surface,
                      color: colors.text
                    }}
                  >
                    <option value="daily">يومياً</option>
                    <option value="weekly">أسبوعياً</option>
                    <option value="monthly">شهرياً</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                    وقت النسخ
                  </label>
                  <input
                    type="time"
                    name="backupTime"
                    value={settings.backupTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg text-sm"
                    style={{ 
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surface,
                      color: colors.text
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* إعدادات التخزين */}
          <div className="p-4 rounded-xl border" style={{ 
            borderColor: colors.border,
            backgroundColor: colors.surfaceLight
          }}>
            <div className="font-semibold mb-4" style={{ color: colors.text }}>إعدادات التخزين</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                  فترة الاحتفاظ (يوم)
                </label>
                <input
                  type="number"
                  name="retentionDays"
                  value={settings.retentionDays}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg text-sm"
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text
                  }}
                  min="1"
                  max="365"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                  الحد الأقصى للنسخ
                </label>
                <input
                  type="number"
                  name="maxBackups"
                  value={settings.maxBackups}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg text-sm"
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text
                  }}
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>

          {/* إعدادات الأمان */}
          <div className="p-4 rounded-xl border" style={{ 
            borderColor: colors.border,
            backgroundColor: colors.surfaceLight
          }}>
            <div className="font-semibold mb-4" style={{ color: colors.text }}>إعدادات الأمان</div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium" style={{ color: colors.text }}>التشفير</div>
                  <div className="text-sm" style={{ color: colors.textLight }}>تشفير النسخ الاحتياطية باستخدام AES-256</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="encryption"
                    checked={settings.encryption}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer bg-gray-700 peer-checked:bg-green-600 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium" style={{ color: colors.text }}>الإشعارات</div>
                  <div className="text-sm" style={{ color: colors.textLight }}>إرسال إشعارات عند اكتمال النسخ</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notification"
                    checked={settings.notification}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer bg-gray-700 peer-checked:bg-green-600 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            style={{ 
              background: colors.gradientSuccess,
              color: '#FFFFFF'
            }}
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>

      {/* معلومات النظام */}
      <div className="rounded-2xl border p-6" style={{ 
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>معلومات النظام</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm" style={{ color: colors.textLight }}>مسار التخزين</div>
            <div className="font-medium" style={{ color: colors.text }}>/backups/</div>
          </div>
          <div>
            <div className="text-sm" style={{ color: colors.textLight }}>نوع التشفير</div>
            <div className="font-medium" style={{ color: colors.text }}>AES-256-GCM</div>
          </div>
          <div>
            <div className="text-sm" style={{ color: colors.textLight }}>صيغة الملفات</div>
            <div className="font-medium" style={{ color: colors.text }}>.json.enc</div>
          </div>
          <div>
            <div className="text-sm" style={{ color: colors.textLight }}>الضغط</div>
            <div className="font-medium" style={{ color: colors.text }}>GZIP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
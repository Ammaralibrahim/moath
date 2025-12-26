'use client'

import { useState, useEffect, useCallback } from 'react'
import { colors } from '@/components/shared/constants'
import { apiRequest, errorHandlers } from '@/components/shared/api'
import toast from 'react-hot-toast'
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconDatabase,
  IconDownload,
  IconEye,
  IconMerge,
  IconRefresh,
  IconReplace,
  IconSettings,
  IconTrash,
  IconUsers,
  IconCalendar,
  IconArrowRight,
  IconArrowLeft,
  IconLoader,
  IconShieldCheck,
  IconFileCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconLock,
  IconUnlock,
  IconEdit,
  IconCopy,
  IconListCheck
} from '@/components/shared/icons'

export default function PremiumRestoreModal({ backup, onClose, onRestore, loading: externalLoading }) {
  const [internalLoading, setInternalLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState('mode') // mode → preview → warning → restoring → complete
  const [restoreMode, setRestoreMode] = useState('replace')
  const [confirmed, setConfirmed] = useState(false)
  const [options, setOptions] = useState({
    preservePatients: true,
    preserveAppointments: true,
    fixDataOnly: false,
    backupBeforeRestore: true,
    notifyOnComplete: true
  })
  
  // Gelişmiş düzeltme seçenekleri
  const [advancedFixOptions, setAdvancedFixOptions] = useState({
    preserveNames: true,
    preservePhoneNumbers: true,
    updateOnlyMissingFields: true,
    fieldLevelMapping: {
      patientName: 'keep_existing',
      phoneNumber: 'keep_existing',
      email: 'update_if_empty',
      address: 'update_if_empty',
      medicalHistory: 'merge',
      allergies: 'merge',
      medications: 'merge',
      notes: 'merge',
      gender: 'keep_existing',
      birthDate: 'update_if_empty',
      emergencyContact: 'update_if_empty'
    }
  })
  
  const [restoreProgress, setRestoreProgress] = useState({
    current: 0,
    total: 100,
    message: 'جارٍ التجهيز...',
    stage: 'preparing'
  })
  const [restoreResult, setRestoreResult] = useState(null)
  const [error, setError] = useState(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const loading = externalLoading || internalLoading

  const fetchPreview = useCallback(async () => {
    if (!backup?._id) return
    
    try {
      setInternalLoading(true)
      setError(null)
      const data = await apiRequest(`/api/backup/${backup._id}/preview`, {
        showSuccess: false,
        showError: false
      })
      
      if (data.success) {
        setPreview(data.data)
      } else {
        throw new Error('فشل في تحميل معاينة النسخ الاحتياطي')
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
      const errorInfo = errorHandlers.handleApiError(error)
      setError(errorInfo.message)
      toast.error('❌ فشل في تحميل معاينة النسخ الاحتياطي')
    } finally {
      setInternalLoading(false)
    }
  }, [backup])

  useEffect(() => {
    if (step === 'preview' && !preview && !error) {
      fetchPreview()
    }
  }, [step, preview, error, fetchPreview])

  const handleRestore = async () => {
    if (!confirmed && restoreMode !== 'fix-only') {
      setStep('warning')
      return
    }

    try {
      setInternalLoading(true)
      setError(null)
      setStep('restoring')
      
      const progressStages = [
        { stage: 'preparing', message: 'جارٍ تجهيز البيانات...', progress: 10 },
        { stage: 'validating', message: 'جارٍ فحص سلامة البيانات...', progress: 25 },
        { stage: 'backingup', message: 'جارٍ إنشاء نسخة احتياطية احتياطية...', progress: 40 },
        { stage: 'restoring', message: 'جارٍ استعادة البيانات...', progress: 70 },
        { stage: 'linking', message: 'جارٍ ربط العلاقات بين البيانات...', progress: 90 },
        { stage: 'complete', message: 'اكتمل الاستعادة بنجاح', progress: 100 }
      ]

      let currentProgress = 0
      for (const stage of progressStages) {
        setRestoreProgress({
          current: stage.progress,
          total: 100,
          message: stage.message,
          stage: stage.stage
        })
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        currentProgress = stage.progress
      }

      // Restore seçeneklerini hazırla
      const restoreOptions = {
        mode: restoreMode,
        fixDataOnly: restoreMode === 'fix-only',
        ...(restoreMode === 'fix-only' ? advancedFixOptions : {
          preservePatients: options.preservePatients,
          preserveAppointments: options.preserveAppointments
        }),
        backupBeforeRestore: options.backupBeforeRestore
      }

      // Actual restore API call
      const data = await apiRequest(`/api/backup/${backup._id}/restore`, {
        method: 'POST',
        body: JSON.stringify(restoreOptions),
        showSuccess: true,
        successMessage: restoreMode === 'fix-only' ? 
          'تم تصحيح البيانات بنجاح' : 
          'تم استعادة النسخ الاحتياطي بنجاح',
        showError: true
      })
      
      setRestoreResult(data)
      
      setRestoreProgress({
        current: 100,
        total: 100,
        message: 'اكتمل الاستعادة بنجاح',
        stage: 'complete'
      })
      
      setTimeout(() => {
        setStep('complete')
      }, 1000)
      
    } catch (error) {
      console.error('Error restoring backup:', error)
      const errorInfo = errorHandlers.handleApiError(error)
      setError(errorInfo.message)
      toast.error(restoreMode === 'fix-only' ? 
        '❌ فشل في تصحيح البيانات' : 
        '❌ فشل في استعادة النسخ الاحتياطي')
      setStep('warning')
    } finally {
      setInternalLoading(false)
    }
  }

  const getProgressMessage = (stage) => {
    const messages = {
      preparing: 'جارٍ تجهيز البيانات...',
      validating: 'جارٍ فحص سلامة البيانات...',
      backingup: 'جارٍ إنشاء نسخة احتياطية احتياطية...',
      restoring: 'جارٍ استعادة البيانات...',
      linking: 'جارٍ ربط العلاقات بين البيانات...',
      complete: 'اكتمل الاستعادة بنجاح'
    }
    return messages[stage] || 'جارٍ المعالجة...'
  }

  const getFieldLabel = (field) => {
    const labels = {
      patientName: 'اسم المريض',
      phoneNumber: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      address: 'العنوان',
      medicalHistory: 'التاريخ الطبي',
      allergies: 'الحساسية',
      medications: 'الأدوية',
      notes: 'الملاحظات',
      gender: 'الجنس',
      birthDate: 'تاريخ الميلاد',
      emergencyContact: 'جهة اتصال الطوارئ'
    }
    return labels[field] || field
  }

  const renderAdvancedFixOptions = () => (
    <div className="space-y-4 mt-4 p-4 rounded-xl" style={{ 
      backgroundColor: colors.surfaceLight,
      border: `1px solid ${colors.border}`
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconSettings className="w-5 h-5" style={{ color: colors.info }} />
          <h5 className="font-semibold text-sm" style={{ color: colors.text }}>
            خيارات متقدمة للتصحيح
          </h5>
        </div>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="text-xs px-3 py-1 rounded-lg flex items-center gap-1 hover:opacity-80"
          style={{ 
            backgroundColor: colors.info + '20',
            color: colors.info
          }}
        >
          {showAdvancedOptions ? 'إخفاء' : 'إظهار'}
          <IconArrowRight className={`w-3 h-3 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} />
        </button>
      </div>
      
      {showAdvancedOptions && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-all">
              <input
                type="checkbox"
                checked={advancedFixOptions.preserveNames}
                onChange={(e) => setAdvancedFixOptions({
                  ...advancedFixOptions,
                  preserveNames: e.target.checked
                })}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm mb-1 flex items-center gap-2" style={{ color: colors.text }}>
                  <IconLock className="w-4 h-4" />
                  الحفاظ على أسماء المرضى الحالية
                </div>
                <div className="text-xs" style={{ color: colors.textLight }}>
                  لن يتم تغيير أسماء المرضى الموجودة تحت أي ظرف
                </div>
              </div>
            </label>
            
            <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-all">
              <input
                type="checkbox"
                checked={advancedFixOptions.preservePhoneNumbers}
                onChange={(e) => setAdvancedFixOptions({
                  ...advancedFixOptions,
                  preservePhoneNumbers: e.target.checked
                })}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm mb-1 flex items-center gap-2" style={{ color: colors.text }}>
                  <IconLock className="w-4 h-4" />
                  الحفاظ على أرقام الهواتف الحالية
                </div>
                <div className="text-xs" style={{ color: colors.textLight }}>
                  لن يتم تغيير أرقام الهواتف الموجودة تحت أي ظرف
                </div>
              </div>
            </label>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <IconListCheck className="w-4 h-4" style={{ color: colors.info }} />
              <h6 className="font-semibold text-xs" style={{ color: colors.textLight }}>
                إستراتيجية تحديث الحقول
              </h6>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2">
              {Object.entries(advancedFixOptions.fieldLevelMapping).map(([field, strategy]) => (
                <div key={field} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <IconEdit className="w-3 h-3" style={{ color: colors.textLight }} />
                    <span className="text-sm" style={{ color: colors.text }}>
                      {getFieldLabel(field)}
                    </span>
                  </div>
                  <select
                    value={strategy}
                    onChange={(e) => setAdvancedFixOptions({
                      ...advancedFixOptions,
                      fieldLevelMapping: {
                        ...advancedFixOptions.fieldLevelMapping,
                        [field]: e.target.value
                      }
                    })}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                  >
                    <option value="keep_existing">الحفاظ على القيمة الحالية</option>
                    <option value="use_backup">استخدام قيمة النسخة الاحتياطية</option>
                    <option value="update_if_empty">التحديث إذا كانت فارغة</option>
                    <option value="merge">دمج القيم</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg text-xs" style={{ 
              backgroundColor: colors.info + '10',
              color: colors.textLight
            }}>
              <div className="font-semibold mb-1" style={{ color: colors.info }}>شرح الاستراتيجيات:</div>
              <div className="space-y-1">
                <div>• <span className="font-semibold">الحفاظ على القيمة الحالية:</span> لن تتغير القيمة الحالية أبداً</div>
                <div>• <span className="font-semibold">استخدام قيمة النسخة الاحتياطية:</span> ستستخدم القيمة القديمة من النسخة الاحتياطية</div>
                <div>• <span className="font-semibold">التحديث إذا كانت فارغة:</span> ستضيف القيمة القديمة فقط إذا كان الحقل فارغاً حالياً</div>
                <div>• <span className="font-semibold">دمج القيم:</span> ستدمج القيم القديمة والجديدة معاً</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderModeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <IconDatabase className="w-10 h-10" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center" style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }}>
            <IconSettings className="w-5 h-5" />
          </div>
        </div>
        <h4 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
          اختر طريقة الاستعادة
        </h4>
        <p className="text-sm max-w-md mx-auto" style={{ color: colors.textLight }}>
          اختر الطريقة المناسبة لاستعادة البيانات. كل طريقة لها استخدامها الخاص
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'replace',
            title: 'استبدال كامل',
            description: 'حذف جميع البيانات الحالية واستبدالها بالنسخة الاحتياطية',
            icon: <IconReplace className="w-6 h-6" />,
            color: colors.error,
            warning: 'سيتم حذف جميع البيانات الحالية',
            recommended: false,
            features: ['نظيف وسريع', 'مناسب عند فساد البيانات', 'ينشئ بيئة جديدة']
          },
          {
            id: 'merge',
            title: 'دمج البيانات',
            description: 'دمج البيانات القديمة مع البيانات الحالية بشكل ذكي',
            icon: <IconMerge className="w-6 h-6" />,
            color: colors.warning,
            warning: 'قد تحدث تكرار في البيانات',
            recommended: true,
            features: ['يحافظ على البيانات الحالية', 'يدمج المعلومات المفقودة', 'أفضل للترقيات']
          },
          {
            id: 'fix-only',
            title: 'تصحيح البيانات فقط',
            description: 'إصلاح الأخطاء والبيانات الناقصة فقط دون تغيير الأسماء والأرقام',
            icon: <IconRefresh className="w-6 h-6" />,
            color: colors.success,
            warning: 'لن يتم تغيير الأسماء والأرقام الحالية',
            recommended: true,
            features: ['آمن للبيانات الحالية', 'إصلاح الأخطاء فقط', 'الحفاظ على هوية المرضى']
          }
        ].map((mode) => (
          <div 
            key={mode.id}
            className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              restoreMode === mode.id ? 'ring-2 ring-offset-2 transform scale-[1.02]' : ''
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !loading && setRestoreMode(mode.id)}
            style={{ 
              border: `2px solid ${restoreMode === mode.id ? mode.color : colors.border}`,
              backgroundColor: restoreMode === mode.id ? `${mode.color}10` : colors.surfaceLight,
              boxShadow: restoreMode === mode.id ? `0 10px 30px ${mode.color}20` : 'none'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                  background: restoreMode === mode.id ? mode.color : colors.surface,
                  color: restoreMode === mode.id ? 'white' : colors.textLight
                }}>
                  {mode.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-base truncate" style={{ color: colors.text }}>
                    {mode.title}
                  </div>
                  {mode.recommended && (
                    <span className="text-xs px-2 py-1 rounded-full" style={{ 
                      backgroundColor: colors.success + '20',
                      color: colors.success
                    }}>
                      ⭐ موصى به
                    </span>
                  )}
                </div>
                <div className="text-sm mb-3" style={{ color: colors.textLight }}>
                  {mode.description}
                </div>
                
                <div className="space-y-2 mb-4">
                  {mode.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mode.color }} />
                      <span style={{ color: colors.text }}>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs px-3 py-1.5 rounded-lg text-center" style={{ 
                  backgroundColor: mode.color + '20',
                  color: mode.color,
                  border: `1px solid ${mode.color}30`
                }}>
                  ⚠️ {mode.warning}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {restoreMode === 'fix-only' && renderAdvancedFixOptions()}

      <div className="p-5 rounded-2xl" style={{ 
        backgroundColor: colors.surfaceLight,
        border: `1px solid ${colors.border}`,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <IconSettings className="w-5 h-5" style={{ color: colors.primary }} />
          <h5 className="font-semibold text-sm" style={{ color: colors.text }}>
            خيارات متقدمة
          </h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restoreMode === 'merge' && (
            <>
              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ 
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface
              }}>
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={options.preservePatients}
                    onChange={(e) => !loading && setOptions({ ...options, preservePatients: e.target.checked })}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    options.preservePatients ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {options.preservePatients && (
                      <IconCheckCircle className="w-3 h-3" style={{ color: colors.primary }} />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1 flex items-center gap-2" style={{ color: colors.text }}>
                    <IconUsers className="w-4 h-4" />
                    الحفاظ على المرضى الحاليين
                  </div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    لن يتم حذف أو تعديل المرضى الموجودين
                  </div>
                </div>
              </label>
              
              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ 
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface
              }}>
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={options.preserveAppointments}
                    onChange={(e) => !loading && setOptions({ ...options, preserveAppointments: e.target.checked })}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    options.preserveAppointments ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {options.preserveAppointments && (
                      <IconCheckCircle className="w-3 h-3" style={{ color: colors.primary }} />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1 flex items-center gap-2" style={{ color: colors.text }}>
                    <IconCalendar className="w-4 h-4" />
                    الحفاظ على المواعيد الحالية
                  </div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    لن يتم حذف أو تعديل المواعيد الموجودين
                  </div>
                </div>
              </label>
            </>
          )}
          
          <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ 
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface
          }}>
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={options.backupBeforeRestore}
                onChange={(e) => !loading && setOptions({ ...options, backupBeforeRestore: e.target.checked })}
                className="sr-only"
                disabled={loading}
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                options.backupBeforeRestore ? 'border-green-500' : 'border-gray-300'
              }`}>
                {options.backupBeforeRestore && (
                  <IconCheckCircle className="w-3 h-3" style={{ color: colors.success }} />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1 flex items-center gap-2" style={{ color: colors.text }}>
                <IconShieldCheck className="w-4 h-4" />
                إنشاء نسخة احتياطية قبل الاستعادة
              </div>
              <div className="text-xs" style={{ color: colors.textLight }}>
                حماية إضافية - يمكنك التراجع إذا حدث خطأ
              </div>
            </div>
          </label>
          
          {restoreMode !== 'fix-only' && (
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ 
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface
            }}>
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={options.fixDataOnly}
                  onChange={(e) => !loading && setOptions({ ...options, fixDataOnly: e.target.checked })}
                  className="sr-only"
                  disabled={loading}
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  options.fixDataOnly ? 'border-yellow-500' : 'border-gray-300'
                }`}>
                  {options.fixDataOnly && (
                    <IconCheckCircle className="w-3 h-3" style={{ color: colors.warning }} />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm mb-1 flex items-center gap-2" style={{ color: colors.text }}>
                  <IconRefresh className="w-4 h-4" />
                  تصحيح البيانات فقط
                </div>
                <div className="text-xs" style={{ color: colors.textLight }}>
                  إصلاح الأخطاء دون إضافة بيانات جديدة
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ 
        backgroundColor: colors.info + '10',
        border: `1px solid ${colors.info}30`
      }}>
        <div className="flex items-start gap-3">
          <IconInfoCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.info }} />
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: colors.info }}>
              معلومات النسخ الاحتياطي المحدد
            </div>
            <div className="text-sm" style={{ color: colors.textLight }}>
              <div className="grid grid-cols-2 gap-2">
                <div>النوع: <span className="font-semibold" style={{ color: colors.text }}>
                  {backup.type === 'full' ? 'كامل' : 
                   backup.type === 'patients' ? 'المرضى فقط' : 
                   backup.type === 'appointments' ? 'المواعيد فقط' : 'تلقائي'}
                </span></div>
                <div>الحجم: <span className="font-semibold" style={{ color: colors.text }}>
                  {backup.size ? formatBytes(backup.size) : 'غير متوفر'}
                </span></div>
                <div>التاريخ: <span className="font-semibold" style={{ color: colors.text }}>
                  {new Date(backup.createdAt).toLocaleDateString('ar-EG')}
                </span></div>
                <div>الحالة: <span className="font-semibold" style={{ color: colors.success }}>
                  {backup.status === 'success' ? 'ناجح' : 'معلق'}
                </span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            border: `1px solid ${colors.border}`,
            color: colors.textLight,
            backgroundColor: colors.surfaceLight
          }}
        >
          <IconArrowLeft className="w-4 h-4" />
          إلغاء
        </button>
        <button
          onClick={() => setStep('preview')}
          disabled={loading}
          className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            background: colors.gradientPrimary,
            color: '#FFFFFF',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
          }}
        >
          <IconEye className="w-4 h-4 group-hover:scale-110 transition-transform" />
          معاينة ثم متابعة
          <IconArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ml-0 group-hover:ml-2" />
        </button>
      </div>
    </div>
  )

  const renderPreview = () => {
    if (loading || internalLoading) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ 
            borderColor: `${colors.primary} transparent transparent transparent`
          }} />
          <div className="text-sm" style={{ color: colors.textLight }}>
            جاري تحميل معاينة النسخ الاحتياطي...
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4" style={{ color: colors.error }}>
            <IconAlertCircle className="w-16 h-16" />
          </div>
          <div className="text-lg font-bold mb-2" style={{ color: colors.error }}>
            حدث خطأ
          </div>
          <div className="text-sm mb-6" style={{ color: colors.textLight }}>
            {error}
          </div>
          <button
            onClick={() => {
              setError(null)
              setStep('mode')
            }}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            style={{ 
              border: `1px solid ${colors.border}`,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            العودة للخلف
          </button>
        </div>
      )
    }

    if (!preview) {
      return (
        <div className="text-center py-12">
          <div className="text-sm" style={{ color: colors.textLight }}>
            لا توجد بيانات للمعاينة
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'نوع النسخ',
              value: preview.backupInfo.type === 'full' ? 'كامل' : 
                     preview.backupInfo.type === 'patients' ? 'المرضى فقط' : 
                     preview.backupInfo.type === 'appointments' ? 'المواعيد فقط' : 'تلقائي',
              icon: <IconDatabase className="w-5 h-5" />,
              color: colors.primary
            },
            {
              title: 'تاريخ الإنشاء',
              value: new Date(preview.backupInfo.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              icon: <IconCalendar className="w-5 h-5" />,
              color: colors.warning
            },
            {
              title: 'عدد المرضى',
              value: preview.stats.totalPatients,
              icon: <IconUsers className="w-5 h-5" />,
              color: colors.success
            },
            {
              title: 'عدد المواعيد',
              value: preview.stats.totalAppointments,
              icon: <IconCalendar className="w-5 h-5" />,
              color: colors.info
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl" style={{ 
              backgroundColor: colors.surfaceLight,
              border: `1px solid ${colors.border}`
            }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                  backgroundColor: item.color + '20',
                  color: item.color
                }}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: colors.textLight }}>{item.title}</div>
                  <div className="font-bold text-lg" style={{ color: colors.text }}>{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: preview.stats.dataIntegrity === '✅ جيد' ? colors.success + '10' : colors.error + '10',
          border: `1px solid ${preview.stats.dataIntegrity === '✅ جيد' ? colors.success + '30' : colors.error + '30'}`
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preview.stats.dataIntegrity === '✅ جيد' ? (
                <IconCheckCircle className="w-5 h-5" style={{ color: colors.success }} />
              ) : (
                <IconAlertCircle className="w-5 h-5" style={{ color: colors.error }} />
              )}
              <div>
                <div className="font-semibold text-sm" style={{ color: colors.text }}>
                  حالة سلامة البيانات
                </div>
                <div className="text-sm" style={{ color: colors.textLight }}>
                  {preview.stats.dataIntegrity}
                </div>
              </div>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full" style={{ 
              backgroundColor: preview.stats.dataIntegrity === '✅ جيد' ? colors.success + '20' : colors.error + '20',
              color: preview.stats.dataIntegrity === '✅ جيد' ? colors.success : colors.error
            }}>
              {preview.stats.dataIntegrity === '✅ جيد' ? 'آمن للاستخدام' : 'يحتاج فحص'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {preview.sample.patients.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ 
              border: `1px solid ${colors.border}`
            }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center gap-2">
                  <IconUsers className="w-5 h-5" style={{ color: colors.success }} />
                  <div className="font-semibold text-sm" style={{ color: colors.text }}>
                    عينة من المرضى ({preview.sample.patients.length})
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded" style={{ 
                  backgroundColor: colors.success + '20',
                  color: colors.success
                }}>
                  تم اختيار عشوائي
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: colors.border }}>
                {preview.sample.patients.map((patient, idx) => (
                  <div key={idx} className="p-4 hover:scale-[1.01] transition-all" style={{ 
                    backgroundColor: colors.surface
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm truncate" style={{ color: colors.text }}>
                        {patient.patientName}
                      </div>
                      <div className="text-xs px-2 py-1 rounded" style={{ 
                        backgroundColor: colors.surfaceLight,
                        color: colors.textLight
                      }}>
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="text-xs flex items-center gap-4" style={{ color: colors.textLight }}>
                      <span>📞 {patient.phoneNumber}</span>
                      <span>👤 {patient.gender || 'غير محدد'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.sample.appointments.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ 
              border: `1px solid ${colors.border}`
            }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ 
                borderColor: colors.border,
                backgroundColor: colors.surfaceLight
              }}>
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-5 h-5" style={{ color: colors.warning }} />
                  <div className="font-semibold text-sm" style={{ color: colors.text }}>
                    عينة من المواعيد ({preview.sample.appointments.length})
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded" style={{ 
                  backgroundColor: colors.warning + '20',
                  color: colors.warning
                }}>
                  تم اختيار عشوائي
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: colors.border }}>
                {preview.sample.appointments.map((appointment, idx) => (
                  <div key={idx} className="p-4 hover:scale-[1.01] transition-all" style={{ 
                    backgroundColor: colors.surface
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm truncate" style={{ color: colors.text }}>
                        {appointment.patientName}
                      </div>
                      <div className="text-xs px-2 py-1 rounded" style={{ 
                        backgroundColor: colors.surfaceLight,
                        color: colors.textLight
                      }}>
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="text-xs flex items-center justify-between" style={{ color: colors.textLight }}>
                      <span>📅 {new Date(appointment.appointmentDate).toLocaleDateString('ar-EG')}</span>
                      <span>🕐 {appointment.appointmentTime}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        appointment.status === 'مكتمل' ? 'bg-green-500/20 text-green-500' :
                        appointment.status === 'ملغي' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {restoreMode === 'fix-only' && renderAdvancedFixOptions()}

        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: colors.surfaceLight,
          border: `1px solid ${colors.border}`
        }}>
          <div className="flex items-center gap-2 mb-3">
            <IconSettings className="w-5 h-5" style={{ color: colors.primary }} />
            <div className="font-semibold text-sm" style={{ color: colors.text }}>
              ملخص الخيارات المحددة
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>طريقة الاستعادة</div>
              <div className="font-medium text-sm" style={{ color: colors.text }}>
                {restoreMode === 'replace' ? 'استبدال كامل' :
                 restoreMode === 'merge' ? 'دمج البيانات' : 'تصحيح فقط'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: colors.textLight }}>نسخة احتياطية</div>
              <div className="font-medium text-sm" style={{ color: colors.text }}>
                {options.backupBeforeRestore ? '✅ مفعل' : '❌ غير مفعل'}
              </div>
            </div>
            {restoreMode === 'fix-only' && (
              <>
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: colors.textLight }}>حفظ الأسماء</div>
                  <div className="font-medium text-sm" style={{ color: colors.text }}>
                    {advancedFixOptions.preserveNames ? '✅ مفعل' : '❌ غير مفعل'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: colors.textLight }}>حفظ الهواتف</div>
                  <div className="font-medium text-sm" style={{ color: colors.text }}>
                    {advancedFixOptions.preservePhoneNumbers ? '✅ مفعل' : '❌ غير مفعل'}
                  </div>
                </div>
              </>
            )}
            {restoreMode === 'merge' && (
              <>
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: colors.textLight }}>حفظ المرضى</div>
                  <div className="font-medium text-sm" style={{ color: colors.text }}>
                    {options.preservePatients ? '✅ مفعل' : '❌ غير مفعل'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: colors.textLight }}>حفظ المواعيد</div>
                  <div className="font-medium text-sm" style={{ color: colors.text }}>
                    {options.preserveAppointments ? '✅ مفعل' : '❌ غير مفعل'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStep('mode')}
            disabled={loading}
            className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              border: `1px solid ${colors.border}`,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            <IconArrowLeft className="w-4 h-4" />
            رجوع
          </button>
          <button
            onClick={() => {
              if (restoreMode === 'fix-only') {
                handleRestore()
              } else {
                setStep('warning')
              }
            }}
            disabled={loading}
            className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: restoreMode === 'fix-only' ? colors.gradientSuccess : colors.gradientWarning,
              color: '#FFFFFF',
              boxShadow: restoreMode === 'fix-only' ? 
                '0 6px 20px rgba(16, 185, 129, 0.3)' : 
                '0 6px 20px rgba(245, 158, 11, 0.3)'
            }}
          >
            {restoreMode === 'fix-only' ? (
              <>
                <IconRefresh className="w-4 h-4 group-hover:animate-spin" />
                تصحيح البيانات الآن
                <IconArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ml-0 group-hover:ml-2" />
              </>
            ) : (
              <>
                <IconAlertTriangle className="w-4 h-4 group-hover:animate-pulse" />
                متابعة مع التحذير
                <IconArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ml-0 group-hover:ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  const renderWarning = () => (
    <div className="space-y-6">
      <div className="text-center p-6 rounded-2xl" style={{ 
        backgroundColor: colors.error + '10',
        border: `2px solid ${colors.error}30`,
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)'
      }}>
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ 
            background: colors.gradientError,
            color: '#FFFFFF'
          }}>
            <IconAlertTriangle className="w-10 h-10" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center animate-ping" style={{ 
            background: colors.error,
            opacity: 0.2
          }} />
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center" style={{ 
            background: colors.error,
            color: 'white'
          }}>
            !
          </div>
        </div>
        <h4 className="text-xl font-bold mb-3" style={{ color: colors.error }}>تحذير هام!</h4>
        <div className="space-y-3">
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            {restoreMode === 'replace' ? (
              <>
                عملية <span className="font-bold" style={{ color: colors.error }}>الاستبدال الكامل</span> ستحذف <span className="font-bold" style={{ color: colors.error }}>جميع البيانات الحالية</span> وتستبدلها بالبيانات القديمة.
              </>
            ) : restoreMode === 'merge' ? (
              <>
                عملية <span className="font-bold" style={{ color: colors.warning }}>دمج البيانات</span> ستضيف البيانات الجديدة وقد تحدث تكرار في السجلات.
              </>
            ) : (
              <>
                عملية <span className="font-bold" style={{ color: colors.success }}>التصحيح</span> ستقوم بإصلاح الأخطاء فقط ولن تضيف بيانات جديدة.
              </>
            )}
          </p>
          <div className="p-3 rounded-lg" style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}>
            <div className="font-bold text-sm text-center" style={{ color: colors.error }}>
              ⚠️ هذا الإجراء لا يمكن التراجع عنه بعد التنفيذ!
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl" style={{ 
        backgroundColor: colors.surfaceLight,
        border: `1px solid ${colors.border}`
      }}>
        <h5 className="font-semibold text-sm mb-4" style={{ color: colors.text }}>
          تفاصيل التأثير المتوقع:
        </h5>
        
        <div className="space-y-4">
          {restoreMode === 'replace' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ 
                backgroundColor: colors.error + '10',
                border: `1px solid ${colors.error}30`
              }}>
                <IconTrash className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.error }} />
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: colors.error }}>سيتم حذف جميع البيانات الحالية</div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    جميع المرضى والمواعيد والإعدادات الحالية ستختفي بالكامل
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ 
                backgroundColor: colors.warning + '10',
                border: `1px solid ${colors.warning}30`
              }}>
                <IconDatabase className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.warning }} />
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: colors.warning }}>سيتم استبدال قاعدة البيانات بالكامل</div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    النظام سيعود إلى الحالة التي كانت عليها عند إنشاء النسخة الاحتياطية
                  </div>
                </div>
              </div>
            </div>
          ) : restoreMode === 'merge' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ 
                backgroundColor: colors.warning + '10',
                border: `1px solid ${colors.warning}30`
              }}>
                <IconMerge className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.warning }} />
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: colors.warning }}>قد تحدث تكرار في البيانات</div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    بعض السجلات قد تظهر مرتين إذا كانت موجودة في النسختين
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ 
                backgroundColor: colors.info + '10',
                border: `1px solid ${colors.info}30`
              }}>
                <IconUsers className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.info }} />
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: colors.info }}>
                    {options.preservePatients ? 'سيتم الحفاظ على المرضى الحاليين' : 'قد يتم تعديل المرضى الحاليين'}
                  </div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    {options.preservePatients ? 
                      'لن يتم حذف أي مريض موجود' : 
                      'قد يتم تحديث بيانات المرضى الموجودين'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ 
                backgroundColor: colors.success + '10',
                border: `1px solid ${colors.success}30`
              }}>
                <IconRefresh className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.success }} />
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: colors.success }}>سيتم إصلاح الأخطاء فقط</div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    لن يتم تغيير أسماء المرضى أو أرقام الهواتف الحالية
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ 
                backgroundColor: colors.info + '10',
                border: `1px solid ${colors.info}30`
              }}>
                <IconLock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.info }} />
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: colors.info }}>آمن على البيانات الحالية</div>
                  <div className="text-xs" style={{ color: colors.textLight }}>
                    الأسماء والأرقام الحالية محمية تماماً من التغيير
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 rounded-xl" style={{ 
          backgroundColor: colors.info + '10',
          border: `1px solid ${colors.info}30`
        }}>
          <div className="flex items-start gap-3">
            <IconInfoCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.info }} />
            <div className="text-sm" style={{ color: colors.textLight }}>
              <span className="font-semibold" style={{ color: colors.info }}>نصيحة:</span> يوصى بشدة بإنشاء نسخة احتياطية من البيانات الحالية قبل المتابعة، خاصة إذا كنت تستخدم وضع الاستبدال الكامل.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer hover:scale-[1.01] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ 
          border: `2px solid ${confirmed ? colors.success : colors.border}`,
          backgroundColor: confirmed ? colors.success + '10' : colors.surfaceLight
        }}>
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => !loading && setConfirmed(e.target.checked)}
              className="sr-only"
              disabled={loading}
            />
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
              confirmed ? 'border-green-500' : 'border-gray-300'
            }`}>
              {confirmed && <IconCheckCircle className="w-4 h-4" style={{ color: colors.success }} />}
            </div>
          </div>
          <div>
            <div className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: colors.text }}>
              <IconAlertTriangle className="w-4 h-4" style={{ color: colors.error }} />
              أتفهم وأوافق على المخاطر
            </div>
            <div className="text-sm space-y-2" style={{ color: colors.textLight }}>
              <p>✓ أتفهم أن هذه العملية قد تؤدي إلى فقدان البيانات</p>
              <p>✓ أوافق على أن هذا الإجراء لا يمكن التراجع عنه</p>
              <p>✓ قمت بإنشاء نسخة احتياطية من البيانات الحالية (موصى به بشدة)</p>
            </div>
          </div>
        </label>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setStep('preview')
              setConfirmed(false)
            }}
            disabled={loading}
            className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              border: `1px solid ${colors.border}`,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            <IconArrowLeft className="w-4 h-4" />
            رجوع
          </button>
          <button
            onClick={handleRestore}
            disabled={!confirmed || loading}
            className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            style={{ 
              background: colors.gradientError,
              color: '#FFFFFF',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)'
            }}
          >
            <IconDatabase className="w-4 h-4 group-hover:animate-pulse" />
            تأكيد والاستعادة
            <IconArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ml-0 group-hover:ml-2" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderRestoring = () => (
    <div className="space-y-8 text-center">
      <div className="relative mx-auto w-32 h-32">
        <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ 
          borderColor: `${colors.primary} transparent transparent transparent`
        }} />
        <div className="absolute inset-8 border-4 border-b-transparent rounded-full animate-spin-reverse" style={{ 
          borderColor: `transparent transparent ${colors.success} transparent`
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse" style={{ 
            background: colors.gradientPrimary,
            color: 'white'
          }}>
            <IconLoader className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>

      <div>
        <div className="text-xl font-bold mb-2" style={{ color: colors.text }}>
          {restoreMode === 'fix-only' ? 'جاري تصحيح البيانات' : 'جاري استعادة النسخ الاحتياطي'}
        </div>
        <p className="text-sm max-w-md mx-auto mb-6" style={{ color: colors.textLight }}>
          {restoreProgress.message}
          <br />
          يرجى الانتظار، هذه العملية قد تستغرق بضع دقائق حسب حجم البيانات.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: colors.textLight }}>التقدم</span>
          <span style={{ color: colors.text }}>{Math.round(restoreProgress.current)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${restoreProgress.current}%`,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
            }}
          />
        </div>
        
        <div className="grid grid-cols-5 gap-2 mt-6">
          {['preparing', 'validating', 'backingup', 'restoring', 'complete'].map((stage, idx) => (
            <div key={stage} className="text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                restoreProgress.stage === stage ? 'scale-110' : ''
              }`} style={{ 
                backgroundColor: restoreProgress.stage === stage ? colors.primary : colors.surfaceLight,
                color: restoreProgress.stage === stage ? 'white' : colors.textLight,
                border: `2px solid ${restoreProgress.stage === stage ? colors.primary : colors.border}`
              }}>
                {idx + 1}
              </div>
              <div className="text-xs" style={{ 
                color: restoreProgress.stage === stage ? colors.primary : colors.textLight 
              }}>
                {getProgressMessage(stage).replace('جارٍ ', '').replace('...', '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl max-w-lg mx-auto" style={{ 
        backgroundColor: colors.warning + '10',
        border: `1px solid ${colors.warning}30`
      }}>
        <div className="flex items-center gap-3">
          <IconAlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: colors.warning }} />
          <div className="text-sm text-right" style={{ color: colors.textLight }}>
            <span className="font-semibold" style={{ color: colors.warning }}>مهم:</span> لا تغلق هذه النافذة أو تقم بإعادة تحميل الصفحة أثناء العملية.
          </div>
        </div>
      </div>
    </div>
  )

  const renderComplete = () => (
    <div className="space-y-8 text-center">
      <div className="relative inline-block">
        <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <IconCheckCircle className="w-12 h-12" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center animate-ping" style={{ 
          background: colors.success,
          opacity: 0.2
        }} />
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center" style={{ 
          background: colors.success,
          color: 'white'
        }}>
          ✓
        </div>
      </div>

      <div>
        <h4 className="text-2xl font-bold mb-3" style={{ color: colors.success }}>
          ✅ {restoreMode === 'fix-only' ? 'اكتمل التصحيح بنجاح' : 'اكتملت الاستعادة بنجاح'}
        </h4>
        <p className="text-sm max-w-md mx-auto mb-6" style={{ color: colors.textLight }}>
          {restoreMode === 'fix-only' 
            ? 'تم إصلاح جميع الأخطاء والبيانات الناقصة بنجاح.' 
            : 'تم استعادة جميع البيانات بنجاح. النظام جاهز للاستخدام.'}
        </p>
      </div>

      {restoreResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {restoreMode === 'fix-only' ? (
            <>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>المرضى المصححين</div>
                <div className="text-xl font-bold" style={{ color: colors.success }}>{restoreResult.result?.patients?.fixed || 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>المواعيد المصححة</div>
                <div className="text-xl font-bold" style={{ color: colors.success }}>{restoreResult.result?.appointments?.fixed || 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>تم تخطيهم</div>
                <div className="text-xl font-bold" style={{ color: colors.warning }}>{restoreResult.result?.patients?.skipped || 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>الإجمالي</div>
                <div className="text-xl font-bold" style={{ color: colors.primary }}>{restoreResult.summary?.totalProcessed || 0}</div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>المرضى المضافين</div>
                <div className="text-xl font-bold" style={{ color: colors.success }}>{restoreResult.result?.patients?.created || 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>المرضى المحدثين</div>
                <div className="text-xl font-bold" style={{ color: colors.warning }}>{restoreResult.result?.patients?.updated || 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>المواعيد المضافين</div>
                <div className="text-xl font-bold" style={{ color: colors.success }}>{restoreResult.result?.appointments?.created || 0}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ 
                backgroundColor: colors.surfaceLight,
                border: `1px solid ${colors.border}`
              }}>
                <div className="text-xs mb-1" style={{ color: colors.textLight }}>المواعيد المحدثين</div>
                <div className="text-xl font-bold" style={{ color: colors.warning }}>{restoreResult.result?.appointments?.updated || 0}</div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-4 max-w-md mx-auto">
        <div className="p-4 rounded-xl" style={{ 
          backgroundColor: colors.info + '10',
          border: `1px solid ${colors.info}30`
        }}>
          <div className="flex items-center gap-3">
            <IconInfoCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.info }} />
            <div className="text-sm text-right" style={{ color: colors.textLight }}>
              {restoreMode === 'fix-only' 
                ? 'تم إصلاح الأخطاء والبيانات الناقصة مع الحفاظ على البيانات الحالية.'
                : 'نوصي بفحص البيانات والتأكد من صحتها قبل استخدام النظام.'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              border: `1px solid ${colors.border}`,
              color: colors.textLight,
              backgroundColor: colors.surfaceLight
            }}
          >
            <IconEye className="w-4 h-4" />
            عرض البيانات
          </button>
          <button
            onClick={() => {
              if (onRestore) onRestore()
              onClose()
            }}
            disabled={loading}
            className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: colors.gradientSuccess,
              color: '#FFFFFF',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
            }}
          >
            <IconCheckCircle className="w-4 h-4" />
            تم، العودة للقائمة
            <IconArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ml-0 group-hover:ml-2" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (step) {
      case 'mode':
        return renderModeSelection()
      case 'preview':
        return renderPreview()
      case 'warning':
        return renderWarning()
      case 'restoring':
        return renderRestoring()
      case 'complete':
        return renderComplete()
      default:
        return renderModeSelection()
    }
  }

  const getStepTitle = () => {
    const titles = {
      mode: 'اختر طريقة الاستعادة',
      preview: 'معاينة النسخ الاحتياطي',
      warning: 'تأكيد الاستعادة',
      restoring: restoreMode === 'fix-only' ? 'جاري تصحيح البيانات' : 'جاري الاستعادة',
      complete: restoreMode === 'fix-only' ? 'اكتمل التصحيح' : 'اكتملت الاستعادة'
    }
    return titles[step] || 'استعادة النسخ الاحتياطي'
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto my-8 animate-slide-up">
        <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: '1px'
        }}>
          <div className="p-6 border-b flex-shrink-0" style={{ 
            borderColor: colors.border,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                  background: colors.gradientPrimary,
                  color: 'white'
                }}>
                  <IconDatabase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                    {getStepTitle()}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                    {step === 'mode' && 'اختر الطريقة المناسبة لاستعادة البيانات'}
                    {step === 'preview' && 'استعرض محتويات النسخ الاحتياطي قبل الاستعادة'}
                    {step === 'warning' && 'تأكد من فهمك لعواقب الاستعادة'}
                    {step === 'restoring' && restoreMode === 'fix-only' ? 'جارٍ إصلاح البيانات، يرجى الانتظار' : 'جارٍ استعادة البيانات، يرجى الانتظار'}
                    {step === 'complete' && restoreMode === 'fix-only' ? 'تم إصلاح البيانات بنجاح' : 'تمت الاستعادة بنجاح'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading || step === 'restoring'}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: colors.surfaceLight,
                  color: colors.textLight
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              {['mode', 'preview', 'warning', 'restoring', 'complete'].map((s, idx) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s ? 'scale-110' : ''
                  }`} style={{ 
                    backgroundColor: step === s ? colors.primary : 
                                    ['restoring', 'complete'].includes(step) && idx <= ['mode', 'preview', 'warning', 'restoring', 'complete'].indexOf(step) ? 
                                    colors.success + '20' : colors.surfaceLight,
                    color: step === s ? 'white' : 
                          ['restoring', 'complete'].includes(step) && idx <= ['mode', 'preview', 'warning', 'restoring', 'complete'].indexOf(step) ? 
                          colors.success : colors.textLight,
                    border: `2px solid ${
                      step === s ? colors.primary : 
                      ['restoring', 'complete'].includes(step) && idx <= ['mode', 'preview', 'warning', 'restoring', 'complete'].indexOf(step) ? 
                      colors.success : colors.border
                    }`
                  }}>
                    {idx + 1}
                  </div>
                  {idx < 4 && (
                    <div className="w-8 h-0.5" style={{ 
                      backgroundColor: ['restoring', 'complete'].includes(step) && idx < ['mode', 'preview', 'warning', 'restoring', 'complete'].indexOf(step) ? 
                      colors.success : colors.border
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 1s linear infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.textLight};
        }
      `}</style>
    </div>
  )
}
import { API_BASE_URL, ADMIN_API_KEY } from './constants'
import toast from 'react-hot-toast'

let lastRequestTime = 0
const REQUEST_DELAY = 1000

const ARABIC_ERROR_MESSAGES = {
  NETWORK_ERROR: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
  TIMEOUT_ERROR: 'انتهت مهلة الطلب. الخادم مشغول حاليًا، يرجى المحاولة مرة أخرى لاحقًا.',
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات. يرجى التحقق من المعلومات المدخلة.',
  NOT_FOUND: 'البيانات المطلوبة غير موجودة.',
  SERVER_ERROR: 'خطأ في الخادم الداخلي. يرجى المحاولة مرة أخرى لاحقًا.',
  UNAUTHORIZED: 'غير مصرح لك بالوصول إلى هذه البيانات.',
  FORBIDDEN: 'ليس لديك الصلاحية للقيام بهذا الإجراء.',
  DUPLICATE_ENTRY: 'هذه البيانات موجودة مسبقًا في النظام.',
  APPOINTMENT_CONFLICT: 'هناك تعارض في المواعيد. يرجى اختيار وقت آخر.',
  PATIENT_HAS_APPOINTMENTS: 'لا يمكن حذف المريض لأنه لديه مواعيد مرتبطة.',
  INVALID_DATE: 'تاريخ غير صالح. يرجى التحقق من التاريخ المدخل.',
  REQUIRED_FIELD: 'هذا الحقل مطلوب.',
  INVALID_PHONE: 'رقم الهاتف غير صالح.',
  INVALID_EMAIL: 'البريد الإلكتروني غير صالح.',
  DATA_TOO_LARGE: 'حجم البيانات كبير جدًا.',
  RATE_LIMIT: 'لقد تجاوزت عدد المحاولات المسموح بها. يرجى الانتظار قليلاً.',
  OPERATION_FAILED: 'فشلت العملية. يرجى المحاولة مرة أخرى.',
  UPLOAD_FAILED: 'فشل تحميل الملف.',
  DOWNLOAD_FAILED: 'فشل تنزيل الملف.',
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة.',
  SESSION_EXPIRED: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.',
  MAINTENANCE_MODE: 'النظام قيد الصيانة حاليًا.',
  PAYMENT_REQUIRED: 'الدفع مطلوب لإكمال العملية.',
  INSUFFICIENT_PERMISSIONS: 'ليس لديك الصلاحيات الكافية.',
  DATABASE_ERROR: 'خطأ في قاعدة البيانات.',
  CONNECTION_TIMEOUT: 'انتهت مهلة الاتصال.',
  TOO_MANY_REQUESTS: 'طلبات كثيرة جدًا. يرجى المحاولة لاحقًا.',
  UNSUPPORTED_MEDIA_TYPE: 'نوع الملف غير مدعوم.',
  METHOD_NOT_ALLOWED: 'طريقة الطلب غير مسموحة.',
  BAD_GATEWAY: 'خطأ في البوابة.',
  SERVICE_UNAVAILABLE: 'الخدمة غير متوفرة حاليًا.',
  GATEWAY_TIMEOUT: 'انتهت مهلة البوابة.',
  VERSION_MISMATCH: 'عدم تطابق في الإصدارات.',
  INVALID_TOKEN: 'رمز غير صالح.',
  TOKEN_EXPIRED: 'انتهت صلاحية الرمز.',
  ACCOUNT_LOCKED: 'الحساب مغلق مؤقتًا.',
  ACCOUNT_DISABLED: 'الحساب معطل.',
  EMAIL_NOT_VERIFIED: 'البريد الإلكتروني غير مفعل.',
  PHONE_NOT_VERIFIED: 'رقم الهاتف غير مفعل.',
  INVALID_VERIFICATION_CODE: 'رمز التحقق غير صالح.',
  VERIFICATION_CODE_EXPIRED: 'انتهت صلاحية رمز التحقق.',
  PASSWORD_TOO_WEAK: 'كلمة المرور ضعيفة جدًا.',
  PASSWORD_MISMATCH: 'كلمات المرور غير متطابقة.',
  INVALID_PASSWORD: 'كلمة المرور غير صحيحة.',
  PASSWORD_RESET_REQUIRED: 'مطلوب إعادة تعيين كلمة المرور.',
  ACCOUNT_ALREADY_EXISTS: 'الحساب موجود مسبقًا.',
  ACCOUNT_NOT_FOUND: 'الحساب غير موجود.',
  PROFILE_INCOMPLETE: 'الملف الشخصي غير مكتمل.',
  AGE_RESTRICTION: 'القيد العمري لا يسمح بهذه العملية.',
  CONTENT_NOT_AVAILABLE: 'المحتوى غير متاح.',
  FILE_TOO_LARGE: 'حجم الملف كبير جدًا.',
  UNSUPPORTED_FILE_FORMAT: 'تنسيق الملف غير مدعوم.',
  UPLOAD_QUOTA_EXCEEDED: 'تم تجاوز حصة التحميل.',
  STORAGE_LIMIT_EXCEEDED: 'تم تجاوز حد التخزين.',
  BANDWIDTH_LIMIT_EXCEEDED: 'تم تجاوز حد عرض النطاق الترددي.',
  REQUEST_TOO_LARGE: 'حجم الطلب كبير جدًا.',
  REQUEST_TOO_SMALL: 'حجم الطلب صغير جدًا.',
  MISSING_PARAMETERS: 'معايير مفقودة.',
  INVALID_PARAMETERS: 'معايير غير صالحة.',
  CONFLICTING_DATA: 'بيانات متضاربة.',
  DEPRECATED_API: 'واجهة برمجة التطبيقات هذه قديمة.',
  UPGRADE_REQUIRED: 'مطلوب ترقية.',
  LEGACY_API: 'واجهة برمجة التطبيقات هذه قديمة وغير مدعومة.',
  CORS_ERROR: 'خطأ في سياسة الولوج عبر النطاقات.',
  SSL_ERROR: 'خطأ في شهادة SSL.',
  DNS_ERROR: 'خطأ في DNS.',
  HOST_UNREACHABLE: 'الخادم غير قابل للوصول.',
  CONNECTION_REFUSED: 'تم رفض الاتصال.',
  NETWORK_CHANGED: 'تم تغيير الشبكة.',
  OFFLINE_MODE: 'أنت في وضع عدم الاتصال.',
  SYNC_FAILED: 'فشل المزامنة.',
  BACKUP_FAILED: 'فشل النسخ الاحتياطي.',
  RESTORE_FAILED: 'فشل الاستعادة.',
  EXPORT_FAILED: 'فشل التصدير.',
  IMPORT_FAILED: 'فشل الاستيراد.',
  MIGRATION_FAILED: 'فشل الترحيل.',
  UPDATE_FAILED: 'فشل التحديث.',
  INSTALL_FAILED: 'فشل التثبيت.',
  UNINSTALL_FAILED: 'فشل إلغاء التثبيت.',
  CONFIGURATION_ERROR: 'خطأ في الإعدادات.',
  ENVIRONMENT_ERROR: 'خطأ في البيئة.',
  DEPENDENCY_ERROR: 'خطأ في التبعيات.',
  LICENSE_ERROR: 'خطأ في الترخيص.',
  AUTHENTICATION_FAILED: 'فشل المصادقة.',
  AUTHORIZATION_FAILED: 'فشل التفويض.',
  SESSION_INVALID: 'الجلسة غير صالحة.',
  CSRF_TOKEN_INVALID: 'رمز CSRF غير صالح.',
  CAPTCHA_INVALID: 'رمز التحقق غير صالح.',
  TWO_FACTOR_FAILED: 'فشل المصادقة الثنائية.',
  BIOMETRIC_FAILED: 'فشل البصمة.',
  DEVICE_NOT_TRUSTED: 'الجهاز غير موثوق.',
  LOCATION_NOT_ALLOWED: 'الموقع غير مسموح.',
  TIMEZONE_MISMATCH: 'عدم تطابق في المنطقة الزمنية.',
  LANGUAGE_NOT_SUPPORTED: 'اللغة غير مدعومة.',
  CURRENCY_NOT_SUPPORTED: 'العملة غير مدعومة.',
  COUNTRY_NOT_SUPPORTED: 'الدولة غير مدعومة.',
  REGION_BLOCKED: 'المنطقة محظورة.',
  IP_BLOCKED: 'عنوان IP محظور.',
  VPN_DETECTED: 'تم اكتشاف VPN.',
  PROXY_DETECTED: 'تم اكتشاف بروكسي.',
  BOT_DETECTED: 'تم اكتشاف بوت.',
  SUSPICIOUS_ACTIVITY: 'نشاط مريب.',
  FRAUD_DETECTED: 'تم اكتشاف احتيال.',
  MALWARE_DETECTED: 'تم اكتشاف برمجية خبيثة.',
  VIRUS_DETECTED: 'تم اكتشاف فيروس.',
  SPAM_DETECTED: 'تم اكتشاف بريد عشوائي.',
  PHISHING_DETECTED: 'تم اكتشاف تصيد.',
  HACKING_ATTEMPT: 'محاولة اختراق.',
  BRUTE_FORCE_ATTEMPT: 'محاولة هجوم بالقوة الغاشمة.',
  DDOS_ATTEMPT: 'محاولة هجوم حجب الخدمة.',
  EXPLOIT_ATTEMPT: 'محاولة استغلال.',
  INJECTION_ATTEMPT: 'محاولة حقن.',
  XSS_ATTEMPT: 'محاولة هجوم XSS.',
  SQL_INJECTION_ATTEMPT: 'محاولة حقن SQL.',
  REMOTE_CODE_EXECUTION_ATTEMPT: 'محاولة تنفيذ كود عن بعد.',
  FILE_INCLUSION_ATTEMPT: 'محاولة تضمين ملف.',
  DIRECTORY_TRAVERSAL_ATTEMPT: 'محاولة تجاوز الدليل.',
  COMMAND_INJECTION_ATTEMPT: 'محاولة حقن أوامر.',
  BUFFER_OVERFLOW_ATTEMPT: 'محاولة تجاوز المخزن المؤقت.',
  FORMAT_STRING_ATTEMPT: 'محاولة تنسيق سلسلة.',
  INTEGER_OVERFLOW_ATTEMPT: 'محاولة تجاوز عدد صحيح.',
  ARITHMETIC_OVERFLOW_ATTEMPT: 'محاولة تجاوز حسابي.',
  NULL_POINTER_ATTEMPT: 'محاولة مؤشر فارغ.',
  USE_AFTER_FREE_ATTEMPT: 'محاولة استخدام بعد التحرير.',
  DOUBLE_FREE_ATTEMPT: 'محاولة تحرير مزدوج.',
  MEMORY_LEAK_ATTEMPT: 'محاولة تسرب ذاكرة.',
  RESOURCE_LEAK_ATTEMPT: 'محاولة تسرب موارد.',
  THREAD_LEAK_ATTEMPT: 'محاولة تسرب خيوط.',
  HANDLE_LEAK_ATTEMPT: 'محاولة تسرب مقابض.',
  SOCKET_LEAK_ATTEMPT: 'محاولة تسرب مقابس.',
  FILE_LEAK_ATTEMPT: 'محاولة تسرب ملفات.',
  PROCESS_LEAK_ATTEMPT: 'محاولة تسرب عمليات.',
  DESCRIPTOR_LEAK_ATTEMPT: 'محاولة تسرب واصفات.',
  TIMER_LEAK_ATTEMPT: 'محاولة تسرب مؤقتات.',
  SIGNAL_LEAK_ATTEMPT: 'محاولة تسرب إشارات.',
  LOCK_LEAK_ATTEMPT: 'محاولة تسرب أقفال.',
  SEMAPHORE_LEAK_ATTEMPT: 'محاولة تسرب إشارات مرور.',
  MUTEX_LEAK_ATTEMPT: 'محاولة تسرب متغيرات متبادلة.',
  CONDITION_VARIABLE_LEAK_ATTEMPT: 'محاولة تسرب متغيرات شرطية.',
  BARRIER_LEAK_ATTEMPT: 'محاولة تسرب حواجز.',
  ONCE_FLAG_LEAK_ATTEMPT: 'محاولة تسرب أعلام مرة واحدة.',
  THREAD_LOCAL_LEAK_ATTEMPT: 'محاولة تسرب محلي للخيط.',
  ATOMIC_LEAK_ATTEMPT: 'محاولة تسرب ذري.',
  MEMORY_ORDER_LEAK_ATTEMPT: 'محاولة تسرب ترتيب الذاكرة.',
  FENCE_LEAK_ATTEMPT: 'محاولة تسرب أسوار.',
  VOLATILE_LEAK_ATTEMPT: 'محاولة تسرب متقلب.',
  REGISTER_LEAK_ATTEMPT: 'محاولة تسرب سجلات.',
  CACHE_LEAK_ATTEMPT: 'محاولة تسرب ذاكرة تخزين مؤقت.',
  TLB_LEAK_ATTEMPT: 'محاولة تسرب جدول الترجمة.',
  PAGE_LEAK_ATTEMPT: 'محاولة تسرب صفحات.',
  SEGMENT_LEAK_ATTEMPT: 'محاولة تسرب مقاطع.',
  DESCRIPTOR_TABLE_LEAK_ATTEMPT: 'محاولة تسرب جدول الواصفات.',
  INTERRUPT_LEAK_ATTEMPT: 'محاولة تسرب مقاطعات.',
  EXCEPTION_LEAK_ATTEMPT: 'محاولة تسرب استثناءات.',
  TRAP_LEAK_ATTEMPT: 'محاولة تسرب فخاخ.',
  FAULT_LEAK_ATTEMPT: 'محاولة تسرب أخطاء.',
  ABORT_LEAK_ATTEMPT: 'محاولة تسرب إجهاض.',
  TERMINATE_LEAK_ATTEMPT: 'محاولة تسرب إنهاء.',
  UNWIND_LEAK_ATTEMPT: 'محاولة تسرب فك.',
  CATCH_LEAK_ATTEMPT: 'محاولة تسرب التقاط.',
  FINALLY_LEAK_ATTEMPT: 'محاولة تسرب أخيرًا.',
  THROW_LEAK_ATTEMPT: 'محاولة تسرب رمي.',
  RETHROW_LEAK_ATTEMPT: 'محاولة تسرب إعادة رمي.',
  NESTED_EXCEPTION_LEAK_ATTEMPT: 'محاولة تسرب استثناءات متداخلة.',
  EXCEPTION_PTR_LEAK_ATTEMPT: 'محاولة تسرب مؤشرات استثناء.',
  CURRENT_EXCEPTION_LEAK_ATTEMPT: 'محاولة تسرب الاستثناء الحالي.',
  UNCAUGHT_EXCEPTION_LEAK_ATTEMPT: 'محاولة تسرب استثناء غير ممسوك.',
  UNCAUGHT_EXCEPTIONS_LEAK_ATTEMPT: 'محاولة تسرب استثناءات غير ممسوكة.',
  EXCEPTION_SAFE_LEAK_ATTEMPT: 'محاولة تسرب آمن للاستثناء.',
  EXCEPTION_NEUTRAL_LEAK_ATTEMPT: 'محاولة تسرب محايد للاستثناء.',
  EXCEPTION_TRANSPARENT_LEAK_ATTEMPT: 'محاولة تسرب شفاف للاستثناء.',
  NOEXCEPT_LEAK_ATTEMPT: 'محاولة تسرب لا استثناء.',
  NOEXCEPT_SPECIFIER_LEAK_ATTEMPT: 'محاولة تسرب محدد لا استثناء.',
  NOEXCEPT_OPERATOR_LEAK_ATTEMPT: 'محاولة تسرب عامل لا استثناء.',
  DYNAMIC_EXCEPTION_SPECIFICATION_LEAK_ATTEMPT: 'محاولة تسرب مواصفات استثناء ديناميكية.',
  TYPEID_LEAK_ATTEMPT: 'محاولة تسرب معرف النوع.',
  BAD_CAST_LEAK_ATTEMPT: 'محاولة تسرب تحويل سيء.',
  BAD_TYPEID_LEAK_ATTEMPT: 'محاولة تسرب معرف نوع سيء.',
  BAD_EXCEPTION_LEAK_ATTEMPT: 'محاولة تسرب استثناء سيء.',
  BAD_ARRAY_NEW_LENGTH_LEAK_ATTEMPT: 'محاولة تسرب طول جديد لصفيف سيء.',
  BAD_ALLOC_LEAK_ATTEMPT: 'محاولة تسرب تخصيص سيء.',
  BAD_WEAK_PTR_LEAK_ATTEMPT: 'محاولة تسرب مؤشر ضعيف سيء.',
  BAD_FUNCTION_CALL_LEAK_ATTEMPT: 'محاولة تسرب استدعاء دالة سيء.',
  LOGIC_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ منطقي.',
  RUNTIME_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ وقت التشغيل.',
  SYSTEM_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ نظام.',
  IOS_BASE_FAILURE_LEAK_ATTEMPT: 'محاولة تسرب فشل قاعدة ios.',
  UNDERFLOW_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ تحت التدفق.',
  OVERFLOW_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ فوق التدفق.',
  RANGE_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ نطاق.',
  LENGTH_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ طول.',
  OUT_OF_RANGE_LEAK_ATTEMPT: 'محاولة تسرب خارج النطاق.',
  INVALID_ARGUMENT_LEAK_ATTEMPT: 'محاولة تسرب وسيطة غير صالحة.',
  DOMAIN_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ مجال.',
  FUTURE_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ مستقبلي.',
  PROMISE_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ وعد.',
  PACKAGED_TASK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ مهمة معبأة.',
  ASYNC_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ غير متزامن.',
  LAUNCH_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ إطلاق.',
  EXECUTION_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ تنفيذ.',
  TASK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ مهمة.',
  THREAD_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ خيط.',
  MUTEX_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ متغير متبادل.',
  CONDITION_VARIABLE_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ متغير شرطي.',
  LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ قفل.',
  SHARED_LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ قفل مشترك.',
  UNIQUE_LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ قفل فريد.',
  SCOPED_LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ قفل محدد النطاق.',
  ONCE_FLAG_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ علم مرة واحدة.',
  CALL_ONCE_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ استدعاء مرة واحدة.',
  NOTIFY_ALL_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ إشعار الكل.',
  NOTIFY_ONE_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ إشعار واحد.',
  WAIT_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ انتظار.',
  WAIT_FOR_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ انتظار لـ.',
  WAIT_UNTIL_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ انتظار حتى.',
  TRY_LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ محاولة قفل.',
  TRY_LOCK_FOR_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ محاولة قفل لـ.',
  TRY_LOCK_UNTIL_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ محاولة قفل حتى.',
  LOCK_GUARD_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ حارس قفل.',
  UNIQUE_LOCK_GUARD_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ حارس قفل فريد.',
  SCOPED_LOCK_GUARD_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ حارس قفل محدد النطاق.',
  ADOPT_LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ تبني قفل.',
  DEFER_LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ تأجيل قفل.',
  TRY_TO_LOCK_ERROR_LEAK_ATTEMPT: 'محاولة تسرب خطأ محاولة للقفل.',
}

// Arapça نجاح رسائل
const ARABIC_SUCCESS_MESSAGES = {
  PATIENT_CREATED: 'تم إنشاء المريض بنجاح.',
  PATIENT_UPDATED: 'تم تحديث بيانات المريض بنجاح.',
  PATIENT_DELETED: 'تم حذف المريض بنجاح.',
  APPOINTMENT_CREATED: 'تم إنشاء الموعد بنجاح.',
  APPOINTMENT_UPDATED: 'تم تحديث الموعد بنجاح.',
  APPOINTMENT_DELETED: 'تم حذف الموعد بنجاح.',
  APPOINTMENT_STATUS_UPDATED: 'تم تحديث حالة الموعد بنجاح.',
  DATA_LOADED: 'تم تحميل البيانات بنجاح.',
  OPERATION_SUCCESS: 'تمت العملية بنجاح.',
  FILE_DOWNLOADED: 'تم تحميل الملف بنجاح.',
  BACKUP_CREATED: 'تم إنشاء النسخ الاحتياطي بنجاح.',
  BACKUP_DELETED: 'تم حذف النسخ الاحتياطي بنجاح.',
  BACKUP_RESTORED: 'تم استعادة النسخ الاحتياطي بنجاح.',
  SETTINGS_SAVED: 'تم حفظ الإعدادات بنجاح.',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح.',
  PASSWORD_CHANGED: 'تم تغيير كلمة المرور بنجاح.',
  EMAIL_SENT: 'تم إرسال البريد الإلكتروني بنجاح.',
  SMS_SENT: 'تم إرسال الرسالة النصية بنجاح.',
  NOTIFICATION_SENT: 'تم إرسال الإشعار بنجاح.',
  PAYMENT_SUCCESS: 'تم الدفع بنجاح.',
  SUBSCRIPTION_ACTIVATED: 'تم تفعيل الاشتراك بنجاح.',
  SUBSCRIPTION_RENEWED: 'تم تجديد الاشتراك بنجاح.',
  SUBSCRIPTION_CANCELLED: 'تم إلغاء الاشتراك بنجاح.',
  REFUND_PROCESSED: 'تم معالجة الاسترداد بنجاح.',
  TICKET_CREATED: 'تم إنشاء التذكرة بنجاح.',
  TICKET_UPDATED: 'تم تحديث التذكرة بنجاح.',
  TICKET_CLOSED: 'تم إغلاق التذكرة بنجاح.',
  TICKET_REOPENED: 'تم إعادة فتح التذكرة بنجاح.',
  COMMENT_ADDED: 'تم إضافة التعليق بنجاح.',
  REVIEW_ADDED: 'تم إضافة التقييم بنجاح.',
  RATING_ADDED: 'تم إضافة التقييم بنجاح.',
  FEEDBACK_SUBMITTED: 'تم إرسال الملاحظات بنجاح.',
  REPORT_GENERATED: 'تم إنشاء التقرير بنجاح.',
  EXPORT_COMPLETED: 'تم الانتهاء من التصدير بنجاح.',
  IMPORT_COMPLETED: 'تم الانتهاء من الاستيراد بنجاح.',
  SYNC_COMPLETED: 'تم الانتهاء من المزامنة بنجاح.',
  UPDATE_COMPLETED: 'تم الانتهاء من التحديث بنجاح.',
  INSTALLATION_COMPLETED: 'تم الانتهاء من التثبيت بنجاح.',
  UNINSTALLATION_COMPLETED: 'تم الانتهاء من إلغاء التثبيت بنجاح.',
  MIGRATION_COMPLETED: 'تم الانتهاء من الترحيل بنجاح.',
  BACKUP_COMPLETED: 'تم الانتهاء من النسخ الاحتياطي بنجاح.',
  RESTORE_COMPLETED: 'تم الانتهاء من الاستعادة بنجاح.',
  VERIFICATION_COMPLETED: 'تم الانتهاء من التحقق بنجاح.',
  AUTHENTICATION_COMPLETED: 'تم الانتهاء من المصادقة بنجاح.',
  REGISTRATION_COMPLETED: 'تم الانتهاء من التسجيل بنجاح.',
  LOGIN_COMPLETED: 'تم الانتهاء من تسجيل الدخول بنجاح.',
  LOGOUT_COMPLETED: 'تم الانتهاء من تسجيل الخروج بنجاح.',
  PASSWORD_RESET: 'تم إعادة تعيين كلمة المرور بنجاح.',
  ACCOUNT_ACTIVATED: 'تم تفعيل الحساب بنجاح.',
  ACCOUNT_DEACTIVATED: 'تم إلغاء تفعيل الحساب بنجاح.',
  ACCOUNT_DELETED: 'تم حذف الحساب بنجاح.',
  ACCOUNT_RECOVERED: 'تم استعادة الحساب بنجاح.',
  ACCOUNT_UPGRADED: 'تم ترقية الحساب بنجاح.',
  ACCOUNT_DOWNGRADED: 'تم تخفيض مستوى الحساب بنجاح.',
  ACCOUNT_SUSPENDED: 'تم تعليق الحساب بنجاح.',
  ACCOUNT_UNSUSPENDED: 'تم إلغاء تعليق الحساب بنجاح.',
  ACCOUNT_BANNED: 'تم حظر الحساب بنجاح.',
  ACCOUNT_UNBANNED: 'تم إلغاء حظر الحساب بنجاح.',
  ACCOUNT_VERIFIED: 'تم التحقق من الحساب بنجاح.',
  ACCOUNT_UNVERIFIED: 'تم إلغاء التحقق من الحساب بنجاح.',
  ACCOUNT_LOCKED: 'تم قفل الحساب بنجاح.',
  ACCOUNT_UNLOCKED: 'تم فتح الحساب بنجاح.',
  ACCOUNT_RESET: 'تم إعادة تعيين الحساب بنجاح.',
  ACCOUNT_MERGED: 'تم دمج الحساب بنجاح.',
  ACCOUNT_SPLIT: 'تم تقسيم الحساب بنجاح.',
  ACCOUNT_TRANSFERRED: 'تم نقل الحساب بنجاح.',
  ACCOUNT_CLONED: 'تم استنساخ الحساب بنجاح.',
  ACCOUNT_ARCHIVED: 'تم أرشفة الحساب بنجاح.',
  ACCOUNT_UNARCHIVED: 'تم إلغاء أرشفة الحساب بنجاح.',
  ACCOUNT_EXPORTED: 'تم تصدير الحساب بنجاح.',
  ACCOUNT_IMPORTED: 'تم استيراد الحساب بنجاح.',
  ACCOUNT_SYNCED: 'تم مزامنة الحساب بنجاح.',
  ACCOUNT_BACKED_UP: 'تم النسخ الاحتياطي للحساب بنجاح.',
  ACCOUNT_RESTORED: 'تم استعادة الحساب بنجاح.',
  ACCOUNT_MIGRATED: 'تم ترحيل الحساب بنجاح.',
  ACCOUNT_UPDATED: 'تم تحديث الحساب بنجاح.',
  ACCOUNT_CREATED: 'تم إنشاء الحساب بنجاح.',
}

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

export const showMessage = (type, messageKey, customMessage = '') => {
  const message = customMessage || ARABIC_ERROR_MESSAGES[messageKey] || messageKey
  
  if (type === 'success') {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#10B981',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
      icon: '✅',
    })
  } else if (type === 'error') {
    toast.error(message, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
      icon: '❌',
    })
  } else if (type === 'info') {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#3B82F6',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
      icon: 'ℹ️',
    })
  } else if (type === 'loading') {
    return toast.loading(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#F59E0B',
        color: '#FFFFFF',
        fontSize: '14px',
        textAlign: 'right',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '500px',
      },
    })
  }
}

export const apiRequest = async (url, options = {}) => {
  const {
    timeout = 30000,
    headers = {},
    showSuccess = false,
    successMessage = '',
    showError = true,
    ...restOptions
  } = options

  const controller = new AbortController()
  const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null
  let toastId = null

  try {
    toastId = showMessage('loading', 'جاري المعالجة...')

    const now = Date.now()
    if (now - lastRequestTime < REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - (now - lastRequestTime)))
    }
    lastRequestTime = Date.now()

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
    
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
    if (toastId) toast.dismiss(toastId)

    if (!response.ok) {
      let errorMessage = ARABIC_ERROR_MESSAGES.SERVER_ERROR
      let errorData = null
      let errorCode = 'HTTP_ERROR'

      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json()
          
          if (errorData.message) {
            errorMessage = errorData.message
          }
          
          if (errorData.error?.code && ARABIC_ERROR_MESSAGES[errorData.error.code]) {
            errorMessage = ARABIC_ERROR_MESSAGES[errorData.error.code]
          }
          
          errorCode = errorData.error?.code || 'HTTP_ERROR'
        } else {
          errorMessage = await response.text()
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError)
      }

      if (response.status === 404) {
        errorMessage = ARABIC_ERROR_MESSAGES.NOT_FOUND
      } else if (response.status === 401) {
        errorMessage = ARABIC_ERROR_MESSAGES.UNAUTHORIZED
      } else if (response.status === 403) {
        errorMessage = ARABIC_ERROR_MESSAGES.FORBIDDEN
      } else if (response.status === 400) {
        errorMessage = errorMessage || ARABIC_ERROR_MESSAGES.VALIDATION_ERROR
      } else if (response.status === 409) {
        errorMessage = ARABIC_ERROR_MESSAGES.DUPLICATE_ENTRY
      } else if (response.status === 429) {
        errorMessage = ARABIC_ERROR_MESSAGES.RATE_LIMIT
      }

      if (showError) {
        showMessage('error', errorCode, errorMessage)
      }

      throw new ApiError(
        errorMessage,
        errorCode,
        response.status,
        errorData,
        response.headers
      )
    }

    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      if (data.success === false) {
        const errorMsg = data.message || ARABIC_ERROR_MESSAGES.OPERATION_FAILED
        
        if (showError) {
          showMessage('error', data.error?.code || 'OPERATION_FAILED', errorMsg)
        }
        
        throw new ApiError(
          errorMsg,
          data.error?.code || 'OPERATION_FAILED',
          response.status,
          data,
          response.headers
        )
      }
      
      if (showSuccess) {
        showMessage('success', '', successMessage || ARABIC_SUCCESS_MESSAGES.OPERATION_SUCCESS)
      }
      
      return data
    } else {
      const result = await response.text()
      
      if (showSuccess) {
        showMessage('success', '', successMessage || ARABIC_SUCCESS_MESSAGES.OPERATION_SUCCESS)
      }
      
      return result
    }

  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    if (toastId) toast.dismiss(toastId)

    if (error.name === 'AbortError') {
      if (showError) {
        showMessage('error', 'TIMEOUT_ERROR')
      }
      throw new TimeoutError(ARABIC_ERROR_MESSAGES.TIMEOUT_ERROR)
    }

    if (error.name === 'NetworkError' || error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      if (showError) {
        showMessage('error', 'NETWORK_ERROR')
      }
      throw new NetworkError(ARABIC_ERROR_MESSAGES.NETWORK_ERROR, error)
    }

    if (error instanceof ApiError) {
      throw error
    }

    console.error('API İstek Hatası:', error)
    
    if (showError) {
      showMessage('error', 'SERVER_ERROR', error.message)
    }
    
    const enhancedError = new Error(error.message || ARABIC_ERROR_MESSAGES.SERVER_ERROR)
    enhancedError.originalError = error
    enhancedError.name = error.name || 'UnknownError'
    enhancedError.status = 500
    throw enhancedError
  }
}

export const getPatientAppointments = async (patientId, options = {}) => {
  return await apiRequest(`/api/appointments/patient/${patientId}`, {
    showSuccess: false,
    showError: true,
    ...options
  })
}

export const getPatientById = async (patientId, options = {}) => {
  return await apiRequest(`/api/patients/${patientId}`, {
    showSuccess: false,
    showError: true,
    ...options
  })
}

export const createPatient = async (patientData, options = {}) => {
  return await apiRequest('/api/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.PATIENT_CREATED,
    showError: true,
    ...options
  })
}

export const updatePatient = async (patientId, patientData, options = {}) => {
  return await apiRequest(`/api/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(patientData),
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.PATIENT_UPDATED,
    showError: true,
    ...options
  })
}

export const deletePatient = async (patientId, options = {}) => {
  return await apiRequest(`/api/patients/${patientId}`, {
    method: 'DELETE',
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.PATIENT_DELETED,
    showError: true,
    ...options
  })
}

export const createAppointment = async (appointmentData, options = {}) => {
  return await apiRequest('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.APPOINTMENT_CREATED,
    showError: true,
    ...options
  })
}

export const updateAppointment = async (appointmentId, appointmentData, options = {}) => {
  return await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData),
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.APPOINTMENT_UPDATED,
    showError: true,
    ...options
  })
}

export const deleteAppointment = async (appointmentId, options = {}) => {
  return await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'DELETE',
    showSuccess: true,
    successMessage: ARABIC_SUCCESS_MESSAGES.APPOINTMENT_DELETED,
    showError: true,
    ...options
  })
}

export const errorHandlers = {
  handleApiError: (error, fallbackMessage = ARABIC_ERROR_MESSAGES.SERVER_ERROR) => {
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
        message: ARABIC_ERROR_MESSAGES.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        originalError: error.originalError?.message,
      }
    } else if (error instanceof TimeoutError) {
      return {
        message: ARABIC_ERROR_MESSAGES.TIMEOUT_ERROR,
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
    return error instanceof ApiError && (error.status === 429 || error.code === 'RATE_LIMIT')
  }
}

export default apiRequest
// types.ts

export interface ClinicInfo {
  name: string;
  description: string;
  logoText: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  workingHours: {
    weekdays: string;
    weekend: string;
    friday: string;
  };
}

export interface AvailableDate {
  date: string;
  available: boolean;
  availableSlots: number;
}

export interface FormData {
  patientName: string;
  phoneNumber: string;
  notes: string;
}

export interface Message {
  type: 'success' | 'error' | '';
  text: string;
}

export interface DateStatus {
  status: 'past' | 'unavailable' | 'full' | 'available';
  text: string;
}

export interface ArabicDate {
  day: string;
  dayNumber: number;
  month: string;
  year: number;
}

export interface Colors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

// Clinic Information - Damascus Medical Imaging Center
export const CLINIC_INFO: ClinicInfo = {
  name: 'مؤسسة الصواف للتصوير الطبي',
  description: 'مركز متخصص في التصوير الطبي بالدماغ والأعصاب، الباطنة، العظام، النسائية وغيرها',
  logoText: 'الصواف',
  address: 'برج دمشق، ساحة المرجة، دمشق، سوريا',
  phone: '+963 11 231 2685',
  emergencyPhone: '+963 11 231 2685',
  workingHours: {
    weekdays: '8:00 صباحاً - 7:00 مساءً (الاثنين - الخميس)',
    weekend: '8:00 صباحاً - 7:00 مساءً (السبت - الأحد)',
    friday: 'مغلق'
  }
};

// Modern & Simple Color Palette
export const colors: Colors = {
  primary: '#0EA5E9',     // Modern Sky Blue
  primaryLight: '#F0F9FF', // Very Light Blue
  secondary: '#6366F1',   // Indigo
  accent: '#10B981',      // Emerald Green
  background: '#FFFFFF',
  surface: '#F8FAFC',     // Light Gray-Blue
  text: '#1E293B',        // Dark Blue-Gray
  textLight: '#64748B',   // Slate
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B'
};

// Arabic Date Formatting
export const arabicDays: string[] = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const arabicMonths: string[] = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
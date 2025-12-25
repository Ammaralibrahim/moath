// @/components/shared/constants.js
export const colors = {
  // Ana renkler
  primary: "#667eea",
  secondary: "#764ba2",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Gradientler
  gradientPrimary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradientSuccess: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  gradientWarning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  gradientError: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  gradientInfo: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  gradientPremium: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",

  // Arkaplanlar
  background: "#0f172a",
  surface: "#1e293b",
  surfaceLight: "#334155",
  surfaceDark: "#0f172a",

  // Kenarlıklar
  border: "#475569",
  borderLight: "#64748b",
  borderDark: "#334155",

  // Metinler
  text: "#f1f5f9",
  textLight: "#cbd5e1",
  textMuted: "#94a3b8",
  textDark: "#64748b",

  // Özel efektler
  glow: "0 0 20px rgba(102, 126, 234, 0.5)",
  shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
  glass: "rgba(255, 255, 255, 0.05)",
};

// Arabic translations
export const arabic = {
  types: {
    full: "نسخ احتياطي كامل",
    patients: "المرضى",
    appointments: "المواعيد",
    partial: "جزئي",
    restoration: "استعادة",
    emergency: "طوارئ",
  },
  status: {
    success: "ناجح",
    failed: "فشل",
    pending: "قيد الانتظار",
  },
};

export const animations = {
  fadeIn: "fade-in 0.3s ease-in-out",
  slideUp: "slide-up 0.4s ease-out",
  slideDown: "slide-down 0.4s ease-out",
  pulse: "pulse 2s infinite",
  shimmer: "shimmer 2s infinite",
};

// CSS Animations için global styles
export const globalStyles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slide-down {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  .glass-effect {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .gradient-border {
    position: relative;
    background: linear-gradient(135deg, #667eea, #764ba2) border-box;
    border: 2px solid transparent;
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
`;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const ADMIN_API_KEY =
  process.env.NEXT_PUBLIC_ADMIN_API_KEY || "admin123";
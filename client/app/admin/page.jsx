"use client";

import { useState, useEffect } from "react";
import { Cairo } from "next/font/google";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import Dashboard from "../../components/admin/Dashboard";
import Appointments from "../../components/admin/Appointments";
import Patients from "../../components/admin/Patients";
import Backup from "../../components/admin/Backup";

import Reports from "../../components/admin/Reports";
import System from "../../components/admin/System";
import MessageAlert from "@/components/ui/MessageAlert";
import { colors } from "@/components/shared/constants";
import { apiRequest } from "@/components/shared/api";
import { Toaster } from "react-hot-toast";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function AdminPanel() {
  // State management
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    today: 0,
    upcoming: 0,
    past: 0,
    male: 0,
    female: 0,
    withAppointments: 0,
    activePatients: 0,
  });
  const [systemStats, setSystemStats] = useState({
    database: {},
    server: {},
  });

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    fetchSystemInfo();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch appointments
      const appointmentsRes = await apiRequest(
        "/api/admin/appointments?limit=1000"
      );
      if (appointmentsRes.success) {
        calculateAppointmentStats(appointmentsRes.data || []);
      }

      // Fetch patient counts
      const patientsRes = await apiRequest("/api/patients?limit=1&page=1");
      if (patientsRes.success) {
        setStats((prev) => ({
          ...prev,
          totalPatients: patientsRes.total || 0,
        }));
      }

      // Fetch gender counts
      try {
        const maleCount = await apiRequest(
          "/api/patients?gender=male&limit=1&page=1"
        );
        const femaleCount = await apiRequest(
          "/api/patients?gender=female&limit=1&page=1"
        );

        if (maleCount.success && femaleCount.success) {
          setStats((prev) => ({
            ...prev,
            male: maleCount.total || 0,
            female: femaleCount.total || 0,
            withAppointments: prev.totalPatients,
            activePatients: prev.totalPatients,
          }));
        }
      } catch (genderError) {
        console.log("Error fetching gender stats:", genderError);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setMessage({ type: "error", text: "فشل في تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const data = await apiRequest("/api/system/info");
      if (data.success) {
        setSystemStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching system info:", error);
    }
  };

  const calculateAppointmentStats = (appointmentsList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const newStats = {
      totalAppointments: appointmentsList.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      today: 0,
      upcoming: 0,
      past: 0,
    };

    appointmentsList.forEach((apt) => {
      if (apt.status === "pending") newStats.pending++;
      if (apt.status === "confirmed") newStats.confirmed++;
      if (apt.status === "cancelled") newStats.cancelled++;

      const aptDate = new Date(apt.appointmentDate);
      const aptDateOnly = new Date(
        aptDate.getFullYear(),
        aptDate.getMonth(),
        aptDate.getDate()
      );

      if (aptDateOnly.getTime() === today.getTime()) {
        newStats.today++;
      } else if (aptDateOnly < today) {
        newStats.past++;
      } else {
        newStats.upcoming++;
      }
    });

    setStats((prev) => ({ ...prev, ...newStats }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard stats={stats} />;
      case "appointments":
        return <Appointments />;
      case "patients":
        return <Patients />;
      case "backup":
        return <Backup />;
      case "reports":
        return <Reports stats={stats} />;
      case "system":
        return <System systemStats={systemStats} />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen ${cairo.className}`}
      style={{ backgroundColor: colors.background }}
    >
      <Header
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          stats={stats}
        />

        <main className="flex-1 p-6 overflow-auto">
          <MessageAlert message={message} setMessage={setMessage} />
          {renderContent()}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

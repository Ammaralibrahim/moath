// @/components/dashboard/Dashboard.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import StatsCards from "./StatsCards";
import { colors } from "@/components/shared/constants";
import { apiRequest } from "@/components/shared/api";
import StatusBadge from "../ui/StatusBadge";

// Register minimal ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Optimized dynamic imports with smaller bundle size
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-900/50 rounded-xl animate-pulse"></div>
  ),
});

const Pie = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-900/50 rounded-xl animate-pulse"></div>
  ),
});

// Simple loading component
const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-800/50 rounded-xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 bg-gray-800/50 rounded-xl"></div>
      <div className="h-64 bg-gray-800/50 rounded-xl"></div>
    </div>
    <div className="h-96 bg-gray-800/50 rounded-xl"></div>
  </div>
);

export default function Dashboard({ stats }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    appointments: null,
    status: null,
  });

  // Memoized fetch function
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const appointmentsRes = await apiRequest(
        "/api/admin/appointments?limit=1000"
      );
      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data || []);
        prepareChartData(appointmentsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Optimized chart data preparation
  const prepareChartData = useCallback((appointmentsList) => {
    const now = Date.now();
    const oneDay = 86400000;

    // Status Distribution - optimized calculation
    const statusCounts = { confirmed: 0, pending: 0, cancelled: 0 };
    appointmentsList.forEach((apt) => {
      if (apt.status === "confirmed") statusCounts.confirmed++;
      else if (apt.status === "pending") statusCounts.pending++;
      else if (apt.status === "cancelled") statusCounts.cancelled++;
    });

    const statusData = {
      labels: ["مؤكد", "قيد الانتظار", "ملغى"],
      datasets: [
        {
          data: [
            statusCounts.confirmed,
            statusCounts.pending,
            statusCounts.cancelled,
          ],
          backgroundColor: ["#059669", "#d97706", "#dc2626"],
          borderWidth: 0,
          hoverOffset: 12,
        },
      ],
    };

    // Daily Appointments - optimized date calculations
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * oneDay);
      return date.toLocaleDateString("ar-EG", { weekday: "narrow" });
    });

    const dateMap = new Map();
    last7Days.forEach((day) => dateMap.set(day, 0));

    appointmentsList.forEach((apt) => {
      if (!apt.appointmentDate) return;
      const aptDate = new Date(apt.appointmentDate);
      if (now - aptDate.getTime() > 7 * oneDay) return;

      const dayKey = aptDate.toLocaleDateString("ar-EG", { weekday: "narrow" });
      if (dateMap.has(dayKey)) {
        dateMap.set(dayKey, dateMap.get(dayKey) + 1);
      }
    });

    const dailyData = {
      labels: last7Days,
      datasets: [
        {
          label: "المواعيد",
          data: Array.from(dateMap.values()),
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderColor: "#667eea",
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    setChartData({ status: statusData, appointments: dailyData });
  }, []);

  // Memoized chart options
  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          titleColor: "#f1f5f9",
          bodyColor: "#cbd5e1",
          borderColor: "#475569",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(71, 85, 105, 0.2)",
            drawBorder: false,
          },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(71, 85, 105, 0.2)",
            drawBorder: false,
          },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
            precision: 0,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    }),
    []
  );

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#cbd5e1",
            font: { size: 11 },
            padding: 16,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          titleColor: "#f1f5f9",
          bodyColor: "#cbd5e1",
          borderColor: "#475569",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        },
      },
      cutout: "65%",
    }),
    []
  );

  // Memoized recent appointments
  const recentAppointments = useMemo(
    () =>
      appointments.slice(0, 5).map((apt) => ({
        ...apt,
        formattedDate: apt.appointmentDate
          ? new Date(apt.appointmentDate).toLocaleDateString("ar-EG")
          : "-",
      })),
    [appointments]
  );

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Weekly Appointments */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-100">
              المواعيد خلال الأسبوع
            </h3>
            <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
              آخر 7 أيام
            </span>
          </div>
          <div className="h-64">
            {chartData.appointments ? (
              <Line data={chartData.appointments} options={lineOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                لا توجد بيانات
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart - Status Distribution */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-100">
              توزيع الحالات
            </h3>
            <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
              إجمالي
            </span>
          </div>
          <div className="h-64">
            {chartData.status ? (
              <Pie data={chartData.status} options={pieOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                لا توجد بيانات
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

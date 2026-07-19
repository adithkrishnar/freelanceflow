import { useCallback, useEffect, useState } from "react";
import DashboardSkeleton from "../components/DashboardSkeleton";
import {
  AlertCircle,
  CalendarDays,
  Database,
  FolderKanban,
  IndianRupee,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import api from "../api/api";
import Button from "../components/Button";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (date) => {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark rounded-xl px-4 py-3 shadow-xl border border-slate-700/50 backdrop-blur-md">
        <p className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-white tracking-tight">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sampleLoading, setSampleLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get("/dashboard");
      setDashboard(response.data.dashboard);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleLoadSampleData = async () => {
    try {
      setSampleLoading(true);
      const response = await api.post("/sample-data");
      toast.success(response.data.message);
      await fetchDashboard();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load sample data"
      );
    } finally {
      setSampleLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const stats = [
    {
      label: "Active Projects",
      value: dashboard?.activeProjects || 0,
      icon: FolderKanban,
      description: "Currently in progress",
      gradient: "from-indigo-500 to-indigo-600",
      lightBg: "bg-indigo-50",
      textColor: "text-indigo-600",
      ringColor: "ring-indigo-100"
    },
    {
      label: "Pending Invoices",
      value: dashboard?.pendingInvoices || 0,
      icon: ReceiptText,
      description: "Awaiting payment",
      gradient: "from-amber-400 to-amber-500",
      lightBg: "bg-amber-50",
      textColor: "text-amber-600",
      ringColor: "ring-amber-100"
    },
    {
      label: "Outstanding",
      value: formatCurrency(dashboard?.outstandingPayments || 0),
      icon: IndianRupee,
      description: "Unpaid invoice value",
      gradient: "from-rose-400 to-rose-500",
      lightBg: "bg-rose-50",
      textColor: "text-rose-600",
      ringColor: "ring-rose-100"
    },
    {
      label: "Upcoming Deadlines",
      value: dashboard?.upcomingDeadlines?.length || 0,
      icon: CalendarDays,
      description: "Tasks due soon",
      gradient: "from-emerald-400 to-emerald-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
      ringColor: "ring-emerald-100"
    },
  ];

  const monthlyRevenue = dashboard?.monthlyRevenue || [];
  const upcomingDeadlines = dashboard?.upcomingDeadlines || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Track your business performance and upcoming deadlines.
          </p>
        </div>

        <Button
          onClick={handleLoadSampleData}
          isLoading={sampleLoading}
          variant="secondary"
          className="shadow-sm bg-white"
        >
          {!sampleLoading && <Database size={16} className="mr-2 text-slate-400" />}
          {sampleLoading ? "Loading Data..." : "Load Sample Data"}
        </Button>
      </header>

      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <motion.article
              variants={itemVariants}
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
            >
              {/* Subtle gradient background flourish on hover */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-[0.03] rounded-full blur-3xl transform translate-x-10 -translate-y-10`}></div>
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.lightBg} ${stat.textColor} ring-1 inset-0 ${stat.ringColor} shadow-sm`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
              </div>

              <p className="relative z-10 mt-4 text-xs font-medium text-slate-400">
                {stat.description}
              </p>
            </motion.article>
          );
        })}
      </motion.section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Revenue Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monthly revenue across all paid invoices.
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-500 border border-indigo-100/50">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="h-[300px] w-full flex-1">
            {monthlyRevenue.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200">
                <div className="text-center">
                  <TrendingUp
                    size={32}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="text-sm font-medium text-slate-600">
                    No revenue data yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Mark an invoice as paid to track revenue.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                  />
                  <Tooltip cursor={{ fill: "#F1F5F9", opacity: 0.4 }} content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.article>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden"
        >
          <div className="border-b border-slate-100 p-5 bg-white">
            <h2 className="text-base font-semibold text-slate-900">
              Upcoming Deadlines
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tasks requiring immediate attention.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-slate-200">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                <CalendarDays
                  size={32}
                  className="mx-auto text-slate-300 mb-3"
                />
                <p className="text-sm font-medium text-slate-600">
                  All caught up!
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  No upcoming deadlines to worry about.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="p-4 transition-colors hover:bg-slate-50/80 group">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500 ring-1 ring-inset ring-amber-500/20">
                        <AlertCircle size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 font-medium">
                          {task.project?.name || "Unknown project"}
                        </p>
                        <div className="mt-2 inline-flex items-center rounded-md bg-slate-100/80 px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200/50">
                          <CalendarDays size={12} className="mr-1.5 text-slate-400" />
                          Due {formatDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.article>
      </section>
    </div>
  );
};

export default DashboardPage;
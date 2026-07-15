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
      <div className="glass-dark rounded-xl px-4 py-3 shadow-lg border border-slate-700/50">
        <p className="text-sm font-medium text-slate-300 mb-1">{label}</p>
        <p className="text-lg font-bold text-white">
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
      color: "bg-blue-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-500"
    },
    {
      label: "Pending Invoices",
      value: dashboard?.pendingInvoices || 0,
      icon: ReceiptText,
      description: "Awaiting payment",
      color: "bg-amber-500",
      lightBg: "bg-amber-50",
      textColor: "text-amber-500"
    },
    {
      label: "Outstanding",
      value: formatCurrency(dashboard?.outstandingPayments || 0),
      icon: IndianRupee,
      description: "Unpaid invoice value",
      color: "bg-red-500",
      lightBg: "bg-red-50",
      textColor: "text-red-500"
    },
    {
      label: "Upcoming Deadlines",
      value: dashboard?.upcomingDeadlines?.length || 0,
      icon: CalendarDays,
      description: "Tasks due soon",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-500"
    },
  ];

  const monthlyRevenue = dashboard?.monthlyRevenue || [];
  const upcomingDeadlines = dashboard?.upcomingDeadlines || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your business performance and upcoming deadlines.
          </p>
        </div>

        <Button
          onClick={handleLoadSampleData}
          isLoading={sampleLoading}
          variant="secondary"
          className="shadow-sm border-slate-200/60"
        >
          {!sampleLoading && <Database size={16} className="mr-2 text-slate-500" />}
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
              className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 transition-opacity group-hover:opacity-10 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 duration-500">
                <Icon size={100} className={stat.textColor} />
              </div>
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.lightBg} ${stat.textColor} shadow-sm`}>
                  <Icon size={22} />
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
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Revenue Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monthly revenue across all paid invoices.
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 text-slate-400 border border-slate-100">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="h-80 w-full">
            {monthlyRevenue.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <div className="text-center">
                  <TrendingUp
                    size={34}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 font-semibold text-slate-600">
                    No revenue data yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Mark an invoice as paid to track revenue.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                  />
                  <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-primary)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
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
          transition={{ delay: 0.5 }}
          className="flex flex-col rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden"
        >
          <div className="border-b border-slate-100 p-6 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">
              Upcoming Deadlines
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tasks requiring immediate attention.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-10 text-center h-full flex flex-col items-center justify-center">
                <CalendarDays
                  size={34}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 font-semibold text-slate-600">
                  All caught up!
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  No upcoming deadlines to worry about.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="p-5 transition hover:bg-slate-50/80">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 ring-1 ring-amber-100">
                        <AlertCircle size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">
                          {task.title}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {task.project?.name || "Unknown project"}
                        </p>
                        <div className="mt-2 inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
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
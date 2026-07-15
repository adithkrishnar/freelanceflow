import { useCallback, useEffect, useState } from "react";
import DashboardSkeleton from "../components/DashboardSkeleton";
import {
  AlertCircle,
  CalendarDays,
  Database,
  FolderKanban,
  IndianRupee,
  LoaderCircle,
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

import api from "../api/api";

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

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sampleLoading, setSampleLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/dashboard");

      setDashboard(response.data.dashboard);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load dashboard"
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
      setError("");
      setMessage("");

      const response = await api.post("/sample-data");

      setMessage(response.data.message);

      await fetchDashboard();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load sample data"
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
    },
    {
      label: "Pending Invoices",
      value: dashboard?.pendingInvoices || 0,
      icon: ReceiptText,
      description: "Awaiting payment",
    },
    {
      label: "Outstanding Payments",
      value: formatCurrency(
        dashboard?.outstandingPayments || 0
      ),
      icon: IndianRupee,
      description: "Unpaid invoice value",
    },
    {
      label: "Upcoming Deadlines",
      value:
        dashboard?.upcomingDeadlines?.length || 0,
      icon: CalendarDays,
      description: "Tasks due soon",
    },
  ];

  const monthlyRevenue =
    dashboard?.monthlyRevenue || [];

  const upcomingDeadlines =
    dashboard?.upcomingDeadlines || [];

  return (
    <div className="p-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Executive View
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Track projects, invoices, revenue and deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleData}
          disabled={sampleLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sampleLoading ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Database size={18} />
          )}

          {sampleLoading
            ? "Loading Sample Data..."
            : "Load Sample Data"}
        </button>
      </header>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {stat.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Monthly Revenue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revenue from paid invoices.
              </p>
            </div>

            <TrendingUp size={22} />
          </div>

          <div className="mt-8 h-80">
            {monthlyRevenue.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50">
                <div className="text-center">
                  <TrendingUp
                    size={34}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 font-semibold text-slate-700">
                    No revenue data yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Mark an invoice as paid to track revenue.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₹${Number(value) / 1000}k`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#0f172a"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={55}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Upcoming Deadlines
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tasks requiring attention.
            </p>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays
                size={34}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 font-semibold text-slate-700">
                No upcoming deadlines
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {upcomingDeadlines.map((task) => (
                <div key={task.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <AlertCircle size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {task.title}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {task.project?.name ||
                          "Unknown project"}
                      </p>

                      <p className="mt-2 text-xs font-medium text-amber-700">
                        Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
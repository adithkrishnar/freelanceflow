import { useCallback, useEffect, useState } from "react";
import TableSkeleton from "../components/TableSkeleton";
import {
  Clock3,
  History,
  Play,
  Plus,
  Square,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import api from "../api/api";
import { useTimer } from "../context/TimerContext";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

const initialTimerForm = {
  projectId: "",
  description: "",
};

const initialManualForm = {
  projectId: "",
  description: "",
  startTime: "",
  hours: "",
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatDuration = (seconds) => {
  const hours = Number(seconds || 0) / 3600;
  return `${hours.toFixed(2)} hrs`;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const TimeTrackingPage = () => {
  const {
    activeTimer,
    elapsedSeconds,
    startTimer,
    stopTimer,
  } = useTimer();

  const [projects, setProjects] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);

  const [timerForm, setTimerForm] = useState(initialTimerForm);
  const [manualForm, setManualForm] = useState(initialManualForm);
  const [showManualForm, setShowManualForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [timerLoading, setTimerLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, logsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/time-logs"),
      ]);
      setProjects(projectsRes.data.projects || []);
      setTimeLogs(logsRes.data.timeLogs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load time tracking data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTimerChange = (event) => {
    const { name, value } = event.target;
    setTimerForm((current) => ({ ...current, [name]: value }));
  };

  const handleManualChange = (event) => {
    const { name, value } = event.target;
    setManualForm((current) => ({ ...current, [name]: value }));
  };

  const handleStartTimer = async (event) => {
    event.preventDefault();
    try {
      setTimerLoading(true);
      const res = await startTimer(timerForm.projectId, timerForm.description.trim());
      toast.success(res.message);
      setTimerForm(initialTimerForm);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to start timer");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleStopTimer = async () => {
    try {
      setTimerLoading(true);
      const res = await stopTimer();
      if (res) toast.success(res.message);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to stop timer");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();
    try {
      setManualLoading(true);
      const res = await api.post("/time-logs/manual", {
        projectId: Number(manualForm.projectId),
        description: manualForm.description.trim(),
        startTime: new Date(manualForm.startTime).toISOString(),
        hours: Number(manualForm.hours),
      });
      toast.success(res.data.message);
      setManualForm(initialManualForm);
      setShowManualForm(false);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add manual entry");
    } finally {
      setManualLoading(false);
    }
  };

  const handleDelete = async (timeLog) => {
    const confirmed = window.confirm("Delete this time entry?");
    if (!confirmed) return;

    try {
      const res = await api.delete(`/time-logs/${timeLog.id}`);
      toast.success(res.data.message);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete time entry");
    }
  };

  const completedLogs = timeLogs.filter((timeLog) => timeLog.endTime);

  const columns = [
    {
      header: "Project",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{row.project?.name}</p>
          <p className="text-xs font-medium text-slate-500 max-w-[200px] truncate">{row.description || "—"}</p>
        </div>
      ),
    },
    {
      header: "Date",
      render: (row) => (
        <span className="text-sm font-medium text-slate-600">{formatDate(row.startTime)}</span>
      ),
    },
    {
      header: "Duration",
      render: (row) => (
        <span className="font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded-md ring-1 ring-inset ring-slate-200">{formatDuration(row.duration)}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${row.billed ? "bg-emerald-50 text-emerald-700 ring-emerald-500/20" : "bg-amber-50 text-amber-700 ring-amber-500/20"}`}>
          {row.billed ? "BILLED" : "UNBILLED"}
        </span>
      ),
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end opacity-80 hover:opacity-100 transition-opacity">
          {!row.billed && (
            <button
              onClick={() => handleDelete(row)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Time Tracking
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Track live work sessions and manually log hours.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => setShowManualForm(true)}
          disabled={projects.length === 0}
        >
          <Plus size={18} className="mr-2" />
          Manual Entry
        </Button>
      </header>

      <section className="mb-8">
        {activeTimer ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 md:p-10 text-white shadow-xl shadow-indigo-600/20"
          >
            <div className="absolute -top-24 -right-24 p-12 opacity-30 blur-3xl mix-blend-screen pointer-events-none">
              <div className="w-96 h-96 bg-indigo-400 rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-100 uppercase tracking-widest mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                  </span>
                  Timer Running
                </div>

                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {activeTimer.project?.name || "Active Project"}
                </h2>

                <p className="mt-2 text-lg text-indigo-100/90 font-medium max-w-lg">
                  {activeTimer.description || "No description provided"}
                </p>
              </div>

              <div className="text-left md:text-right flex flex-col items-start md:items-end">
                <div className="font-mono text-6xl md:text-7xl font-bold tracking-tighter tabular-nums mb-6 drop-shadow-md">
                  {formatTime(elapsedSeconds)}
                </div>

                <Button
                  onClick={handleStopTimer}
                  isLoading={timerLoading}
                  className="bg-white text-indigo-600 hover:bg-slate-50 shadow-lg shadow-black/10 h-14 px-8 text-lg rounded-2xl w-full md:w-auto transition-transform active:scale-95"
                >
                  {!timerLoading && <Square size={20} className="mr-3 fill-indigo-600" />}
                  {timerLoading ? "Stopping..." : "Stop Timer"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600">
                <Play size={16} className="fill-indigo-600" />
              </div>
              Start new session
            </h2>
            <form onSubmit={handleStartTimer} className="grid gap-5 md:grid-cols-[1fr_2fr_auto] items-end">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Project</label>
                <select
                  name="projectId"
                  value={timerForm.projectId}
                  onChange={handleTimerChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                >
                  <option value="">Select project</option>
                  {projects.filter((p) => p.status === "ACTIVE").map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <input
                  name="description"
                  type="text"
                  value={timerForm.description}
                  onChange={handleTimerChange}
                  placeholder="What are you working on?"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={timerLoading || !timerForm.projectId}
                isLoading={timerLoading}
                className="h-12 px-6 rounded-xl w-full md:w-auto"
              >
                {!timerLoading && <Play size={18} className="mr-2 fill-current" />}
                {timerLoading ? "Starting..." : "Start Timer"}
              </Button>
            </form>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 bg-slate-50/50 flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl ring-1 ring-inset ring-indigo-500/10">
            <History size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Time History</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Completed billable work sessions.</p>
          </div>
        </div>

        {completedLogs.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Clock3}
              title="No time entries yet"
              description="Start a timer or log time manually to track your work."
            />
          </div>
        ) : (
          <DataTable columns={columns} data={completedLogs} />
        )}
      </section>

      <Modal
        isOpen={showManualForm}
        onClose={() => setShowManualForm(false)}
        title="Manual Time Entry"
        description="Log work completed outside the stopwatch."
      >
        <form onSubmit={handleManualSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Project</label>
            <select
              name="projectId"
              value={manualForm.projectId}
              onChange={handleManualChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Date and Time</label>
              <input
                name="startTime"
                type="datetime-local"
                value={manualForm.startTime}
                onChange={handleManualChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Hours Worked</label>
              <input
                name="hours"
                type="number"
                min="0.01"
                step="0.01"
                value={manualForm.hours}
                onChange={handleManualChange}
                required
                placeholder="3.5"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <input
              name="description"
              type="text"
              value={manualForm.description}
              onChange={handleManualChange}
              placeholder="Completed API integration"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="ghost" onClick={() => setShowManualForm(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={manualLoading}>
              Add Time Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimeTrackingPage;
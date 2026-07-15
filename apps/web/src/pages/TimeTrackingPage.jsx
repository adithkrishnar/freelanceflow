import {
  useCallback,
  useEffect,
  useState,
} from "react";
import TableSkeleton from "../components/TableSkeleton";

import {
  Clock3,
  History,
  LoaderCircle,
  Play,
  Plus,
  Square,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/api";
import { useTimer } from "../context/TimerContext";

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

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

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

  const [timerForm, setTimerForm] = useState(
    initialTimerForm
  );

  const [manualForm, setManualForm] = useState(
    initialManualForm
  );

  const [showManualForm, setShowManualForm] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [timerLoading, setTimerLoading] =
    useState(false);

  const [manualLoading, setManualLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");

      const [projectsResponse, logsResponse] =
        await Promise.all([
          api.get("/projects"),
          api.get("/time-logs"),
        ]);

      setProjects(projectsResponse.data.projects || []);

      setTimeLogs(
        logsResponse.data.timeLogs || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load time tracking data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTimerChange = (event) => {
    const { name, value } = event.target;

    setTimerForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleManualChange = (event) => {
    const { name, value } = event.target;

    setManualForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleStartTimer = async (event) => {
    event.preventDefault();

    try {
      setTimerLoading(true);
      setError("");
      setMessage("");

      const response = await startTimer(
        timerForm.projectId,
        timerForm.description.trim()
      );

      setMessage(response.message);

      setTimerForm(initialTimerForm);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to start timer"
      );
    } finally {
      setTimerLoading(false);
    }
  };

  const handleStopTimer = async () => {
    try {
      setTimerLoading(true);
      setError("");
      setMessage("");

      const response = await stopTimer();

      if (response) {
        setMessage(response.message);
      }

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to stop timer"
      );
    } finally {
      setTimerLoading(false);
    }
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();

    try {
      setManualLoading(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/time-logs/manual",
        {
          projectId: Number(manualForm.projectId),
          description:
            manualForm.description.trim(),
          startTime: new Date(
            manualForm.startTime
          ).toISOString(),
          hours: Number(manualForm.hours),
        }
      );

      setMessage(response.data.message);

      setManualForm(initialManualForm);
      setShowManualForm(false);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to add manual time entry"
      );
    } finally {
      setManualLoading(false);
    }
  };

  const handleDelete = async (timeLog) => {
    const confirmed = window.confirm(
      "Delete this time entry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/time-logs/${timeLog.id}`
      );

      setMessage(response.data.message);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete time entry"
      );
    }
  };

  const completedLogs = timeLogs.filter(
    (timeLog) => timeLog.endTime
  );

  if (loading) {
    return (
      <div className="p-8">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Billable Work
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Time Tracking
          </h1>

          <p className="mt-2 text-slate-500">
            Track live work sessions and manually log hours.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualForm(true)}
          disabled={projects.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Plus size={18} />
          Manual Entry
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

      <section className="mt-8 rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        {activeTimer ? (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                TIMER RUNNING
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                {activeTimer.project?.name ||
                  "Active Project"}
              </h2>

              <p className="mt-2 text-slate-400">
                {activeTimer.description ||
                  "No description"}
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="font-mono text-5xl font-bold tracking-tight">
                {formatTime(elapsedSeconds)}
              </p>

              <button
                type="button"
                onClick={handleStopTimer}
                disabled={timerLoading}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
              >
                {timerLoading ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Square size={17} />
                )}

                Stop Timer
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleStartTimer}
            className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
          >
            <div>
              <label
                htmlFor="timerProjectId"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Project
              </label>

              <select
                id="timerProjectId"
                name="projectId"
                value={timerForm.projectId}
                onChange={handleTimerChange}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-white"
              >
                <option value="">Select project</option>

                {projects
                  .filter(
                    (project) =>
                      project.status === "ACTIVE"
                  )
                  .map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="timerDescription"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Description
              </label>

              <input
                id="timerDescription"
                name="description"
                type="text"
                value={timerForm.description}
                onChange={handleTimerChange}
                placeholder="What are you working on?"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={
                timerLoading ||
                !timerForm.projectId
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {timerLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Play size={18} />
              )}

              Start Timer
            </button>
          </form>
        )}
      </section>

      {showManualForm && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Manual Time Entry
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Log work completed outside the stopwatch.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleManualSubmit}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="manualProjectId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Project
              </label>

              <select
                id="manualProjectId"
                name="projectId"
                value={manualForm.projectId}
                onChange={handleManualChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              >
                <option value="">Select project</option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="startTime"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Start Date and Time
              </label>

              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={manualForm.startTime}
                onChange={handleManualChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="hours"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Hours Worked
              </label>

              <input
                id="hours"
                name="hours"
                type="number"
                min="0.01"
                step="0.01"
                value={manualForm.hours}
                onChange={handleManualChange}
                required
                placeholder="3"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="manualDescription"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <input
                id="manualDescription"
                name="description"
                type="text"
                value={manualForm.description}
                onChange={handleManualChange}
                placeholder="Completed API integration"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={manualLoading}
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {manualLoading && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}

                {manualLoading
                  ? "Saving..."
                  : "Add Time Entry"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowManualForm(false)
                }
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <History size={21} />

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Time History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Completed billable work sessions.
              </p>
            </div>
          </div>
        </div>

        {completedLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock3
              size={38}
              className="mx-auto text-slate-400"
            />

            <p className="mt-4 font-semibold text-slate-700">
              No time entries yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">
                    Description
                  </th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">
                    Duration
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {completedLogs.map((timeLog) => (
                  <tr key={timeLog.id}>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {timeLog.project?.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {timeLog.description || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(timeLog.startTime)}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatDuration(timeLog.duration)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          timeLog.billed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {timeLog.billed
                          ? "BILLED"
                          : "UNBILLED"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {!timeLog.billed && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(timeLog)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimeTrackingPage;
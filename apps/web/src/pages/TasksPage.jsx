import { useCallback, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/TableSkeleton";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/api";

const initialForm = {
  title: "",
  projectId: "",
  dueDate: "",
  status: "TODO",
};

const statusConfig = {
  TODO: {
    label: "To Do",
    icon: Circle,
    className: "bg-slate-100 text-slate-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock3,
    className: "bg-amber-100 text-amber-700",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700",
  },
};

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

const formatDateInput = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().split("T")[0];
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [editingTask, setEditingTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");

      const [tasksResponse, projectsResponse] =
        await Promise.all([
          api.get("/tasks"),
          api.get("/projects"),
        ]);

      setTasks(tasksResponse.data.tasks || []);
      setProjects(projectsResponse.data.projects || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load tasks"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingTask(null);
    setShowForm(false);
  };

  const handleAddTask = () => {
    setError("");
    setMessage("");
    setEditingTask(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setError("");
    setMessage("");

    setEditingTask(task);

    setFormData({
      title: task.title || "",
      projectId: String(task.projectId || ""),
      dueDate: formatDateInput(task.dueDate),
      status: task.status || "TODO",
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: formData.title.trim(),
        projectId: Number(formData.projectId),
        dueDate: formData.dueDate,
        status: formData.status,
      };

      if (editingTask) {
        const response = await api.put(
          `/tasks/${editingTask.id}`,
          payload
        );

        setMessage(response.data.message);
      } else {
        const response = await api.post(
          "/tasks",
          payload
        );

        setMessage(response.data.message);
      }

      resetForm();
      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save task"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/tasks/${task.id}`
      );

      setMessage(response.data.message);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete task"
      );
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      setError("");
      setMessage("");

      const payload = {
        title: task.title,
        projectId: task.projectId,
        dueDate: task.dueDate,
        status,
      };

      const response = await api.put(
        `/tasks/${task.id}`,
        payload
      );

      setMessage(response.data.message);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update task status"
      );
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "ALL" || task.status === filter;
    if (!matchesFilter) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (task.title || "").toLowerCase().includes(searchLower) ||
      (task.project?.name || "").toLowerCase().includes(searchLower)
    );
  });

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
            Project Workflow
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Tasks
          </h1>

          <p className="mt-2 text-slate-500">
            Manage project tasks and upcoming deadlines.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks..."
          />
          <button
            type="button"
            onClick={handleAddTask}
            disabled={projects.length === 0}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </header>

      {projects.length === 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create a project before adding tasks.
        </div>
      )}

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

      {showForm && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Link the task to a project and assign a due
                date.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Close task form"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Task Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Build revenue chart"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="projectId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Project
              </label>

              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
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
                htmlFor="dueDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Due Date
              </label>

              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              >
                <option value="TODO">To Do</option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="COMPLETED">
                  Completed
                </option>
              </select>
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? "Saving..."
                  : editingTask
                    ? "Update Task"
                    : "Create Task"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap gap-2">
          {[
            ["ALL", "All"],
            ["TODO", "To Do"],
            ["IN_PROGRESS", "In Progress"],
            ["COMPLETED", "Completed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filter === value
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ListTodo
              size={38}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No tasks found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create a task or select another filter.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => {
              const config =
                statusConfig[task.status] ||
                statusConfig.TODO;

              const StatusIcon = config.icon;

              return (
                <article
                  key={task.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${config.className}`}
                    >
                      <StatusIcon size={14} />
                      {config.label}
                    </span>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(task)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(task)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-slate-950">
                    {task.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {task.project?.name || "Unknown project"}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays size={16} />

                    <span>
                      Due {formatDate(task.dueDate)}
                    </span>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <label
                      htmlFor={`status-${task.id}`}
                      className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                      Update Status
                    </label>

                    <select
                      id={`status-${task.id}`}
                      value={task.status}
                      onChange={(event) =>
                        handleStatusChange(
                          task,
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                    >
                      <option value="TODO">To Do</option>

                      <option value="IN_PROGRESS">
                        In Progress
                      </option>

                      <option value="COMPLETED">
                        Completed
                      </option>
                    </select>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default TasksPage;
import { useCallback, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/TableSkeleton";
import {
  CalendarDays,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../api/api";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

const initialForm = {
  title: "",
  projectId: "",
  dueDate: "",
  status: "TODO",
};

const formatDate = (date) => {
  if (!date) return "No due date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const formatDateInput = (date) => {
  if (!date) return "";
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

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setProjects(projectsRes.data.projects || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingTask(null);
    setShowForm(false);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (task) => {
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

    try {
      const payload = {
        title: formData.title.trim(),
        projectId: Number(formData.projectId),
        dueDate: formData.dueDate,
        status: formData.status,
      };

      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask.id}`, payload);
        toast.success(res.data.message);
      } else {
        const res = await api.post("/tasks", payload);
        toast.success(res.data.message);
      }
      resetForm();
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;

    try {
      const res = await api.delete(`/tasks/${task.id}`);
      toast.success(res.data.message);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete task");
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const payload = {
        title: task.title,
        projectId: task.projectId,
        dueDate: task.dueDate,
        status,
      };
      const res = await api.put(`/tasks/${task.id}`, payload);
      toast.success(res.data.message);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update status");
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

  const columns = [
    {
      header: "Task",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <ListTodo size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-500">{row.project?.name || "Unknown project"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Due Date",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays size={16} className="text-slate-400" />
          <span>{formatDate(row.dueDate)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => {
            e.stopPropagation();
            handleStatusChange(row, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      ),
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage project tasks and upcoming deadlines.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks..."
          />
          <Button
            onClick={handleAddTask}
            disabled={projects.length === 0}
          >
            <Plus size={18} className="mr-2" />
            Add Task
          </Button>
        </div>
      </header>

      {projects.length === 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create a project before adding tasks.
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ["ALL", "All Tasks"],
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
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title={tasks.length === 0 ? "No tasks yet" : "No tasks found"}
            description={tasks.length === 0 ? "Create your first task to stay organized." : "Try adjusting your search terms or filters."}
            action={
              tasks.length === 0 && (
                <Button onClick={handleAddTask} disabled={projects.length === 0}>
                  <Plus size={18} className="mr-2" />
                  Create a task
                </Button>
              )
            }
          />
        ) : (
          <DataTable columns={columns} data={filteredTasks} />
        )}
      </section>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingTask ? "Edit Task" : "Add Task"}
        description="Link the task to a project and assign a due date."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Task Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Build revenue chart"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Project</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</label>
              <input
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
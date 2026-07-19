import { useCallback, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/TableSkeleton";
import {
  Building2,
  FolderKanban,
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
  name: "",
  description: "",
  clientId: "",
  budget: "",
  status: "ACTIVE",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const getBurnRateStyle = (burnRate) => {
  if (burnRate >= 100) return { bar: "bg-rose-500", text: "text-rose-600", track: "bg-rose-100" };
  if (burnRate >= 75) return { bar: "bg-amber-500", text: "text-amber-600", track: "bg-amber-100" };
  return { bar: "bg-emerald-500", text: "text-emerald-600", track: "bg-emerald-100" };
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [burnRates, setBurnRates] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, clientsRes, burnRatesRes] = await Promise.all([
        api.get("/projects"),
        api.get("/clients"),
        api.get("/burn-rates"),
      ]);
      setProjects(projectsRes.data.projects || []);
      setClients(clientsRes.data.clients || []);
      setBurnRates(burnRatesRes.data.burnRates || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load projects");
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
    setEditingProject(null);
    setShowForm(false);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      clientId: String(project.clientId || ""),
      budget: String(project.budget || ""),
      status: project.status || "ACTIVE",
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        clientId: Number(formData.clientId),
        budget: Number(formData.budget),
        status: formData.status,
      };

      if (editingProject) {
        const res = await api.put(`/projects/${editingProject.id}`, payload);
        toast.success(res.data.message);
      } else {
        const res = await api.post("/projects", payload);
        toast.success(res.data.message);
      }
      resetForm();
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(`Delete "${project.name}"?`);
    if (!confirmed) return;

    try {
      const res = await api.delete(`/projects/${project.id}`);
      toast.success(res.data.message);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchQuery.toLowerCase();
    const client = clients.find((c) => c.id === project.clientId);
    return (
      (project.name || "").toLowerCase().includes(searchLower) ||
      (project.status || "").toLowerCase().includes(searchLower) ||
      (client?.name || "").toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      header: "Project",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-500/10 shadow-sm">
            <FolderKanban size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{row.name}</p>
            <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{row.description || "No description"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Client",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Building2 size={16} className="text-slate-400" />
          <span>{row.client?.name || "Unknown"}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Burn Rate",
      render: (row) => {
        const burnRate = burnRates.find((item) => item.id === row.id);
        const burnPercentage = burnRate?.burnRate || 0;
        const burnStyle = getBurnRateStyle(burnPercentage);
        return (
          <div className="w-48 group/progress">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700">{formatCurrency(burnRate?.amountSpent || 0)}</span>
              <span className={burnStyle.text}>{burnPercentage}%</span>
            </div>
            <div className={`h-1.5 w-full overflow-hidden rounded-full ${burnStyle.track}`}>
              <div 
                className={`h-full rounded-full ${burnStyle.bar} transition-all duration-500 ease-out`} 
                style={{ width: `${Math.min(burnPercentage, 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-medium text-slate-400 mt-1.5 opacity-0 group-hover/progress:opacity-100 transition-opacity">Budget: {formatCurrency(row.budget)}</p>
          </div>
        );
      },
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1.5 opacity-80 transition-opacity hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={16} />
          </button>
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
            Projects
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage projects, budgets and track burn rates.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search projects..."
          />
          <Button
            onClick={handleAddProject}
            disabled={clients.length === 0}
          >
            <Plus size={18} className="mr-2" />
            Add Project
          </Button>
        </div>
      </header>

      <section>
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={projects.length === 0 ? "No projects yet" : "No projects found"}
            description={projects.length === 0 ? "Create your first project to start tracking time and billing clients." : "Try adjusting your search terms."}
            action={
              projects.length === 0 && (
                <Button onClick={handleAddProject} disabled={clients.length === 0}>
                  <Plus size={18} className="mr-2" />
                  Add your first project
                </Button>
              )
            }
          />
        ) : (
          <DataTable columns={columns} data={filteredProjects} />
        )}
      </section>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingProject ? "Edit Project" : "Add Project"}
        description="Configure project and budget information."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Project Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Client</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Budget (₹)</label>
            <input
              name="budget"
              type="number"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingProject ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
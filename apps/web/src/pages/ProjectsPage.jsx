import { useCallback, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/TableSkeleton";

import {
  Building2,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import api from "../api/api";

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
  if (burnRate >= 100) {
    return {
      bar: "bg-red-500",
      text: "text-red-700",
      background: "bg-red-50",
    };
  }

  if (burnRate >= 75) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-700",
      background: "bg-amber-50",
    };
  }

  return {
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    background: "bg-emerald-50",
  };
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [burnRates, setBurnRates] = useState([]);

  const [formData, setFormData] = useState(initialForm);

  const [editingProject, setEditingProject] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");

      const [
        projectsResponse,
        clientsResponse,
        burnRatesResponse,
      ] = await Promise.all([
        api.get("/projects"),
        api.get("/clients"),
        api.get("/burn-rates"),
      ]);

      setProjects(
        projectsResponse.data.projects || []
      );

      setClients(
        clientsResponse.data.clients || []
      );

      setBurnRates(
        burnRatesResponse.data.burnRates || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load projects"
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
    setEditingProject(null);
    setShowForm(false);
  };

  const handleAddProject = () => {
    setError("");
    setMessage("");

    setEditingProject(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (project) => {
    setError("");
    setMessage("");

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
    setError("");
    setMessage("");

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        clientId: Number(formData.clientId),
        budget: Number(formData.budget),
        status: formData.status,
      };

      if (editingProject) {
        const response = await api.put(
          `/projects/${editingProject.id}`,
          payload
        );

        setMessage(response.data.message);
      } else {
        const response = await api.post(
          "/projects",
          payload
        );

        setMessage(response.data.message);
      }

      resetForm();

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save project"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/projects/${project.id}`
      );

      setMessage(response.data.message);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete project"
      );
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
            Project CRM
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Projects
          </h1>

          <p className="mt-2 text-slate-500">
            Manage projects, budgets and burn rates.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search projects..."
          />
          <button
            type="button"
            onClick={handleAddProject}
            disabled={clients.length === 0}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Project
          </button>
        </div>
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

      {showForm && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {editingProject
                  ? "Edit Project"
                  : "Add Project"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure project and budget information.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Client
              </label>

              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">
                  Select client
                </option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Budget
              </label>

              <input
                name="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="COMPLETED">
                  Completed
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {submitting
                  ? "Saving..."
                  : editingProject
                    ? "Update Project"
                    : "Create Project"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8">
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FolderKanban
              size={38}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-bold">
              {projects.length === 0 ? "No projects yet" : "No projects found"}
            </h2>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const burnRate = burnRates.find(
                (item) => item.id === project.id
              );

              const burnPercentage =
                burnRate?.burnRate || 0;

              const burnStyle =
                getBurnRateStyle(burnPercentage);

              return (
                <article
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      <FolderKanban size={22} />
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(project)
                        }
                        className="rounded-lg p-2 hover:bg-slate-100"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(project)
                        }
                        className="rounded-lg p-2 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-slate-950">
                    {project.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Building2 size={15} />

                    {project.client?.name}
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    {project.description ||
                      "No description"}
                  </p>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                      <Wallet size={15} />
                      Project Budget
                    </div>

                    <p className="mt-2 text-xl font-bold">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Budget Burn Rate
                        </p>

                        <p
                          className={`mt-2 text-lg font-bold ${burnStyle.text}`}
                        >
                          {burnPercentage}%
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          Tracked Hours
                        </p>

                        <p className="mt-1 font-semibold">
                          {burnRate?.totalHours || 0} hrs
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${burnStyle.bar}`}
                        style={{
                          width: `${Math.min(
                            burnPercentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div
                      className={`mt-4 grid grid-cols-2 gap-3 rounded-xl p-4 ${burnStyle.background}`}
                    >
                      <div>
                        <p className="text-xs text-slate-500">
                          Amount Spent
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {formatCurrency(
                            burnRate?.amountSpent || 0
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Remaining
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {formatCurrency(
                            burnRate?.remainingBudget ??
                              project.budget
                          )}
                        </p>
                      </div>
                    </div>
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

export default ProjectsPage;
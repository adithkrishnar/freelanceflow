import { useCallback, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/TableSkeleton";
import {
  Building2,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  defaultHourlyRate: "",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const ClientsPage = () => {
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingClient, setEditingClient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/clients");

      setClients(response.data.clients);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load clients"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingClient(null);
    setShowForm(false);
  };

  const handleAddClient = () => {
    setError("");
    setMessage("");
    setEditingClient(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setError("");
    setMessage("");

    setEditingClient(client);

    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      defaultHourlyRate: String(
        client.defaultHourlyRate || ""
      ),
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
        ...formData,
        defaultHourlyRate: Number(
          formData.defaultHourlyRate
        ),
      };

      if (editingClient) {
        const response = await api.put(
          `/clients/${editingClient.id}`,
          payload
        );

        setMessage(response.data.message);
      } else {
        const response = await api.post(
          "/clients",
          payload
        );

        setMessage(response.data.message);
      }

      resetForm();
      await fetchClients();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save client"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (client) => {
    const confirmed = window.confirm(
      `Delete ${client.name}? Their projects and related data will also be removed.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/clients/${client.id}`
      );

      setMessage(response.data.message);

      await fetchClients();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete client"
      );
    }
  };

  const freeLimitReached =
    user?.plan === "FREE" && clients.length >= 2;

  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (client.name || "").toLowerCase().includes(searchLower) ||
      (client.company || "").toLowerCase().includes(searchLower) ||
      (client.email || "").toLowerCase().includes(searchLower)
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
            Client CRM
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Clients
          </h1>

          <p className="mt-2 text-slate-500">
            Manage contact details and default hourly rates.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search clients..."
          />
          <button
            type="button"
            onClick={handleAddClient}
            disabled={freeLimitReached}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Client
          </button>
        </div>
      </header>

      {freeLimitReached && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your FREE plan allows a maximum of 2 clients.
          Existing clients can still be edited or deleted.
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
                {editingClient
                  ? "Edit Client"
                  : "Add Client"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the client's business information.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
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
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Client Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Client name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="company"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Company
              </label>

              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="client@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="defaultHourlyRate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Default Hourly Rate
              </label>

              <input
                id="defaultHourlyRate"
                name="defaultHourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.defaultHourlyRate}
                onChange={handleChange}
                required
                placeholder="1000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
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
                  : editingClient
                    ? "Update Client"
                    : "Create Client"}
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
        {filteredClients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Users
              size={38}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              {clients.length === 0 ? "No clients yet" : "No clients found"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {clients.length === 0 ? "Add your first client to create projects." : "Try adjusting your search terms."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => (
              <article
                key={client.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Building2 size={22} />
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(client)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                      aria-label={`Edit ${client.name}`}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(client)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                      aria-label={`Delete ${client.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-950">
                  {client.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {client.company || "Independent client"}
                </p>

                <div className="mt-5 space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail
                        size={16}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {client.email}
                      </span>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone
                        size={16}
                        className="shrink-0"
                      />

                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Default hourly rate
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {formatCurrency(
                      client.defaultHourlyRate
                    )}
                    <span className="text-sm font-normal text-slate-500">
                      {" "}
                      / hour
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClientsPage;
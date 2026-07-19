import { useCallback, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import TableSkeleton from "../components/TableSkeleton";
import {
  Building2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

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

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data.clients);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load clients"
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
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingClient(null);
    setShowForm(false);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      defaultHourlyRate: String(client.defaultHourlyRate || ""),
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        defaultHourlyRate: Number(formData.defaultHourlyRate),
      };

      if (editingClient) {
        const response = await api.put(`/clients/${editingClient.id}`, payload);
        toast.success(response.data.message);
      } else {
        const response = await api.post("/clients", payload);
        toast.success(response.data.message);
      }

      resetForm();
      await fetchClients();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save client"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (client) => {
    const confirmed = window.confirm(
      `Delete ${client.name}? Their projects and related data will also be removed.`
    );
    if (!confirmed) return;

    try {
      const response = await api.delete(`/clients/${client.id}`);
      toast.success(response.data.message);
      await fetchClients();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete client"
      );
    }
  };

  const freeLimitReached = user?.plan === "FREE" && clients.length >= 2;

  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (client.name || "").toLowerCase().includes(searchLower) ||
      (client.company || "").toLowerCase().includes(searchLower) ||
      (client.email || "").toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      header: "Client",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-500/10 shadow-sm">
            <Building2 size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{row.name}</p>
            <p className="text-xs font-medium text-slate-500">{row.company || "Independent"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      render: (row) => (
        <div className="space-y-1.5 text-sm text-slate-600">
          {row.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <span className="font-medium">{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span className="font-medium">{row.phone}</span>
            </div>
          )}
          {!row.email && !row.phone && <span className="text-slate-400 italic">No contact info</span>}
        </div>
      ),
    },
    {
      header: "Rate",
      render: (row) => (
        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
          {formatCurrency(row.defaultHourlyRate)}<span className="text-[10px] font-medium text-slate-500 uppercase">/hr</span>
        </div>
      ),
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
            Clients
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage your client roster and their contact details.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search clients..."
          />
          <Button
            onClick={handleAddClient}
            disabled={freeLimitReached}
          >
            <Plus size={18} className="mr-2" />
            Add Client
          </Button>
        </div>
      </header>

      {freeLimitReached && (
        <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-50 px-4 py-3.5 text-sm text-amber-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="shrink-0 mt-0.5 text-amber-500" size={18} />
          <p className="font-medium">
            Your FREE plan allows a maximum of 2 clients.
            Existing clients can still be edited or deleted. Upgrade to PRO to add unlimited clients.
          </p>
        </div>
      )}

      <section>
        {filteredClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={clients.length === 0 ? "No clients yet" : "No clients found"}
            description={clients.length === 0 ? "Add your first client to start creating projects and tracking time." : "Try adjusting your search terms to find what you're looking for."}
            action={
              clients.length === 0 && (
                <Button onClick={handleAddClient} disabled={freeLimitReached}>
                  <Plus size={18} className="mr-2" />
                  Add your first client
                </Button>
              )
            }
          />
        ) : (
          <DataTable columns={columns} data={filteredClients} />
        )}
      </section>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingClient ? "Edit Client" : "Add Client"}
        description="Enter the client's business information."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">Client Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="company" className="mb-1.5 block text-sm font-semibold text-slate-700">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="client@example.com"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="defaultHourlyRate" className="mb-1.5 block text-sm font-semibold text-slate-700">Default Hourly Rate (₹)</label>
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
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingClient ? "Update Client" : "Create Client"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
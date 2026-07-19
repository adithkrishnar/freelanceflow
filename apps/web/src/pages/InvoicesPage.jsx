import { useCallback, useEffect, useState } from "react";
import TableSkeleton from "../components/TableSkeleton";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Plus,
  ReceiptText,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../api/api";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

const initialForm = {
  clientId: "",
  startDate: "",
  endDate: "",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const InvoicesPage = () => {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [showGenerator, setShowGenerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [clientsRes, invoicesRes] = await Promise.all([
        api.get("/clients"),
        api.get("/invoices"),
      ]);
      setClients(clientsRes.data.clients || []);
      setInvoices(invoicesRes.data.invoices || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load invoices");
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
    setPreview(null);
  };

  const openGenerator = () => {
    setPreview(null);
    setFormData(initialForm);
    setShowGenerator(true);
  };

  const closeGenerator = () => {
    setShowGenerator(false);
    setFormData(initialForm);
    setPreview(null);
  };

  const handlePreview = async (event) => {
    event.preventDefault();
    try {
      setPreviewLoading(true);
      setPreview(null);
      const res = await api.post("/invoices/preview", {
        clientId: Number(formData.clientId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      setPreview(res.data.preview);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to preview invoice");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      setCreating(true);
      const res = await api.post("/invoices", {
        clientId: Number(formData.clientId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      toast.success(res.data.message);
      closeGenerator();
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create invoice");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (invoice, status) => {
    try {
      const res = await api.put(`/invoices/${invoice.id}/status`, { status });
      toast.success(res.data.message);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update status");
    }
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      setDownloadLoading(invoice.id);
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: "blob",
      });
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const data = JSON.parse(text);
          toast.error(data.message || "Unable to download PDF");
        } catch {
          toast.error("Unable to download PDF");
        }
        return;
      }
      toast.error(error.response?.data?.message || "Unable to download PDF");
    } finally {
      setDownloadLoading(null);
    }
  };

  const columns = [
    {
      header: "Invoice",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-500/10 shadow-sm">
            <FileText size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{row.invoiceNumber}</p>
            <p className="text-xs font-medium text-slate-500">{row.client?.name}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Period",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <CalendarDays size={16} className="text-slate-400" />
          <span>{formatDate(row.startDate)} - {formatDate(row.endDate)}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <p className="font-bold text-slate-900">{formatCurrency(row.totalAmount)}</p>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row, e.target.value)}
          className="rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-sm font-semibold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm hover:border-slate-300"
        >
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>
      ),
    },
    {
      header: "Download",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadPdf(row)}
            isLoading={downloadLoading === row.id}
          >
            {!downloadLoading && <Download size={16} className="mr-2 text-slate-500 group-hover:text-slate-700" />}
            PDF
          </Button>
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
            Invoices
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Turn unbilled time into professional client invoices.
          </p>
        </div>

        <Button
          onClick={openGenerator}
          disabled={clients.length === 0}
        >
          <Plus size={18} className="mr-2" />
          Create Invoice
        </Button>
      </header>

      <section>
        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create an invoice from your unbilled time logs."
            action={
              <Button onClick={openGenerator} disabled={clients.length === 0}>
                <Plus size={18} className="mr-2" />
                Create Invoice
              </Button>
            }
          />
        ) : (
          <DataTable columns={columns} data={invoices} />
        )}
      </section>

      <Modal
        isOpen={showGenerator}
        onClose={closeGenerator}
        title="Create Invoice"
        description="Select a client and billing period."
      >
        <form onSubmit={handlePreview} className="space-y-5">
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Date</label>
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">End Date</label>
              <input
                name="endDate"
                type="date"
                min={formData.startDate}
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" isLoading={previewLoading} className="w-full">
              {!previewLoading && <Search size={18} className="mr-2" />}
              {previewLoading ? "Finding Time Logs..." : "Preview Invoice"}
            </Button>
          </div>
        </form>

        {preview && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-xl bg-slate-50/80 p-5 border border-slate-200/80 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Invoice for</p>
                <h3 className="text-lg font-bold text-slate-900">{preview.client?.name}</h3>
                <p className="text-sm font-medium text-slate-500">{preview.client?.company || "Independent client"}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(preview.totalAmount)}</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-4">Project</th>
                    <th className="px-5 py-4">Hours</th>
                    <th className="px-5 py-4">Rate</th>
                    <th className="px-5 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(preview.items || []).map((item) => (
                    <tr key={item.timeLogId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">{item.projectName}</td>
                      <td className="px-5 py-4 font-medium">{Number(item.hours).toFixed(2)}h</td>
                      <td className="px-5 py-4 font-medium">{formatCurrency(item.rate)}</td>
                      <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  {(preview.items || []).length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-5 py-10 text-center">
                        <ReceiptText size={24} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-600 font-medium">No unbilled time logs found</p>
                        <p className="text-xs text-slate-400 mt-1">Try another client or date range.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {(preview.items || []).length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleCreateInvoice} isLoading={creating}>
                  {!creating && <CheckCircle2 size={18} className="mr-2" />}
                  {creating ? "Creating..." : "Generate Invoice"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;
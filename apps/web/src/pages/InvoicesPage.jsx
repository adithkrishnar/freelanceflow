import { useCallback, useEffect, useState } from "react";
import TableSkeleton from "../components/TableSkeleton";

import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  LoaderCircle,
  Plus,
  ReceiptText,
  Search,
  X,
} from "lucide-react";

import api from "../api/api";

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
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getStatusStyle = (status) => {
  if (status === "PAID") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "SENT") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
};

const InvoicesPage = () => {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  const [showGenerator, setShowGenerator] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [creating, setCreating] = useState(false);

  const [statusLoading, setStatusLoading] =
    useState(null);

  const [downloadLoading, setDownloadLoading] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");

      const [clientsResponse, invoicesResponse] =
        await Promise.all([
          api.get("/clients"),
          api.get("/invoices"),
        ]);

      setClients(clientsResponse.data.clients || []);

      setInvoices(
        invoicesResponse.data.invoices || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load invoices"
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

    setPreview(null);
  };

  const openGenerator = () => {
    setError("");
    setMessage("");
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
      setError("");
      setMessage("");
      setPreview(null);

      const response = await api.post(
        "/invoices/preview",
        {
          clientId: Number(formData.clientId),
          startDate: formData.startDate,
          endDate: formData.endDate,
        }
      );

      setPreview(response.data.preview);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to preview invoice"
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await api.post("/invoices", {
        clientId: Number(formData.clientId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      setMessage(response.data.message);

      closeGenerator();

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create invoice"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (
    invoice,
    status
  ) => {
    try {
      setStatusLoading(invoice.id);
      setError("");
      setMessage("");

      const response = await api.put(
        `/invoices/${invoice.id}/status`,
        {
          status,
        }
      );

      setMessage(response.data.message);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update invoice status"
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      setDownloadLoading(invoice.id);
      setError("");
      setMessage("");

      const response = await api.get(
        `/invoices/${invoice.id}/pdf`,
        {
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url =
        window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${invoice.invoiceNumber}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Invoice PDF downloaded successfully");
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();

        try {
          const data = JSON.parse(text);

          setError(
            data.message ||
              "Unable to download invoice PDF"
          );
        } catch {
          setError("Unable to download invoice PDF");
        }

        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to download invoice PDF"
      );
    } finally {
      setDownloadLoading(null);
    }
  };

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
            Financials
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Invoices
          </h1>

          <p className="mt-2 text-slate-500">
            Turn unbilled time into professional client
            invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={openGenerator}
          disabled={clients.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />

          Create Invoice
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

      {showGenerator && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Create Invoice
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a client and billing period.
              </p>
            </div>

            <button
              type="button"
              onClick={closeGenerator}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close invoice generator"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handlePreview}
            className="mt-6 grid gap-5 md:grid-cols-3"
          >
            <div>
              <label
                htmlFor="clientId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Client
              </label>

              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
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
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                name="endDate"
                type="date"
                min={formData.startDate}
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={previewLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {previewLoading ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Search size={18} />
                )}

                {previewLoading
                  ? "Finding Time Logs..."
                  : "Preview Invoice"}
              </button>
            </div>
          </form>

          {preview && (
            <div className="mt-8 border-t border-slate-200 pt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Invoice for
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-950">
                    {preview.client?.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {preview.client?.company ||
                      "Independent client"}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-sm text-slate-500">
                    Invoice Total
                  </p>

                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {formatCurrency(
                      preview.totalAmount
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">
                        Project
                      </th>

                      <th className="px-5 py-4">
                        Description
                      </th>

                      <th className="px-5 py-4">
                        Hours
                      </th>

                      <th className="px-5 py-4">
                        Rate
                      </th>

                      <th className="px-5 py-4">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {(preview.items || []).map(
                      (item) => (
                        <tr key={item.timeLogId}>
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {item.projectName}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.description || "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {Number(
                              item.hours
                            ).toFixed(2)}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatCurrency(item.rate)}
                          </td>

                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {formatCurrency(
                              item.amount
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {(preview.items || []).length === 0 ? (
                <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
                  <ReceiptText
                    size={32}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 font-semibold text-slate-700">
                    No unbilled time logs found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Try another client or date range.
                  </p>
                </div>
              ) : (
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateInvoice}
                    disabled={creating}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {creating ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}

                    {creating
                      ? "Creating Invoice..."
                      : "Create Invoice"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText
              size={38}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No invoices yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create an invoice from your unbilled time.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {invoices.map((invoice) => (
              <article
                key={invoice.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <FileText size={22} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </div>

                <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {invoice.invoiceNumber}
                </p>

                <h2 className="mt-2 text-lg font-bold text-slate-950">
                  {invoice.client?.name}
                </h2>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} />

                  <span>
                    {formatDate(invoice.startDate)}
                    {" — "}
                    {formatDate(invoice.endDate)}
                  </span>
                </div>

                <p className="mt-6 text-2xl font-bold text-slate-950">
                  {formatCurrency(invoice.totalAmount)}
                </p>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <label
                    htmlFor={`invoice-status-${invoice.id}`}
                    className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    Invoice Status
                  </label>

                  <select
                    id={`invoice-status-${invoice.id}`}
                    value={invoice.status}
                    disabled={
                      statusLoading === invoice.id
                    }
                    onChange={(event) =>
                      handleStatusChange(
                        invoice,
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:opacity-60"
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="SENT">
                      Sent
                    </option>

                    <option value="PAID">
                      Paid
                    </option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadPdf(invoice)
                    }
                    disabled={
                      downloadLoading === invoice.id
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadLoading === invoice.id ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Download size={17} />
                    )}

                    {downloadLoading === invoice.id
                      ? "Generating PDF..."
                      : "Download PDF"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default InvoicesPage;
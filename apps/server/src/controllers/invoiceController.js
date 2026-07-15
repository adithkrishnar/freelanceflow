import prisma from "../config/prisma.js";

import {
  generateInvoicePdf,
} from "../utils/invoicePdf.js";

const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

const buildInvoicePreview = (timeLogs, client) => {
  const items = timeLogs.map((timeLog) => {
    const hours =
      Number(timeLog.duration || 0) / 3600;

    const rate = Number(
      timeLog.hourlyRate ||
        client.defaultHourlyRate ||
        0
    );

    const amount = hours * rate;

    return {
      timeLogId: timeLog.id,
      projectName: timeLog.project.name,
      description: timeLog.description,
      hours: Number(hours.toFixed(2)),
      rate: Number(rate.toFixed(2)),
      amount: Number(amount.toFixed(2)),
    };
  });

  const totalAmount = items.reduce(
    (total, item) => total + item.amount,
    0
  );

  return {
    client,
    items,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
};

export const previewInvoice = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      clientId,
      startDate,
      endDate,
    } = req.body;

    if (!clientId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Client, start date and end date are required",
      });
    }

    const { start, end } = getDateRange(
      startDate,
      endDate
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      return res.status(400).json({
        message: "Invalid billing date range",
      });
    }

    const client = await prisma.client.findFirst({
      where: {
        id: Number(clientId),
        userId,
      },
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId,
        billed: false,
        endTime: {
          not: null,
        },
        startTime: {
          gte: start,
          lte: end,
        },
        project: {
          clientId: client.id,
          userId,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const preview = buildInvoicePreview(
      timeLogs,
      client
    );

    return res.status(200).json({
      success: true,
      preview,
    });
  } catch (error) {
    console.error("Preview invoice error:", error);

    return res.status(500).json({
      message: "Unable to preview invoice",
    });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      clientId,
      startDate,
      endDate,
    } = req.body;

    if (!clientId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Client, start date and end date are required",
      });
    }

    const { start, end } = getDateRange(
      startDate,
      endDate
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      return res.status(400).json({
        message: "Invalid billing date range",
      });
    }

    const client = await prisma.client.findFirst({
      where: {
        id: Number(clientId),
        userId,
      },
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId,
        billed: false,
        endTime: {
          not: null,
        },
        startTime: {
          gte: start,
          lte: end,
        },
        project: {
          clientId: client.id,
          userId,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    if (timeLogs.length === 0) {
      return res.status(400).json({
        message: "No unbilled time logs found",
      });
    }

    const preview = buildInvoicePreview(
      timeLogs,
      client
    );

    const invoice = await prisma.$transaction(
      async (tx) => {
        const invoiceCount = await tx.invoice.count({
          where: {
            userId,
          },
        });

        const invoiceNumber = `INV-${String(
          invoiceCount + 1
        ).padStart(5, "0")}`;

        const createdInvoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            clientId: client.id,
            userId,
            startDate: start,
            endDate: end,
            totalAmount: preview.totalAmount,
            items: {
              create: preview.items.map((item) => ({
                timeLogId: item.timeLogId,
                hours: item.hours,
                rate: item.rate,
                amount: item.amount,
              })),
            },
          },
          include: {
            client: true,
            items: true,
          },
        });

        await tx.timeLog.updateMany({
          where: {
            id: {
              in: preview.items.map(
                (item) => item.timeLogId
              ),
            },
            userId,
            billed: false,
          },
          data: {
            billed: true,
          },
        });

        return createdInvoice;
      }
    );

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    return res.status(500).json({
      message: "Unable to create invoice",
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Get invoices error:", error);

    return res.status(500).json({
      message: "Unable to load invoices",
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      include: {
        client: true,
        items: {
          include: {
            timeLog: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Get invoice error:", error);

    return res.status(500).json({
      message: "Unable to load invoice",
    });
  }
};

export const updateInvoiceStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "PAID",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid invoice status",
      });
    }

    const existingInvoice =
      await prisma.invoice.findFirst({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
      });

    if (!existingInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const invoice = await prisma.invoice.update({
      where: {
        id: existingInvoice.id,
      },
      data: {
        status,
      },
      include: {
        client: true,
        items: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      invoice,
    });
  } catch (error) {
    console.error(
      "Update invoice status error:",
      error
    );

    return res.status(500).json({
      message: "Unable to update invoice status",
    });
  }
};

export const downloadInvoicePdf = async (
  req,
  res
) => {
  try {
    if (req.user.plan !== "PRO") {
      return res.status(403).json({
        message:
          "PDF invoicing is available on the Pro plan",
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      include: {
        client: true,
        items: {
          include: {
            timeLog: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    generateInvoicePdf(invoice, req.user, res);
  } catch (error) {
    console.error(
      "Download invoice PDF error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Unable to generate invoice PDF",
      });
    }
  }
};
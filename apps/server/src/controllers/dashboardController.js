import prisma from "../config/prisma.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();

    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);

    const [
      activeProjects,
      pendingInvoices,
      upcomingDeadlines,
      paidInvoices,
    ] = await Promise.all([
      prisma.project.count({
        where: {
          userId,
          status: "ACTIVE",
        },
      }),

      prisma.invoice.findMany({
        where: {
          userId,
          status: {
            in: ["DRAFT", "SENT"],
          },
        },
        select: {
          id: true,
          totalAmount: true,
          status: true,
        },
      }),

      prisma.task.findMany({
        where: {
          userId,
          status: {
            not: "COMPLETED",
          },
          dueDate: {
            gte: now,
            lte: upcomingDate,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
        take: 5,
      }),

      prisma.invoice.findMany({
        where: {
          userId,
          status: "PAID",
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    const outstandingPayments = pendingInvoices.reduce(
      (total, invoice) =>
        total + Number(invoice.totalAmount || 0),
      0
    );

    const revenueByMonth = {};

    paidInvoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);

      const monthKey = new Intl.DateTimeFormat(
        "en-IN",
        {
          month: "short",
          year: "numeric",
        }
      ).format(date);

      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = 0;
      }

      revenueByMonth[monthKey] += Number(
        invoice.totalAmount || 0
      );
    });

    const monthlyRevenue = Object.entries(
      revenueByMonth
    ).map(([month, revenue]) => ({
      month,
      revenue: Number(revenue.toFixed(2)),
    }));

    return res.status(200).json({
      success: true,

      dashboard: {
        activeProjects,

        pendingInvoices: pendingInvoices.length,

        outstandingPayments: Number(
          outstandingPayments.toFixed(2)
        ),

        upcomingDeadlines,

        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      message: "Unable to load dashboard",
    });
  }
};
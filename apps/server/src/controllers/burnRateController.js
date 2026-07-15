import prisma from "../config/prisma.js";

export const getProjectBurnRates = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            defaultHourlyRate: true,
          },
        },
        timeLogs: {
          where: {
            endTime: {
              not: null,
            },
          },
          select: {
            duration: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const burnRates = projects.map((project) => {
      const totalSeconds = project.timeLogs.reduce(
        (total, timeLog) => {
          return total + Number(timeLog.duration || 0);
        },
        0
      );

      const totalHours = totalSeconds / 3600;

      const hourlyRate = Number(
        project.client?.defaultHourlyRate || 0
      );

      const budget = Number(project.budget || 0);

      const amountSpent = totalHours * hourlyRate;

      const burnRate =
        budget > 0
          ? (amountSpent / budget) * 100
          : 0;

      const remainingBudget = Math.max(
        0,
        budget - amountSpent
      );

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        budget,
        client: project.client,
        totalHours: Number(totalHours.toFixed(2)),
        hourlyRate,
        amountSpent: Number(amountSpent.toFixed(2)),
        remainingBudget: Number(
          remainingBudget.toFixed(2)
        ),
        burnRate: Number(burnRate.toFixed(2)),
      };
    });

    return res.status(200).json({
      burnRates,
    });
  } catch (error) {
    console.error(
      "Get project burn rates error:",
      error
    );

    return res.status(500).json({
      message: "Unable to calculate project burn rates",
    });
  }
};
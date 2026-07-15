import prisma from "../config/prisma.js";

export const loadSampleData = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingSampleClient =
      await prisma.client.findFirst({
        where: {
          userId,
          email: "arjun@northstar.example",
        },
      });

    if (existingSampleClient) {
      return res.status(400).json({
        success: false,
        message: "Sample data has already been loaded",
      });
    }

    const clientCount = await prisma.client.count({
      where: {
        userId,
      },
    });

    if (
      req.user.plan === "FREE" &&
      clientCount > 0
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Load sample data on an empty FREE workspace because the FREE plan supports a maximum of 2 clients.",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const clientOne = await tx.client.create({
          data: {
            name: "Arjun Mehta",
            email: "arjun@northstar.example",
            company: "Northstar Digital",
            phone: "+91 98765 43210",
            defaultHourlyRate: 1500,
            userId,
          },
        });

        const clientTwo = await tx.client.create({
          data: {
            name: "Priya Sharma",
            email: "priya@pixelcraft.example",
            company: "PixelCraft Studio",
            phone: "+91 91234 56789",
            defaultHourlyRate: 1200,
            userId,
          },
        });

        const projectOne = await tx.project.create({
          data: {
            name: "SaaS Dashboard",
            description:
              "Analytics dashboard and reporting platform",
            budget: 75000,
            status: "ACTIVE",
            clientId: clientOne.id,
            userId,
          },
        });

        const projectTwo = await tx.project.create({
          data: {
            name: "E-Commerce Redesign",
            description:
              "Modern storefront and checkout redesign",
            budget: 50000,
            status: "ACTIVE",
            clientId: clientTwo.id,
            userId,
          },
        });

        const now = new Date();

        const deadlineOne = new Date(now);
        deadlineOne.setDate(deadlineOne.getDate() + 3);

        const deadlineTwo = new Date(now);
        deadlineTwo.setDate(deadlineTwo.getDate() + 6);

        await tx.task.createMany({
          data: [
            {
              title: "Complete analytics widgets",
              description:
                "Finish revenue and project widgets",
              status: "TODO",
              dueDate: deadlineOne,
              projectId: projectOne.id,
              userId,
            },
            {
              title: "Review checkout screens",
              description:
                "Complete final checkout UI review",
              status: "IN_PROGRESS",
              dueDate: deadlineTwo,
              projectId: projectTwo.id,
              userId,
            },
          ],
        });

        const firstStart = new Date(now);

        firstStart.setDate(
          firstStart.getDate() - 2
        );

        firstStart.setHours(9, 0, 0, 0);

        const firstEnd = new Date(firstStart);

        firstEnd.setHours(12, 0, 0, 0);

        const secondStart = new Date(now);

        secondStart.setDate(
          secondStart.getDate() - 1
        );

        secondStart.setHours(10, 0, 0, 0);

        const secondEnd = new Date(secondStart);

        secondEnd.setHours(14, 0, 0, 0);

        await tx.timeLog.createMany({
          data: [
            {
              description: "Dashboard development",
              startTime: firstStart,
              endTime: firstEnd,
              duration: 10800,
              hourlyRate: 1500,
              billed: false,
              projectId: projectOne.id,
              userId,
            },
            {
              description: "Checkout redesign",
              startTime: secondStart,
              endTime: secondEnd,
              duration: 14400,
              hourlyRate: 1200,
              billed: false,
              projectId: projectTwo.id,
              userId,
            },
          ],
        });

        return {
          clients: 2,
          projects: 2,
          tasks: 2,
          timeLogs: 2,
        };
      }
    );

    return res.status(201).json({
      success: true,
      message: "Sample data loaded successfully",
      result,
    });
  } catch (error) {
    console.error("Load sample data error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load sample data",
    });
  }
};
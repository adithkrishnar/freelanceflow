import prisma from "../config/prisma.js";

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getOwnedProject = async (projectId, userId) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    include: {
      client: {
        select: {
          defaultHourlyRate: true,
        },
      },
    },
  });
};

export const startTimer = async (req, res) => {
  try {
    const { projectId, description } = req.body;

    const parsedProjectId = parseId(projectId);

    if (!parsedProjectId) {
      return res.status(400).json({
        success: false,
        message: "Valid project ID is required",
      });
    }

    const activeTimer = await prisma.timeLog.findFirst({
      where: {
        userId: req.user.id,
        endTime: null,
      },
    });

    if (activeTimer) {
      return res.status(409).json({
        success: false,
        message: "A timer is already running",
        timeLog: activeTimer,
      });
    }

    const project = await getOwnedProject(
      parsedProjectId,
      req.user.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        description: description?.trim() || null,
        startTime: new Date(),
        hourlyRate: project.client.defaultHourlyRate,
        projectId: parsedProjectId,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Timer started",
      timeLog,
    });
  } catch (error) {
    console.error("Start timer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start timer",
    });
  }
};

export const stopTimer = async (req, res) => {
  try {
    const timeLogId = parseId(req.params.id);

    if (!timeLogId) {
      return res.status(400).json({
        success: false,
        message: "Invalid time log ID",
      });
    }

    const timeLog = await prisma.timeLog.findFirst({
      where: {
        id: timeLogId,
        userId: req.user.id,
      },
    });

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    if (timeLog.endTime) {
      return res.status(400).json({
        success: false,
        message: "Timer has already been stopped",
      });
    }

    const endTime = new Date();

    const duration = Math.max(
      0,
      Math.floor(
        (endTime.getTime() - timeLog.startTime.getTime()) /
          1000
      )
    );

    const updatedTimeLog = await prisma.timeLog.update({
      where: {
        id: timeLog.id,
      },
      data: {
        endTime,
        duration,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Timer stopped",
      timeLog: updatedTimeLog,
    });
  } catch (error) {
    console.error("Stop timer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to stop timer",
    });
  }
};

export const getActiveTimer = async (req, res) => {
  try {
    const timeLog = await prisma.timeLog.findFirst({
      where: {
        userId: req.user.id,
        endTime: null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      timeLog,
    });
  } catch (error) {
    console.error("Get active timer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch active timer",
    });
  }
};

export const createManualTimeLog = async (req, res) => {
  try {
    const {
      projectId,
      description,
      startTime,
      hours,
    } = req.body;

    const parsedProjectId = parseId(projectId);
    const parsedHours = Number(hours);

    if (!parsedProjectId) {
      return res.status(400).json({
        success: false,
        message: "Valid project ID is required",
      });
    }

    if (
      !Number.isFinite(parsedHours) ||
      parsedHours <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Hours must be greater than 0",
      });
    }

    const parsedStartTime = new Date(startTime);

    if (
      !startTime ||
      Number.isNaN(parsedStartTime.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid start time is required",
      });
    }

    const project = await getOwnedProject(
      parsedProjectId,
      req.user.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const duration = Math.round(parsedHours * 60 * 60);

    const endTime = new Date(
      parsedStartTime.getTime() + duration * 1000
    );

    const timeLog = await prisma.timeLog.create({
      data: {
        description: description?.trim() || null,
        startTime: parsedStartTime,
        endTime,
        duration,
        hourlyRate: project.client.defaultHourlyRate,
        projectId: parsedProjectId,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Time entry added successfully",
      timeLog,
    });
  } catch (error) {
    console.error("Manual time log error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add time entry",
    });
  }
};

export const getTimeLogs = async (req, res) => {
  try {
    const { projectId } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (projectId !== undefined) {
      const parsedProjectId = parseId(projectId);

      if (!parsedProjectId) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      where.projectId = parsedProjectId;
    }

    const timeLogs = await prisma.timeLog.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      timeLogs,
    });
  } catch (error) {
    console.error("Get time logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch time logs",
    });
  }
};

export const deleteTimeLog = async (req, res) => {
  try {
    const timeLogId = parseId(req.params.id);

    if (!timeLogId) {
      return res.status(400).json({
        success: false,
        message: "Invalid time log ID",
      });
    }

    const timeLog = await prisma.timeLog.findFirst({
      where: {
        id: timeLogId,
        userId: req.user.id,
      },
    });

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    if (timeLog.billed) {
      return res.status(400).json({
        success: false,
        message: "Billed time logs cannot be deleted",
      });
    }

    await prisma.timeLog.delete({
      where: {
        id: timeLog.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Time log deleted successfully",
    });
  } catch (error) {
    console.error("Delete time log error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete time log",
    });
  }
};

export const getProjectTimeSummary = async (req, res) => {
  try {
    const projectId = parseId(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await getOwnedProject(
      projectId,
      req.user.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const timeLogs = await prisma.timeLog.findMany({
      where: {
        projectId,
        userId: req.user.id,
        endTime: {
          not: null,
        },
        duration: {
          not: null,
        },
      },
      select: {
        duration: true,
        hourlyRate: true,
      },
    });

    let totalSeconds = 0;
    let amountSpent = 0;

    for (const timeLog of timeLogs) {
      const duration = timeLog.duration ?? 0;
      const hours = duration / 3600;

      totalSeconds += duration;
      amountSpent +=
        hours * Number(timeLog.hourlyRate);
    }

    const totalHours = totalSeconds / 3600;
    const budget = Number(project.budget);

    const burnRate =
      budget > 0 ? (amountSpent / budget) * 100 : 0;

    return res.status(200).json({
      success: true,
      summary: {
        projectId: project.id,
        projectName: project.name,
        totalHours: Number(totalHours.toFixed(2)),
        amountSpent: Number(amountSpent.toFixed(2)),
        budget,
        burnRate: Number(burnRate.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Project time summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate project summary",
    });
  }
};
import prisma from "../config/prisma.js";

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
];

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      dueDate,
      projectId,
    } = req.body;

    if (!title?.trim() || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title and project ID are required",
      });
    }

    const parsedProjectId = parseId(projectId);

    if (!parsedProjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (
      status !== undefined &&
      !TASK_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    let parsedDueDate = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }
    }

    const project = await prisma.project.findFirst({
      where: {
        id: parsedProjectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || "TODO",
        dueDate: parsedDueDate,
        projectId: parsedProjectId,
        userId: req.user.id,
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

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create task",
    });
  }
};

export const getTasks = async (req, res) => {
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

      const project = await prisma.project.findFirst({
        where: {
          id: parsedProjectId,
          userId: req.user.id,
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      where.projectId = parsedProjectId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tasks",
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const taskId = parseId(req.params.id);

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: req.user.id,
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

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch task",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const taskId = parseId(req.params.id);

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: req.user.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const {
      title,
      description,
      status,
      dueDate,
      projectId,
    } = req.body;

    const updateData = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }

      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description =
        description?.trim() || null;
    }

    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }

      updateData.status = status;
    }

    if (dueDate !== undefined) {
      if (!dueDate) {
        updateData.dueDate = null;
      } else {
        const parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid due date",
          });
        }

        updateData.dueDate = parsedDueDate;
      }
    }

    if (projectId !== undefined) {
      const parsedProjectId = parseId(projectId);

      if (!parsedProjectId) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const project = await prisma.project.findFirst({
        where: {
          id: parsedProjectId,
          userId: req.user.id,
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      updateData.projectId = parsedProjectId;
    }

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
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
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const taskId = parseId(req.params.id);

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete task",
    });
  }
};
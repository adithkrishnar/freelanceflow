import prisma from "../config/prisma.js";

import {
  findOwnedClient,
  findOwnedProject,
} from "../utils/ownership.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        client: true,
        _count: {
          select: {
            tasks: true,
            timeLogs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Unable to load projects",
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      include: {
        client: true,
        tasks: true,
        timeLogs: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      message: "Unable to load project",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      description,
      budget,
      status,
      clientId,
    } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({
        message: "Project name and client are required",
      });
    }

    const client = await findOwnedClient(
      clientId,
      userId
    );

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        budget: Number(budget || 0),
        status: status || "ACTIVE",
        clientId: client.id,
        userId,
      },
      include: {
        client: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      message: "Unable to create project",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const userId = req.user.id;

    const project = await findOwnedProject(
      req.params.id,
      userId
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const {
      name,
      description,
      budget,
      status,
      clientId,
    } = req.body;

    let ownedClient = null;

    if (clientId !== undefined) {
      ownedClient = await findOwnedClient(
        clientId,
        userId
      );

      if (!ownedClient) {
        return res.status(404).json({
          message: "Client not found",
        });
      }
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        name:
          name !== undefined
            ? name.trim()
            : project.name,

        description:
          description !== undefined
            ? description?.trim() || null
            : project.description,

        budget:
          budget !== undefined
            ? Number(budget)
            : project.budget,

        status:
          status !== undefined
            ? status
            : project.status,

        clientId:
          ownedClient?.id || project.clientId,
      },
      include: {
        client: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      message: "Unable to update project",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await findOwnedProject(
      req.params.id,
      req.user.id
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await prisma.project.delete({
      where: {
        id: project.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message:
        "Unable to delete project. Remove related data first.",
    });
  }
};
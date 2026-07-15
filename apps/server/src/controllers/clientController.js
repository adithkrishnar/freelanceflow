import prisma from "../config/prisma.js";

export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Get clients error:", error);

    return res.status(500).json({
      message: "Unable to load clients",
    });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      include: {
        projects: true,
      },
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("Get client error:", error);

    return res.status(500).json({
      message: "Unable to load client",
    });
  }
};

export const createClient = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      company,
      phone,
      defaultHourlyRate,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    if (req.user.plan === "FREE") {
      const clientCount = await prisma.client.count({
        where: {
          userId,
        },
      });

      if (clientCount >= 2) {
        return res.status(403).json({
          message:
            "Free plan allows a maximum of 2 clients. Upgrade to Pro for unlimited clients.",
        });
      }
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        defaultHourlyRate: Number(
          defaultHourlyRate || 0
        ),
        userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    console.error("Create client error:", error);

    return res.status(500).json({
      message: "Unable to create client",
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    const existingClient =
      await prisma.client.findFirst({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
      });

    if (!existingClient) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const {
      name,
      email,
      company,
      phone,
      defaultHourlyRate,
    } = req.body;

    const client = await prisma.client.update({
      where: {
        id: existingClient.id,
      },
      data: {
        name:
          name !== undefined
            ? name.trim()
            : existingClient.name,

        email:
          email !== undefined
            ? email.trim().toLowerCase()
            : existingClient.email,

        company:
          company !== undefined
            ? company?.trim() || null
            : existingClient.company,

        phone:
          phone !== undefined
            ? phone?.trim() || null
            : existingClient.phone,

        defaultHourlyRate:
          defaultHourlyRate !== undefined
            ? Number(defaultHourlyRate)
            : existingClient.defaultHourlyRate,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("Update client error:", error);

    return res.status(500).json({
      message: "Unable to update client",
    });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    await prisma.client.delete({
      where: {
        id: client.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client error:", error);

    return res.status(500).json({
      message:
        "Unable to delete client. Remove related business data first.",
    });
  }
};
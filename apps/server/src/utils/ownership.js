import prisma from "../config/prisma.js";

export const findOwnedClient = async (clientId, userId) => {
  return prisma.client.findFirst({
    where: {
      id: Number(clientId),
      userId,
    },
  });
};

export const findOwnedProject = async (
  projectId,
  userId
) => {
  return prisma.project.findFirst({
    where: {
      id: Number(projectId),
      userId,
    },
  });
};

export const findOwnedTask = async (taskId, userId) => {
  return prisma.task.findFirst({
    where: {
      id: Number(taskId),
      userId,
    },
  });
};

export const findOwnedTimeLog = async (
  timeLogId,
  userId
) => {
  return prisma.timeLog.findFirst({
    where: {
      id: Number(timeLogId),
      userId,
    },
  });
};

export const findOwnedInvoice = async (
  invoiceId,
  userId
) => {
  return prisma.invoice.findFirst({
    where: {
      id: Number(invoiceId),
      userId,
    },
  });
};
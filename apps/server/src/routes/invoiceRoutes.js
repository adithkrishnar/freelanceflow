import express from "express";

import {
  createInvoice,
  downloadInvoicePdf,
  getInvoiceById,
  getInvoices,
  previewInvoice,
  updateInvoiceStatus,
} from "../controllers/invoiceController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/preview", previewInvoice);

router.post("/", createInvoice);

router.get("/", getInvoices);

router.get("/:id/pdf", downloadInvoicePdf);

router.get("/:id", getInvoiceById);

router.put("/:id/status", updateInvoiceStatus);

export default router;
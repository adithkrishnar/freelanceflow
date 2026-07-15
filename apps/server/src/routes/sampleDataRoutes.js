import express from "express";

import {
  loadSampleData,
} from "../controllers/sampleDataController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", loadSampleData);

export default router;
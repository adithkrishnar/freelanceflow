import express from "express";

import {
  getProjectBurnRates,
} from "../controllers/burnRateController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getProjectBurnRates);

export default router;
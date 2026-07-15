import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  startTimer,
  stopTimer,
  getActiveTimer,
  createManualTimeLog,
  getTimeLogs,
  deleteTimeLog,
  getProjectTimeSummary,
} from "../controllers/timeLogController.js";

const router = express.Router();

router.use(protect);

router.post("/start", startTimer);
router.put("/:id/stop", stopTimer);

router.get("/active", getActiveTimer);

router.post("/manual", createManualTimeLog);
router.get("/", getTimeLogs);
router.delete("/:id", deleteTimeLog);

router.get(
  "/project/:projectId/summary",
  getProjectTimeSummary
);

export default router;
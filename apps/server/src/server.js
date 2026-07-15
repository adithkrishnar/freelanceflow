import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import timeLogRoutes from "./routes/timeLogRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sampleDataRoutes from "./routes/sampleDataRoutes.js";
import burnRateRoutes from "./routes/burnRateRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "FreelanceFlow API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/clients", clientRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/time-logs", timeLogRoutes);

app.use("/api/invoices", invoiceRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/sample-data", sampleDataRoutes);

app.use("/api/burn-rates", burnRateRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `FreelanceFlow server running on port ${PORT}`
  );
});
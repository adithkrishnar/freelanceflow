import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { TimerProvider } from "./context/TimerContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <App />

          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            toastOptions={{
              duration: 3000,
              style: {
                background: "#0f172a",
                color: "#ffffff",
                borderRadius: "12px",
                fontSize: "14px",
                padding: "14px 18px",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
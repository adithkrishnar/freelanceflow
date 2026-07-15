import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/api";

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateElapsed = useCallback((startTime) => {
    if (!startTime) {
      return 0;
    }

    const start = new Date(startTime).getTime();
    const now = Date.now();

    return Math.max(0, Math.floor((now - start) / 1000));
  }, []);

  const fetchActiveTimer = useCallback(async () => {
    try {
      const response = await api.get("/time-logs/active");
      const timer = response.data.timeLog || null;

      setActiveTimer(timer);

      setElapsedSeconds(
        timer ? calculateElapsed(timer.startTime) : 0
      );
    } catch (error) {
      console.error("Fetch active timer error:", error);
      setActiveTimer(null);
      setElapsedSeconds(0);
    } finally {
      setLoading(false);
    }
  }, [calculateElapsed]);

  useEffect(() => {
    fetchActiveTimer();
  }, [fetchActiveTimer]);

  useEffect(() => {
    if (!activeTimer) {
      setElapsedSeconds(0);
      return undefined;
    }

    setElapsedSeconds(
      calculateElapsed(activeTimer.startTime)
    );

    const interval = window.setInterval(() => {
      setElapsedSeconds(
        calculateElapsed(activeTimer.startTime)
      );
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeTimer, calculateElapsed]);

  const startTimer = async (projectId, description) => {
    const response = await api.post("/time-logs/start", {
      projectId: Number(projectId),
      description,
    });

    setActiveTimer(response.data.timeLog);
    setElapsedSeconds(0);

    return response.data;
  };

  const stopTimer = async () => {
    if (!activeTimer) {
      return null;
    }

    const response = await api.put(
      `/time-logs/${activeTimer.id}/stop`
    );

    setActiveTimer(null);
    setElapsedSeconds(0);

    return response.data;
  };

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        elapsedSeconds,
        loading,
        startTimer,
        stopTimer,
        refreshTimer: fetchActiveTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);

  if (!context) {
    throw new Error(
      "useTimer must be used inside TimerProvider"
    );
  }

  return context;
};

export default TimerContext;
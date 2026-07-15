import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem(
        "freelanceflow_token"
      );

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data.user);
      } catch {
        localStorage.removeItem(
          "freelanceflow_token"
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = (token, authenticatedUser) => {
    localStorage.setItem(
      "freelanceflow_token",
      token
    );

    setUser(authenticatedUser);
  };

  const logout = () => {
    localStorage.removeItem(
      "freelanceflow_token"
    );

    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;
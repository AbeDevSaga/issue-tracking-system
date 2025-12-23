// src/contexts/AuthContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLoginMutation, useLogoutMutation } from "../redux/services/authApi";
import {
  AuthContextType,
  AuthResponse,
  LoginCredentials,
  User,
} from "../types/auth";
import { useIdleLogout } from "../hooks/useIdleLogout";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  // ✅ Idle logout handles inactivity
  useIdleLogout(token);

  // 🔁 Restore session
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);

      const response = await loginMutation(credentials).unwrap();
      setUser(response.user);
      setToken(response.token);

      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      return response;
    } catch (err: any) {
      const message = err.data?.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap();
    } catch {}

    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // window.location.replace("/login");
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    clearError: () => setError(null),
    isAuthenticated: !!user && !!token,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
    hasRole: () => false,
    updateProfile: async () => {
      throw new Error("Not implemented");
    },
    register: async () => {
      throw new Error("Not implemented");
    },
    changePassword: async () => {
      throw new Error("Not implemented");
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#269A99] border-r-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

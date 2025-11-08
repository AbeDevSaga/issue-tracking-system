// src/contexts/AuthContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLoginMutation, useLogoutMutation } from "../redux/services/authApi"; // ✅ RTK Query hooks
import {
  AuthContextType,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// --- Hook for easy access ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// --- Provider Implementation ---
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // RTK Query hooks
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  // --- Permission & Role Helpers ---
  const hasPermission = (permission: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some((role) =>
      role.role?.subRoles.some((sub) =>
        sub.permissions.some((perm) => perm.action === permission)
      )
    );
  };

  const hasAnyPermission = (permissions: string[]): boolean =>
    permissions.some((p) => hasPermission(p));

  const hasAllPermissions = (permissions: string[]): boolean =>
    permissions.every((p) => hasPermission(p));

  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some((r) => r.role?.name === roleName);
  };

  // --- Initialize Auth from localStorage ---
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log("AuthContext: Session restored from localStorage");
      }
    } catch (err) {
      console.error("AuthContext: Failed to restore session", err);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Login ---
  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);

      const response = await loginMutation(credentials).unwrap();
      const { token: authToken, user: userData } = response;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return response;
    } catch (err: any) {
      const message = err.data?.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Register (if available) ---
  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    // You can integrate registration API similarly if needed
    throw new Error("Register not implemented yet");
  };

  // --- Logout ---
  const logout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap();
    } catch {
      console.warn("AuthContext: Logout request failed, clearing anyway");
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  };

  // --- Profile Update (if backend supports it) ---
  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    const updatedUser = { ...user, ...profileData } as User;
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  };

  const changePassword = async (_: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> => {
    throw new Error("Change password not implemented yet");
  };

  const clearError = (): void => setError(null);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user && !!token,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

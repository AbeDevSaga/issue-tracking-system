// src/contexts/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { AuthContextType, AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  // Check if user has specific role
  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = (): void => {
      try {
        console.log("AuthProvider: Initializing auth from localStorage");
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        console.log("AuthProvider: Stored token found:", !!storedToken);
        console.log("AuthProvider: Stored user found:", !!storedUser);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log("AuthProvider: Auth state restored from localStorage");
        } else {
          console.log("AuthProvider: No stored auth data found");
        }
      } catch (error) {
        console.error("AuthProvider: Error initializing auth:", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
        console.log("AuthProvider: Initialization complete, loading set to false");
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);
      console.log("AuthContext: Starting login process");
      // map app's LoginCredentials { user_name, password } to API expected { email, password }
      const payload = { email: (credentials as any).email ?? credentials.user_name, password: credentials.password };
      const response = await authAPI.login(payload);
      console.log("AuthContext: API response received", response.data);
      
      const { user: userData, access_token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log("AuthContext: User and token stored in localStorage");
      console.log("AuthContext: user set to", userData.name);
      console.log("AuthContext: token set to", authToken ? "YES" : "NO");

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      console.error("AuthContext: Login error", message);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = (): void => {
    console.log("AuthContext: Logging out");
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log("AuthContext: Logout complete");
  };

  const updateProfile = async (profileData: Partial<User>): Promise<any> => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(profileData);

      const updatedUser = { ...user, ...profileData } as User;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  };

  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }): Promise<any> => {
    try {
      setError(null);
      const response = await authAPI.changePassword(passwordData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password change failed';
      setError(message);
      throw new Error(message);
    }
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

  console.log("AuthProvider: Rendering with state:", { 
    user: user?.name, 
    isAuthenticated: !!user && !!token,
    loading,
    permissions: user?.permissions?.length || 0
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
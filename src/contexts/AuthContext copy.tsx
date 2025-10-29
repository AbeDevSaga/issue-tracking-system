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

  // Initialize auth state from localStorage - SIMPLIFIED VERSION
  useEffect(() => {
    const initializeAuth = (): void => {
      try {
        console.log("AuthProvider: Initializing auth from localStorage");
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        console.log("AuthProvider: Stored token found:", !!storedToken);
        console.log("AuthProvider: Stored user found:", !!storedUser);

        if (storedToken && storedUser) {
          // Set state immediately from localStorage
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log("AuthProvider: Auth state restored from localStorage");
        } else {
          console.log("AuthProvider: No stored auth data found");
        }
      } catch (error) {
        console.error("AuthProvider: Error initializing auth:", error);
        // Clear corrupted data
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
      
      const response = await authAPI.login(credentials);
      console.log("AuthContext: API response received", response.data);
      
      const { user: userData, access_token: authToken } = response.data;

      // Set state
      setUser(userData);
      setToken(authToken);

      // Store in localStorage
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
    isAuthenticated: !!user && !!token,
    clearError,
  };

  console.log("AuthProvider: Rendering with state:", { 
    user: user?.name, 
    isAuthenticated: !!user && !!token,
    loading 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
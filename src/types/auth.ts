// src/types/auth.ts

export interface LoginCredentials {
  user_name?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  user_name: string;
  email: string;
  password: string;
  user_type: string;
  gender?: string;
  phone?: string;
  // Add other registration fields as needed
}

export interface AuthResponse {
  access_token: string;
  user: User;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  user_name: string;
  gender: string;
  user_type: string;
 
  status: boolean;
  last_login: string | null;
  photo: string | null;
  school: any | null;

  grade: any | null;
  roles: Array<{
    id: string;
    name: string;
  }>;
  permissions: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<any>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<any>;
  clearError: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const PERMISSIONS = {
  



  ROLE_READ: 'role_read',
  USER_READ: 'user_read',

  ROLE_UPDATE: 'role_update',
  
 
} as const;


export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role constants for better type safety
export const ROLES = {
  ADMIN: 'Admin',

  // Add other roles as needed
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
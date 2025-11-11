// src/redux/apis/userApi.ts
import { baseApi } from "../baseApi";

// --------------------- Types ---------------------
export interface UserType {
  user_type_id: string;
  name: string;
  description?: string;
}

export interface Institute {
  institute_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface HierarchyNode {
  hierarchy_node_id: string;
  name: string;
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  position?: string;
  is_active: boolean;
  user_type_id: string;
  institute_id?: string | null;
  hierarchy_node_id?: string | null;
  profile_image?: string;
  is_first_logged_in?: boolean;
  last_login_at?: string;
  password_changed_at?: string;
  created_at?: string;
  updated_at?: string;
  assigned_by?: string;
  assigned_at?: string;
  userType?: UserType;
  institute?: Institute;
  hierarchyNode?: HierarchyNode;
}

export interface CreateUserDto {
  full_name: string;
  email: string;
  user_type_id: string;
  institute_id?: string;
  hierarchy_node_id?: string;
  position?: string;
  phone_number?: string;
}

export interface UpdateUserDto {
  full_name?: string;
  email?: string;
  phone_number?: string;
  position?: string;
  user_type_id?: string;
  institute_id?: string;
  hierarchy_node_id?: string;
  is_active?: boolean;
}

// --------------------- API ---------------------
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users
    getUsers: builder.query<User[], void>({
      query: () => `/users`,
      providesTags: ["User"],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Create a new user
    createUser: builder.mutation<User, CreateUserDto>({
      query: (data) => ({
        url: `/users`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Update user
    updateUser: builder.mutation<User, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    // Delete (deactivate) user
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Toggle user active status
    toggleUserStatus: builder.mutation<
      {
        success: boolean;
        message: string;
        data: { user_id: string; is_active: boolean };
      },
      { id: string; is_active: boolean }
    >({
      query: ({ id, is_active }) => ({
        url: `/users/${id}/toggle-status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    // Reset user password
    resetUserPassword: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/users/${id}/reset-password`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Get all user types
    getUserTypes: builder.query<UserType[], void>({
      query: () => `/users/user-types`,
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

// --------------------- Hooks ---------------------
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useResetUserPasswordMutation,
  useGetUserTypesQuery,
} = userApi;

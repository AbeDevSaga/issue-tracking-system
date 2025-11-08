import { baseApi } from "../baseApi";
import type { AuthResponse, LoginCredentials } from "../../types/auth";

// --- AUTH API ---
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // normalize backend field names if needed
        return {
          token: response.token,
          user: response.user,
          message: response.message,
        };
      },
      invalidatesTags: ["User"],
    }),

    // Logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Fetch current user (optional, for session persistence)
    getCurrentUser: builder.query<AuthResponse["user"], void>({
      query: () => ({
        url: "/auth/me", // if you later add this route in backend
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

// --- Export Hooks ---
export const { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } =
  authApi;

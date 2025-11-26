// src/redux/apis/authApi.ts
import { baseApi } from "../baseApi";
import type { AuthResponse, LoginCredentials } from "../../types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // Store token and user immediately after login
        if (response.token) {
          localStorage.setItem("authToken", response.token);
        }
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        return {
          token: response.token,
          user: response.user,
          message: response.message,
        };
      },
      invalidatesTags: ["User"],
    }),
    // Add find user by email endpoint
    findUserByEmail: builder.query({
      query: (email: string) => ({
        url: `/users/find-by-email?email=${encodeURIComponent(email)}`,
        method: "GET",
      }),
    }),
    // ✅ Password reset mutation
    resetUserPassword: builder.mutation({
      query: ({ email }: { email: string }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { email }, // must match backend
      }),
    }),
    confirmPasswordReset: builder.mutation({
      query: (data: { token: string; email: string; newPassword: string }) => ({
        url: "/auth/reset-password/confirm",
        method: "POST",
        body: data,
      }),
    }),

    validateResetToken: builder.query({
      query: ({ token, email }: { token: string; email: string }) => ({
        url: `/auth/reset-password/validate?token=${token}&email=${encodeURIComponent(
          email
        )}`,
        method: "GET",
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // Clear token and user on logout
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        }
      },
      invalidatesTags: ["User"],
    }),

    getCurrentUser: builder.query<AuthResponse["user"], void>({
      query: () => ({
        url: "/auth/me", // optional, backend route for session persistence
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useResetUserPasswordMutation,
  useFindUserByEmailQuery,
  useConfirmPasswordResetMutation,
  useValidateResetTokenQuery,
  useLazyValidateResetTokenQuery,
} = authApi;

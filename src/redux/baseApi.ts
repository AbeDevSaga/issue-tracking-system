// src/redux/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Base API URL (from .env.local)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// --- Base query with token from NextAuth session ---
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "same-origin",
  prepareHeaders: async (headers) => {
    try {
      const session = await getSession();

      // Attach JWT to Authorization header
      if (session?.accessToken) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
      }

      // Standard JSON headers
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");

      return headers;
    } catch (error) {
      console.error("Error preparing headers:", error);
      return headers;
    }
  },
});

// --- Enhanced query to catch 401 and log out if needed ---
const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn("⚠️ Unauthorized (401) — token invalid or expired.");
    // Optionally, you can trigger logout or session refresh here
  }

  return result;
};

// --- API base slice ---
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "User",
    "Role",
    "Permission",
    "Project",
    "Institute",
    "Hierarchy",
    "HierarchyNode",
    "Issue",
    "Assignment",
    "Escalation",
    "Attachment",
  ],
  endpoints: () => ({}),
});

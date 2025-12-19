// src/redux/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = import.meta.env.VITE_API_PUBLIC_BASE_URL;
type RefreshResponse = {
  accessToken: string;
};

// --- Base query with JWT from localStorage ---
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
   credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken"); 

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    return headers;
  },
});

// --- Wrap to handle 401 globally ---
const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    const refreshData = refreshResult.data as RefreshResponse | undefined;

    if (refreshData?.accessToken) {
      localStorage.setItem("authToken", refreshData.accessToken);

      // retry original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }
  }

  return result;
};



export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "User",
    "Roles",
    "Permission",
    "Project",
    "Institute",
    "Hierarchy",
    "HierarchyNode",
    "InternalNode",
    "Issue",
    "IssueEscalation",
    "IssueResolution",
    "IssuePriority",
    "IssueResponseTime",
    "IssueAssignment",
    "IssueCategory",
    "Assignment",
    "Escalation",
    "Attachment",
    "IssueAttachment",
    "ProjectMetrics",
  ],
  endpoints: () => ({}),
});

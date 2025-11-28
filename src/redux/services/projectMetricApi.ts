// src/redux/features/projectMetricApi.ts
import { baseApi } from "../baseApi";

export const projectMetricApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== Create a new Project Metric =====
    createProjectMetric: builder.mutation({
      query: (body) => ({
        url: "/project-metrics",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // ===== Get all Project Metrics =====
    getProjectMetrics: builder.query({
      query: () => ({
        url: "/project-metrics",
        method: "GET",
      }),
      providesTags: ["ProjectMetrics"],
    }),

    // ===== Get a specific Project Metric by ID =====
    getProjectMetricById: builder.query({
      query: (id: string) => ({
        url: `/project-metrics/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ProjectMetrics", id }],
    }),

    // ===== Update a specific Project Metric =====
    updateProjectMetric: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/project-metrics/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ProjectMetrics", id },
        "ProjectMetrics",
      ],
    }),

    // ===== Delete a specific Project Metric =====
    deleteProjectMetric: builder.mutation({
      query: (id: string) => ({
        url: `/project-metrics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // ===== Get Metrics Assigned to a Project =====
    getMetricsByProject: builder.query({
      query: (projectId: string) => ({
        url: `/projects/${projectId}/metrics`,
        method: "GET",
      }),
    }),

    // ===== Get User Metrics for a project metric =====
    getMetricUsers: builder.query({
      query: (metricId: string) => ({
        url: `/project-metrics/${metricId}/users`,
        method: "GET",
      }),
    }),

    // ===== Assign User to a Project Metric =====
    assignUserToMetric: builder.mutation({
      query: (body) => ({
        url: "/project-metric-users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // ===== Update User Metric Value =====
    updateMetricUserValue: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/project-metric-users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),

    // ===== Remove User from Metric =====
    deleteMetricUser: builder.mutation({
      query: (id: string) => ({
        url: `/project-metric-users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectMetrics"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useCreateProjectMetricMutation,
  useGetProjectMetricsQuery,
  useGetProjectMetricByIdQuery,
  useUpdateProjectMetricMutation,
  useDeleteProjectMetricMutation,

  // Additional metric relations
  useGetMetricsByProjectQuery,
  useGetMetricUsersQuery,
  useAssignUserToMetricMutation,
  useUpdateMetricUserValueMutation,
  useDeleteMetricUserMutation,
} = projectMetricApi;

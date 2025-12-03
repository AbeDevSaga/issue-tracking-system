// src/redux/apis/issueResponseTimeApi.ts
import { baseApi } from "../baseApi";

// Interface for IssueResponseTime
export interface IssueResponseTime {
  response_time_id: string;
  duration: number;
  unit: "hour" | "day" | "month";
  created_at?: string;
  updated_at?: string;
}

// DTO for creating/updating IssueResponseTime
export interface CreateIssueResponseTimeDto {
  duration: number;
  unit: "hour" | "day" | "month";
}

// Inject endpoints into baseApi
export const issueResponseTimeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all response times
    getIssueResponseTimes: builder.query<IssueResponseTime[], void>({
      query: () => `/issue-response-times`,
      providesTags: ["IssueResponseTime"],
    }),

    // Get response time by ID
    getIssueResponseTimeById: builder.query<IssueResponseTime, string>({
      query: (id) => `/issue-response-times/${id}`,
      providesTags: (result, error, id) => [{ type: "IssueResponseTime", id }],
    }),

    // Create a new response time
    createIssueResponseTime: builder.mutation<
      IssueResponseTime,
      CreateIssueResponseTimeDto
    >({
      query: (data) => ({
        url: `/issue-response-times`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["IssueResponseTime"],
    }),

    // Update a response time
    updateIssueResponseTime: builder.mutation<
      IssueResponseTime,
      { id: string; data: Partial<CreateIssueResponseTimeDto> }
    >({
      query: ({ id, data }) => ({
        url: `/issue-response-times/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "IssueResponseTime", id },
      ],
    }),

    // Delete a response time
    deleteIssueResponseTime: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/issue-response-times/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["IssueResponseTime"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useGetIssueResponseTimesQuery,
  useGetIssueResponseTimeByIdQuery,
  useCreateIssueResponseTimeMutation,
  useUpdateIssueResponseTimeMutation,
  useDeleteIssueResponseTimeMutation,
} = issueResponseTimeApi;

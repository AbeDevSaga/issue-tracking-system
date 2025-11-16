// src/redux/apis/issueApi.ts
import { baseApi } from "../baseApi";

// Issue interface (matches backend Issue model)
export interface Issue {
  issue_id: string;
  institute_project_id?: string | null;
  title: string;
  description?: string;
  issue_category_id?: string | null;
  hierarchy_node_id?: string | null;
  priority_id?: string | null;
  reported_by: string;
  assigned_to?: string | null;
  action_taken?: string | null;
  url_path?: string | null;
  issue_description?: string | null;
  issue_occured_time?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  attachments?: { attachment_id: string; attachment: any }[];
  category?: any;
  priority?: any;
  reporter?: any;
  assignee?: any;
  instituteProject?: any;
  hierarchyNode?: any;
}

// DTO for creating/updating an Issue
export interface CreateIssueDto {
  institute_project_id?: string;
  title: string;
  description?: string;
  issue_category_id?: string;
  hierarchy_node_id?: string;
  priority_id?: string;
  reported_by: string;
  assigned_to?: string;
  action_taken?: string;
  url_path?: string;
  issue_description?: string;
  issue_occured_time?: string;
  status?: string;
  attachment_ids?: string[]; // array of attachment UUIDs
}

// Inject endpoints into the base API
export const issueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIssues: builder.query<Issue[], void>({
      query: () => `/issues`,
      providesTags: ["Issue"],
    }),
    getIssueById: builder.query<Issue, string>({
      query: (id) => `/issues/${id}`,
      providesTags: (result, error, id) => [{ type: "Issue", id }],
    }),
    createIssue: builder.mutation<Issue, CreateIssueDto>({
      query: (data) => ({
        url: `/issues`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Issue"],
    }),
    updateIssue: builder.mutation<
      Issue,
      { id: string; data: Partial<CreateIssueDto> }
    >({
      query: ({ id, data }) => ({
        url: `/issues/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Issue", id }],
    }),
    deleteIssue: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/issues/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Issue"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIssuesQuery,
  useGetIssueByIdQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
} = issueApi;

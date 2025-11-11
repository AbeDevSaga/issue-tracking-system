// src/redux/services/projectApi.ts
import { baseApi } from "../baseApi";

export interface Project {
  project_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  institutes?: any[];
  hierarchies?: any[];
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  is_active?: boolean;
  institute_id?: string;
}

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all projects
    getProjects: builder.query<Project[], void>({
      query: () => `/projects`,
      providesTags: ["Project"],
    }),

    // Get project by ID
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // Create project
    createProject: builder.mutation<Project, CreateProjectDto>({
      query: (data) => ({
        url: `/projects`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    // Update project
    updateProject: builder.mutation<
      Project,
      { id: string; data: Partial<CreateProjectDto> }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // Delete project
    deleteProject: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // Assign user to project
    assignUserToProject: builder.mutation<
      any,
      {
        project_id: string;
        user_id: string;
        role_id: string;
        sub_role_id?: string;
      }
    >({
      query: (data) => ({
        url: `/projects/assign-user`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    // Remove user from project
    removeUserFromProject: builder.mutation<
      any,
      { project_id: string; user_id: string }
    >({
      query: (data) => ({
        url: `/projects/remove-user`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAssignUserToProjectMutation,
  useRemoveUserFromProjectMutation,
} = projectApi;

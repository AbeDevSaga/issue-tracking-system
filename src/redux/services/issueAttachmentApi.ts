// src/redux/apis/issueAttachmentApi.ts
import { baseApi } from "../baseApi";

export interface Attachment {
  attachment_id: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface IssueAttachment {
  issue_attachment_id: string;
  issue_id: string;
  attachment: Attachment;
}

export interface LinkAttachmentDto {
  issue_id: string;
  attachment_id: string;
}

export const issueAttachmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Link an attachment to an issue
    linkAttachmentToIssue: builder.mutation<
      { success: boolean; message: string; issue_attachment: IssueAttachment },
      LinkAttachmentDto
    >({
      query: (data) => ({
        url: `/issue-attachments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "IssueAttachment", id: "LIST" }],
    }),

    // Get all attachments for a specific issue
    getAttachmentsForIssue: builder.query<
      { success: boolean; count: number; attachments: IssueAttachment[] },
      string
    >({
      query: (issue_id) => `/issue-attachments/${issue_id}`,
      providesTags: (result, error, issue_id) =>
        result
          ? [
              ...result.attachments.map(({ issue_attachment_id }) => ({
                type: "IssueAttachment" as const,
                id: issue_attachment_id,
              })),
              { type: "IssueAttachment", id: `ISSUE-${issue_id}` },
            ]
          : [{ type: "IssueAttachment", id: `ISSUE-${issue_id}` }],
    }),

    // Delete a linked attachment
    deleteIssueAttachment: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (issue_attachment_id) => ({
        url: `/issue-attachments/${issue_attachment_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, issue_attachment_id) => [
        { type: "IssueAttachment", id: issue_attachment_id },
        { type: "IssueAttachment", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLinkAttachmentToIssueMutation,
  useGetAttachmentsForIssueQuery,
  useDeleteIssueAttachmentMutation,
} = issueAttachmentApi;

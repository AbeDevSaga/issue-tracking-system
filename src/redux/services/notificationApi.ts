import { baseApi } from "../baseApi";

// Update your notification interface to match backend
export interface Notification {
  notification_id: string;
  recipient_id: string; // Changed from user_id to recipient_id
  user_id: string; // The user who triggered the notification
  reference_type: string;
  reference_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  delivered_at?: string;
  created_at: string;
  payload?: any;
  // Include related data if your backend provides it
  issue?: {
    issue_id: string;
    title: string;
  };
  project?: {
    project_id: string;
    name: string;
  };
}

export interface NotificationPreferences {
  preference_id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  issue_created: boolean;
  issue_escalated: boolean;
  issue_assigned: boolean;
  issue_resolved: boolean;
  comments_added: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user notifications
    getNotifications: builder.query<
      NotificationsResponse,
      {
        user_id: string;
        page?: number;
        limit?: number;
        unread_only?: boolean;
      }
    >({
      query: ({ user_id, page = 1, limit = 20, unread_only = false }) => ({
        url: `/notifications/user/${user_id}`,
        params: { page, limit, unread_only },
      }),
      providesTags: ["Notification"],
    }),

    // Get unread notifications count
    getUnreadCount: builder.query<UnreadCountResponse, string>({
      query: (user_id) => `/notifications/user/${user_id}/unread-count`,
      providesTags: ["Notification"],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (notification_id) => ({
          url: `/notifications/${notification_id}/read`,
          method: "PATCH",
        }),
        invalidatesTags: ["Notification"],
      }
    ),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (user_id) => ({
        url: `/notifications/user/${user_id}/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Get notification preferences
    getNotificationPreferences: builder.query<
      {
        success: boolean;
        data: NotificationPreferences;
      },
      string
    >({
      query: (user_id) => `/notifications/user/${user_id}/preferences`,
      providesTags: ["NotificationPreferences"],
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<
      {
        success: boolean;
        message: string;
        data: NotificationPreferences;
      },
      {
        user_id: string;
        data: Partial<NotificationPreferences>;
      }
    >({
      query: ({ user_id, data }) => ({
        url: `/notifications/user/${user_id}/preferences`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["NotificationPreferences"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationApi;

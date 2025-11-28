// src/hooks/useNotifications.ts
import { useCallback, useEffect } from "react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../redux/services/notificationApi";

export const useNotifications = (user_id: string) => {
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery({
    user_id,
    limit: 10,
    page: 1,
  });

  const {
    data: unreadCountData,
    isLoading: unreadCountLoading,
    error: unreadCountError,
    refetch: refetchUnreadCount,
  } = useGetUnreadCountQuery(user_id);

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const handleMarkAsRead = useCallback(
    async (notification_id: string) => {
      try {
        await markAsRead(notification_id).unwrap();
        // Refetch counts after marking as read
        refetchUnreadCount();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [markAsRead, refetchUnreadCount]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead(user_id).unwrap();
      // Refetch both notifications and counts
      refetchNotifications();
      refetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [markAllAsRead, user_id, refetchNotifications, refetchUnreadCount]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications();
      refetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchNotifications, refetchUnreadCount]);

  return {
    notifications: notificationsData?.data || [],
    unreadCount: unreadCountData?.data?.unread_count || 0,
    loading: notificationsLoading || unreadCountLoading,
    error: notificationsError || unreadCountError,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetchNotifications,
    refetchUnreadCount,
  };
};

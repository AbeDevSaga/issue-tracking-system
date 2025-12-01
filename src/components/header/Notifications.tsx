import { useState } from "react";
import { Link } from "react-router";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../redux/services/notificationApi";
import { useAuth } from "../../hooks/useAuth";

export default function Notifications() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const {
    data: notificationsResponse,
    refetch: refetchNotifications,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useGetNotificationsQuery(
    {
      user_id: userId!,
      limit: 100,
      unread_only: filter === "unread",
    },
    { skip: !userId }
  );

  const { data: unreadCountResponse } = useGetUnreadCountQuery(userId!, {
    skip: !userId,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  // Extract data safely
  const notifications =
    notificationsResponse?.data ||
    notificationsResponse?.notifications ||
    (Array.isArray(notificationsResponse) ? notificationsResponse : []);

  const unreadCount =
    unreadCountResponse?.data?.unread_count ||
    unreadCountResponse?.unread_count ||
    0;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId).unwrap();
      refetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await markAllAsRead(userId).unwrap();
      refetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleFilterChange = (newFilter: "all" | "unread") => {
    setFilter(newFilter);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Please log in to view notifications
          </h2>
          <Link
            to="/login"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your notifications and preferences
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Notifications
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {notifications.length}
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Unread Notifications
          </div>
          <div className="mt-1 text-2xl font-semibold text-orange-600 dark:text-orange-400">
            {unreadCount}
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Read Notifications
          </div>
          <div className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            {notifications.length - unreadCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            filter === "all"
              ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => handleFilterChange("unread")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            filter === "unread"
              ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        {notificationsLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Loading notifications...
              </p>
            </div>
          </div>
        ) : notificationsError ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Error loading notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Failed to load your notifications. Please try again.
              </p>
              <button
                onClick={() => refetchNotifications()}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
              >
                Retry
              </button>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 17h5l-5 5v-5zM8.5 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filter === "unread"
                  ? "You don't have any unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.notification_id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Notification Card Component
const NotificationCard = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.notification_id);
    }
  };

  return (
    <div
      className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
        !notification.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
            notification.type
          )}`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            dangerouslySetInnerHTML={{
              __html: getNotificationIcon(notification.type),
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {notification.body || notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatNotificationType(notification.type)}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{formatTimeAgo(notification.created_at)}</span>
                {!notification.is_read && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      Unread
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <button
                  onClick={() => onMarkAsRead(notification.notification_id)}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
                >
                  Mark Read
                </button>
              )}
              <Link
                to={getNotificationLink(notification)}
                onClick={handleClick}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions (same as in your dropdown)
function getNotificationColor(type: string): string {
  const colors = {
    issue_escalated: "bg-orange-500",
    issue_assigned: "bg-blue-500",
    issue_resolved: "bg-green-500",
    issue_created: "bg-purple-500",
    comment_added: "bg-indigo-500",
  };
  return colors[type] || "bg-gray-500";
}

function getNotificationIcon(type: string): string {
  const icons = {
    issue_escalated:
      '<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />',
    issue_assigned:
      '<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />',
    issue_resolved:
      '<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />',
    issue_created:
      '<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />',
    comment_added:
      '<path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />',
  };
  return (
    icons[type] ||
    '<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />'
  );
}

function formatNotificationType(type: string): string {
  const typeMap = {
    issue_escalated: "Escalation",
    issue_assigned: "Assignment",
    issue_resolved: "Resolution",
    issue_created: "New Issue",
    comment_added: "Comment",
  };
  return typeMap[type] || "Notification";
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function getNotificationLink(notification: any): string {
  if (notification.issue_id) {
    return `/issues/${notification.issue_id}`;
  }
  if (notification.project_id) {
    return `/projects/${notification.project_id}`;
  }
  return "#";
}

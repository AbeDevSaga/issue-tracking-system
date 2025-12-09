import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../redux/services/notificationApi";
import { useAuth } from "../../hooks/useAuth";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.user_id;

  // Fetch notifications and unread count
  const {
    data: notificationsResponse,
    refetch: refetchNotifications,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useGetNotificationsQuery(
    { user_id: userId!, limit: 50, unread_only: false },
    { skip: !userId }
  );

  const {
    data: unreadCountResponse,
    refetch: refetchUnreadCount,
    error: unreadCountError,
  } = useGetUnreadCountQuery(userId!, { skip: !userId });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  // Debug the API responses
  useEffect(() => {
    console.log("🔍 DEBUG - Notifications Response:", notificationsResponse);
    console.log("🔍 DEBUG - Unread Count Response:", unreadCountResponse);
  }, [notificationsResponse, unreadCountResponse]);

  // Safe data extraction with multiple fallbacks
  const extractNotifications = (response: any) => {
    if (!response) return [];

    // Case 1: Response has data array directly
    if (Array.isArray(response)) return response;

    // Case 2: Response has data property that's an array
    if (response.data && Array.isArray(response.data)) return response.data;

    // Case 3: Response has notifications property
    if (response.notifications && Array.isArray(response.notifications))
      return response.notifications;

    // Case 4: Response is an object with success property
    if (response.success && Array.isArray(response.data)) return response.data;

    console.warn("🔍 Unknown notifications response structure:", response);
    return [];
  };

  const extractUnreadCount = (response: any) => {
    if (!response) return 0;

    // Case 1: Direct number
    if (typeof response === "number") return response;

    // Case 2: Response has unread_count property
    if (response.unread_count !== undefined) return response.unread_count;

    // Case 3: Response has data property with unread_count
    if (response.data && response.data.unread_count !== undefined)
      return response.data.unread_count;

    // Case 4: Response is success object
    if (response.success && response.data?.unread_count !== undefined)
      return response.data.unread_count;

    console.warn("🔍 Unknown unread count response structure:", response);
    return 0;
  };

  const notifications = extractNotifications(notificationsResponse);
  const unreadCount = extractUnreadCount(unreadCountResponse);
  const notifying = unreadCount > 0;

  // Debug the extracted data
  useEffect(() => {
    console.log("🔍 DEBUG - Extracted notifications:", notifications);
    console.log("🔍 DEBUG - Extracted unreadCount:", unreadCount);
    console.log("🔍 DEBUG - Notifications length:", notifications.length);
  }, [notifications, unreadCount]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    // Refetch notifications when dropdown is opened
    if (!isOpen && userId) {
      refetchNotifications();
      refetchUnreadCount();
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId).unwrap();
      // Refetch counts after marking as read
      refetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
    closeDropdown();
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    try {
      await markAllAsRead(userId).unwrap();
      // Refetch data after marking all as read
      refetchNotifications();
      refetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Auto-refresh notifications periodically
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      refetchNotifications();
      refetchUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, refetchNotifications, refetchUnreadCount]);

  if (!userId) {
    return null; // Don't show notifications if user is not logged in
  }

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {/* Notification Icon */}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>

        {/* Notification Badge - Updated styling */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-red-500 border-2 border-white rounded-full dark:border-gray-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification {unreadCount > 0 && `(${unreadCount})`}
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notificationsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading notifications...</div>
            </div>
          ) : notificationsError ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500 text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-red-300"
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
                Error loading notifications
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500 text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
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
                No notifications
                <div className="mt-2 text-xs text-gray-400">
                  (Unread count: {unreadCount})
                </div>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col h-auto">
              {notifications.map((notification) => (
                <li key={notification.notification_id}>
                  <DropdownItem
                    onItemClick={() =>
                      handleNotificationClick(notification.notification_id)
                    }
                    className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                      !notification.is_read
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                    to={getNotificationLink(notification)}
                  >
                    <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
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
                      {!notification.is_read && (
                        <span className="absolute top-0 right-0 z-10 h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                      )}
                    </span>

                    <span className="block flex-1">
                      <span className="mb-1.5 block text-theme-sm text-gray-800 dark:text-white/90">
                        {notification.body}
                      </span>
                      <span className="block text-theme-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.reason || notification.message}
                      </span>
                      <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                        <span>{formatNotificationType(notification.type)}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{formatTimeAgo(notification.created_at)}</span>
                      </span>
                    </span>
                  </DropdownItem>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          to="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={closeDropdown}
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}

// Helper functions (keep the same)
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
  return "/notifications";
}

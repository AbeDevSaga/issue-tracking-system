"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, X, User, ChevronRight, Users } from "lucide-react";
import { formatStatus } from "../../utils/statusFormatter";
import { useState } from "react";

interface User {
  full_name: string;
}

interface Escalation {
  fromTierNode: { name: string };
  toTierNode: { name: string };
  escalated_at: string;
}

interface Resolution {
  reason: string;
  resolved_at: string;
}

interface IssueHistoryLog {
  history_id: string;
  action: string;
  status_at_time: string;
  created_at: string;
  performed_by: User;
  escalation?: Escalation | null;
  resolution?: Resolution | null;
}

interface LogsPreviewProps {
  logs: IssueHistoryLog[];
  onClose?: () => void;
}

// Group logs by user
const groupLogsByUser = (logs: IssueHistoryLog[]) => {
  const grouped: { [key: string]: IssueHistoryLog[] } = {};

  logs.forEach((log) => {
    const userName = log.performed_by?.full_name || "System";
    if (!grouped[userName]) {
      grouped[userName] = [];
    }
    grouped[userName].push(log);
  });

  return grouped;
};

export default function IssueHistoryLog({ logs, onClose }: LogsPreviewProps) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const groupedLogs = groupLogsByUser(logs);
  const userNames = Object.keys(groupedLogs);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "escalated":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActionColor = (log: IssueHistoryLog) => {
    if (log.resolution) return "bg-green-50 border-green-200";
    if (log.escalation) return "bg-purple-50 border-purple-200";
    return "bg-gray-50 border-gray-200";
  };

  const toggleUserExpansion = (userName: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userName)) {
      newExpanded.delete(userName);
    } else {
      newExpanded.add(userName);
    }
    setExpandedUsers(newExpanded);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (userName: string) => {
    // Generate a consistent color based on user name
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-amber-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-rose-500",
      "bg-cyan-500",
    ];
    const index =
      userName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-full lg:w-[350px] bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 h-full flex flex-col shadow-xl overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 border-b border-indigo-600 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Issue Timeline</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {logs.length} events • {userNames.length} users
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">
                {userNames.length} users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">
                {logs.length} actions
              </span>
            </div>
          </div>
          <button
            onClick={() => setExpandedUsers(new Set(userNames))}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Expand all
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 p-4">
        {userNames.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">No history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userNames.map((userName, userIndex) => {
              const userLogs = groupedLogs[userName];
              const isExpanded = expandedUsers.has(userName);
              const hasMultipleLogs = userLogs.length > 1;

              return (
                <div
                  key={userName}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* User Header */}
                  <button
                    onClick={() => toggleUserExpansion(userName)}
                    className={`w-full p-4 flex items-center justify-between transition-colors ${
                      isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${getUserColor(
                          userName
                        )} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}
                      >
                        {getUserInitials(userName)}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800">
                          {userName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {userLogs.length} action
                          {userLogs.length > 1 ? "s" : ""} • Last:{" "}
                          {new Date(
                            userLogs[0].created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasMultipleLogs && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {userLogs.length}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* User's Actions - Collapsible */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4">
                      <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-gray-100"></div>

                        <div className="space-y-3">
                          {userLogs.map((log, logIndex) => (
                            <div key={log.history_id} className="relative">
                              {/* Timeline dot */}
                              <div
                                className={`absolute left-[-24px] top-2 w-3 h-3 rounded-full border-2 border-white ${
                                  logIndex === 0
                                    ? getUserColor(userName).replace(
                                        "bg-",
                                        "bg-"
                                      )
                                    : "bg-gray-300"
                                }`}
                              ></div>

                              {/* Log card */}
                              <div
                                className={`p-3 rounded-lg border ${getActionColor(
                                  log
                                )}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-gray-800 capitalize">
                                      {log.action}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                          log.status_at_time
                                        )}`}
                                      >
                                        {formatStatus(log.status_at_time) ||
                                          "N/A"}
                                      </span>
                                      {log.escalation && (
                                        <div className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs">
                                          <span className="font-medium">
                                            {log.escalation.fromTierNode.name}
                                          </span>
                                          <ArrowRight className="w-3 h-3" />
                                          <span className="font-medium">
                                            {log.escalation.toTierNode?.name ||
                                              "EAII"}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                                    <Clock className="w-3 h-3" />
                                    {new Date(
                                      log.created_at
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                  {new Date(log.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {logs.length} events across {userNames.length} users
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to top
          </button>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ToggleRight,
  ToggleLeft,
  Shield,
  Activity,
  Filter,
  RefreshCw,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { FilterField } from "../../../types/layout";
import {
  useGetPermissionsQuery,
  useTogglePermissionMutation,
} from "../../../redux/services/permissionApi";

// Types
interface Permission {
  permission_id: string;
  resource: string;
  action: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PermissionStats {
  total: number;
  active: number;
  inactive: number;
}

interface ResourceGroup {
  resource: string;
  permissions: Permission[];
  isExpanded: boolean;
  activeCount: number;
  totalCount: number;
}

// Custom Badge Component
const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const variantStyles = {
    default: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border border-gray-200",
    outline: "bg-transparent text-gray-700 border border-gray-300",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Loading Skeleton Component
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// Empty State Component
const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Shield className="h-10 w-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>
    {action}
  </div>
);

// Permission Row Component
const PermissionRow: React.FC<{
  permission: Permission;
  onToggle: (id: string) => Promise<void>;
  isToggling: boolean;
}> = ({ permission, onToggle, isToggling }) => {
  const isActive = !!permission.is_active;

  const handleToggle = async () => {
    await onToggle(permission.permission_id);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Shield className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-gray-900 capitalize">
              {permission.action.replace("_", " ")}
            </span>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={
                isActive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Permission to {permission.action.replace("_", " ")}{" "}
            {permission.resource}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className={`h-9 w-9 p-0 transition-all duration-200 border ${
          isActive
            ? "bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700"
            : "bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-700"
        }`}
        onClick={handleToggle}
        disabled={isToggling}
        title={isActive ? "Deactivate permission" : "Activate permission"}
      >
        {isToggling ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isActive ? (
          <ToggleRight className="h-4 w-4" />
        ) : (
          <ToggleLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

// Resource Group Component
const ResourceGroup: React.FC<{
  group: ResourceGroup;
  onToggle: (id: string) => Promise<void>;
  isToggling: boolean;
  onToggleExpand: (resource: string) => void;
}> = ({ group, onToggle, isToggling, onToggleExpand }) => {
  const isAllActive = group.activeCount === group.totalCount;
  const isSomeActive =
    group.activeCount > 0 && group.activeCount < group.totalCount;

  const getStatusColor = () => {
    if (isAllActive) return "text-green-600 bg-green-50 border-green-200";
    if (isSomeActive) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusIcon = () => {
    if (isAllActive) return <CheckCircle className="h-4 w-4" />;
    if (isSomeActive)
      return <div className="h-2 w-2 bg-yellow-500 rounded-full" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isAllActive) return "All Active";
    if (isSomeActive) return "Partial";
    return "All Inactive";
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 last:mb-0 overflow-hidden">
      {/* Resource Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => onToggleExpand(group.resource)}
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-gray-900 capitalize">
                {group.resource}
              </h3>
              <Badge variant="outline" className={getStatusColor()}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon()}
                  <span>{getStatusText()}</span>
                </div>
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {group.totalCount} permissions • {group.activeCount} active
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {group.activeCount}/{group.totalCount}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div
            className={`transform transition-transform duration-200 ${
              group.isExpanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Permissions List */}
      {group.isExpanded && (
        <div className="bg-white divide-y divide-gray-100">
          {group.permissions.map((permission) => (
            <PermissionRow
              key={permission.permission_id}
              permission={permission}
              onToggle={onToggle}
              isToggling={isToggling}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Statistics Component
const PermissionStats: React.FC<{ stats: PermissionStats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    {/* Total Card */}
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Permissions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>

    {/* Active Card */}
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <Activity className="h-6 w-6 text-green-600" />
        </div>
      </div>
    </div>

    {/* Inactive Card */}
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <Settings className="h-6 w-6 text-red-600" />
        </div>
      </div>
    </div>
  </div>
);

// Loading Skeleton
const PermissionSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        >
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div className="p-4 bg-gray-50">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function PermissionList() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set()
  );

  const { data, isLoading, isError, refetch } = useGetPermissionsQuery();
  const [togglePermissionMutation, { isLoading: isToggling }] =
    useTogglePermissionMutation();

  // Calculate statistics
  const stats: PermissionStats = useMemo(
    () => ({
      total: permissions.length,
      active: permissions.filter((p) => p.is_active).length,
      inactive: permissions.filter((p) => !p.is_active).length,
    }),
    [permissions]
  );

  const togglePermission = useCallback(
    async (id: string) => {
      try {
        await togglePermissionMutation(id).unwrap();
      } catch (err) {
        console.error("Toggle permission failed", err);
      }
    },
    [togglePermissionMutation]
  );

  // Process API data
  useEffect(() => {
    if (!isError && !isLoading && data) {
      const normalized = data.data.map((p: any) => ({
        ...p,
        is_active: p.is_active ?? false,
      }));
      setPermissions(normalized);

      // Expand all resources by default
      const resources = new Set(normalized.map((p: Permission) => p.resource));
      setExpandedResources(resources);
    }
  }, [data, isError, isLoading]);

  // Group permissions by resource
  const resourceGroups = useMemo(() => {
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    return Object.entries(grouped).map(([resource, permissions]) => {
      const activeCount = permissions.filter((p) => p.is_active).length;
      return {
        resource,
        permissions,
        isExpanded: expandedResources.has(resource),
        activeCount,
        totalCount: permissions.length,
      };
    });
  }, [permissions, expandedResources]);

  // Filtered resource groups with search
  const filteredResourceGroups = useMemo(() => {
    let filtered = resourceGroups;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((group) =>
        statusFilter === "ACTIVE"
          ? group.activeCount > 0
          : group.activeCount < group.totalCount
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.resource.toLowerCase().includes(query) ||
          group.permissions.some((p) => p.action.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [resourceGroups, statusFilter, searchQuery]);

  const toggleResourceExpand = useCallback((resource: string) => {
    setExpandedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resource)) {
        newSet.delete(resource);
      } else {
        newSet.add(resource);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allResources = new Set(permissions.map((p) => p.resource));
    setExpandedResources(allResources);
  }, [permissions]);

  const collapseAll = useCallback(() => {
    setExpandedResources(new Set());
  }, []);

  // Filter Fields
  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "All Status", value: "all" },
        { label: "Has Active", value: "ACTIVE" },
        { label: "All Inactive", value: "INACTIVE" },
      ],
      value: statusFilter,
      onChange: (value: string | string[]) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
      },
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PermissionSkeleton />
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <EmptyState
          title="Unable to load permissions"
          description="There was an error loading the permissions data. Please try again."
          action={
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      filters={filterFields}
      filterColumnsPerRow={1}
      actions={[
        {
          label: "Expand All",
          icon: <ChevronDown className="h-4 w-4" />,
          variant: "outline",
          size: "default",
          onClick: expandAll,
        },
        {
          label: "Collapse All",
          icon: <ChevronRight className="h-4 w-4" />,
          variant: "outline",
          size: "default",
          onClick: collapseAll,
        },
        {
          label: "Refresh",
          icon: <RefreshCw className="h-4 w-4" />,
          variant: "outline",
          size: "default",
          onClick: handleRefresh,
        },
      ]}
    >
      {/* Statistics Cards */}
      <PermissionStats stats={stats} />

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search permissions by resource or action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>
                {filteredResourceGroups.length} resource groups •{" "}
                {permissions.length} total permissions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Accordion */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Permission Management
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              {filteredResourceGroups.length} of {resourceGroups.length}{" "}
              resource groups
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredResourceGroups.length === 0 ? (
            <EmptyState
              title="No permissions found"
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No permissions have been configured yet."
              }
              action={
                (searchQuery || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredResourceGroups.map((group) => (
                <ResourceGroup
                  key={group.resource}
                  group={group}
                  onToggle={togglePermission}
                  isToggling={isToggling}
                  onToggleExpand={toggleResourceExpand}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

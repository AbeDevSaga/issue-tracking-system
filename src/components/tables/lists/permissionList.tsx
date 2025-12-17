"use client";

import React, { useEffect, useState, useMemo, useCallback, JSX } from "react";
import {
  Shield,
  Activity,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Folder,
  BarChart3,
} from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import {
  useGetPermissionsQuery,
  useTogglePermissionMutation,
} from "../../../redux/services/permissionApi";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/cn/card";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";

/* ================= TYPES ================= */

interface Permission {
  permission_id: string;
  resource: string;
  action: string;
  is_active: boolean;
}

interface PermissionStats {
  total: number;
  active: number;
  inactive: number;
}

interface ResourceGroup {
  resource: string;
  icon: JSX.Element;
  permissions: Permission[];
  isExpanded: boolean;
  activeCount: number;
  totalCount: number;
}

/* ================= RESOURCE GROUP ================= */

const ResourceGroup: React.FC<{
  group: ResourceGroup;
  onToggle: (id: string) => Promise<void>;
  isToggling: boolean;
  onToggleExpand: (resource: string) => void;
}> = ({ group, onToggle, isToggling, onToggleExpand }) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      {/* HEADER */}
      <div
        onClick={() => onToggleExpand(group.resource)}
        className="flex cursor-pointer items-center justify-between p-4 bg-gray-50 hover:bg-[#094C81]/10 transition"
      >
        <div className="flex items-center gap-3">
          {/* ICON BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // ✅ IMPORTANT
              onToggleExpand(group.resource);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {group.isExpanded ? (
              <ChevronDown className="h-5 w-5 text-[#094C81]" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#094C81]" />
            )}
          </button>

          <div className="p-2 bg-white rounded shadow">{group.icon}</div>

          <div>
            <h3 className="font-semibold capitalize text-[#094C81]">
              {group.resource}
            </h3>
            <p className="text-sm text-gray-600">
              {group.activeCount} / {group.totalCount} active
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <AnimatePresence>
        {group.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.permissions.map((permission) => (
                <div
                  key={permission.permission_id}
                  className="flex items-center justify-between border rounded p-2"
                >
                  <span className="capitalize text-sm">
                    {permission.action.replace("_", " ")}
                  </span>

                  <button
                    onClick={() => onToggle(permission.permission_id)}
                    disabled={isToggling}
                  >
                    {permission.is_active ? (
                      <MdToggleOn className="h-8 w-8 text-green-600" />
                    ) : (
                      <MdToggleOff className="h-8 w-8 text-red-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

export default function PermissionList() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  const { search } = useGlobalSearch(); // ✅ GLOBAL SEARCH
  const { data, isLoading, isError, refetch } = useGetPermissionsQuery();
  const [togglePermission, { isLoading: isToggling }] =
    useTogglePermissionMutation();

  const resourceIcons: Record<string, JSX.Element> = {
    users: <Users className="h-4 w-4" />,
    roles: <Shield className="h-4 w-4" />,
    projects: <Folder className="h-4 w-4" />,
    issues: <BarChart3 className="h-4 w-4" />,
    system: <Settings className="h-4 w-4" />,
  };

  useEffect(() => {
    if (data?.data) {
      setPermissions(
        data.data.map((p: any) => ({
          ...p,
          is_active: !!p.is_active,
        }))
      );
    }
  }, [data]);

  const resourceGroups = useMemo(() => {
    const grouped = permissions.reduce((acc, p) => {
      acc[p.resource] = acc[p.resource] || [];
      acc[p.resource].push(p);
      return acc;
    }, {} as Record<string, Permission[]>);

    return Object.entries(grouped).map(([resource, perms]) => ({
      resource,
      icon: resourceIcons[resource] || <Shield className="h-4 w-4" />,
      permissions: perms,
      activeCount: perms.filter((p) => p.is_active).length,
      totalCount: perms.length,
      isExpanded: expandedResource === resource,
    }));
  }, [permissions, expandedResource]);

  /* ✅ GLOBAL SEARCH FILTER */
  const filteredResourceGroups = useMemo(() => {
    if (!search) return resourceGroups;

    const q = search.toLowerCase();

    return resourceGroups
      .map((g) => {
        const matched = g.permissions.filter(
          (p) =>
            p.action.toLowerCase().includes(q) ||
            g.resource.toLowerCase().includes(q)
        );

        if (matched.length > 0 || g.resource.toLowerCase().includes(q)) {
          return { ...g, permissions: matched, isExpanded: true };
        }
        return null;
      })
      .filter(Boolean) as typeof resourceGroups;
  }, [resourceGroups, search]);

  const toggleExpand = (resource: string) => {
    setExpandedResource((prev) => (prev === resource ? null : resource));
  };

  if (isLoading) return <PageLayout>Loading...</PageLayout>;
  if (isError)
    return (
      <Button onClick={refetch}>
        <RefreshCw className="mr-2 h-4 w-4" /> Retry
      </Button>
    );

  return (
    <PageLayout>
      {/* ===== PAGE HEADER ===== */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#094C81]/10">
            <Shield className="h-6 w-6 text-[#094C81]" />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Permission List
            </h1>
            <p className="text-sm text-gray-500">
              Manage system permissions grouped by resource
            </p>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResourceGroups.map((group) => (
          <ResourceGroup
            key={group.resource}
            group={group}
            onToggle={async (id) => togglePermission(id).unwrap()}
            isToggling={isToggling}
            onToggleExpand={toggleExpand}
          />
        ))}
      </div>
    </PageLayout>
  );
}

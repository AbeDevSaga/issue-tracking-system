"use client";

import React, { useEffect, useState, useMemo, JSX } from "react";
import {
  Shield,
  Users,
  Folder,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { AnimatePresence, motion } from "framer-motion";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import Breadcrumbs from "../../common/Breadcrumbs";
import { useNavigate } from "react-router";
import {
  useGetPermissionsQuery,
  useTogglePermissionMutation,
} from "../../../redux/services/permissionApi";

/* ================= TYPES ================= */
interface Permission {
  permission_id: string;
  resource: string;
  action: string;
  is_active: boolean;
}

interface ResourceGroup {
  resource: string;
  icon: JSX.Element;
  permissions: Permission[];
  activeCount: number;
  totalCount: number;
}

/* ================= RESOURCE GROUP COMPONENT ================= */
const ResourceGroup: React.FC<{
  group: ResourceGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggle: (id: string) => Promise<void>;
  isToggling: boolean;
}> = ({ group, isExpanded, onToggleExpand, onToggle, isToggling }) => {
  return (
    <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-gray-50 transition hover:bg-[#094C81]/10">
        <div className="flex items-center gap-3">
          {/* ONLY CHEVRON TOGGLE */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-[#094C81]" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#094C81]" />
            )}
          </button>

          {/* Resource Icon */}
          <div className="p-2 bg-white rounded shadow">{group.icon}</div>

          {/* Resource Info */}
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
        {isExpanded && (
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
  const [expandedResources, setExpandedResources] = useState<
    Record<string, boolean>
  >({});
  const navigate = useNavigate();
  const { search } = useGlobalSearch();
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

  // Load permissions
  useEffect(() => {
    if (data?.data) {
      setPermissions(
        data.data.map((p: any) => ({ ...p, is_active: !!p.is_active }))
      );
    }
  }, [data]);

  // Group permissions by resource
  const resourceGroups: ResourceGroup[] = useMemo(() => {
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
    }));
  }, [permissions]);

  // Apply global search
  const filteredResourceGroups = useMemo(() => {
    if (!search) return resourceGroups;

    const q = search.toLowerCase();
    const newExpandedResources: Record<string, boolean> = {};

    const filtered = resourceGroups
      .map((g) => {
        const matched = g.permissions.filter(
          (p) =>
            p.action.toLowerCase().includes(q) ||
            g.resource.toLowerCase().includes(q)
        );

        if (matched.length > 0 || g.resource.toLowerCase().includes(q)) {
          // auto-expand matched resources
          newExpandedResources[g.resource] = true;
          return { ...g, permissions: matched };
        }
        return null;
      })
      .filter(Boolean) as ResourceGroup[];

    // update expanded state for search matches
    setExpandedResources((prev) => ({ ...prev, ...newExpandedResources }));

    return filtered;
  }, [resourceGroups, search]);

  // Toggle expand for a single resource
  const toggleExpand = (resource: string) => {
    setExpandedResources((prev) => ({
      ...prev,
      [resource]: !prev[resource],
    }));
  };

  if (isLoading) return <PageLayout>Loading...</PageLayout>;
  if (isError)
    return (
      <Button onClick={refetch}>
        <RefreshCw className="mr-2 h-4 w-4" /> Retry
      </Button>
    );

  return (
    <>
      <div className="mb-4 space-y-2">
        <Breadcrumbs />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <PageLayout>
        <div className="mb-6 flex items-center gap-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
          {filteredResourceGroups.map((group) => (
            <ResourceGroup
              key={group.resource}
              group={group}
              isExpanded={!!expandedResources[group.resource]}
              onToggleExpand={() => toggleExpand(group.resource)}
              onToggle={async (id) => togglePermission(id).unwrap()}
              isToggling={isToggling}
            />
          ))}
        </div>
      </PageLayout>
    </>
  );
}

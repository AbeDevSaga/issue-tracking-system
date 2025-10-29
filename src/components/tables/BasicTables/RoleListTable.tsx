// src/components/roles/RoleListTable.tsx
import {
  EllipsisHorizontalIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import PermissionModal from "./PermissionModal";
import RoleModal from "./RoleModal";

export interface Role {
  id: string;
  role_name: string;
  description: string;
  permissions: Permission[];
  userCount?: number;
}

export interface Permission {
  permissionId: string;
  permissionName: string;
  description: string;
}

const columnHelper = createColumnHelper<Role>();

interface RoleListTableProps {
  onRefresh: () => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function RoleListTable({ onRefresh, canCreate, canUpdate, canDelete }: RoleListTableProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        console.log("Fetching roles...");
        const token = localStorage.getItem('authToken');
        console.log("Auth token:", token ? "Present" : "Missing");
        
        // Debug: Check what's in localStorage
        console.log("LocalStorage authToken:", token);
        console.log("LocalStorage user:", localStorage.getItem('user'));
        
        // Use the correct API endpoint - check your api.ts baseURL
        const res = await api.get("/roles"); // This should call /api/roles
        console.log("Roles API response:", res.data);
        
        if (res.data.success) {
          const rolesData = res.data.data.roles || res.data.data || [];
          console.log("Roles data:", rolesData);
          
          // Transform the data to match your frontend interface
          const transformedRoles = rolesData.map((role: any) => ({
            id: role.role_id || role.id,
            role_name: role.role_name,
            description: role.role_description || role.description,
            permissions: role.permissions || [],
            userCount: role.userCount || 0
          }));
          
          setRoles(transformedRoles);
        } else {
          console.error("Failed to fetch roles:", res.data.message);
        }
      } catch (err: any) {
        console.error("Failed to fetch roles", err);
        console.error("Error details:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        if (err.response?.status === 401) {
          console.error("Authentication failed - token may be invalid");
          // Clear invalid token
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          // You might want to redirect to login here or show a message
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoles();
  }, [onRefresh]);

  // Rest of your component remains the same...
  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const closeDropdown = () => setOpenDropdownId(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      closeDropdown();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleDelete = async (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.userCount && role.userCount > 0) {
      alert(`Cannot delete role "${role.role_name}" because it is assigned to ${role.userCount} user(s).`);
      return;
    }

    if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/roles/${id}`);
      onRefresh();
      alert("Role deleted successfully!");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete role";
      alert(errorMessage);
    }
    closeDropdown();
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
    closeDropdown();
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
    closeDropdown();
  };

  const handleAdd = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const closePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedRole(null);
  };

  const handleSave = () => {
    onRefresh();
    closeRoleModal();
  };

  const handlePermissionSave = () => {
    onRefresh();
    closePermissionModal();
  };

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'index',
        header: '#',
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
        size: 40,
        enableSorting: false,
      }),
      columnHelper.accessor("role_name", {
        header: "Role Name",
        cell: info => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {info.getValue()}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: info => (
          <div className="max-w-md">
            {info.getValue() || (
              <span className="text-gray-400 italic">No description</span>
            )}
          </div>
        ),
      }),
      columnHelper.display({
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => (
          <div className="max-w-xs">
            {row.original.permissions && row.original.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {row.original.permissions.slice(0, 3).map((permission) => (
                  <Badge 
                    key={permission.permissionId} 
                    size="sm" 
                    color="primary"
                    className="truncate max-w-[120px]"
                    title={permission.permissionName}
                  >
                    {permission.permissionName}
                  </Badge>
                ))}
                {row.original.permissions.length > 3 && (
                  <Badge size="sm" color="secondary">
                    +{row.original.permissions.length - 3} more
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">No permissions</span>
            )}
          </div>
        ),
      }),
      columnHelper.display({
        id: "userCount",
        header: "Users",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge size="sm" color="neutral">
              {row.original.userCount || 0}
            </Badge>
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => toggleDropdown(row.original.id, e)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <EllipsisHorizontalIcon className="size-5" />
            </button>
            
            {openDropdownId === row.original.id && (
              <div className="absolute right-0 top-full z-50 mt-1">
                <Dropdown
                  isOpen={openDropdownId === row.original.id}
                  onClose={closeDropdown}
                  className="w-48 p-1 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {canUpdate && (
                    <>
                      <DropdownItem
                        onItemClick={() => handleEdit(row.original)}
                        className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-3 py-2"
                      >
                        <PencilIcon className="size-4" /> Edit Role
                      </DropdownItem>
                      <DropdownItem
                        onItemClick={() => handleManagePermissions(row.original)}
                        className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-3 py-2"
                      >
                        <ShieldCheckIcon className="size-4" /> Manage Permissions
                      </DropdownItem>
                    </>
                  )}
                  
                  {canDelete && (
                    <DropdownItem
                      onItemClick={() => handleDelete(row.original.id)}
                      className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-3 py-2"
                      disabled={row.original.userCount && row.original.userCount > 0}
                    >
                      <TrashIcon className="size-4" /> Delete
                    </DropdownItem>
                  )}
                  
                  {/* Show message if no actions available */}
                  {!canUpdate && !canDelete && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No actions available
                    </div>
                  )}
                </Dropdown>
              </div>
            )}
          </div>
        ),
      }),
    ],
    [openDropdownId, canUpdate, canDelete, roles]
  );

  const table = useReactTable({
    data: roles,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      if (columnId === "permissions") {
        const permissions = row.original.permissions || [];
        return permissions.some(permission => 
          permission.permissionName.toLowerCase().includes(filterValue.toLowerCase())
        );
      }
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) return <div className="p-6 text-center">Loading roles...</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">System Roles</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage roles and their permissions
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[#269A99] hover:bg-[#1d7d7d] text-white"
          >
            <PlusIcon className="size-4" /> Create Role
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative max-w-md">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by role name, description, or permissions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#269A99] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={`px-5 py-4 ${
                        cell.column.id === "role_name"
                          ? "font-medium text-gray-800 dark:text-white/90"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <ShieldCheckIcon className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-lg font-medium text-gray-500">No roles found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {canCreate 
                        ? "Get started by creating your first role." 
                        : "No roles available to view."
                      }
                    </p>
                  </div>
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
          Showing {table.getRowModel().rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1"
          >
            Prev
          </Button>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1"
          >
            Next
          </Button>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="ml-2 text-sm border border-gray-300 rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            {[5, 10, 20, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modals */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={closeRoleModal}
        role={editingRole}
        onSave={handleSave}
      />

      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={closePermissionModal}
        role={selectedRole}
        onSave={handlePermissionSave}
      />
    </div>
  );
}

// Icons (keep the same)
const PencilIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 7.79m8.236 0h-8.236m8.236 0v-.959A2.25 2.25 0 0 0 18.16 4.5H5.84a2.25 2.25 0 0 0-2.244 2.244v.959m8.236 0h-8.236" />
  </svg>
);

const ShieldCheckIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);
import { useMemo, useState, useEffect } from "react";
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/solid";

const ROLE_OPTIONS = [
  "Super Admin",
  "Division XX Head",
  "Division Head",
  "Registry Officer",
  "Analyst",
  "Claims Officer",
  "Support",
  "User",
  "Read Only",
  "Auditor"
];
const PERMISSIONS = [
  "Case Verification",
  "Report Organization",
  "Case Investigation",
  "Analysis",
  "Decision Making",
  "Case Review",
  "Final Decision",
  "Letter Preparation"
];

// 20 unique roles with combinations for realistic pagination.
const initialRoles = Array.from({ length: 20 }, (_, i) => ({
  id: `ONR-${(i + 1).toString().padStart(4, "0")}`,
  roleName: ROLE_OPTIONS[i % ROLE_OPTIONS.length],
  description: ROLE_OPTIONS[i % ROLE_OPTIONS.length] + " - default description",
  permissions: PERMISSIONS.filter((_, idx) => (i + idx) % 2 === 0),
}));

function RoleModal({ open, onClose, onSave, initial, mode }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial }
      : { roleName: "", description: "", permissions: [] }
  );
  useEffect(() => {
    if (open && initial && mode === "edit") setForm({ ...initial });
    if (open && mode === "add") setForm({ roleName: "", description: "", permissions: [] });
  }, [open, initial, mode]);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handlePermissionToggle(permission) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(permission)
        ? f.permissions.filter(p => p !== permission)
        : [...f.permissions, permission]
    }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.roleName) {
      setError("Select a role name.");
      return;
    }
    setError("");
    onSave(form);
    onClose();
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-xl"
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-blue-800 font-semibold text-lg">
              {mode === "add" ? "Add New Role" : "Edit Role"}
            </span>
            <p className="text-xs text-gray-600 mt-1">
              {mode === "add"
                ? "Fill the Role Information carefully"
                : "Edit the Role Information carefully"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-blue-900 text-xl p-2"
          >
            &times;
          </button>
        </div>
        {mode === "edit" && (
          <div className="mb-3">
            <label className="block text-xs font-bold mb-1">Role ID</label>
            <input
              value={form.id}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-500"
              tabIndex={-1}
            />
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">
              Role Name <span className="text-red-600">*</span>
            </label>
            <select
              name="roleName"
              value={form.roleName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring appearance-none"
              required
            >
              <option value="">Select Role Name</option>
              {ROLE_OPTIONS.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Role Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="place role description here"
              className="w-full border rounded px-3 py-2 focus:ring"
              style={{ minHeight: "60px" }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">Permissions</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6">
              {PERMISSIONS.map((perm, idx) => (
                <label key={perm} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm)}
                    onChange={() => handlePermissionToggle(perm)}
                    className="accent-blue-800 w-4 h-4"
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
        <div className="flex justify-between gap-3 mt-7">
          <button
            type="button"
            className="px-6 py-2 border rounded text-blue-900 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-blue-900 text-white rounded hover:bg-blue-700"
          >
            {mode === "add" ? "Save Role" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RoleListTable() {
  const [roles, setRoles] = useState(initialRoles);
  const [deletedRoles, setDeletedRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingRoleIdx, setEditingRoleIdx] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [trashOpen, setTrashOpen] = useState(false);

  // Filtering
  const filteredRoles = useMemo(
    () => roles.filter(r =>
      (!searchTerm ||
        r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())))
    ),
    [roles, searchTerm]
  );
  const pageSize = 15;
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));

  // -- CRUD ---
  function handleAddRole() {
    setModalMode("add");
    setEditingRoleIdx(null);
    setModalOpen(true);
  }
  function handleEditRole(idx) {
    setModalMode("edit");
    setEditingRoleIdx(idx);
    setModalOpen(true);
  }
  function handleDeleteRole(idx) {
    if (window.confirm("Delete this role?")) {
      setDeletedRoles([...deletedRoles, roles[idx]]);
      setRoles(roles.filter((_, i) => i !== idx));
    }
  }
  function handleModalSave(form) {
    if (modalMode === "add") {
      setRoles([
        ...roles,
        {
          id: `ONR-${(roles.length + deletedRoles.length + 1).toString().padStart(4, "0")}`,
          roleName: form.roleName,
          description: form.description,
          permissions: form.permissions
        },
      ]);
    } else if (modalMode === "edit" && editingRoleIdx !== null) {
      setRoles(roles.map((r, i) =>
        i === editingRoleIdx
          ? {
              ...r,
              roleName: form.roleName,
              description: form.description,
              permissions: form.permissions,
            }
          : r
      ));
    }
  }
  function handleRestoreRole(role) {
    setRoles([...roles, role]);
    setDeletedRoles(deletedRoles.filter(r => r !== role));
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded"
            style={{ minWidth: 150 }}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-red-50 text-red-700 rounded border border-red-400 hover:bg-red-100 flex items-center"
            onClick={() => setTrashOpen(true)}
          >
            <TrashIcon className="w-5 h-5 mr-1" /> Trash
          </button>
          <button
            className="bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            onClick={handleAddRole}
          >
            <PlusIcon className="w-5 h-5" /> Add New Role
          </button>
        </div>
      </div>
      {/* Table */}
      <table className="w-full border rounded text-sm">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-3 py-3 text-left font-medium">Role ID</th>
            <th className="px-3 py-3 text-left font-medium">Role Name</th>
            <th className="px-3 py-3 text-left font-medium">Description</th>
            <th className="px-3 py-3 text-left font-medium">Permissions</th>
            <th className="px-3 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRoles.map((role, idx) => (
            <tr key={role.id} className="border-b">
              <td className="px-3 py-2">{role.id}</td>
              <td className="px-3 py-2">{role.roleName}</td>
              <td className="px-3 py-2">{role.description}</td>
              <td className="px-3 py-2">
                {role.permissions.slice(0, 3).join(", ")}
                {role.permissions.length > 3 && (
                  <> +{role.permissions.length - 3} more</>
                )}
              </td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  className="text-green-600 hover:text-green-800"
                  onClick={() => handleEditRole((currentPage - 1) * pageSize + idx)}
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteRole((currentPage - 1) * pageSize + idx)}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <span className="text-gray-500 text-xs">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            className="px-2 rounded bg-gray-100"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Back
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              className={`px-3 py-1 rounded ${
                currentPage === idx + 1
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100"
              }`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-2 rounded bg-gray-100"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal */}
      <RoleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        initial={
          modalMode === "edit" && editingRoleIdx !== null
            ? roles[editingRoleIdx]
            : null
        }
        mode={modalMode}
      />
      {/* Trash Modal */}
      {trashOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2 text-red-700">Trashed Roles</h2>
            {deletedRoles.length === 0 ? (
              <div className="text-gray-400 text-sm py-6 text-center">No deleted roles</div>
            ) : (
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr>
                    <th className="py-2 text-left">Role Name</th>
                    <th className="py-2 text-left">Role ID</th>
                    <th className="py-2">Restore</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedRoles.map((r, i) => (
                    <tr key={r.id + i}>
                      <td className="py-1">{r.roleName}</td>
                      <td className="py-1">{r.id}</td>
                      <td>
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          onClick={() => handleRestoreRole(r)}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setTrashOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


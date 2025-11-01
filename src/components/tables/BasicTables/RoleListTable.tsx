import { useMemo, useState, useEffect, useRef } from "react";
import { PencilIcon, TrashIcon, EyeIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

const ROLE_OPTIONS = [
  "Super Admin", "Division XX Head", "Division Head", "Registry Officer", "Analyst",
  "Claims Officer", "Support", "User", "Read Only", "Auditor"
];
const PERMISSIONS = [
  "Case Verification", "Report Organization", "Case Investigation", "Analysis",
  "Decision Making", "Case Review", "Final Decision", "Letter Preparation"
];

// 20 unique roles with combinations for realistic pagination.
const initialRoles = Array.from({ length: 20 }, (_, i) => ({
  id: `ONR-${(i + 1).toString().padStart(4, "0")}`,
  roleName: ROLE_OPTIONS[i % ROLE_OPTIONS.length],
  description: ROLE_OPTIONS[i % ROLE_OPTIONS.length] + " - default description",
  permissions: PERMISSIONS.filter((_, idx) => (i + idx) % 2 === 0),
}));

function AddRoleSuccessModal({ open, onCancel, onView }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-[#101624cc] z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-10 px-12 min-w-[320px] w-[400px] max-w-[96vw] relative">
        <span className="absolute left-6 top-6 text-blue-700 text-xl">✔️</span>
        <div className="pl-8">
          <div className="font-mono font-semibold text-blue-900 text-lg mb-2">
            Role added successfully.
          </div>
          <div className="text-[.99rem] mb-6 text-gray-700">
            The new role has been created and saved to the system.
          </div>
        </div>
        <div className="flex gap-6 justify-center mt-3 w-full">
          <button
            className="rounded border border-blue-900 px-6 py-2 font-semibold hover:bg-gray-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded bg-blue-900 text-white px-7 py-2 font-semibold hover:bg-blue-800"
            onClick={onView}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteRoleConfirmModal({ open, onCancel, onDelete }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-[#101624cc] z-50 flex items-center justify-center">
      <div
        className="shadow-xl border-2 border-blue-300 rounded-xl bg-white px-10 py-8 min-w-[410px] w-[440px] max-w-[95vw] relative"
        style={{ borderStyle: "dashed" }}
      >
        <div className="bg-[#FF5B5B] rounded-t px-3 py-1 mb-3 flex items-center text-white font-mono font-semibold text-lg tracking-wide"
          style={{ width: "fit-content" }}
        >
          Confirm Delete
        </div>
        <div className="bg-gray-50 rounded px-3 py-2 mb-3 font-mono">
          Are you sure you want to delete the role ? This action cannot be undone.
        </div>
        <div className="text-[#FF5B5B] text-sm pl-1 my-2 flex items-center">
          <span className="mr-2">⚠️</span>
          <span>Warning: Deleting this role will affect all users assigned to it.</span>
        </div>
        <div className="flex justify-between gap-3 mt-6 px-1">
          <button
            className="rounded border border-blue-900 px-7 py-2 font-semibold hover:bg-gray-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded bg-[#FF5B5B] text-white px-9 py-2 font-semibold hover:bg-red-600"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Role Detail Modal
function RoleDetailModal({ open, onClose, role }) {
  if (!open || !role) return null;
  return (
    <div className="fixed inset-0 bg-[#101624cc] z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] px-8 py-6 relative">
        <button
          className="absolute right-5 top-5 text-[#1956A7] hover:text-blue-900 text-lg font-bold"
          onClick={onClose}
          aria-label="Close"
        >×</button>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-800 mb-3">
            {role.roleName ? role.roleName[0].toUpperCase() : "R"}
          </div>
          <div className="font-semibold text-lg mb-1">{role.roleName}</div>
          <div className="text-sm text-gray-500 mb-2">{role.id}</div>
          <table className="text-[15px] mt-3 mb-2">
            <tbody>
              <tr>
                <td className="pr-3 font-semibold text-gray-600">Description:</td>
                <td>{role.description}</td>
              </tr>
              <tr>
                <td className="pr-3 font-semibold text-gray-600 align-top">Permissions:</td>
                <td>
                  <ul className="text-sm list-disc ml-4">
                    {role.permissions.map((perm, i) => (
                      <li key={i}>{perm}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-[#101624cc] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl px-8 py-8 w-full max-w-md shadow-2xl"
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

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [addSuccessOpen, setAddSuccessOpen] = useState(false);
  const [newlyAddedRoleId, setNewlyAddedRoleId] = useState(null);

  // Role Detail Modal state
  const [viewRole, setViewRole] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const filteredRoles = useMemo(
    () => roles.filter(r =>
      (!searchTerm ||
        r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())))
    ),
    [roles, searchTerm]
  );
  const pageSize = 5;
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));

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
    setDeleteIdx(idx);
    setDeleteConfirmOpen(true);
  }
  function confirmDeleteRole() {
    if (deleteIdx !== null) {
      setDeletedRoles([...deletedRoles, roles[deleteIdx]]);
      setRoles(roles.filter((_, i) => i !== deleteIdx));
      setDeleteIdx(null);
      setDeleteConfirmOpen(false);
    }
  }
  function cancelDeleteRole() {
    setDeleteIdx(null);
    setDeleteConfirmOpen(false);
  }
  function handleModalSave(form) {
    if (modalMode === "add") {
      const roleid = `ONR-${(roles.length + deletedRoles.length + 1).toString().padStart(4, "0")}`;
      setRoles([
        ...roles,
        {
          id: roleid,
          roleName: form.roleName,
          description: form.description,
          permissions: form.permissions
        },
      ]);
      setNewlyAddedRoleId(roleid);
      setModalOpen(false);
      setAddSuccessOpen(true);
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
      setModalOpen(false);
    }
  }
  function handleRestoreRole(role) {
    setRoles([...roles, role]);
    setDeletedRoles(deletedRoles.filter(r => r !== role));
  }

  function handleViewRole(role) {
    setViewRole(role);
    setViewModalOpen(true);
  }

  const tableRef = useRef(null);

  useEffect(() => {
    if (addSuccessOpen === false && newlyAddedRoleId && tableRef.current) {
      const el = document.getElementById("role-" + newlyAddedRoleId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-blue-50");
        setTimeout(() => {
          el.classList.remove("bg-blue-50");
        }, 2500);
      }
      setNewlyAddedRoleId(null);
    }
  }, [addSuccessOpen, newlyAddedRoleId]);

  function handleAddSuccessCancel() { setAddSuccessOpen(false); }
  function handleAddSuccessView() { setAddSuccessOpen(false); }

  return (
    <main className="flex-1 flex flex-col items-stretch py-6 px-8">
      <div className="rounded-xl border border-blue-100 bg-white p-7" style={{ minHeight: 480 }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <span className="text-gray-400 text-[15px] mt-1">
              This is the role management page
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 bg-gray-50 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 placeholder-gray-400 text-[15px] w-[180px]"
            />
            <button
              className="ml-1 flex items-center px-2 py-2 rounded-lg border border-blue-900 text-blue-900 font-semibold bg-white hover:bg-blue-50 shadow"
              title="Show Trashed Roles"
              onClick={() => setTrashOpen(true)}
            >
              <TrashIcon className="w-5 h-5" />
              <span className="ml-1 text-sm font-bold">Trash</span>
            </button>
            <button
              className="bg-blue-900 text-white px-6 py-2 font-semibold rounded-lg shadow hover:bg-blue-800 flex items-center gap-2"
              onClick={handleAddRole}
            >
              <PlusCircleIcon className="w-5 h-5" /> Add New Role
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto mt-2" ref={tableRef}>
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3 rounded-tl-[12px]">Role ID</th>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3">Role Name</th>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3">Description</th>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3">Permissions</th>
                <th className="bg-blue-900 text-white font-bold text-center px-5 py-3 rounded-tr-[12px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoles.map((role, idx) => (
                <tr
                  key={role.id}
                  id={"role-" + role.id}
                  className={"border-b border-gray-100"}
                  style={{ height: 34 }}
                >
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium rounded-l-[12px]">{role.id}</td>
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium">{role.roleName}</td>
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium">{role.description}</td>
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium">
                    {role.permissions.slice(0, 3).join(", ")}
                    {role.permissions.length > 3 && (
                      <span title={role.permissions.join(", ")} className="text-blue-700 cursor-pointer"> +{role.permissions.length - 3} more</span>
                    )}
                  </td>
                  <td className="bg-white px-5 py-1 align-middle text-center rounded-r-[12px] flex gap-2 justify-center">
                    <button
                      className="text-blue-900 hover:text-blue-700"
                      onClick={() => handleViewRole(role)}
                      title="View"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleEditRole((currentPage - 1) * pageSize + idx)}
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteRole((currentPage - 1) * pageSize + idx)}
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-100"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage-1)}
            >Back</button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx+1}
                className={`px-3 py-1 rounded font-bold ${currentPage === idx+1 ? "bg-blue-900 text-white" : "border border-gray-200 bg-white hover:bg-gray-100"}`}
                onClick={() => setCurrentPage(idx+1)}
              >{idx+1}</button>
            ))}
            <button
              className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-100"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage+1)}
            >Next</button>
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
        <AddRoleSuccessModal
          open={addSuccessOpen}
          onCancel={handleAddSuccessCancel}
          onView={handleAddSuccessView}
        />
        <DeleteRoleConfirmModal
          open={deleteConfirmOpen}
          onCancel={cancelDeleteRole}
          onDelete={confirmDeleteRole}
        />
        <RoleDetailModal
          open={viewModalOpen}
          role={viewRole}
          onClose={() => setViewModalOpen(false)}
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
    </main>
  );
}

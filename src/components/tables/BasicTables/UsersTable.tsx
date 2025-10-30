import { useMemo, useState } from "react";
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/solid';

const mockUsersInitial = [
  { user_id: "u1", full_name: "Jemal Adem", organization: "MoTL", email: "jemal.adem@aii.gov.et", phone: "0910171711", role: "Super Admin" },
  { user_id: "u2", full_name: "Marta Eshetu", organization: "ICS", email: "marta.e@ics.org", phone: "0910987261", role: "Division XX Head" },
  { user_id: "u3", full_name: "Biniam Fikru", organization: "AA CITY LAB", email: "biniam.fikru@aacity.lab", phone: "0910123411", role: "User" },
  { user_id: "u4", full_name: "Abeba Haile", organization: "OTA", email: "abeba.haile@ota.org", phone: "0910456700", role: "Division Head" },
  { user_id: "u5", full_name: "Yared Gashaw", organization: "MoTL", email: "yared.gashaw@aii.gov.et", phone: "0910679512", role: "User" },
  { user_id: "u6", full_name: "Hanna Belay", organization: "ICS", email: "hanna.b@ics.org", phone: "0910888877", role: "Super Admin" },
  { user_id: "u7", full_name: "Getahun Tadesse", organization: "AA CITY LAB", email: "getahun.t@aacity.lab", phone: "0910112233", role: "Division XX Head" },
  { user_id: "u8", full_name: "Selam Dawit", organization: "OTA", email: "selam.d@ota.org", phone: "0910223344", role: "Division Head" },
  { user_id: "u9", full_name: "Kassahun Worku", organization: "MoTL", email: "kassahun.w@aii.gov.et", phone: "0910334455", role: "User" },
  { user_id: "u10", full_name: "Aster Mengistu", organization: "ICS", email: "aster.m@ics.org", phone: "0910445566", role: "Super Admin" },
  { user_id: "u11", full_name: "Elias Fisseha", organization: "AA CITY LAB", email: "elias.f@aacity.lab", phone: "0910556677", role: "Division XX Head" },
  { user_id: "u12", full_name: "Rahel Desta", organization: "OTA", email: "rahel.d@ota.org", phone: "0910667788", role: "Division Head" },
  { user_id: "u13", full_name: "Tilahun Habte", organization: "MoTL", email: "tilahun.h@aii.gov.et", phone: "0910778899", role: "User" },
  { user_id: "u14", full_name: "Sofia Tesfaye", organization: "ICS", email: "sofia.t@ics.org", phone: "0910889900", role: "Super Admin" },
  { user_id: "u15", full_name: "Dawit Mulugeta", organization: "AA CITY LAB", email: "dawit.m@aacity.lab", phone: "0910111999", role: "Division XX Head" }
];

const organizations = ['MoTL', 'ICS', 'AA CITY LAB', 'OTA'];
const roles = ['Super Admin', 'Division XX Head', 'Division Head', 'User'];

function UserFormModal({ open, onClose, onSave, initial, mode }) {
  const [form, setForm] = useState(
    initial || { full_name: '', email: '', organization: '', system: '', role: '', phone: '' }
  );
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const isEmail = form.email.includes('@');
    const isPhone = /^\d+$/.test(form.phone);
    if (!form.full_name.trim() || !form.organization || !isEmail || !isPhone || !form.role) {
      setError("All fields are required. Email must have '@'. Phone numbers must be digits only.");
      return;
    }
    setError('');
    onSave(form);
    onClose();
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 w-full max-w-xl shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-blue-800 font-semibold text-lg">{mode === "add" ? "Add User" : "Edit User"}</span>
            <p className="text-xs text-gray-600 mt-1">Fill the user Information carefully</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-blue-900 text-xl p-2">&times;</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="enter full name"
             className="w-full border rounded px-3 py-2 focus:ring" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="example.domain@gmail.com"
              className="w-full border rounded px-3 py-2 focus:ring" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Select organization</label>
            <select name="organization" value={form.organization} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">select your organization</option>
              {organizations.map(org => <option key={org}>{org}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Select Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Role Name</option>
              {roles.map(role => <option key={role}>{role}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Phone Number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="Phone numbers only" className="w-full border rounded px-3 py-2 focus:ring" />
          </div>
          {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
        <div className="flex justify-between gap-3 mt-7">
          <button type="button" className="px-6 py-2 border rounded text-blue-900 hover:bg-gray-50"
           onClick={onClose}>Cancel</button>
          <button type="submit" className="px-8 py-2 bg-blue-900 text-white rounded hover:bg-blue-700"
          >Save</button>
        </div>
      </form>
    </div>
  );
}

export default function UsersTable() {
  const [users, setUsers] = useState(mockUsersInitial);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingUser, setEditingUser] = useState(null);

  // Trash modal state
  const [trashOpen, setTrashOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering
  const filteredUsers = useMemo(() =>
    users.filter(u =>
      (!searchTerm ||
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!organizationFilter || u.organization === organizationFilter) &&
      (!roleFilter || u.role === roleFilter)
    ),
    [users, searchTerm, organizationFilter, roleFilter]
  );
  const pageSize = 10;
  const paginatedUsers = filteredUsers.slice((currentPage-1)*pageSize, currentPage*pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Actions
  function handleAddUser() {
    setModalMode("add");
    setEditingUser(null);
    setModalOpen(true);
  }
  function handleEditUser(user) {
    setModalMode("edit");
    setEditingUser(user);
    setModalOpen(true);
  }
  function handleDeleteUser(user) {
    if (window.confirm("Delete this user?")) {
      setDeletedUsers([...deletedUsers, user]);
      setUsers(users.filter(u => u.user_id !== user.user_id));
    }
  }
  function handleModalSave(form) {
    if (modalMode === "add") {
      setUsers([
        ...users,
        { ...form, user_id: "u" + (users.length + deletedUsers.length + 1) }
      ]);
    } else if (modalMode === "edit" && editingUser) {
      setUsers(users.map(u => u.user_id === editingUser.user_id ? { ...u, ...form } : u));
    }
  }
  function handleRestoreUser(user) {
    setUsers([...users, user]);
    setDeletedUsers(deletedUsers.filter(u => u.user_id !== user.user_id));
  }

  // UI
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search ..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded"
            style={{ minWidth: 150 }}
          />
          <select
            value={organizationFilter}
            onChange={e => { setOrganizationFilter(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Organization</option>
            {organizations.map(org => <option key={org}>{org}</option>)}
          </select>
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Role</option>
            {roles.map(role => <option key={role}>{role}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-red-50 text-red-700 rounded border border-red-400 hover:bg-red-100 flex items-center"
            onClick={() => setTrashOpen(true)}
          >
            <TrashIcon className="w-5 h-5 mr-1" /> Trash
          </button>
          <button
            className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleAddUser}
          >Add User</button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border rounded text-sm">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-4 py-3 text-left font-medium">Full Name</th>
            <th className="px-4 py-3 text-left font-medium">Organization</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Phone No.</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="px-4 py-3 text-left font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((u) => (
            <tr key={u.user_id} className="border-b">
              <td className="px-4 py-2">{u.full_name}</td>
              <td className="px-4 py-2">{u.organization}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.phone}</td>
              <td className="px-4 py-2">{u.role}</td>
              <td className="px-4 py-2 flex gap-2">
                <button className="text-green-600 hover:text-green-800" onClick={() => handleEditUser(u)}>
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteUser(u)}>
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
            onClick={() => setCurrentPage(currentPage-1)}
          >Back</button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx+1}
              className={`px-3 py-1 rounded ${currentPage === idx+1 ? "bg-blue-900 text-white" : "bg-gray-100"}`}
              onClick={() => setCurrentPage(idx+1)}
            >{idx+1}</button>
          ))}
          <button
            className="px-2 rounded bg-gray-100"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage+1)}
          >Next</button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        initial={editingUser}
        mode={modalMode}
      />

      {/* Trash Modal */}
      {trashOpen &&
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2 text-red-700">Trashed Users</h2>
            {deletedUsers.length === 0 ? (
              <div className="text-gray-400 text-sm py-6 text-center">No deleted users</div>
            ) : (
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr>
                    <th className="py-2 text-left">Name</th>
                    <th className="py-2 text-left">Email</th>
                    <th className="py-2">Restore</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedUsers.map(u => (
                    <tr key={u.user_id}>
                      <td className="py-1">{u.full_name}</td>
                      <td className="py-1">{u.email}</td>
                      <td>
                        <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => handleRestoreUser(u)}>
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setTrashOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

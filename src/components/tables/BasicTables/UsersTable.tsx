import { useMemo, useState } from "react";
import { PencilIcon, TrashIcon, EyeIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

const organizations = ['MoTL', 'ICS', 'AA CITY LAB', 'OTA'];
const systems = ['HR System', 'Finance System', 'Document System'];
const roles = ['Super Admin', 'Division XX Head', 'Division Head', 'User'];

const names = [
  "Liya Tefera", "Samrawit Mekonnen", "Abel Kidane", "Belen Sileshi", "Brook Ayalew", "Hanna Nega",
  "Dawit Tarekegn", "Sofia Bizuneh", "Mulugeta Getachew", "Helen Alemu", "Temesgen Asfaw",
  "Selam Dawit", "Fitsum Abebe", "Bethel Ashenafi", "Dagmawit Fekadu", "Dagim Alemayehu",
  "Elshaday Ademe", "Rahwa Solomon", "Saron Mulu", "Kaleb Tadesse", "Meklit Gashaw", "Endalkachew Melaku",
  "Almaz Zebene", "Eyerusalem Shiferaw", "Kefyalew Mekuria"
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomUser(i) {
  const name = names[getRandomInt(0, names.length - 1)];
  const org = organizations[getRandomInt(0, organizations.length - 1)];
  const sys = systems[getRandomInt(0, systems.length - 1)];
  const role = roles[getRandomInt(0, roles.length - 1)];
  const emailUser = name.toLowerCase().replace(/\s/g, '.') + (i + 10);
  const domain = org === "ICS" ? "ics.org" : org === "MoTL" ? "aii.gov.et" : org === "AA CITY LAB" ? "aacity.lab" : "ota.org";
  return {
    user_id: `u${i + 1}`,
    full_name: name,
    organization: org,
    system: sys,
    email: `${emailUser}@${domain}`,
    phone: `+2519${getRandomInt(100000000,999999999)}`,
    role: role
  };
}
const mockUsersInitial = Array.from({ length: 20 }).map((_, i) => randomUser(i));

// Success alert/modal as in provided screenshot
function AddUserSuccessModal({ open, onCancel, onView }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-[#101624cc] z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-10 px-12 min-w-[320px] w-[400px] max-w-[96vw] relative">
        <span className="absolute left-6 top-6 text-blue-700 text-xl">✔️</span>
        <div className="pl-8">
          <div className="font-mono font-semibold text-blue-900 text-lg mb-2">
            User added successfully.
          </div>
          <div className="text-[.99rem] mb-6 text-gray-700">
            The new user account has been created and saved to the system.
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

// Modal (Add/Edit)
function UserFormModal({ open, onClose, onSave, initial, mode }) {
  const [form, setForm] = useState(
    initial || { full_name: '', email: '', phone: '', organization: '', system: '', role: '' }
  );
  const [error, setError] = useState('');
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "phone") {
      // Remove non-numeric, take up to 9 digits (start with 9, e.g. 911234567)
      let digits = value.replace(/\D/g, '').replace(/^0/, '');
      if (digits.length > 9) digits = digits.slice(0, 9);
      setForm(f => ({ ...f, phone: digits }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.organization || !form.role || !form.system || !form.email || !form.phone || form.phone.length !== 9) {
      setError("All fields are required, and phone must be 9 digits.");
      return;
    }
    setError('');
    // Always save with "+251" prefix
    onSave({ ...form, phone: "+251" + form.phone });
    onClose();
  }
  // When editing, update form with initial
  useMemo(() => { if (mode === "edit") setForm(initial); }, [initial, mode]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[#101624cc] z-50 flex items-center justify-center">
      <div className="bg-white rounded-[18px] shadow-2xl w-[500px] h-[500px] max-w-[98vw] max-h-[98vh] px-8 py-7 relative flex flex-col justify-between">
        <button
          className="absolute right-5 top-5 text-[#1956A7] hover:text-blue-900 text-lg font-bold"
          onClick={onClose}
          aria-label="Close"
        >×</button>
        <div>
          <div className="font-bold text-[17px] text-[#1956A7] mb-1">Add User</div>
          <div className="text-xs text-[#222] mb-6 ml-[1px]">Fill the user Information carefully</div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-[14px] text-[#1956A7] font-bold mb-1">Full Name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="enter full name"
                className="w-full border border-[#E8ECEF] rounded-[6px] px-4 py-2.5 bg-[#F7F9FB] text-[15px] placeholder-gray-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-[14px] text-[#1956A7] font-bold mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example.domain@gmail.com"
                className="w-full border border-[#E8ECEF] rounded-[6px] px-4 py-2.5 bg-[#F7F9FB] text-[15px] placeholder-gray-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-[14px] text-[#1956A7] font-bold mb-1">Phone Number</label>
              <div className="flex items-center">
                <span className="rounded-l bg-gray-100 border border-r-0 border-[#E8ECEF] px-3 py-2.5 text-[15px] text-gray-500 select-none">
                  +251
                </span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9XXXXXXXX"
                  className="rounded-r w-full border border-[#E8ECEF] px-3 py-2.5 bg-[#F7F9FB] text-[15px] placeholder-gray-400"
                  maxLength={9}
                  pattern="\d*"
                  type="text"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-[14px] text-[#1956A7] font-bold mb-1">Select organization</label>
              <select
                name="organization"
                value={form.organization}
                onChange={handleChange}
                className="w-full border border-[#E8ECEF] rounded-[6px] px-4 py-2.5 bg-[#F7F9FB] text-[15px] text-gray-800"
              >
                <option value="">select your organization</option>
                {organizations.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-[14px] text-[#1956A7] font-bold mb-1">Select System</label>
              <select
                name="system"
                value={form.system}
                onChange={handleChange}
                className="w-full border border-[#E8ECEF] rounded-[6px] px-4 py-2.5 bg-[#F7F9FB] text-[15px] text-gray-800"
              >
                <option value="">select System name</option>
                {systems.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-[14px] text-[#1956A7] font-bold mb-1">Select Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-[#E8ECEF] rounded-[6px] px-4 py-2.5 bg-[#F7F9FB] text-[15px] text-gray-800"
              >
                <option value="">Role Name</option>
                {roles.map(role => <option key={role}>{role}</option>)}
              </select>
            </div>
            {error && <div className="text-xs text-red-600 mb-3">{error}</div>}
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                className="border border-[#1956A7] rounded-md px-8 py-2.5 bg-white text-[#1956A7] font-medium hover:bg-[#F1F7FB] transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#1956A7] text-white rounded-md px-10 py-2.5 font-semibold shadow hover:bg-[#114080] transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// User Detail Modal
function UserDetailModal({ open, onClose, user }) {
  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 bg-[#101624cc] z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] px-8 py-7 relative">
        <button
          className="absolute right-5 top-5 text-[#1956A7] hover:text-blue-900 text-lg font-bold"
          onClick={onClose}
          aria-label="Close"
        >×</button>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-800 mb-3">
            {user.full_name ? user.full_name[0].toUpperCase() : "U"}
          </div>
          <div className="font-semibold text-lg mb-1">{user.full_name}</div>
          <div className="text-sm text-gray-500 mb-1">{user.email}</div>
          <table className="text-[15px] mt-3">
            <tbody>
              <tr><td className="pr-3 font-semibold text-gray-600">Organization:</td><td>{user.organization}</td></tr>
              <tr><td className="pr-3 font-semibold text-gray-600">System:</td><td>{user.system}</td></tr>
              <tr><td className="pr-3 font-semibold text-gray-600">Phone:</td><td>{user.phone}</td></tr>
              <tr><td className="pr-3 font-semibold text-gray-600">Role:</td><td>{user.role}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function UsersTable() {
  const [users, setUsers] = useState(mockUsersInitial);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingUser, setEditingUser] = useState(null);

  const [trashOpen, setTrashOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [newlyAddedUser, setNewlyAddedUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
  const pageSize = 5;
  const paginatedUsers = filteredUsers.slice((currentPage-1)*pageSize, currentPage*pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

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
      const newUser = { ...form, user_id: "u" + (users.length + deletedUsers.length + 1) };
      setUsers([...users, newUser]);
      setNewlyAddedUser(newUser);
      setSuccessModalOpen(true);
    } else if (modalMode === "edit" && editingUser) {
      setUsers(users.map(u => u.user_id === editingUser.user_id ? { ...u, ...form } : u));
    }
  }
  function handleRestoreUser(user) {
    setUsers([...users, user]);
    setDeletedUsers(deletedUsers.filter(u => u.user_id !== user.user_id));
  }
  function handleViewUser(user) {
    setViewUser(user);
    setUserDetailOpen(true);
  }

  // Handle success modal actions
  function handleSuccessCancel() {
    setSuccessModalOpen(false);
    setNewlyAddedUser(null);
  }
  function handleSuccessView() {
    setSuccessModalOpen(false);
    if (newlyAddedUser) {
      setViewUser(newlyAddedUser);
      setUserDetailOpen(true);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-stretch py-6 px-8">
      <div className="rounded-xl border border-blue-100 bg-white p-7" style={{ minHeight: 480 }}>
        {/* --- TOPBAR --- */}
        <div className="flex flex-wrap gap-3 items-center mb-2 justify-between">
          <div>
            <span className="text-gray-400 text-[15px] mt-1">This is the the user management page</span>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 bg-gray-50 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 placeholder-gray-400 text-[15px] w-[180px]"
            />
            <select
              value={organizationFilter}
              onChange={e => { setOrganizationFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:outline-none w-[145px]"
            >
              <option value="">Organization</option>
              {organizations.map(org => <option key={org}>{org}</option>)}
            </select>
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:outline-none w-[140px]"
            >
              <option value="">Name</option>
              {roles.map(role => <option key={role}>{role}</option>)}
            </select>
            <button
              className="bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-800 flex items-center gap-2"
              onClick={handleAddUser}
            >
              <PlusCircleIcon className="w-5 h-5 mr-1" /> Add User
            </button>
            {/* Trash Button (top bar) */}
            <button
              className="ml-1 flex items-center px-2 py-2 rounded-lg border border-blue-900 text-blue-900 font-semibold bg-white hover:bg-blue-50 shadow"
              title="Show Trashed Users"
              onClick={() => setTrashOpen(true)}
            >
              <TrashIcon className="w-5 h-5" />
              <span className="ml-1 text-sm font-bold">Trash</span>
            </button>
          </div>
        </div>
        {/* --- END TOPBAR --- */}

        {/* Table */}
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3 rounded-tl-[12px]">Full Name</th>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3">Organization</th>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3">Email</th>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3">Phone No.</th>
                <th className="bg-blue-900 text-white font-bold text-left px-5 py-3">Role</th>
                <th className="bg-blue-900 text-white font-bold text-center px-5 py-3 rounded-tr-[12px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, idx) => (
                <tr
                  key={u.user_id}
                  style={{ height: 34 }}
                  className="border-b border-gray-100"
                >
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium rounded-l-[12px]">{u.full_name}</td>
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium">{u.organization}</td>
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium">{u.email}</td>
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium">{u.phone}</td>
                  <td className="bg-white px-5 py-1 align-middle text-left font-medium">{u.role}</td>
                  <td className="bg-white px-5 py-1 align-middle text-center rounded-r-[12px]">
                    <button className="text-blue-900 hover:text-blue-700 mx-2" title="View" onClick={() => handleViewUser(u)}><EyeIcon className="w-5 h-5" /></button>
                    <button className="text-green-600 hover:text-green-800 mx-2" onClick={() => handleEditUser(u)} title="Edit"><PencilIcon className="w-5 h-5" /></button>
                    <button className="text-red-600 hover:text-red-800 mx-2" onClick={() => handleDeleteUser(u)} title="Delete"><TrashIcon className="w-5 h-5" /></button>
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
        {/* Add/Edit Modal */}
        <UserFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          initial={editingUser}
          mode={modalMode}
        />
        {/* Add Success Modal */}
        <AddUserSuccessModal
          open={successModalOpen}
          onCancel={handleSuccessCancel}
          onView={handleSuccessView}
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
        {/* View User Modal (Detail) */}
        <UserDetailModal open={userDetailOpen} user={viewUser} onClose={() => setUserDetailOpen(false)} />
      </div>
    </main>
  );
}

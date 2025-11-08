import { PencilIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import Badge from "../../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useTranslation } from "react-i18next";
import AddUser from "../../../pages/Users/usersModal";
import Alert from "../../ui/alert/Alert";

interface User {
  id: string;
  full_name:String;
  username: string;
  phone_number: string;
  email:String;
  role:String;
  user_type:String;
  branch_id:String;
  organization_name:String;
}
interface Organization {
  id: string;
  organization_name: string;
  has_branch: boolean;
}
interface Branch {
  id: string;
  organization_id: string;
  parent_hierarchy_id?: string;
}
interface Hierarchy {
  id: string;
  hierarchy_name: string;
  parent_hierarchy_id?: string;
}

interface Role {
  id: string;
  name:String;
}
const mockRoles: Role[] = [
    {
    id:"1",
    name:"admin"
    },
     {
    id:"1",
    name:"developer"
    },
     {
    id:"1",
    name:"team leader"
    },
     {
    id:"1",
    name:"quality assurance"
    },
]
const mockUsers: User[] = [
  {
    id: "org001",
    full_name:"Test User",
    phone_number:"0912345678",
    username: "test_user",
    user_type:"internal",
    email:"user@gmail.com",
    role:"Developer",
    branch_id:"3",
    organization_name:"EPA"
  },
];
const mockBranches: Branch[] = [
 
];
const mockHierarchies: Hierarchy[] = [
  { id: "h1", hierarchy_name: "Central" },
  { id: "h2", hierarchy_name: "City" , parent_hierarchy_id: "h1"},
  { id: "h3", hierarchy_name: "Subcity", parent_hierarchy_id: "h2" },
  { id: "h4", hierarchy_name: "Woreda", parent_hierarchy_id: "h3"},
];

// Sample organizations
const mockOrganizations: Organization[] = [
  { id: "org001", organization_name: "EPA", has_branch: true },
  { id: "org002", organization_name: "Horizon", has_branch: false },
  { id: "org003", organization_name: "EthioTech", has_branch: true },
];


export default function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  const filteredUsers = useMemo(() => {
  return mockUsers.filter((user) =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [searchTerm]);


  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subcity?")) {
      console.log("Deleting subcity:", id);
    }
  };
const openModal = (org?: User) => {
  setEditData(org || null);
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setEditData(null);
};

  const handleView = (id: string) => {
    console.log("Viewing subcity:", id);
  };

const handleEdit = (id: string) => {
  const org = mockUsers.find((o) => o.id === id);
  console.log("org",org)
  if (org) openModal(org);

};

const handleFormSubmit = (values: Record<string, any>) => {
  if (editData) {
    console.log("Updating:", { ...editData, ...values });
    setAlert({ type: "success", message: "User updated successfully!" });
  } else {
    console.log("Adding:", values);
    setAlert({ type: "success", message: "User added successfully!" });
  }
  closeModal();
  setTimeout(() => setAlert(null), 3000);
};
  return (
    <>
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-xs">
          <div className="scale-95 shadow-md rounded-md">
            <Alert
              variant={alert.type}
              title={
                <span className="text-sm font-semibold capitalize">
                  {alert.type}
                </span>
              }
              message={<span className="text-xs">{alert.message}</span>}
              showLink={false}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-[#1E516A] text-sm">Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <span className="text-[#1E516A] text-sm">entries</span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={()=>openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#094C81] text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t("user.add_user")}
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader className="bg-[#094C81] h-[60px]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start first:rounded-tl-xl"
                >
                  {t("common.id")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("user.user_name")}
                </TableCell>
                 <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("user.phone_number")}
                </TableCell>
                 <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("user.email")}
                </TableCell>
                 <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("user.role")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start last:rounded-tr-xl"
                >
                  {t("common.action")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="px-4 py-3 text-[#1E516A] text-start">
                    {index + 1}
                  </TableCell>
                   <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-[#1E516A]">
                      {user.username}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-[#1E516A]">
                      {user.phone_number}
                    </span>
                  </TableCell>
                   <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-[#1E516A]">
                      {user.email}
                    </span>
                  </TableCell> <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-[#1E516A]">
                      {user.role}
                    </span>
                  </TableCell>
                
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(user.id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="text-gray-600 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-[#1E516A] text-sm">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredUsers.length)}{" "}
          of {filteredUsers.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>

{isModalOpen && (
  <AddUser
    onClose={closeModal}
    onSubmit={handleFormSubmit}
    fields={[
      { id: "full_name", label: t("user.full_name"), type: "text", placeholder: "Enter Full Name", value: editData?.full_name || "" },
      { id: "email", label: t("user.email"), type: "email", placeholder: "Enter Email", value: editData?.email || "" },
      { id: "phone_number", label: t("user.phone_number"), type: "number", placeholder: "Enter Phone Number", value: editData?.phone_number || "" },
      { id: "user_type", label: t("user.user_type"), type: "select", options: [{ value: "internal", label: "Internal" }, { value: "external", label: "External" }], placeholder: "Select User Type", value: editData?.user_type || "" },
      { id: "organization_name", label: t("user.organization_name"), type: "select", options: [{ value: "EPA", label: "EPA" }, { value: "MESOB", label: "MESOB" }], placeholder: "Select Organization", value: editData?.organization_name || "" },
   
    ]}
  />
)}


    </>
  );
}

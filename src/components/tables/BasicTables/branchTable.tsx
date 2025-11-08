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
import AddBranch from "../../../pages/branch/branchModal";
import Alert from "../../ui/alert/Alert";

interface Organization {
  id: string;
  organization_name: string;
  has_branch: boolean;
}

interface Hierarchy {
  id: string;
  hierarchy_name: string;
  parent_hierarchy_id?: string;
}

interface Branch {
  id: string;
  organization_name?: string;
  hierarchy_id: string;
  branch_name:String;
  description: string;
  has_branch: boolean;
}

// Sample hierarchies
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

// Sample branches
const mockBranches: Branch[] = [
  {
    id: "b001",
    organization_name: "MESOB",
    hierarchy_id: "h1",
    branch_name:"Branch 1",
    description: "City-level main branch",
    has_branch: true,
  },
  {
    id: "b002",
    organization_name: "MESOB",
    hierarchy_id: "h2",
    branch_name:"Branch 2",
    description: "Subcity branch",
    has_branch: true,
  },
  {
    id: "b003",
    organization_name: "MESOB",
    hierarchy_id: "h3",
    branch_name:"Branch 3",
    description: "Woreda branch",
    has_branch: true,
  },
];

export default function BranchTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Branch | null>(null);
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  // Filter branches
  const filteredBranches = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return mockBranches.filter((b) => 
      b.organization_name?.toLowerCase().includes(term) ||
      b.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedBranches = filteredBranches.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const totalPages = Math.ceil(filteredBranches.length / entriesPerPage);

  const openModal = (branch?: Branch) => {
    setEditData(branch ?? null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = (values: Record<string, any>) => {
    if (editData) {
      console.log("Updating:", { ...editData, ...values });
      setAlert({ type: "success", message: "Branch updated successfully!" });
    } else {
      console.log("Adding:", values);
      setAlert({ type: "success", message: "Branch added successfully!" });
    }
    closeModal();
    setTimeout(() => setAlert(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      console.log("Deleting branch:", id);
    }
  };

  const handleView = (id: string) => {
    console.log("Viewing branch:", id);
  };

  const handleEdit = (id: string) => {
    const branch = mockBranches.find((b) => b.id === id);
    if (branch) openModal(branch);
  };

  return (
    <>
      {/* Alert */}
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-xs">
          <div className="scale-95 shadow-md rounded-md">
            <Alert
              variant={alert.type}
              title={<span className="text-sm font-semibold capitalize">{alert.type}</span>}
              message={<span className="text-xs">{alert.message}</span>}
              showLink={false}
            />
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-[#1E516A] text-sm">Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#094C81] text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t("branch.add_branch")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader className="bg-[#094C81] h-[60px]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start first:rounded-tl-xl">
                  {t("common.id")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start">
                  {t("organization.organization_name")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start">
                  {t("branch.hierarchy_level")}
                </TableCell>
                 <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start">
                  {t("branch.branch_name")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start last:rounded-tr-xl">
                  {t("common.action")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedBranches.map((branch, index) => {
                const hierarchy = mockHierarchies.find(h => h.id === branch.hierarchy_id);
                return (
                  <TableRow key={branch.id}>
                    <TableCell className="px-4 py-3 text-[#1E516A] text-start">{index + 1}</TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="font-medium text-[#1E516A]">{branch.organization_name}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#1E516A]">
                      {hierarchy?.hierarchy_name || "—"}
                    </TableCell>
                      <TableCell className="px-4 py-3 text-[#1E516A]">
                      {branch?.branch_name || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(branch.id)} className="text-blue-500 hover:text-blue-600">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleEdit(branch.id)} className="text-gray-600 hover:text-blue-700">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-700">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-[#1E516A] text-sm">
          Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredBranches.length)} of {filteredBranches.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <AddBranch
  onClose={closeModal}
  onSubmit={handleFormSubmit}
  organizations={mockOrganizations.filter(org => org.has_branch)}
  hierarchies={mockHierarchies}
  fields={[
    {
      id: "organizationId",
      label: t("organization.organization_name"),
      type: "select",
      options: mockOrganizations
        .filter(org => org.has_branch)
        .map(o => ({ value: o.id, label: o.organization_name })),
      value: editData?.organization_name || "",
    },
    {
      id: "hierarchy_id",
      label: t("branch.hierarchy_level"),
      type: "select",
      options: mockHierarchies.map(h => ({ value: h.id, label: h.hierarchy_name })),
      value: editData?.hierarchy_id || "",
    },
    {
      id: "branch_name",
      label: t("branch.branch_name"),
      type: "text",
      placeholder: "Enter branch name",
      value: editData?.branch_name || "",
    },
    {
      id: "description",
      label: t("common.description"),
      type: "textarea",
      placeholder: "Enter description (optional)",
      value: editData?.description || "",
    },
  ]}
/>

      )}
    </>
  );
}

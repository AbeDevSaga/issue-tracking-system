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
import AddOrganization from "../../../pages/organization/organizationModal";
import Alert from "../../../components/ui/alert/Alert";

interface Organization {
  id: string;
  organization_name: string;
  description: string;
  has_branch: boolean;
}

const mockOrganizations: Organization[] = [
  {
    id: "org001",
    organization_name: "MESOB",
    description: "Handles system maintenance and updates.",
    has_branch: true,
  },
];

// Component
export default function OrganizationTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Organization | null>(null);
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const [branchFilter, setBranchFilter] = useState("all");
const filteredOrganizations = useMemo(() => {
  const term = searchTerm.toLowerCase();

  return mockOrganizations.filter((org) => {
    const branchType = org.has_branch
      ? "multi-branch organization"
      : "central only";

    return (
      org.organization_name.toLowerCase().includes(term) ||
      org.description.toLowerCase().includes(term) ||
      branchType.includes(term)
    );
  });
}, [searchTerm]);


  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedOrganizations = filteredOrganizations.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const totalPages = Math.ceil(filteredOrganizations.length / entriesPerPage);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this organization?")) {
      console.log("Deleting organization:", id);
    }
  };
const openModal = (org?: Organization) => {
  console.log("org",org)
  setEditData(org ?? null);
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setEditData(null);
};

  const handleView = (id: string) => {
    console.log("Viewing organization:", id);
  };

const handleEdit = (id: string) => {
  const org = mockOrganizations.find((o) => o.id === id);
  console.log("org",org)
  if (org) openModal(org);

};

const handleFormSubmit = (values: Record<string, any>) => {
  if (editData) {
    // ✏️ Edit existing
    console.log("Updating:", { ...editData, ...values });
    setAlert({ type: "success", message: "Organization updated successfully!" });
  } else {
    // ➕ Add new
    console.log("Adding:", values);
    setAlert({ type: "success", message: "Organization added successfully!" });
  }
  closeModal();
  setTimeout(() => setAlert(null), 3000);
};
  return (
    <>
      {/* ✅ Alert (Top Right) */}
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

      {/* ✅ Table Header */}
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
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <select
  value={branchFilter}
  onChange={(e) => setBranchFilter(e.target.value)}
  className="ml-2 border p-2 rounded"
>
  <option value="all">All</option>
  <option value="multi">Multi-Branch</option>
  <option value="central">Central Only</option>
</select>
          </div>

          <button
            onClick={()=>openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#094C81] text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t("organization.add_organization")}
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
                  {t("organization.organization_name")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("organization.organization_type")}
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
              {paginatedOrganizations.map((org, index) => (
                <TableRow key={org.id}>
                  <TableCell className="px-4 py-3 text-[#1E516A] text-start">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-[#1E516A]">
                      {org.organization_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      size="sm"
                      className={`px-3 py-1 rounded-full text-white ${
                        org.has_branch ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                    {org.has_branch ? "Multi-Branch Organization" : "Central Only"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(org.id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(org.id)}
                        className="text-gray-600 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
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
          {Math.min(startIndex + entriesPerPage, filteredOrganizations.length)}{" "}
          of {filteredOrganizations.length} entries
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
  <AddOrganization
    onClose={closeModal}
    onSubmit={handleFormSubmit}
    fields={[
      {
        id: "organization_name",
        label:  t("organization.organization_name"),
        type: "text",
        placeholder: "Enter organization name",
        value: editData?.organization_name || "",
      },
      {
        id: "description",
        label: t("common.description"),
        type: "textarea",
        placeholder: "Enter description",
        value: editData?.description || "",
      },
      { id: "has_branch", label: "Has Branch", type: "checkbox", value: editData?.has_branch || false },
    ]}
  />
)}


    </>
  );
}

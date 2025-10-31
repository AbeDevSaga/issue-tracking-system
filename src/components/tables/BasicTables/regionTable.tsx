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
import AddRegion from "../../../pages/region/regionModal";
import Alert from "../../ui/alert/Alert";

interface Region {
  id: string;
  region_name: string;
}

// Mock data
const mockCities: Region[] = [
  {
    id: "org001",
    region_name: "Addis Ababa",
  },
];

// Component
export default function RegionTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Region | null>(null);
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  const filteredCities = useMemo(() => {
  return mockCities.filter((region) =>
    region.region_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [searchTerm]);


  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCities = filteredCities.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const totalPages = Math.ceil(filteredCities.length / entriesPerPage);

  // Handlers
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this region?")) {
      console.log("Deleting region:", id);
    }
  };
const openModal = (org?: Region) => {
  setEditData(org || null);
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setEditData(null);
};

  const handleView = (id: string) => {
    console.log("Viewing region:", id);
  };

const handleEdit = (id: string) => {
  const org = mockCities.find((o) => o.id === id);
  console.log("org",org)
  if (org) openModal(org);

};

const handleFormSubmit = (values: Record<string, any>) => {
  if (editData) {
    console.log("Updating:", { ...editData, ...values });
    setAlert({ type: "success", message: "Region updated successfully!" });
  } else {
    console.log("Adding:", values);
    setAlert({ type: "success", message: "Region added successfully!" });
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
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <button
           onClick={()=>openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#094C81] text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t("region.add_region")}
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
                  {t("region.region_name")}
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
              {paginatedCities.map((region, index) => (
                <TableRow key={region.id}>
                  <TableCell className="px-4 py-3 text-[#1E516A] text-start">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-[#1E516A]">
                      {region.region_name}
                    </span>
                  </TableCell>
                
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(region.id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(region.id)}
                        className="text-gray-600 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(region.id)}
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
          {Math.min(startIndex + entriesPerPage, filteredCities.length)}{" "}
          of {filteredCities.length} entries
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
  <AddRegion
    onClose={closeModal}
    onSubmit={handleFormSubmit}
    fields={[
      {
        id: "region_name",
        label: t("region.region_name"),
        type: "text",
        placeholder: "Enter Region name",
        value: editData?.region_name || "",
      },
     
    ]}
  />
)}


    </>
  );
}

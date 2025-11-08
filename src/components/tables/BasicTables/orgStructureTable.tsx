import { PencilIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { useTranslation } from "react-i18next";
import AddOrgStructure from "../../../pages/org_structure/org_structureModal";
import Alert from "../../ui/alert/Alert";

interface Hierarchy {
  id: string;
  hierarchy_name: string;
  parent_hierarchy_id?: string;
}

const existingHierarchies: Hierarchy[] = [
  { id: "h1", hierarchy_name: "City" },
  { id: "h2", hierarchy_name: "Subcity", parent_hierarchy_id: "h1" },
  { id: "h3", hierarchy_name: "Woreda", parent_hierarchy_id: "h2" },
];

export default function OrgStructureTable() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Hierarchy | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const filteredHierarchies = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return existingHierarchies.filter(h =>
      h.hierarchy_name.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedHierarchies = filteredHierarchies.slice(startIndex, startIndex + entriesPerPage);
  const totalPages = Math.ceil(filteredHierarchies.length / entriesPerPage);

  const openModal = (hierarchy?: Hierarchy) => {
    setEditData(hierarchy ?? null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };
  const handleFormSubmit = (levels: Record<string, any>) => {
    if (editData) {
      console.log("Updating hierarchy:", { ...editData, ...levels });
      setAlert({ type: "success", message: "Hierarchy updated successfully!" });
    } else {
      console.log("Adding new hierarchy levels:", levels);
      setAlert({ type: "success", message: "Hierarchy levels added successfully!" });
    }
    closeModal();
    setTimeout(() => setAlert(null), 3000);
  };
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this hierarchy?")) {
      console.log("Deleting hierarchy:", id);
    }
  };
  const handleView = (id: string) => console.log("Viewing hierarchy:", id);
  const handleEdit = (id: string) => {
    const hierarchy = existingHierarchies.find(h => h.id === id);
    if (hierarchy) openModal(hierarchy);
  };

  return (
    <>
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-xs">
          <Alert variant={alert.type} title={alert.type} message={alert.message} showLink={false} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-[#1E516A] text-sm">Show</span>
          <select
            value={entriesPerPage}
            onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <span className="text-[#1E516A] text-sm">entries</span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search hierarchies..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-[240px] pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#094C81] text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t("org_structure.add_hierarchy") || "Add Hierarchy"}
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader className="bg-[#094C81] h-[60px]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start first:rounded-tl-xl">
                  {t("common.id")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start">
                  Hierarchy Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start">
                  Parent Hierarchy
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-white text-start last:rounded-tr-xl">
                  {t("common.action")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedHierarchies.map((h, index) => {
                const parent = existingHierarchies.find(p => p.id === h.parent_hierarchy_id);
                return (
                  <TableRow key={h.id}>
                    <TableCell className="px-4 py-3 text-[#1E516A] text-start">{index + 1}</TableCell>
                    <TableCell className="px-5 py-4 text-start text-[#1E516A] font-medium">{h.hierarchy_name}</TableCell>
                    <TableCell className="px-4 py-3 text-[#1E516A]">{parent ? parent.hierarchy_name : "—"}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(h.id)} className="text-blue-500 hover:text-blue-600">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleEdit(h.id)} className="text-gray-600 hover:text-blue-700">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(h.id)} className="text-red-600 hover:text-red-700">
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

      <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-[#1E516A] text-sm">
          Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredHierarchies.length)} of {filteredHierarchies.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
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
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <AddOrgStructure
          onClose={closeModal}
          onSubmit={(levels) => handleFormSubmit(levels)}
        />
      )}
    </>
  );
}

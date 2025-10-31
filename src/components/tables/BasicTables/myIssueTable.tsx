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
import AddMyIssue from "../../../pages/issue/my_issue_modal";
import Alert from "../../../components/ui/alert/Alert";

interface MyIssue {
  id: string;
  category: string;
  priority_level: string;
  created_date: string;
  center_action: string;
  status: string;
  description: string;
  action_taken: string;
  created_time: string;
  url: string;
  issue_screenshot: File;
}

const mockIssues: MyIssue[] = [
  {
    id: "org001",
    category: "Ethiopian AI Institute",
    priority_level: "High",
    created_date: "2025-10-30",
    center_action: "Handles system maintenance and updates.",
    status: "active",
    description: "System encountered network latency issues.",
    action_taken: "Debugged network module and restored connectivity.",
    created_time: "14:45:00",
    url: "https://localhost:2000",
    issue_screenshot: new File([], "screenshot.png"), // mock file placeholder
  },
];

export default function MyissueTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<MyIssue | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

 const filteredissues = useMemo(() => {
  return mockIssues.filter((issue) => {
    const issueDate = new Date(issue.created_date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchesDate =
      (!from || issueDate >= from) &&
      (!to || issueDate <= to);

    const matchesSearch =
      issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.priority_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.created_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.status.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && matchesDate;
  });
}, [mockIssues, searchTerm, fromDate, toDate]);


  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedIssues = filteredissues.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const totalPages = Math.ceil(filteredissues.length / entriesPerPage);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this issue?")) {
      console.log("Deleting organization:", id);
    }
  };
const openModal = (org?: MyIssue) => {
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
  const org = mockIssues.find((o) => o.id === id);
  console.log("org",org)
  if (org) openModal(org);

};

const handleFormSubmit = (values: Record<string, any>) => {
  if (editData) {
    console.log("Updating:", { ...editData, ...values });
    setAlert({ type: "success", message: "Issue updated successfully!" });
  } else {
    console.log("Adding:", values);
    setAlert({ type: "success", message: "Issue added successfully!" });
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
      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={25}>25</option>
    </select>
    <span className="text-[#1E516A] text-sm">entries</span>
  </div>

  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

    <select
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
    >
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>

   <div className="flex items-center gap-2">
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
  />
  <span className="text-gray-500">to</span>
  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
  />
</div>


    <div className="relative flex-1 max-w-md">
      <input
        type="text"
        placeholder="Search issue..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
      <svg
        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
    </div>

    <button
      onClick={() => openModal()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#094C81] text-white rounded-lg hover:bg-blue-800 transition-colors"
    >
      {t("issue.add_issue")}
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
                  {t("issue.category")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("issue.priority_level")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("issue.created_date")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("common.status")}
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
              {paginatedIssues.map((issue, index) => (
                <TableRow key={issue.id}>
                  <TableCell className="px-4 py-3 text-[#1E516A] text-start">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-[#1E516A]">
                      {issue.category}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#1E516A] text-start">
                    {issue.priority_level}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#1E516A] text-start">
                    {issue.created_date}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      size="sm"
                      className={`px-3 py-1 rounded-full text-white ${
                        issue.is_active ? "bg-yellow-600" : "bg-green-600"
                      }`}
                    >
                      {issue.is_active ? "Pending" : "Accepted"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(issue.id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(issue.id)}
                        className="text-gray-600 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(issue.id)}
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
          {Math.min(startIndex + entriesPerPage, filteredissues.length)}{" "}
          of {filteredissues.length} entries
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
  <AddMyIssue
    onClose={closeModal}
    onSubmit={handleFormSubmit}
    fields={[
      {
        id: "category",
        label:  t("issue.category"),
        type: "text",
        placeholder: "Enter Issue Categoty",
        value: editData?.category || "",
      },
      {
        id: "priority_level",
        label: t("organization.priority_level"),
        type: "select",
        options: [
          { value: "low", label: "Low" },
          { value: "high", label: "Medium" },
        ],
        placeholder: "Select Priority Level",
        value: editData?.priority_level || "",
      },
      {
        id: "created_date",
        label: t("organization.created_date"),
        type: "date",
        placeholder: "Select Created Date",
        value: editData?.created_date || "",
      },
        {
        id: "created_time",
        label: t("organization.created_time"),
        type: "time",
        placeholder: "Select created time",
        value: editData?.created_time || "",
      },
      {
        id: "action_taken",
        label: t("common.action_taken"),
        type: "textarea",
        placeholder: "Provide Action Taken",
        value: editData?.action_taken || "",
      },
      {
        id: "description",
        label: t("common.description"),
        type: "textarea",
        placeholder: "Enter description",
        value: editData?.description || "",
      },
       {
        id: "url",
        label:  t("issue.url"),
        type: "text",
        placeholder: "Enter URL",
        value: editData?.url || "",
      },
       {
        id: "issue_screenshot",
        label:  t("issue.issue_screenshot"),
        type: "file",
        placeholder: "Enter Issue Screenshot",
        value: editData?.issue_screenshot || "",
      },
    ]}
    
  />
)}


    </>
  );
}

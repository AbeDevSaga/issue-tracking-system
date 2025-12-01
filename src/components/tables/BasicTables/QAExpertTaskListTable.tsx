import { PencilIcon, EyeIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";
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
import AssignDeveloper from "../../../pages/QAExpertTaskList/QAExpertTaskModal";
import Alert from "../../ui/alert/Alert";
import { useNavigate } from "react-router-dom";
import { formatStatus } from "../../../utils/statusFormatter";

interface QAExpertTask {
  id: string;
  category: string;
  organization: String;
  priority_level: string;
  system_name: string,
  due_date: string;
  center_action: string;
  status: string;
  task_summary: string;
  action_taken: string;
  created_time: string;
  url: string;
  document_attachement: File;
  developer: String;
  deadline: string;
}

const mockIssues: QAExpertTask[] = [
  {
    id: "org001",
    category: "Ethiopian AI Institute",
    organization: "MOFA",
    system_name: "Human Resource Management System",
    priority_level: "High",
    due_date: "2025-10-30",
    center_action: "Handles system maintenance and updates.",
    status: "pending",
    action_taken: "Debugged network module and restored connectivity.",
    created_time: "14:45:00",
    url: "https://localhost:2000",
    document_attachement: new File([], "screenshot.png"),
    developer: "test developer",
    task_summary: "Debugged network module and restored connectivity.",
    deadline: "2025-10-30",
  },
  {
    id: "org002",
    category: "Ethiopian AI Institute",
    organization: "ICS",
    system_name: "Human Resource Management System",
    priority_level: "Medium",
    due_date: "2025-11-29",
    center_action: "Handles system maintenance and updates.",
    status: "solved",
    action_taken: "Debugged network module and restored connectivity.",
    created_time: "14:45:00",
    url: "https://localhost:3000",
    document_attachement: new File([], "screenshot.png"),
    developer: "test developer",
    task_summary: "Debugged network module and restored connectivity.",
    deadline: "2025-10-30",
  },
];

export default function QAExpertTaskListTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState<QAExpertTask | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate()

  const filteredissues = useMemo(() => {
    return mockIssues.filter((issue) => {
      const issueDate = new Date(issue.due_date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const matchesDate =
        (!from || issueDate >= from) &&
        (!to || issueDate <= to);

      const matchesSearch =
        issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.priority_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.due_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const take_action = (org?: QAExpertTask) => {
    console.log("org", org)
    setEditData(org ?? null);
    navigate("/tl_tasks_detail", { state: { issue: org } });
  };

  const handleView = (id: string) => {
    console.log("Viewing organization:", id);
  };
  const openModal = (org?: QAExpertTask) => {
    setEditData(org || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };
  const handleFormSubmit = (values: Record<string, any>) => {
    if (editData) {
      console.log("Updating:", { ...editData, ...values });
      setAlert({ type: "success", message: "Developer Assigned successfully!" });
    } else {
      console.log("Adding:", values);
      setAlert({ type: "success", message: "Developer Assigned successfully!" });
    }
    closeModal();
    setTimeout(() => setAlert(null), 3000);
  };
  const handleEdit = (id: string) => {
    const org = mockIssues.find((o) => o.id === id);
    console.log("org", org)

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
                  {t("task_list.system_name")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("task_list.priority_level")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-semibold text-white text-start"
                >
                  {t("task_list.due_date")}
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
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#1E516A] text-sm">
                        {issue.organization}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {issue.system_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold
                 ${issue.priority_level === "Critical"
                          ? "bg-red-100 text-red-700"
                          : issue.priority_level === "High"
                            ? "bg-orange-100 text-orange-700"
                            : issue.priority_level === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : issue.priority_level === "Low"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {issue.priority_level}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-[#1E516A] text-start">
                    {issue.due_date}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      size="sm"
                      className={`px-3 py-1 rounded-full text-white ${issue.status === "pending"
                        ? "bg-yellow-600"
                        : issue.status === "solved"
                          ? "bg-green-600"
                          : issue.status === "rejected"
                            ? "bg-red-600"
                            : issue.status === "in_Progress"
                              ? "bg-blue-600"
                              : "bg-gray-500"
                        }`}
                    >
                      {formatStatus(issue.status) || "N/A"}

                    </Badge>

                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
               

                        <button
                          onClick={() => take_action(issue)}
                          className="flex items-center gap-2 text-blue-500 px-2 py-1 rounded hover:text-blue-600 transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
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
            className={`px-3 py-1 rounded ${currentPage === 1
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
              className={`px-3 py-1 rounded ${currentPage === i + 1
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
            className={`px-3 py-1 rounded ${currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            Next
          </button>
        </div>
      </div>
      {isModalOpen && (
        <AssignDeveloper
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          fields={[
            {
              id: "developer",
              label: t("TLTask.developer"),
              type: "select",
              options: [
                { value: "developer1", label: "Developer 1" },
                { value: "developer2", label: "Developer 2" },
              ],
              placeholder: "Select developer",
              value: editData?.developer || "",
            },
            {
      id: "priority_level",
      label: "Priority Level",
      type: "select",
      options: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
    },
            {
              id: "deadline",
              label: "Deadline",
              type: "date",
              placeholder: "Enter ",
              value: editData?.deadline || "",
            },
            {
              id: "task_summary",
              label: t("TLTask.task_summary"),
              type: "textarea",
              placeholder: "Enter Task Summary",
              value: editData?.task_summary || "",
            },
            {
              id: "document_attachement",
              label: "Document Attachement",
              type: "file",
              placeholder: "Enter Task Summary",
              value: editData?.document_attachement || "",
            },

          ]}
        />
      )}
    </>
  );
}

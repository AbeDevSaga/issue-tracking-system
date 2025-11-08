import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { EyeIcon, PlusIcon } from "@heroicons/react/24/solid";

const CATEGORIES = ["Bug", "Performance", "Enhancement", "UI", "Data", "Other"];
const SEVERITYS = ["Critical", "High", "Medium", "Low"];
const STATUS_LABELS = {
  pending: "Pending",
  resolved: "Resolved",
  "qa-verified": "QA Verified",
  "dev-resolved": "Developer Resolved"
};
const STATUS_BADGES = {
  New: "bg-blue-900 text-white",
  Pending: "bg-yellow-400 text-white",
  Resolved: "bg-green-500 text-white",
  "QA Verified": "bg-blue-300 text-white",
  "Developer Resolved": "bg-gray-400 text-white",
};

const initialIssues = Array.from({ length: 20 }).map((_, i) => ({
  id: `ISS-2024-${(i + 1).toString().padStart(3, "0")}`,
  category: CATEGORIES[i % CATEGORIES.length],
  severity: SEVERITYS[i % 4],
  date: "2025-10-24",
  status:
    i < 5
      ? "Pending"
      : i < 10
      ? "Resolved"
      : i < 15
      ? "QA Verified"
      : "Developer Resolved",
}));

export default function ReportList() {
  const { status } = useParams(); // pending, resolved, qa-verified, dev-resolved or undefined
  const [issues, setIssues] = useState(initialIssues);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewReport, setViewReport] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const pageSize = 10;

  const statusLabel = STATUS_LABELS[status];

  const filteredIssues = useMemo(
    () =>
      issues.filter(
        (issue) =>
          (!search || issue.id.toLowerCase().includes(search.toLowerCase())) &&
          (!category || issue.category === category) &&
          (!date || issue.date === date) &&
          (!statusLabel || issue.status === statusLabel)
      ),
    [issues, search, category, date, statusLabel]
  );
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / pageSize));

  // --- Modal form for Add Report ---
  function AddReportModal() {
    const [form, setForm] = useState({
      category: "",
      customCategory: "",
      severity: "",
      date: "",
      status: "Pending"
    });
    const [error, setError] = useState("");

    // Compute next issue id
    const lastIdNum = issues.reduce((max, item) => {
      const n = Number(item.id.split("-").pop() ?? "0");
      return n > max ? n : max;
    }, 0);
    const nextId = `ISS-2024-${String(lastIdNum + 1).padStart(3, "0")}`;

    function handleChange(e) {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
    function handleSubmit(e) {
      e.preventDefault();
      const cat = form.category === "Other" ? form.customCategory.trim() : form.category;
      if (!cat || !form.severity || !form.date || !form.status) {
        setError("All fields are required.");
        return;
      }
      setIssues([{ id: nextId, category: cat, severity: form.severity, date: form.date, status: form.status }, ...issues]);
      setShowAddModal(false);
      setError("");
      setForm({
        category: "",
        customCategory: "",
        severity: "",
        date: "",
        status: "Pending"
      });
    }
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
        <form
          className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
          onSubmit={handleSubmit}
        >
          <h2 className="font-bold mb-2 text-lg">Add New Issue</h2>
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-1">Issue ID</label>
            <input
              value={nextId}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          {form.category === "Other" && (
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1">Other Category Description</label>
              <input
                name="customCategory"
                value={form.customCategory}
                onChange={handleChange}
                placeholder="Specify the category"
                className="w-full border rounded px-3 py-2 focus:ring"
              />
            </div>
          )}
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-1">Severity</label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring"
            >
              <option value="">Select severity</option>
              {SEVERITYS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-1">Date Submitted</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring"
            >
              <option value="">Select status</option>
              <option>Pending</option>
              <option>Resolved</option>
              <option>QA Verified</option>
              <option>Developer Resolved</option>
            </select>
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-100"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-900 text-white"
            >
              Add Issue
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-blue-900 mb-1">
          Bug– Issue Tucking System
        </h2>
        <div className="text-gray-500 text-sm mb-4">
          This is the issue management of the AA city central Admin
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded"
            style={{ minWidth: 120 }}
          />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">issue category</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded"
            style={{ minWidth: 120 }}
          />
        </div>
        <button
          className="bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="w-5 h-5" /> Report New Issue
        </button>
      </div>
      {/* Table */}
      <table className="w-full border rounded text-sm">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-3 py-3 text-left font-medium">Issue ID</th>
            <th className="px-3 py-3 text-left font-medium">Category</th>
            <th className="px-3 py-3 text-left font-medium">Severity</th>
            <th className="px-3 py-3 text-left font-medium">
              Date Submitted
            </th>
            <th className="px-3 py-3 text-left font-medium">Status</th>
            <th className="px-3 py-3 text-left font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedIssues.map((issue, idx) => (
            <tr key={issue.id} className="border-b">
              <td className="px-3 py-2">{issue.id}</td>
              <td className="px-3 py-2">{issue.category}</td>
              <td
                className={`px-3 py-2 font-medium ${
                  issue.severity === "Critical"
                    ? "text-red-600"
                    : issue.severity === "High"
                    ? "text-orange-500"
                    : issue.severity === "Medium"
                    ? "text-blue-700"
                    : "text-green-600"
                }`}
              >
                {issue.severity}
              </td>
              <td className="px-3 py-2">{issue.date}</td>
              <td className="px-3 py-2">
                <span
                  className={`${
                    STATUS_BADGES[issue.status]
                  } rounded-full text-xs px-3 py-1`}
                >
                  {issue.status}
                </span>
              </td>
              <td className="px-3 py-2">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => setViewReport(issue)}
                >
                  <EyeIcon className="w-5 h-5" />
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
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Back
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              className={`px-3 py-1 rounded ${
                currentPage === idx + 1
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100"
              }`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-2 rounded bg-gray-100"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal for Add Issue */}
      {showAddModal && <AddReportModal />}
      {/* Modal for Eye Icon */}
      {viewReport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs">
            <h2 className="font-bold mb-2 text-lg">
              Report Status: {viewReport.id}
            </h2>
            <div className="mb-3">
              <span
                className={`${
                  STATUS_BADGES[viewReport.status]
                } rounded-full text-xs px-3 py-1`}
              >
                {viewReport.status}
              </span>
            </div>
            <button
              className="mt-3 px-4 py-2 rounded bg-blue-900 text-white w-full"
              onClick={() => setViewReport(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

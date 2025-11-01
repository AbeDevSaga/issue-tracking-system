import { useState, useMemo } from "react";
import { EyeIcon, PlusIcon } from "@heroicons/react/24/solid";

const CATEGORIES = ["Bug", "Performance", "Enhancement", "UI", "Data", "Other"];
const SEVERITY_BADGES = {
  Critical: "text-red-600",
  High: "text-orange-500",
  Medium: "text-blue-700",
  Low: "text-green-600"
};
const STATUS_BADGES = {
  New: "bg-blue-900 text-white",
  Pending: "bg-yellow-400 text-white",
  Resolved: "bg-green-500 text-white",
};

const initialIssues = [
  {
    id: "ISS-2024-001",
    category: "Bug",
    severity: "Critical",
    date: "2025-10-24 03:20",
    status: "New",
  },
  {
    id: "ISS-2024-002",
    category: "Performance",
    severity: "High",
    date: "2025-10-24 03:20",
    status: "New",
  },
  {
    id: "ISS-2024-003",
    category: "Enhancement",
    severity: "Medium",
    date: "2025-10-24 03:20",
    status: "Pending",
  },
  {
    id: "ISS-2024-004",
    category: "Performance",
    severity: "Low",
    date: "2025-10-24 03:20",
    status: "Resolved",
  },
];
// You can create up to 20 with variety if needed.
while (initialIssues.length < 20) {
  const i = initialIssues.length+1;
  initialIssues.push({
    id: `ISS-2024-${i.toString().padStart(3,"0")}`,
    category: CATEGORIES[i % CATEGORIES.length],
    severity: Object.keys(SEVERITY_BADGES)[i % 4],
    date: "2025-10-24 03:20",
    status: ["New","Pending","Resolved"][i % 3],
  });
}

export default function TicketsPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filtering logic
  const filteredIssues = useMemo(() =>
    issues.filter(issue =>
      (!search || issue.id.toLowerCase().includes(search.toLowerCase()))
      && (!category || issue.category === category)
      && (!date || issue.date.startsWith(date))
    ), [issues, search, category, date]
  );
  const paginatedIssues = filteredIssues.slice((currentPage-1)*pageSize, currentPage*pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / pageSize));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-blue-900 mb-1">Bug– Issue Tucking System</h2>
        <div className="text-gray-500 text-sm mb-4">This is the issue management of the AA city central Admin</div>
      </div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search ..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded"
            style={{ minWidth: 120 }}
          />
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded"
          >
            <option value="">issue category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded"
            style={{ minWidth: 120 }}
          />
        </div>
        <button className="bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
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
            <th className="px-3 py-3 text-left font-medium">Date Submitted</th>
            <th className="px-3 py-3 text-left font-medium">Status</th>
            <th className="px-3 py-3 text-left font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedIssues.map(issue => (
            <tr key={issue.id} className="border-b">
              <td className="px-3 py-2">{issue.id}</td>
              <td className="px-3 py-2">{issue.category}</td>
              <td className={`px-3 py-2 font-medium ${SEVERITY_BADGES[issue.severity]}`}>{issue.severity}</td>
              <td className="px-3 py-2">{issue.date}</td>
              <td className="px-3 py-2">
                <span className={`${STATUS_BADGES[issue.status]} rounded-full text-xs px-3 py-1`}>
                  {issue.status}
                </span>
              </td>
              <td className="px-3 py-2">
                <button className="text-blue-600 hover:text-blue-900">
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
    </div>
  );
}

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaPlus, FaChevronDown, FaChevronUp, FaEdit, FaTrashAlt,
  FaEye, FaFilter, FaArrowsAltV, FaTimes, FaCheck
} from "react-icons/fa";
import { jobPostsApi, usersApi } from "../../lib/api";
import TopBarDashboard from "../../Components/TopBarDashboard";
import CreateJob from "./CreateJob";
import EditJob from "./EditJob";

const toStatus = (deadline) => {
  if (!deadline) return "active";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) return "active";
  return end < today ? "closed" : "active";
};

const toStatusLabel = (deadline) => {
  return toStatus(deadline) === "active" ? "Active" : "Closed";
};

const toCloseDate = (deadline) => {
  if (!deadline) return "Not set";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatDeadline = (deadline) => {
  if (!deadline) return "";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const getStatusStyle = (deadline) => {
  const status = toStatus(deadline);
  if (status === "active") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  return "bg-red-50 text-red-600 border border-red-100";
};

const getMatchScoreStyle = (score) => {
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-600";
};

const JobPost = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await usersApi.me();
        setUserName(profile.name || "");
        setUserEmail(profile.email || "");
      } catch (_) {}
    };
    loadData();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await jobPostsApi.listMine();
      const mapped = (Array.isArray(data) ? data : []).map((job) => ({
        ...job,
        status: toStatus(job.deadline),
        statusLabel: toStatusLabel(job.deadline),
        closeDate: toCloseDate(job.deadline),
        formattedDeadline: formatDeadline(job.deadline),
      }));
      setJobs(mapped);
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...jobs];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (j) =>
          (j.title || "").toLowerCase().includes(term) ||
          (j.companyName || "").toLowerCase().includes(term) ||
          (j.location || "").toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((j) => j.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "createdAt" || sortField === "deadline") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [jobs, searchTerm, statusFilter, sortField, sortDir]);

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    loadJobs();
  };

  const handleEditSuccess = () => {
    setEditingJob(null);
    loadJobs();
  };

  const handleDeleteClick = (job) => {
    setDeleteConfirm(job);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await jobPostsApi.remove(deleteConfirm.id);
      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || "Failed to delete job");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FaArrowsAltV size={14} className="text-gray-300" />;
    return sortDir === "asc" ? <FaChevronUp size={14} className="text-emerald-600" /> : <FaChevronDown size={14} className="text-emerald-600" />;
  };

  const activeCount = jobs.filter((j) => j.status === "active").length;
  const closedCount = jobs.filter((j) => j.status === "closed").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (Number(j.applicantCount) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBarDashboard userName={userName} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-4 pb-12">
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Job Postings</h1>
            <p className="text-gray-500">Manage your recruitment campaigns</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FaPlus size={18} />
            Create Job
          </button>
        </div>

        {/* --- ERROR --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <FaTimes size={16} />
            </button>
          </div>
        )}

        {/* --- STATS --- */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Jobs</p>
            <span className="text-3xl font-extrabold text-gray-900">{jobs.length}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active</p>
            <span className="text-3xl font-extrabold text-emerald-600">{activeCount}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Applicants</p>
            <span className="text-3xl font-extrabold text-gray-900">{totalApplicants}</span>
          </div>
        </div>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="search"
                placeholder="Search jobs by title, company, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaFilter size={16} />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
              {["all", "active", "closed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                    statusFilter === s
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                  {s === "active" && activeCount > 0 && ` (${activeCount})`}
                  {s === "closed" && closedCount > 0 && ` (${closedCount})`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
              Loading jobs...
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch size={24} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">
                {searchTerm || statusFilter !== "all" ? "No matching jobs" : "No jobs yet"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first job posting to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700"
                >
                  Create Job
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">
                        <button
                          onClick={() => handleSort("title")}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                        >
                          Job Title <SortIcon field="title" />
                        </button>
                      </th>
                      <th className="px-6 py-4">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                        >
                          Status <SortIcon field="status" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Candidates
                        </span>
                      </th>
                      <th className="px-6 py-4">
                        <button
                          onClick={() => handleSort("deadline")}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                        >
                          Closing Date <SortIcon field="deadline" />
                        </button>
                      </th>
                      <th className="px-6 py-4">
                        <button
                          onClick={() => handleSort("createdAt")}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                        >
                          Posted <SortIcon field="createdAt" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAndSorted.map((job) => (
                      <tr key={job.id} className="hover:bg-emerald-50/20 transition-colors group">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-gray-900">{job.title || "—"}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {job.companyName || "—"} {job.location ? `• ${job.location}` : ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(job.deadline)}`}>
                            {job.statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-lg font-bold text-gray-900">{job.applicantCount || 0}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-gray-600">{job.closeDate}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-gray-500">
                            {job.createdAt
                              ? new Date(job.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="View job"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => navigate("/recruiter/application")}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View applications"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingJob(job)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit job"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(job)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete job"
                            >
                              <FaTrashAlt size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {filteredAndSorted.length} of {jobs.length} jobs
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateJob
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      {editingJob && (
        <EditJob
          isOpen={!!editingJob}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrashAlt size={24} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Job</h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPost;

import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBriefcase, FaUsers, FaCalendar, FaCheckCircle, FaPlus } from "react-icons/fa";
import { jobPostsApi, applicationsApi, usersApi } from "../../lib/api";
import TopBarDashboard from "../../Components/TopBarDashboard";

const StatCard = ({ title, value, subtitle, icon: Icon, color = "emerald" }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const activeColor = colorMap[color] || colorMap.emerald;

  return (
    <div className={`p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${activeColor.split(" ").map(c => c.startsWith("bg-") ? "bg-white" : c).join(" ")}`}
      style={{ backgroundColor: "white" }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeColor}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-gray-900">{value ?? "—"}</span>
        {subtitle && <span className="text-xs font-medium text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [profile, jobsData, appsData] = await Promise.all([
          usersApi.me(),
          jobPostsApi.listMine(),
          applicationsApi.listForRecruiter(),
        ]);
        setUserName(profile.name || "");
        setUserEmail(profile.email || "");
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => {
      if (!j.deadline) return true;
      return new Date(j.deadline) >= new Date();
    }).length;
    const totalCandidates = applications.length;
    const interviews = applications.filter((a) => a.status === "reviewed" || a.status === "interview").length;
    const offers = applications.filter((a) => a.status === "accepted").length;
    const pending = applications.filter((a) => a.status === "applied").length;

    return { totalJobs, activeJobs, totalCandidates, interviews, offers, pending };
  }, [jobs, applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
      .slice(0, 5);
  }, [applications]);

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted" || s === "offered")
      return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Offer</span>;
    if (s === "reviewed" || s === "interview")
      return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Interview</span>;
    if (s === "rejected")
      return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Rejected</span>;
    return <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full">Pending</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBarDashboard userName="" userEmail="" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border animate-pulse">
                <div className="w-20 h-4 bg-gray-100 rounded mb-3" />
                <div className="w-12 h-8 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBarDashboard userName={userName} userEmail={userEmail} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-4 pb-12">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Recruiter Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, {userName || "there"}. Here's what's happening today.
            </p>
          </div>
          <button
            onClick={() => navigate("/recruiter/job")}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FaPlus size={18} />
            Create Job
          </button>
        </div>

        {/* --- ERROR --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            subtitle="posted"
            icon={FaBriefcase}
            color="emerald"
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            subtitle="open now"
            icon={FaCheckCircle}
            color="blue"
          />
          <StatCard
            title="Total Candidates"
            value={stats.totalCandidates}
            subtitle="applied"
            icon={FaUsers}
            color="purple"
          />
          <StatCard
            title="Interviews"
            value={stats.interviews}
            subtitle={`${stats.offers} offers sent`}
            icon={FaCalendar}
            color="orange"
          />
        </div>

        {/* --- MAIN LAYOUT --- */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Recent Applications */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
              <Link
                to="/recruiter/application"
                className="text-sm font-semibold text-emerald-600 hover:underline"
              >
                View All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers size={24} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No applications yet</h3>
                <p className="text-sm text-gray-500">Candidates will appear here when they apply to your jobs.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {recentApplications.map((app, idx) => (
                  <div
                    key={app.id}
                    className={`p-5 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                      idx < recentApplications.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                    onClick={() => navigate("/recruiter/application")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                        {(app.candidateName || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-gray-900 truncate">{app.candidateName || "Unknown Candidate"}</p>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-500 truncate">{app.jobTitle || "—"}</p>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatTime(app.applicationDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Active Jobs Summary */}
          <div className="w-full lg:w-80 xl:w-96">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Active Jobs</h2>
              <Link
                to="/recruiter/job"
                className="text-sm font-semibold text-emerald-600 hover:underline"
              >
                Manage
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBriefcase size={24} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No jobs posted</h3>
                <p className="text-sm text-gray-500 mb-4">Start by creating your first job posting.</p>
                <button
                  onClick={() => navigate("/recruiter/job")}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700"
                >
                  Create Job
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => {
                  const isActive = !job.deadline || new Date(job.deadline) >= new Date();
                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => navigate("/recruiter/job")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {job.applicantCount || 0} applicants
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {isActive ? "Active" : "Closed"}
                        </span>
                      </div>
                      {job.deadline && (
                        <p className="text-xs text-gray-400 mt-2">
                          Deadline: {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;

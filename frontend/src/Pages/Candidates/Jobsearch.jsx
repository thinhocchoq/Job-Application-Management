import { useEffect, useState } from "react";
import { jobPostsApi, savedJobsApi } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const Jobsearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [savingJobIds, setSavingJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const handleSaveClick = async (jobId) => {
    if (savingJobIds.includes(jobId) || savedJobIds.includes(jobId)) return;
    setSavingJobIds((prev) => [...prev, jobId]);

    try {
      const response = await savedJobsApi.save(jobId); 
      setSavedJobIds((prev) => [...prev, jobId]);
      alert("Đã lưu công việc!");
    } 
    catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert("Lưu thất bại, có thể bạn đã lưu job này rồi.");
    } 
    finally {
      setSavingJobIds((prev) => prev.filter(id => id !== jobId));
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const data = await jobPostsApi.list(searchTerm);
        setJobs(data);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error.message || "Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="h-screen">
      <h2 className="text-3xl font-semibold mb-6">Job Search</h2>

      <form
        className="max-w-md"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center pl-3">
            <svg
              className="w-4 h-4 text-gray"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-4 pl-10 text-sm text-[#888] border border-gray-light rounded-md bg-white outline-none"
            placeholder="Search by title, company, or status"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </form>

      {errorMessage && <p className="text-[#c93434] text-sm mt-4">{errorMessage}</p>}
      {isLoading && <p className="text-sm text-gray mt-4">Loading jobs...</p>}

      {!isLoading && !errorMessage && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray">No matching jobs found.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-light-gray bg-[#F8F9F8] p-4">
                
                <div className="flex-grow"
                onClick = {() => navigate(`/jobs/${job.id}`)}>
                  <h3 className="text-lg font-semibold">{job.title || "Untitled job"}</h3>
                  <p className="text-sm text-gray mt-1">{job.companyName || "Unknown company"}</p>
                  <p className="text-xs text-gray mt-2">{job.location || "Remote or not specified"}</p>
                  <p className="text-xs text-gray mt-1">{job.salary || "Salary not disclosed"}</p>
                </div>

                <div className = "mt-4 flex justify-end">
                  <button 
                    onClick={() => handleSaveClick(job.id)}
                    className="text-gray-400 hover:text-teal-600 transition-colors flex-shrink-0"
                    title="Lưu công việc này"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Jobsearch;

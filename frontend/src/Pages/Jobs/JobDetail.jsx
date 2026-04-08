import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LuUserCircle2, LuSearch, LuMapPin } from "react-icons/lu";
import { 
  FaLongArrowAltRight, FaRegLightbulb, FaCheckCircle, FaRegClock, 
  FaRegPaperPlane, FaRegHeart, FaRegBell, FaUsers, FaBuilding, 
  FaExternalLinkAlt, FaMedal, FaGraduationCap 
} from "react-icons/fa";
import { BsBriefcase, BsCurrencyDollar, BsHourglassSplit } from "react-icons/bs";
import { CiMenuKebab } from "react-icons/ci";

import DashboardCard from "../../Components/DashboardCard";
import { applyFromJob, usersApi, jobPostsApi, savedJobsApi } from "../../lib/api";
import "chart.js/auto";

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobDetail, setJobDetail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [savingJobIds, setSavingJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const applyJob = async (jobId) => {
    const normalizedJobId = Number(jobId ?? jobDetail?.id ?? id);

    try {
      setIsLoading(true);
      const response = await applyFromJob(normalizedJobId);
      setIsApplied(true); 
      alert("Apply thành công.");   
    }
    catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert("Apply thất bại, có thể bạn đã apply job này rồi.");   
    }
    finally{
      setIsLoading(false);
    } 
       setTimeout(() => {
        navigate("/job");
      }, 1000);
  }; 

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

  const generalInfoItems = [
  { label: "Loại hình", value: "Toàn thời gian" },
  { label: "Cấp bậc", value: "Nhân viên/Chuyên viên" },
  { label: "Ngày đăng tuyển",value:  new Date(jobDetail.createdAt).toLocaleDateString("vi-VN") || "N/A"},
  { label: "Số lượng tuyển", value:  "1" },   
  { label: "Yêu cầu ngôn ngữ", value: "Tiếng Trung" },
];

  const companyCard = {
    name: jobDetail?.companyName || "Công ty TNHH Baosteel Can Making (Việt Nam)",
    industry: jobDetail?.industry || "Sản xuất",
    logo: jobDetail?.companyLogo || "https://via.placeholder.com/96x96?text=Logo",
    cover: jobDetail?.companyCover || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=60",
  };

  const formatDeadline = (value) => {
    if (!value) return "30/04/2026";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "30/04/2026";
    return parsed.toLocaleDateString("vi-VN");
  };

  const getDeadlineDifferenceText = (value) => {
    if (!value) return "Chưa có hạn nộp";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Ngày không hợp lệ";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);

    const diffInDays = Math.ceil(
      (parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays > 0) return `Còn ${diffInDays} ngày`;
    if (diffInDays === 0) return "Hết hạn hôm nay";
    return `Đã hết hạn ${Math.abs(diffInDays)} ngày`;
  };

  const isDeadlineExpired = (value) => {
    if (!value) return false;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);

    return parsed < today;
  };

  const checkDeadline = (value) => {
    if (!value) return false;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    return parsed < today;
      
    }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await usersApi.me();
        setUserName(response.name);
        setUserEmail(response.email);
        setJobs(await jobPostsApi.list());
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const data = await jobPostsApi.getById(id); 
        console.log("Dữ liệu Job từ API:", data);
        setJobDetail(data); 
      } catch (error) {
        console.error("Error fetching job detail:", error);
      }
    };
    fetchJobDetail();
  }, [id]); 

  return (
    <div className='min-h-screen bg-[#f4f5f5] p-6'>
      
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="text-teal-dark text-3xl font-semibold mb-6">Job Detail</h2>

        <div className="hidden lg:flex items-center gap-3 border-l-2 border-[#5D6661] pl-4">
          <div className = "text-right leading-tight">
            <p className="text-[12px]">{userName || "User"}</p>
            <p className="text-[12px]">{userEmail || "you@beautiful.com"}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 space-y-6">
              
              {/* Box 1: Thông tin cơ bản */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      {jobDetail?.title || "Chi tiết công việc"}
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-[#00b14f] flex items-center justify-center text-lg">
                              <BsCurrencyDollar />
                          </div>
                          <div>
                              <p className="text-gray-500 text-sm">Mức lương</p>
                              <p className="font-semibold text-gray-800">
                                {jobDetail?.salary || "Thỏa thuận"}
                              </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-[#00b14f] flex items-center justify-center text-lg">
                              <LuMapPin />
                          </div>
                          <div>
                              <p className="text-gray-500 text-sm">Địa điểm</p>
                              <p className="font-semibold text-gray-800">
                                {jobDetail?.location || "Chi tiết"}
                              </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-[#00b14f] flex items-center justify-center text-lg">
                              <BsHourglassSplit />
                          </div>
                          <div>
                              <p className="text-gray-500 text-sm">Kinh nghiệm</p>
                              <p className="font-semibold text-gray-800">Không yêu cầu</p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                      <p className="text-gray-600 text-sm flex items-center gap-2">
                          <FaRegClock /> Hạn nộp hồ sơ: 
                          <span className="font-semibold">
                            {formatDeadline(jobDetail?.deadline)}
                          </span> 
                          ({getDeadlineDifferenceText(jobDetail?.deadline)})
                      </p>
                  </div>

                  <div className="flex gap-4 mt-4">
                      <button 
                        disabled={checkDeadline(jobDetail?.deadline)}
                        onClick={() => applyJob(jobDetail?.id)}
                        className={`flex-1 font-bold py-3 px-4 rounded-lg transition duration-200 flex justify-center items-center gap-2 ${
                          checkDeadline(jobDetail?.deadline) 
                            ? "bg-[#ba0000] text-white cursor-not-allowed" 
                            : "bg-[#00b14f] hover:bg-[#009944] text-white "
                          }`}
                      >
                          <FaRegPaperPlane /> 
                           {checkDeadline(jobDetail?.deadline) ? "Đã hết hạn ứng tuyển" : "Ứng tuyển ngay"}
                      </button>
                      <button className="w-32 border border-[#00b14f] text-[#00b14f] font-bold py-3 px-4 rounded-lg hover:bg-green-50 transition duration-200 flex justify-center items-center gap-2"
                        onClick={() => handleSaveClick(jobDetail?.id)}>
                          <FaRegHeart /> Lưu tin
                      </button>
                  </div>
              </div>

              {/* Box 2: Chi tiết tin tuyển dụng */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-[#00b14f] rounded-full"></div>
                          <h2 className="text-xl font-bold text-gray-800">Chi tiết tin tuyển dụng</h2>
                      </div>
                      <button className="text-[#00b14f] text-sm hover:underline flex items-center gap-1">
                          <FaRegBell /> Gửi tôi việc làm tương tự
                      </button>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-semibold text-gray-700 w-24">Yêu cầu:</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">Không yêu cầu kinh nghiệm</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">Trung cấp trở lên</span>
                      <button className="text-[#00b14f] hover:underline">Xem thêm</button>
                  </div>
                  <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-semibold text-gray-700 w-24">Chuyên môn:</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">Kỹ sư lập trình máy</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">Cơ khí / Tự động hóa</span>
                  </div>

                  <div>
                      <h3 className="font-bold text-gray-800 mb-2 mt-6">Mô tả công việc</h3>
                      <div className="text-gray-700 space-y-2 whitespace-pre-line ml-2">
                          {jobDetail?.description || "Chi tiết mô tả..."}
                      </div>
                  </div>
              </div>
          </div>

          {/* ================== CỘT PHẢI (Chiếm 1/3) ================== */}
          {/* Cột phải đã được di chuyển vào bên trong thẻ flex tổng */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={companyCard.cover}
                alt="Company cover"
                className="w-full h-28 object-cover"
              />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <img
                    src={companyCard.logo}
                    alt={companyCard.name}
                    className="w-20 h-20 rounded-xl border border-gray-200 object-contain bg-white p-2"
                  />
                  <p className="text-2xl font-semibold text-gray-900 leading-tight">
                    {companyCard.name}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <BsBriefcase className="text-[#2F80ED]" />
                  <p className="text-gray-500">Lĩnh vực:</p>
                  <p className="font-semibold text-gray-900">{companyCard.industry}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-3xl font-semibold text-gray-800 mb-5">Thông tin chung</h3>

              <div className="space-y-4">
                {generalInfoItems.map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-3">
                    <p className="text-gray-500">{item.label}:</p>
                    <p className="font-semibold text-gray-900 text-right">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
                    
      </div>
    </div>
  );
}
export default JobDetail;
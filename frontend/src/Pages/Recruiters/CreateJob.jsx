import React from 'react';

const CreateJob = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">        
        {/* Body (Form) có thể cuộn */}
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] relative overflow-hidden">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            {/* Header */}
            <div className="mb-2 pr-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng tin tuyển dụng mới</h2>
            </div>

            {/* Section 1: Thông tin cơ bản */}
            <div className="bg-[#f8f9fa] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h3>
              </div>

              <div className="space-y-5">
                {/* Tiêu đề */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tiêu đề công việc</label>
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <input type="text" placeholder="Ví dụ: Senior Product Designer" className="w-full outline-none bg-transparent text-gray-800 placeholder-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Địa điểm */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Địa điểm làm việc</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                      <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <input type="text" defaultValue="Thành phố Hồ Chí Minh, Việt Nam" className="w-full outline-none bg-transparent text-gray-800" />
                    </div>
                  </div>
                  {/* Hình thức */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Hình thức làm việc</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                      <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <select className="w-full outline-none bg-transparent text-gray-800 appearance-none cursor-pointer">
                        <option>Toàn thời gian (Full-time)</option>
                        <option>Bán thời gian (Part-time)</option>
                        <option>Remote</option>
                      </select>
                    </div>
                  </div>
                  {/* Mức lương */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Mức lương (Tháng)</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                      <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      <input type="text" placeholder="Ví dụ: 20,000,000 - 35,000,000 VNĐ" className="w-full outline-none bg-transparent text-gray-800" />
                    </div>
                  </div>
                  {/* Kinh nghiệm */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Kinh nghiệm yêu cầu</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                      <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                        <input type="text" placeholder="Kinh nghiệm" className="w-full outline-none bg-transparent text-gray-800" />
                    </div>
                  </div>
                  {/* Hạn chót */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Hạn chót ứng tuyển</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
                      <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <input type="date" placeholder="mm/dd/yyyy" className="w-full outline-none bg-transparent text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Nội dung chi tiết */}
            <div className="bg-[#f8f9fa] rounded-2xl p-6 relative">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Nội dung chi tiết</h3>
              </div>

              <div className="space-y-6">
                {/* Mô tả */}
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Mô tả công việc
                  </label>
                  <textarea rows="4" placeholder="Mô tả tổng quan về vai trò này tại công ty..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
                
                {/* Trách nhiệm */}
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Trách nhiệm công việc
                  </label>
                  <textarea rows="4" placeholder="Nêu rõ các nhiệm vụ hằng ngày ứng viên sẽ đảm nhận..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>

                {/* Yêu cầu */}
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    Yêu cầu ứng viên
                  </label>
                  <textarea rows="4" placeholder="Kỹ năng cứng, kỹ năng mềm và các tố chất cần thiết..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-sm border border-transparent">
                Lưu nháp
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center px-8 py-2.5 font-semibold rounded-full transition shadow-sm text-white bg-emerald-500 hover:bg-emerald-600">
                Đăng tuyển ngay
              </button>
            </div>        
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
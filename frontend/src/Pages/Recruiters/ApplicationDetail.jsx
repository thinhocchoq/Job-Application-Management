import React, { useEffect, useState } from 'react';
import { applicationsApi } from '../../lib/api';
import { formatMessageTime } from '../../utils/format';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Moi nop' },
  { value: 'reviewed', label: 'Dang xem xet' },
  { value: 'accepted', label: 'De nghi nhan viec' },
  { value: 'rejected', label: 'Tu choi' },
];

const STATUS_VALUES = new Set(STATUS_OPTIONS.map((option) => option.value));

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const ApplicationDetail = ({ onBack, candidate }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return '';
    });
    setPreviewError('');

    let isMounted = true;

    const loadApplicationDetail = async () => {
      if (!candidate?.id) {
        if (isMounted) {
          setDetail(null);
          setLoading(false);
          setError('');
          setPreviewUrl('');
          setPreviewError('');
          setPreviewLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await applicationsApi.getForRecruiter(candidate.id);

        if (isMounted) {
          setDetail(response || null);
        }
      } catch (loadError) {
        if (isMounted) {
          setDetail(null);
          setError(loadError.message || 'Failed to load application detail');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadApplicationDetail();

    return () => {
      isMounted = false;
    };
  }, [candidate?.id]);

  useEffect(() => () => {
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return '';
    });
  }, []);

  const source = detail
    ? {
        ...candidate,
        id: detail.id,
        jobPostId: detail.jobPostId,
        applicationDate: detail.applicationDate,
        status: detail.status,
        name: detail.candidateName,
        email: detail.candidateEmail,
        phone: detail.candidatePhone,
        jobTitle: detail.jobTitle,
        department: detail.companyName,
        cvFileName: detail.cvFileName,
      }
    : candidate;

  const candidateName = source?.name || 'Unknown Candidate';
  const candidateJobTitle = source?.jobTitle || 'Unknown Position';
  const candidateEmail = source?.email || 'No email available';
  const candidatePhone = source?.phone || 'No phone available';
  const candidateAppliedDate = formatMessageTime(source?.applicationDate) || 'N/A';
  const normalizedStatus = (source?.status || 'applied').toLowerCase();
  const candidateStatus = STATUS_VALUES.has(normalizedStatus) ? normalizedStatus : 'applied';
  const initials = getInitials(candidateName);
  const cvFileName = source?.cvFileName || 'Chua co CV';
  const canPreviewCv = Boolean(source?.id && source?.cvFileName);

  const handlePreviewCv = async () => {
    if (!source?.id) return;

    try {
      setPreviewLoading(true);
      setPreviewError('');

      const fileBlob = await applicationsApi.getRecruiterCvFile(source.id);
      const nextPreviewUrl = URL.createObjectURL(fileBlob);

      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return nextPreviewUrl;
      });
    } catch (loadError) {
      setPreviewError(loadError.message || 'Khong the xem truoc CV');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadCv = async () => {
    if (!source?.id) return;

    try {
      const fileBlob = await applicationsApi.getRecruiterCvFile(source.id);
      const downloadUrl = URL.createObjectURL(fileBlob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = cvFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (loadError) {
      setPreviewError(loadError.message || 'Khong the tai CV');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col h-screen">
      {/* Header điều hướng */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-2"
        >
          <span>&larr;</span> Quay lại danh sách
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
            Từ chối
          </button>
          <button className="px-4 py-2 font-medium text-sm rounded-lg transition shadow-sm text-white bg-emerald-500 hover:bg-emerald-600">
            Chuyển sang Phỏng vấn
          </button>
        </div>
      </div>

      {/* Main Layout: Split Screen */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Cột trái: PDF Viewer (60%) */}
        <div className="flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">CV đính kèm: {cvFileName}</h3>
            <button
              onClick={handleDownloadCv}
              disabled={!canPreviewCv}
              className="text-blue-600 hover:underline text-sm font-medium disabled:text-gray-400 disabled:no-underline"
            >
              Tải xuống
            </button>
          </div>
          <div className="flex-1 bg-gray-100 flex items-center justify-center m-4 rounded border border-dashed border-gray-300 overflow-hidden">
            {previewUrl ? (
              <iframe
                title="CV Preview"
                src={previewUrl}
                className="w-full h-full bg-white"
              />
            ) : (
              <div className="text-center px-6">
                <button
                  onClick={handlePreviewCv}
                  disabled={!canPreviewCv || previewLoading}
                  className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:text-gray-400 disabled:border-gray-200 disabled:hover:bg-transparent"
                >
                  {previewLoading ? 'Loading...' : 'Xem trước'}
                </button>
                {!canPreviewCv && <p className="mt-3 text-sm text-gray-400">Ung vien chua nop file CV.</p>}
                {previewError && <p className="mt-3 text-sm text-red-500">{previewError}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Thông tin & Thao tác (40%) */}
        <div className="flex-[2] flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* Card 1: Thông tin cơ bản */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{candidateName}</h2>
                <p className="text-blue-600 font-medium text-sm mt-1">Ứng tuyển: {candidateJobTitle}</p>
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p>Email: {candidateEmail}</p>
                  <p>Phone: {candidatePhone}</p>
                  <p>Ngày nộp: {candidateAppliedDate}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hiện tại</label>
              {loading && <p className="mb-2 text-xs text-gray-400">Dang tai thong tin chi tiet...</p>}
              {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
              <select
                value={candidateStatus}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50 text-yellow-800 font-medium"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 2: Ghi chú đánh giá */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
            <h3 className="font-bold text-gray-800 mb-4">Ghi chú & Đánh giá nội bộ</h3>
            <textarea 
              rows="5" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
              placeholder="Nhập nhận xét của bạn về ứng viên này (Ứng viên sẽ không thấy phần này)..."
            ></textarea>
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors">
              Lưu ghi chú
            </button>
            
            {/* Lịch sử ghi chú */}
            <div className="mt-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-700">Kỹ năng cứng khá ổn, dùng React rất thành thạo. Cần hỏi thêm về cách tối ưu performance.</p>
                <p className="text-xs text-gray-400 mt-2">Bởi HR - 2 giờ trước</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
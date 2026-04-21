import React, { useEffect, useState } from 'react';
import { applicationsApi } from '../../lib/api';
import { formatMessageTime } from '../../utils/format';
import { FaArrowLeft, FaDownload, FaEye, FaMailBulk } from 'react-icons/fa';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'New Application', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'reviewed', label: 'Under Review', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'accepted', label: 'Offer Extended', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
];

const STATUS_VALUES = new Set(STATUS_OPTIONS.map((o) => o.value));

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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');

  useEffect(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
    setPreviewError('');

    let isMounted = true;

    const loadApplicationDetail = async () => {
      if (!candidate?.id) {
        if (isMounted) {
          setDetail(null);
          setLoading(false);
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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

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
  const cvFileName = source?.cvFileName || 'No CV attached';
  const canPreviewCv = Boolean(source?.id && source?.cvFileName);

  const currentStatusMeta = STATUS_OPTIONS.find((o) => o.value === candidateStatus) || STATUS_OPTIONS[0];

  const handlePreviewCv = async () => {
    if (!source?.id) return;
    try {
      setPreviewLoading(true);
      setPreviewError('');
      const fileBlob = await applicationsApi.getRecruiterCvFile(source.id);
      const nextPreviewUrl = URL.createObjectURL(fileBlob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(nextPreviewUrl);
    } catch (loadError) {
      setPreviewError(loadError.message || 'Unable to preview CV');
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
      setPreviewError(loadError.message || 'Unable to download CV');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!source?.id || newStatus === candidateStatus) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError('');
    try {
      await applicationsApi.updateStatus(source.id, newStatus);
      setDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      setStatusUpdateError(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getAvatarColor = () => {
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-teal-100 text-teal-700',
    ];
    const index = candidateName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-medium transition-colors"
          >
            <FaArrowLeft size={18} />
            Back to Applications
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadCv}
              disabled={!canPreviewCv}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <FaDownload size={16} />
              Download CV
            </button>
          </div>
        </div>

        {/* Error */}
        {(error || statusUpdateError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error || statusUpdateError}
          </div>
        )}

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Left: CV Preview */}
          <div className="flex-[3] bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden min-h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">CV: {cvFileName}</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviewCv}
                  disabled={!canPreviewCv || previewLoading}
                  className="text-sm text-emerald-600 hover:underline font-medium disabled:text-gray-400 disabled:no-underline"
                >
                  {previewLoading ? 'Loading...' : 'Preview'}
                </button>
                <button
                  onClick={handleDownloadCv}
                  disabled={!canPreviewCv}
                  className="text-sm text-emerald-600 hover:underline font-medium disabled:text-gray-400 disabled:no-underline"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center m-4 rounded-xl border border-dashed border-gray-300 overflow-hidden">
              {previewUrl ? (
                <iframe
                  title="CV Preview"
                  src={previewUrl}
                  className="w-full h-full bg-white"
                />
              ) : (
                <div className="text-center px-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaEye size={24} className="text-gray-400" />
                  </div>
                  {previewError ? (
                    <p className="text-sm text-red-500">{previewError}</p>
                  ) : (
                    <>
                      <button
                        onClick={handlePreviewCv}
                        disabled={!canPreviewCv || previewLoading}
                        className="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm font-medium disabled:text-gray-400 disabled:border-gray-200 disabled:hover:bg-transparent"
                      >
                        {previewLoading ? 'Loading...' : 'Click to Preview CV'}
                      </button>
                      {!canPreviewCv && (
                        <p className="mt-3 text-sm text-gray-400">No CV file attached to this application.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Candidate Info */}
          <div className="flex-[2] flex flex-col gap-5">
            {/* Candidate Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${avatarColor}`}>
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{candidateName}</h2>
                  <p className="text-sm text-emerald-600 font-medium mt-0.5">{candidateJobTitle}</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>{candidateEmail}</p>
                    <p>{candidatePhone !== 'No phone available' ? candidatePhone : ''}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Applied on {candidateAppliedDate}
              </div>

              {/* Status */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Application Status</label>
                <select
                  value={candidateStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                  className={`w-full border rounded-xl px-4 py-2.5 font-semibold text-sm focus:ring-2 focus:ring-emerald-200 outline-none transition-all cursor-pointer ${currentStatusMeta.color} border-current`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-gray-800 bg-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {isUpdatingStatus && (
                  <p className="text-xs text-gray-400 mt-1">Updating...</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-100 transition-colors">
                  <FaMailBulk size={16} />
                  Move to Interview Stage
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Interview
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Application
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 flex-1">
              <h3 className="font-bold text-gray-800 mb-4">Internal Notes</h3>
              <textarea
                rows="5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none text-sm"
                placeholder="Add private notes about this candidate (not visible to candidate)..."
              />
              <button className="mt-3 w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium text-sm transition-colors">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;

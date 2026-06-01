import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  Users,
  FileDown,
  ArrowLeft,
  ChevronDown,
  CheckCircle,
  FileText,
  Loader2,
  X
} from 'lucide-react';

const Applicants = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeApp, setActiveApp] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchApplicants = async () => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      setJob(response.data.job);
      setApplicants(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch applicants error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const openStatusModal = (app) => {
    setActiveApp(app);
    setSelectedStatus(app.status);
    setRemarks('');
    setModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setStatusLoading(true);
    try {
      await api.put(`/applications/${activeApp._id}/status`, {
        status: selectedStatus,
        remarks,
      });
      fetchApplicants();
      setModalOpen(false);
    } catch (error) {
      console.error('Update status error:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interviewing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans">
      <Link
        to="/po/jobs"
        className="flex items-center text-xs font-bold text-slate-500 hover:text-sky-500 hover:underline mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Jobs
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {job?.companyId?.name}
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{job?.title} Applicants</h1>
          <p className="text-slate-500 text-sm">Review candidate resumes and advance application pipelines</p>
        </div>

        <a
          href={`http://localhost:5000/api/v1/applications/${jobId}/download-resumes`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-200 self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Download Resumes (ZIP)
        </a>
      </div>

      {applicants.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Applicants Yet</h3>
          <p className="text-slate-400 text-sm mt-1">Students have not applied for this job announcement yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">CGPA</th>
                  <th className="py-4 px-6 text-center">Backlogs</th>
                  <th className="py-4 px-6 text-center">Resume Snapshot</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {applicants.map((app) => {
                  const student = app.studentId;
                  const profile = app.studentProfile;
                  
                  return (
                    <tr key={app._id} className="hover:bg-slate-50/30">
                      <td className="py-4 px-6 font-bold text-slate-800 uppercase">{profile?.rollNumber}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-semibold">{student?.name}</span>
                          <span className="text-xs text-slate-400 font-medium">{student?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{profile?.departmentId?.code}</td>
                      <td className="py-4 px-6 text-center font-bold text-sky-600">{profile?.cgpa?.toFixed(2)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={profile?.backlogs > 0 ? 'text-red-500 font-bold' : ''}>
                          {profile?.backlogs}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <a
                          href={`http://localhost:5000${app.resumeUrlSnapshot}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-bold text-sky-600 hover:underline"
                        >
                          <FileText className="w-4 h-4 mr-1 text-slate-400" />
                          View PDF
                        </a>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openStatusModal(app)}
                          className="text-xs font-bold text-sky-500 hover:text-sky-600 hover:underline flex items-center justify-end ml-auto"
                        >
                          Change Status
                          <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-zoom-in relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Advance Application Status
            </h2>
            <div className="mb-4 text-sm text-slate-500">
              Update placement pipeline stage for{' '}
              <span className="font-bold text-slate-700">{activeApp?.studentId?.name}</span>.
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Pipeline Stage
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 transition-colors text-sm"
                  required
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="selected">Selected (Lock Placement)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Stage Remarks / Logs Message
                </label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Cleared technical round, scheduled for panel interview..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center"
                >
                  {statusLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Update Pipeline'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;

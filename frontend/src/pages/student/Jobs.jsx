import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Lock,
  CheckCircle,
  FileText,
  Search,
  Loader2,
  X
} from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const fetchData = async () => {
    try {
      const jobsRes = await api.get('/jobs?status=open');
      const appsRes = await api.get('/applications/my-applications');
      setJobs(jobsRes.data.data);
      setApplications(appsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch jobs/applications error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isApplied = (jobId) => {
    return applications.some((app) => app.jobId._id === jobId);
  };

  const handleApply = async (jobId) => {
    setApplyLoading(true);
    setApplyError('');
    setApplySuccess('');
    try {
      await api.post('/applications/apply', { jobId });
      setApplySuccess('Applied successfully! Status: Applied');
      fetchData();
    } catch (error) {
      setApplyError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.companyId?.name.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Jobs Board</h1>
          <p className="text-slate-500">Explore eligible job opportunities and submit applications</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Jobs Found</h3>
          <p className="text-slate-400 text-sm mt-1">Check back later or search for other parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = isApplied(job._id);
            return (
              <div
                key={job._id}
                onClick={() => {
                  setSelectedJob(job);
                  setApplyError('');
                  setApplySuccess('');
                }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        {job.companyId?.name}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 hover:text-sky-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                    </div>
                    {job.companyId?.logoUrl && (
                      <img
                        src={job.companyId.logoUrl}
                        alt={job.companyId.name}
                        className="w-10 h-10 object-contain rounded-lg border border-slate-100"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 mb-6">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>{job.packageLPA} LPA</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <Calendar className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>Apply by: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                  {hasApplied ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Applied
                    </span>
                  ) : job.isEligible ? (
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full">
                      Eligible to Apply
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                      <Lock className="w-3.5 h-3.5 mr-1" />
                      Locked
                    </span>
                  )}
                  <span className="text-xs text-sky-500 font-semibold hover:underline">View details &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 animate-zoom-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">
                {selectedJob.companyId?.name}
              </span>
              <h2 className="text-2xl font-bold text-slate-800">{selectedJob.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 mt-2">
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                  {selectedJob.packageLPA} LPA
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                  {selectedJob.location}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                  Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Job Description</h4>
                <div className="text-slate-600 text-sm whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedJob.description}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Eligibility Criteria</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Minimum CGPA</span>
                    <span className="font-bold text-slate-700">{selectedJob.eligibility?.minCgpa}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Max Backlogs</span>
                    <span className="font-bold text-slate-700">{selectedJob.eligibility?.maxBacklogs}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-1 sm:col-span-2">
                    <span className="text-slate-500 font-medium block mb-1">Eligible Branches</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.eligibility?.eligibleDepartments && selectedJob.eligibility.eligibleDepartments.length > 0 ? (
                        selectedJob.eligibility.eligibleDepartments.map((dept) => (
                          <span
                            key={dept._id}
                            className="text-xs px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold border border-sky-100 rounded-md"
                          >
                            {dept.code}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">All Departments Eligible</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!selectedJob.isEligible && !isApplied(selectedJob._id) && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">You are currently ineligible to apply:</span>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-amber-700">
                      {selectedJob.ineligibilityReasons?.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {applyError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
                  {applyError}
                </div>
              )}
              {applySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
                  {applySuccess}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Close
                </button>
                {isApplied(selectedJob._id) ? (
                  <button
                    disabled
                    className="px-6 py-2 bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-sm flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Applied
                  </button>
                ) : (
                  <button
                    disabled={!selectedJob.isEligible || applyLoading}
                    onClick={() => handleApply(selectedJob._id)}
                    className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {applyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;

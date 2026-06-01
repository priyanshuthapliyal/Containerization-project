import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import {
  Briefcase,
  Plus,
  Edit2,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Loader2,
  X
} from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [packageLPA, setPackageLPA] = useState('');
  const [location, setLocation] = useState('');
  const [minCgpa, setMinCgpa] = useState('0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [eligibleDepartments, setEligibleDepartments] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('open');

  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      const jobsRes = await api.get('/jobs');
      const companiesRes = await api.get('/companies');
      const deptsRes = await api.get('/departments');
      setJobs(jobsRes.data.data);
      setCompanies(companiesRes.data.data);
      setDepartments(deptsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch data error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setSelectedJob(null);
    setTitle('');
    setDescription('');
    setCompanyId(companies[0]?._id || '');
    setPackageLPA('');
    setLocation('');
    setMinCgpa('0');
    setMaxBacklogs('0');
    setEligibleDepartments([]);
    setDeadline('');
    setStatus('open');
    setSubmitError('');
    setModalOpen(true);
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setCompanyId(job.companyId?._id || '');
    setPackageLPA(job.packageLPA.toString());
    setLocation(job.location);
    setMinCgpa(job.eligibility?.minCgpa?.toString() || '0');
    setMaxBacklogs(job.eligibility?.maxBacklogs?.toString() || '0');
    setEligibleDepartments(job.eligibility?.eligibleDepartments?.map(d => d._id) || []);
    
    const date = new Date(job.deadline);
    const formattedDate = date.toISOString().split('T')[0];
    setDeadline(formattedDate);
    setStatus(job.status);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleDeptCheckbox = (deptId) => {
    if (eligibleDepartments.includes(deptId)) {
      setEligibleDepartments(eligibleDepartments.filter(id => id !== deptId));
    } else {
      setEligibleDepartments([...eligibleDepartments, deptId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !companyId || !packageLPA || !location || !deadline) {
      setSubmitError('Required fields are missing');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    const payload = {
      companyId,
      title,
      description,
      packageLPA: parseFloat(packageLPA),
      location,
      eligibility: {
        minCgpa: parseFloat(minCgpa),
        maxBacklogs: parseInt(maxBacklogs, 10),
        eligibleDepartments,
      },
      deadline,
      status,
    };

    try {
      if (selectedJob) {
        await api.put(`/jobs/${selectedJob._id}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      fetchData();
      setModalOpen(false);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'open':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Job Openings</h1>
          <p className="text-slate-500">Configure recruitment eligibility, deadlines, and view applicants</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-500/10 hover:shadow-sky-500/25 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Job Postings</h3>
          <p className="text-slate-400 text-sm mt-1">Add job announcements for students to browse and apply.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {job.companyId?.name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{job.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-500 mb-6 mt-3">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1.5 text-slate-400" />
                    <span>{job.packageLPA} LPA</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between">
                <button
                  onClick={() => openEditModal(job)}
                  className="flex items-center text-xs font-bold text-slate-600 hover:text-sky-500 hover:underline bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit Job
                </button>
                
                <Link
                  to={`/po/applicants/${job._id}`}
                  className="flex items-center text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl px-4 py-2 transition-all shadow-md shadow-sky-500/10 hover:shadow-sky-500/20"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  View Applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 animate-zoom-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {selectedJob ? 'Modify Placement Announcement' : 'Post Placement Opportunity'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Graduate"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    required
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Job Description & Skills Requirement
                </label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="We are looking for full stack engineers familiar with React and Node.js..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    CTC Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={packageLPA}
                    onChange={(e) => setPackageLPA(e.target.value)}
                    placeholder="e.g. 12.5"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Apply Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Candidate Eligibility Boundaries
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Minimum CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Maximum Backlogs Allowed
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxBacklogs}
                      onChange={(e) => setMaxBacklogs(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Posting Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 transition-colors text-xs"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-2">
                    Eligible Branches (Leave empty to allow all)
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {departments.map((dept) => (
                      <label key={dept._id} className="flex items-center text-xs text-slate-600 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eligibleDepartments.includes(dept._id)}
                          onChange={() => handleDeptCheckbox(dept._id)}
                          className="mr-1.5 h-4 w-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
                        />
                        {dept.code}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Posting'
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

export default Jobs;

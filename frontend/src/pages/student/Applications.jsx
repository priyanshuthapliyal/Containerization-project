import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  FileText,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  Loader2
} from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setApplications(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch applications error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusStyle = (status) => {
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Applications</h1>
        <p className="text-slate-500">Track the interview and shortlisting status of your applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Applications Yet</h3>
          <p className="text-slate-400 text-sm mt-1">Browse the Jobs Board and apply to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedId === app._id;
            const job = app.jobId;
            const company = job?.companyId;

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
              >
                <div
                  onClick={() => toggleExpand(app._id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-between text-slate-500 font-bold border border-slate-200 flex-shrink-0">
                      <Briefcase className="w-5 h-5 mx-auto text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{job?.title}</h3>
                      <span className="text-sm font-medium text-slate-500">{company?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 ml-14 sm:ml-0">
                    <div className="text-xs font-semibold text-slate-400 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-slate-300" />
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                    
                    <span className={`px-3 py-1 border text-xs font-bold rounded-full uppercase ${getStatusStyle(app.status)}`}>
                      {app.status}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 hidden sm:block" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 hidden sm:block" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 animate-slide-down">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-500 mb-6 py-3">
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                        Package: {job?.packageLPA} LPA
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                        Location: {job?.location}
                      </span>
                      <span className="flex items-center col-span-1 sm:col-span-2">
                        <FileText className="w-4 h-4 mr-1 text-slate-400" />
                        Resume Submitted:{' '}
                        <a
                          href={`http://localhost:5000${app.resumeUrlSnapshot}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 font-bold hover:underline ml-1"
                        >
                          View PDF Snapshot
                        </a>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                        Application Status History
                      </h4>
                      <div className="relative border-l border-slate-200 pl-5 ml-2.5 space-y-6">
                        {app.statusHistory.map((history, idx) => (
                          <div key={history._id || idx} className="relative">
                            <span className={`absolute -left-8 top-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                              idx === app.statusHistory.length - 1
                                ? 'bg-sky-500 scale-110 shadow-sky-500/20'
                                : 'bg-slate-300'
                            }`} />
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-slate-700 capitalize">
                                  {history.status}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(history.changedAt).toLocaleString()}
                                </span>
                              </div>
                              {history.remarks && (
                                <p className="text-xs text-slate-500 mt-0.5 italic">
                                  &ldquo;{history.remarks}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;

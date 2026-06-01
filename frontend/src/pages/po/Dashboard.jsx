import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Users2,
  Building2,
  Briefcase,
  FileCheck,
  Percent,
  DollarSign,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/reports/dashboard-stats');
      const deptRes = await api.get('/reports/department-stats');
      setStats(statsRes.data.data);
      setDeptStats(deptRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch PO analytics error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  const placementBreakdown = [
    { name: 'Placed', value: stats?.placedStudents || 0 },
    { name: 'Unplaced', value: (stats?.totalStudents || 0) - (stats?.placedStudents || 0) },
  ];
  
  const PIE_COLORS = ['#10b981', '#cbd5e1'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Placement Analytics</h1>
        <p className="text-slate-500">Live operational overview and statistical breakdown of campus recruitment</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-xl">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Candidates</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.totalStudents}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Placed Candidates</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.placedStudents}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Rate</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.placementPercentage}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-violet-500 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Package</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.highestPackage} LPA</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-around">
          <div>
            <Building2 className="w-8 h-8 text-slate-300 mb-1" />
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Companies Registered</span>
            <span className="text-xl font-bold text-slate-700">{stats?.totalCompanies} Partner Companies</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-around">
          <div>
            <Briefcase className="w-8 h-8 text-slate-300 mb-1" />
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Job Posts</span>
            <span className="text-xl font-bold text-slate-700">{stats?.activeJobs} Open Openings</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-around">
          <div>
            <FileCheck className="w-8 h-8 text-slate-300 mb-1" />
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Placed CSV Download</span>
            <a
              href="http://localhost:5000/api/v1/reports/export-placed"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-sky-600 hover:underline block mt-1"
            >
              Export Placed Student List &rarr;
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
            Department-wise Placement Rates (%)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tickLine={false} axisLine={false} style={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} style={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13 }}
                />
                <Bar dataKey="placementRate" fill="#0ea5e9" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
            Recruitment Funnel Status
          </h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={placementBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {placementBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" style={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-[42%] flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-700">{stats?.placementPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Placed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

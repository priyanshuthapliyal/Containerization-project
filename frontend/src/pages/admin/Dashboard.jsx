import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Users2,
  GraduationCap,
  Plus,
  Edit2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Loader2,
  X
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // User modal/form state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('student');
  const [rollNumber, setRollNumber] = useState('');
  const [deptId, setDeptId] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [cgpa, setCgpa] = useState('0');
  const [backlogs, setBacklogs] = useState('0');
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Department modal/form state
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHOD, setDeptHOD] = useState('');
  const [deptError, setDeptError] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);

  // CSV Importer state
  const [csvData, setCsvData] = useState('');
  const [csvReport, setCsvReport] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/users');
      const deptsRes = await api.get('/departments');
      setUsers(usersRes.data.data);
      setDepartments(deptsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch admin data error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (departments.length > 0 && !deptId) {
      setDeptId(departments[0]._id);
    }
  }, [departments]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setUserError('');

    const payload = {
      name: userName,
      email: userEmail,
      role: userRole,
    };

    if (!selectedUser) {
      payload.password = userPassword;
    }

    if (userRole === 'student') {
      payload.rollNumber = rollNumber;
      payload.departmentId = deptId;
      payload.graduationYear = parseInt(gradYear, 10);
      payload.cgpa = parseFloat(cgpa);
      payload.backlogs = parseInt(backlogs, 10);
    }

    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, {
          name: userName,
          email: userEmail,
          profileData: userRole === 'student' ? {
            rollNumber,
            departmentId: deptId,
            graduationYear: parseInt(gradYear, 10),
            cgpa: parseFloat(cgpa),
            backlogs: parseInt(backlogs, 10),
          } : undefined
        });
      } else {
        await api.post('/users', payload);
      }
      fetchData();
      setUserModalOpen(false);
    } catch (err) {
      setUserError(err.response?.data?.message || 'Operation failed');
    } finally {
      setUserLoading(false);
    }
  };

  const handleToggleUser = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      fetchData();
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const openCreateUserModal = () => {
    setSelectedUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('student');
    setRollNumber('');
    setDeptId(departments[0]?._id || '');
    setGradYear(new Date().getFullYear().toString());
    setCgpa('0');
    setBacklogs('0');
    setUserError('');
    setUserModalOpen(true);
  };

  const openEditUserModal = (u) => {
    setSelectedUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserPassword('');
    setUserError('');

    if (u.role === 'student' && u.profile) {
      setRollNumber(u.profile.rollNumber || '');
      setDeptId(u.profile.departmentId?._id || departments[0]?._id || '');
      setGradYear(u.profile.graduationYear?.toString() || '');
      setCgpa(u.profile.cgpa?.toString() || '0');
      setBacklogs(u.profile.backlogs?.toString() || '0');
    }
    setUserModalOpen(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setDeptLoading(true);
    setDeptError('');

    const payload = { name: deptName, code: deptCode, headOfDept: deptHOD };

    try {
      if (selectedDept) {
        await api.put(`/departments/${selectedDept._id}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      fetchData();
      setDeptModalOpen(false);
    } catch (err) {
      setDeptError(err.response?.data?.message || 'Operation failed');
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const openCreateDeptModal = () => {
    setSelectedDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptHOD('');
    setDeptError('');
    setDeptModalOpen(true);
  };

  const openEditDeptModal = (d) => {
    setSelectedDept(d);
    setDeptName(d.name);
    setDeptCode(d.code);
    setDeptHOD(d.headOfDept || '');
    setDeptError('');
    setDeptModalOpen(true);
  };

  const handleCSVImport = async (e) => {
    e.preventDefault();
    if (!csvData.trim()) return;

    setCsvLoading(true);
    setCsvError('');
    setCsvReport(null);

    try {
      const response = await api.post('/users/bulk-import', { csvData });
      setCsvReport(response.data.data);
      fetchData();
    } catch (err) {
      setCsvError(err.response?.data?.message || 'CSV Import failed. Check department codes.');
    } finally {
      setCsvLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Console</h1>
        <p className="text-slate-500">Configure college branches, manage accounts directory, and import bulk rosters</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-6 py-3 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === 'users'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users2 className="w-4 h-4 mr-2" />
          User Directory
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center px-6 py-3 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === 'csv'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          CSV Student Importer
        </button>
        <button
          onClick={() => setActiveTab('depts')}
          className={`flex items-center px-6 py-3 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === 'depts'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          Departments
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              System Accounts: {users.length} Users
            </span>
            <button
              onClick={openCreateUserModal}
              className="flex items-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Account
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Academic parameters</th>
                    <th className="py-3 px-6 text-center">Active status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/20">
                      <td className="py-3.5 px-6 font-bold text-slate-800">{u.name}</td>
                      <td className="py-3.5 px-6">{u.email}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] border ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : u.role === 'po'
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            : 'bg-sky-100 text-sky-800 border-sky-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {u.role === 'student' && u.profile ? (
                          <div className="space-y-0.5">
                            <div>
                              Roll: <span className="font-bold uppercase text-slate-700">{u.profile.rollNumber}</span> | Branch:{' '}
                              <span className="font-semibold">{u.profile.departmentId?.code}</span>
                            </div>
                            <div>
                              CGPA: <span className="font-bold text-sky-600">{u.profile.cgpa?.toFixed(2)}</span> | Backlogs:{' '}
                              <span className={u.profile.backlogs > 0 ? 'text-red-500 font-bold' : ''}>
                                {u.profile.backlogs}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => handleToggleUser(u)}
                          className={`p-1.5 transition-colors ${
                            u.isActive ? 'text-emerald-500' : 'text-slate-300'
                          }`}
                        >
                          {u.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => openEditUserModal(u)}
                          className="text-xs text-sky-500 hover:text-sky-600 hover:underline font-bold"
                        >
                          Edit Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'csv' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Import Student Directory via CSV Block
            </h3>
            
            <form onSubmit={handleCSVImport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  CSV Raw Data Rows
                </label>
                <textarea
                  rows="8"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="rollNumber,name,email,password,departmentCode,graduationYear,cgpa,backlogs&#10;22CSE01,John Doe,john@college.edu,pass123,CSE,2026,8.45,0&#10;22CSE02,Alice Smith,alice@college.edu,student22,CSE,2026,9.10,0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500 transition-colors"
                  required
                />
              </div>

              {csvError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                  {csvError}
                </div>
              )}

              <button
                type="submit"
                disabled={csvLoading || !csvData.trim()}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center"
              >
                {csvLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running bulk imports...
                  </>
                ) : (
                  'Run Bulk Import'
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">CSV Roster Template Instructions</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The CSV input must contain a header row specifying standard fields.
                Department codes (e.g. <b>CSE</b>, <b>ECE</b>) must match existing database records exactly.
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl font-mono text-[10px] text-slate-500 border border-slate-100 overflow-x-auto">
                rollNumber,name,email,password,departmentCode,graduationYear,cgpa,backlogs
              </div>
            </div>

            {csvReport && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-zoom-in">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                  Import Summary Report
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Total</span>
                    <span className="text-slate-700 text-lg">{csvReport.total}</span>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800">
                    <span className="block text-[10px] text-emerald-600 font-semibold uppercase">Imported</span>
                    <span className="text-lg">{csvReport.imported}</span>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-800">
                    <span className="block text-[10px] text-rose-600 font-semibold uppercase">Failed</span>
                    <span className="text-lg">{csvReport.failed}</span>
                  </div>
                </div>
                
                {csvReport.errors?.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-rose-50/50">
                    <span className="block text-[10px] text-rose-700 font-bold uppercase mb-1">Errors Log</span>
                    <ul className="list-disc pl-4 text-[10px] text-rose-600 space-y-1">
                      {csvReport.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'depts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Branches: {departments.length} Departments
            </span>
            <button
              onClick={openCreateDeptModal}
              className="flex items-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Department
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-6">Dept Code</th>
                    <th className="py-4 px-6">Branch Name</th>
                    <th className="py-4 px-6">Head of Department</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                  {departments.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/30">
                      <td className="py-4 px-6 font-bold text-slate-800 uppercase">{d.code}</td>
                      <td className="py-4 px-6">{d.name}</td>
                      <td className="py-4 px-6">{d.headOfDept || 'N/A'}</td>
                      <td className="py-4 px-6 text-right flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditDeptModal(d)}
                          className="p-1.5 text-slate-400 hover:text-sky-500 rounded-lg hover:bg-slate-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(d._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 animate-zoom-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setUserModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {selectedUser ? 'Modify User Profile' : 'Register User Account'}
            </h2>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              {!selectedUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  User Role
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  disabled={!!selectedUser}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="po">Placement Officer (PO)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              {userRole === 'student' && (
                <div className="border-t border-slate-100 pt-4 space-y-4 mt-6">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Student Academic parameters
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. 22CSE01"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Department
                      </label>
                      <select
                        value={deptId}
                        onChange={(e) => setDeptId(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                        required
                      >
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Grad Year
                      </label>
                      <input
                        type="number"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Backlogs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={backlogs}
                        onChange={(e) => setBacklogs(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {userError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                  {userError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userLoading}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center"
                >
                  {userLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Edit/Create Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-zoom-in relative">
            <button
              onClick={() => setDeptModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {selectedDept ? 'Modify Department' : 'Register Department'}
            </h2>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. CSE"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    value={deptHOD}
                    onChange={(e) => setDeptHOD(e.target.value)}
                    placeholder="e.g. Dr. John"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {deptError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                  {deptError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deptLoading}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center"
                >
                  {deptLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Department'
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

export default Dashboard;

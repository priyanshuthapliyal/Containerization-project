import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import {
  User,
  GraduationCap,
  FileDown,
  Tag,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Profile = () => {
  const { changePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState('');
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsMsg, setSkillsMsg] = useState({ type: '', text: '' });

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeMsg, setResumeMsg] = useState({ type: '', text: '' });

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data.data);
      if (response.data.data.profile?.skills) {
        setSkills(response.data.data.profile.skills.join(', '));
      }
      setLoading(false);
    } catch (error) {
      console.error('Fetch profile error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSkillsSubmit = async (e) => {
    e.preventDefault();
    setSkillsLoading(true);
    setSkillsMsg({ type: '', text: '' });

    try {
      await api.put('/users/profile', { skills });
      setSkillsMsg({ type: 'success', text: 'Skills updated successfully!' });
      fetchProfile();
    } catch (err) {
      setSkillsMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update skills' });
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setResumeLoading(true);
    setResumeMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await api.post('/users/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeMsg({ type: 'success', text: 'Resume uploaded successfully!' });
      fetchProfile();
      setResumeFile(null);
    } catch (err) {
      setResumeMsg({ type: 'error', text: err.response?.data?.message || 'Resume upload failed' });
    } finally {
      setResumeLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  const { user, profile: studentInfo } = profile || {};

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Student Profile</h1>
          <p className="text-slate-500">Manage your academic profile and credentials</p>
        </div>
        {studentInfo?.placementStatus === 'placed' && (
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Placed at {studentInfo.placedCompanyId?.name || 'Partner Company'}!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-6">
            <GraduationCap className="w-6 h-6 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-800">Academic & Personal Info</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</span>
              <span className="text-slate-800 font-medium">{user?.name}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</span>
              <span className="text-slate-800 font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Roll Number</span>
              <span className="text-slate-800 font-semibold uppercase">{studentInfo?.rollNumber}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</span>
              <span className="text-slate-800 font-medium">
                {studentInfo?.departmentId?.name} ({studentInfo?.departmentId?.code})
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Graduation Year</span>
              <span className="text-slate-800 font-medium">{studentInfo?.graduationYear}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">CGPA</span>
              <span className="text-slate-800 font-bold text-sky-600 text-lg">{studentInfo?.cgpa?.toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Backlogs</span>
              <span className={`font-semibold ${studentInfo?.backlogs > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                {studentInfo?.backlogs}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Status</span>
              <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full uppercase mt-1 ${
                studentInfo?.placementStatus === 'placed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {studentInfo?.placementStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-6">
              <FileDown className="w-6 h-6 text-sky-500" />
              <h2 className="text-lg font-bold text-slate-800">Resume Vault</h2>
            </div>

            {studentInfo?.resumeUrl ? (
              <div className="mb-6 p-4 rounded-xl bg-sky-50/50 border border-sky-100 flex items-center justify-between">
                <div className="overflow-hidden">
                  <span className="block text-xs font-semibold text-sky-700">Uploaded Resume</span>
                  <a
                    href={`http://localhost:5000${studentInfo.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-sky-600 hover:underline break-all"
                  >
                    View Active PDF
                  </a>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center space-x-3 text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>No resume uploaded yet. You cannot apply for jobs without uploading.</span>
              </div>
            )}

            <form onSubmit={handleResumeUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Upload New Resume (PDF only, max 2MB)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  required
                />
              </div>

              {resumeMsg.text && (
                <div className={`p-3 rounded-lg text-xs ${
                  resumeMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  {resumeMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={resumeLoading || !resumeFile}
                className="w-full py-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
              >
                {resumeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Resume'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-6">
            <Tag className="w-6 h-6 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-800">Skills Portfolio</h2>
          </div>

          <form onSubmit={handleSkillsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Your Skills (Comma-separated)
              </label>
              <textarea
                rows="3"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="JavaScript, React, Node.js, Python, SQL"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors text-sm"
              />
            </div>

            {studentInfo?.skills && studentInfo.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 py-2">
                {studentInfo.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {skillsMsg.text && (
              <div className={`p-3 rounded-lg text-xs ${
                skillsMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
              }`}>
                {skillsMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={skillsLoading}
              className="py-2 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {skillsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Skills'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-6">
            <KeyRound className="w-6 h-6 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-800">Security Credentials</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Password (Min 6 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                required
              />
            </div>

            {passwordMsg.text && (
              <div className={`p-3 rounded-lg text-xs ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="py-2 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

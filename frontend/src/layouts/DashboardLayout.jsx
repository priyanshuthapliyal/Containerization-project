import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import doonLogo from '../assets/doon_logo.jpg';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  Users2,
  GraduationCap,
  LogOut,
  Menu,
  X,
  User,
  AlertCircle
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { name: 'My Profile', path: '/student/profile', icon: GraduationCap },
          { name: 'Jobs Board', path: '/student/jobs', icon: Briefcase },
          { name: 'My Applications', path: '/student/applications', icon: FileText },
        ];
      case 'po':
        return [
          { name: 'Analytics Dashboard', path: '/po', icon: LayoutDashboard },
          { name: 'Manage Companies', path: '/po/companies', icon: Building2 },
          { name: 'Manage Jobs', path: '/po/jobs', icon: Briefcase },
        ];
      case 'admin':
        return [
          { name: 'Analytics Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'User Directory', path: '/admin/users', icon: Users2 },
          { name: 'Departments', path: '/admin/departments', icon: GraduationCap },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-4 border-b border-slate-800 bg-slate-950 gap-3">
          <img src={doonLogo} alt="Doon University Logo" className="h-10 w-10 object-contain rounded-full bg-white p-0.5 shadow-sm" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wide uppercase leading-none">
              Doon University
            </span>
            <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider mt-0.5">
              Placement Portal
            </span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group {
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:-translate-x-1" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-slate-900 text-slate-100 h-full border-r border-slate-800 animate-slide-in">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <img src={doonLogo} alt="Doon University Logo" className="h-10 w-10 object-contain rounded-full bg-white p-0.5 shadow-sm" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-white tracking-wide uppercase leading-none">
                    Doon University
                  </span>
                  <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider mt-0.5">
                    Placement Portal
                  </span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{user?.role}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-between text-slate-600 font-bold border border-slate-200">
              <User className="w-5 h-5 mx-auto" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          {user && !user.isPasswordReset && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg flex items-start space-x-3 text-amber-800 shadow-sm animate-pulse">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Security Action Required:</span> You are still using college-issued default credentials. Please{' '}
                <Link to={user.role === 'student' ? '/student/profile' : `/${user.role}`} className="underline font-bold hover:text-amber-950">
                  reset your password
                </Link>{' '}
                to secure your account.
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

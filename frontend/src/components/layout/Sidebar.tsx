import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  FileText,
  Building2,
  Briefcase,
  Bookmark,
  Bot,
  User,
  ShieldCheck,
  QrCode,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showQrModal, setShowQrModal] = useState(false);

  // Student Initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PD';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/tests', label: 'Tests', icon: FileCheck2 },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/company-questions', label: 'Company Questions', icon: Building2 },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/coding', label: 'Ask TAI', icon: Bot },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  if (user?.role === 'ROLE_ADMIN') {
    navItems.push({
      to: '/admin',
      label: 'Admin Console',
      icon: ShieldCheck,
    });
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 h-screen w-60 bg-[#0c0e12] border-r border-[#191c24] transition-all duration-300 ease-in-out flex flex-col justify-between select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Brand Logo & Notification Header */}
          <div className="pt-4 px-4 pb-3 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00b4d8] to-[#38bdf8] flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/20">
                ⚡
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-tight text-[#00c2ff] leading-none">
                  TAP ACADEMY
                </span>
                <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase mt-0.5">
                  Skill Portal
                </span>
              </div>
            </NavLink>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => navigate('/notifications')}
                className="p-1.5 text-slate-400 hover:text-white transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00b4d8] text-slate-950 text-[9px] font-black flex items-center justify-center">
                  2
                </span>
              </button>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="px-3 pb-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-[#14171f] border border-[#1e2330] focus:border-[#00b4d8] text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Scan QR Code Item */}
          <div className="px-3 py-1">
            <button
              onClick={() => setShowQrModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#14171f] rounded-lg transition-all text-left"
            >
              <QrCode className="w-4 h-4 text-slate-400" />
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* MENU Category Label */}
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              MENU
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 space-y-0.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all font-medium group ${
                      isActive
                        ? 'bg-[#131b2e] text-[#38bdf8] font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#14171f]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Employability Score, Theme Switcher & Profile Card */}
        <div className="p-3 border-t border-[#191c24] space-y-2.5 bg-[#0a0c10]">
          {/* Employability Score Widget */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#12151c] border border-[#1e2330]">
            <div className="relative w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center text-[11px] font-black text-white shrink-0">
              0
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                EMPLOYABILITY SCORE
              </span>
              <span className="text-xs font-black text-slate-200">
                0 <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
              </span>
            </div>
          </div>

          {/* Light / Dark Mode Pill Toggle */}
          <div className="p-1 rounded-xl bg-[#12151c] border border-[#1e2330] flex items-center justify-between text-xs">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
                theme === 'dark'
                  ? 'bg-[#000000] text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Dark</span>
            </button>
          </div>

          {/* Student Profile User Bar */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-xs font-black shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-slate-100 uppercase truncate">
                    {user?.fullName || 'PRAJWAL'}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-500/20" />
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'student@skillportal.com'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* QR Code Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#12151c] border border-[#1f2430] rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4 text-[#00c2ff]" />
              <span>Scan QR Code</span>
            </h3>
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  window.location.origin
                )}`}
                alt="Skill Portal QR"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-400">
              Scan with your mobile camera to quickly log in or sync your learning streak.
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-[#1e2330] hover:bg-[#2a3142] text-white rounded-xl text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};


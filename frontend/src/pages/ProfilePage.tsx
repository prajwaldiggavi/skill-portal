import React, { useEffect, useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Award,
  CalendarCheck,
  CheckCircle2,
  Github,
  Linkedin,
  Phone,
  Save,
  Lock
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        const p = res.data.data;
        setProfile(p);
        setPhone(p.phoneNumber || '');
        setBio(p.bio || '');
        setGithubUrl(p.githubUrl || '');
        setLinkedinUrl(p.linkedinUrl || '');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.put('/users/profile', {
        phoneNumber: phone,
        bio: bio,
        githubUrl: githubUrl,
        linkedinUrl: linkedinUrl,
      });
      setProfileMsg('Profile updated successfully! ✓');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', error: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', error: true });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordMsg({ text: 'Password successfully changed! ✓', error: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err: any) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Incorrect current password.',
        error: true,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading student records..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#00c2ff]" />
          Student Profile & Identity Records
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your verified batch credentials, portfolio links, and security access.
        </p>
      </div>

      {/* Official Student Digital ID Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#00b4d8] to-[#38bdf8] flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-cyan-500/20 shrink-0">
            {profile?.fullName
              ? profile.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'PD'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#00c2ff] text-slate-950 shadow-sm">
                ID: {profile?.studentIdNumber || user?.studentIdNumber || 'STU-2026-001'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#181c26] text-slate-300 border border-[#263147]">
                {profile?.batchName || 'Java Full Stack Morning Batch 2026'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {profile?.fullName || user?.fullName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile?.email || user?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-4 pt-4 border-t border-[#1f2430] text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Points</span>
                <strong className="text-[#00c2ff] text-base font-black">
                  {profile?.totalPoints || 0} pts
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Enrolled Track</span>
                <strong className="text-white font-extrabold">
                  Full Stack Java Engineering
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Edit Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-white">
          Portfolio & Contact Information
        </h3>

        {profileMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs font-bold border border-emerald-800/60">
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-200 outline-none focus:border-[#00c2ff]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                GitHub Profile URL
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-200 outline-none focus:border-[#00c2ff]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-200 outline-none focus:border-[#00c2ff]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Personal Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Aspiring Software Engineer interested in Distributed Systems..."
                className="w-full px-4 py-2 rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-200 outline-none focus:border-[#00c2ff] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl bg-[#00c2ff] hover:bg-[#38bdf8] text-slate-950 font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security: Change Password Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0e12] border border-[#1f2430] shadow-xl space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#00c2ff]" />
          Security & Password Change
        </h3>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold border ${
              passwordMsg.error
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-200 outline-none focus:border-[#00c2ff]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-200 outline-none focus:border-[#00c2ff]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#090b0e] border border-[#1f2430] text-slate-200 outline-none focus:border-[#00c2ff]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 rounded-xl bg-[#181c26] hover:bg-[#202533] border border-[#2a3040] text-white font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


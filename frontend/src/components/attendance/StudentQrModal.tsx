import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  X,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface StudentQrData {
  studentId: number;
  studentIdNumber: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  batchId: number;
  batchName: string;
  courseTitle: string;
  qrToken: string;
  qrStatus: string;
  qrGeneratedAt: string;
}

interface StudentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentQrModal: React.FC<StudentQrModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<StudentQrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQr = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/attendance/my-qr');
      setQrData(res.data?.data || null);
    } catch (err: any) {
      console.error('Failed to load student QR code', err);
      setError(err.response?.data?.message || 'Unable to retrieve your unique QR code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQr();
    }
  }, [isOpen]);

  const handleDownload = () => {
    const svg = document.getElementById('student-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${qrData?.studentIdNumber || 'student'}_attendance_qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative bg-[#0d1017] border border-[#1f2636] rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl shadow-cyan-950/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#181f2e] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-[#00c2ff] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Classroom Identity</span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-2 pt-1">
            <span>My Attendance QR Code</span>
          </h3>
          <p className="text-xs text-slate-400">
            Present this unique QR to the instructor or administrator scanner for instant attendance verification.
          </p>
        </div>

        {/* QR Display Card */}
        <div className="bg-[#121622] border border-[#1d2433] rounded-2xl p-5 space-y-4">
          {loading ? (
            <div className="h-60 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#00c2ff] animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Generating encrypted student QR identity...</span>
            </div>
          ) : error ? (
            <div className="h-60 flex flex-col items-center justify-center gap-3 p-4">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-xs text-rose-300 font-medium">{error}</p>
              <button
                onClick={fetchQr}
                className="px-4 py-2 bg-[#1d2433] hover:bg-[#283247] text-white text-xs font-bold rounded-xl transition-all"
              >
                Retry
              </button>
            </div>
          ) : qrData ? (
            <>
              {/* White High-Contrast QR Frame */}
              <div className="w-56 h-56 mx-auto bg-white p-3.5 rounded-2xl shadow-xl flex items-center justify-center">
                <QRCodeSVG
                  id="student-qr-svg"
                  value={qrData.qrToken}
                  size={200}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0a0d14"
                />
              </div>

              {/* Student Metadata */}
              <div className="space-y-1 pt-1">
                <h4 className="text-sm font-black text-white">
                  {qrData.fullName || user?.fullName}
                </h4>
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#00c2ff]">
                  <span>{qrData.studentIdNumber}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-sans text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {qrData.qrStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-xs mx-auto">
                  {qrData.batchName}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-[#090b10] border border-[#161b26] text-left text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Anti-Proxy Security Protection</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            This QR code contains your unique cryptographically generated identity token. Duplicate scans on the same day are rejected automatically. Never share your QR code.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={fetchQr}
            disabled={loading}
            className="py-2.5 px-3 rounded-xl bg-[#181f2e] hover:bg-[#222c42] text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#253046]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!qrData}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0096c7] hover:from-[#00c2ff] hover:to-[#00b4d8] text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};

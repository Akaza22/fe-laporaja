'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { 
  Plus, CheckCircle2, MapPin, 
  Activity, FileText, ArrowRight,
  ShieldAlert, Zap, AlertCircle, Calendar
} from 'lucide-react';
import Link from 'next/link';

interface Report {
  id: string;
  category: string;
  description: string;
  address: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  user_id?: string;
}

export default function UserDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string, full_name: string } | null>(null);
  const [greeting, setGreeting] = useState('Halo');
  
  useEffect(() => {
    // Set Salam Berdasarkan Jam
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 19) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    const initData = async () => {
      try {
        const resMe = await api.get('/me');
        const authData = resMe.data.user || resMe.data.data || resMe.data;
        const userId = authData?.userId || authData?.id;

        // Fetch User Data dari endpoint /users/:id
        if (userId) {
          const resProfile = await api.get(`/users/${userId}`);
          setUser(resProfile.data.data);
        }

        const resReports = await api.get('/reports/me'); 
        let reportData: Report[] = [];
        if (Array.isArray(resReports.data)) {
          reportData = resReports.data;
        } else if (resReports.data?.data && Array.isArray(resReports.data.data)) {
          reportData = resReports.data.data;
        } else if (resReports.data?.reports && Array.isArray(resReports.data.reports)) {
          reportData = resReports.data.reports;
        }

        if (userId) {
          const myReports = reportData.filter((r: any) => 
            r.user_id === userId || r.userId === userId || r.user?.id === userId
          );
          setReports(myReports.length > 0 ? myReports : reportData);
        } else {
          setReports(reportData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // === VISUAL HELPERS ===
  const getStatusConfig = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'RESOLVED' || s === 'DONE') {
      return { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'Selesai' };
    }
    if (s === 'IN_PROGRESS' || s === 'VERIFIED') {
      return { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500 animate-pulse', text: 'Diproses' };
    }
    if (s === 'REJECTED') {
      return { color: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500', text: 'Ditolak' };
    }
    return { color: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-500', text: 'Diterima' };
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('jalan') || cat.includes('infrastruktur')) return <MapPin className="w-5 h-5" />;
    if (cat.includes('keamanan') || cat.includes('kriminal')) return <ShieldAlert className="w-5 h-5" />;
    if (cat.includes('listrik') || cat.includes('lampu')) return <Zap className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const activeReportsCount = reports.filter(r => ['IN_PROGRESS', 'VERIFIED', 'SUBMITTED'].includes(r.status)).length;
  const resolvedReportsCount = reports.filter(r => ['RESOLVED', 'DONE'].includes(r.status)).length;

  return (
    // CONTAINER UTAMA: Full Screen, background abu-abu sangat muda agar Box Putih menonjol
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-76px)] w-full bg-slate-50 overflow-hidden relative">
      
      {/* CSS Hide Scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* AREA SCROLLABLE */}
      {/* px-4 sm:px-8 lg:px-12 membuat layar membentang penuh ke samping */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8 lg:px-12 py-6 lg:py-10 pb-32">
        <div className="w-full max-w-[1600px] mx-auto space-y-6 lg:space-y-8">

          {/* ========================================================= */}
          {/* SECTION 1: HERO & STATS BOXES (Variasi Atas)               */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* HERO BOX (Lebar 3/4) */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 bg-slate-900 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl shadow-slate-900/10"
            >
              {/* Efek Cahaya Background */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
              
              <div className="relative z-10">
                <p className="text-blue-400 font-bold tracking-wider text-sm uppercase mb-2">
                  {greeting},
                </p>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {user?.full_name?.split(' ')[0] || 'Memuat...'}
                </h1>
                <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-xl leading-relaxed">
                  Mari bersama-sama wujudkan lingkungan yang lebih baik. Suara Anda adalah awal dari perubahan.
                </p>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <Link href="/reports/create" className="group flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 active:scale-95 w-full md:w-auto">
                  <Plus className="w-5 h-5" />
                  <span>Lapor Cepat</span>
                </Link>
              </div>
            </motion.div>

            {/* STATS COLUMN (Lebar 1/4) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Box Total Laporan */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-[2rem] p-6 sm:p-8 flex items-center gap-5 border border-slate-200 shadow-sm flex-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Laporan</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 leading-none">{reports.length}</p>
                </div>
              </motion.div>

              {/* Box Diproses */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-[2rem] p-6 sm:p-8 flex items-center gap-5 border border-slate-200 shadow-sm flex-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diproses</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 leading-none">{activeReportsCount}</p>
                </div>
              </motion.div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* SECTION 2: RIWAYAT AKTIVITAS (List Memanjang Full Width)   */}
          {/* ========================================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden"
          >
            {/* Header List */}
            <div className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Riwayat Aktivitas</h2>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">
                {reports.length} Catatan
              </div>
            </div>

            {/* Content List */}
            <div className="p-6 sm:p-8 bg-slate-50/30">
              <div className="flex flex-col gap-4">
                {loading ? (
                  // Skeleton
                  [1,2,3].map(i => (
                    <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
                  ))
                ) : reports.length === 0 ? (
                  // Empty State
                  <div className="py-16 flex flex-col items-center justify-center text-center px-4 bg-white rounded-[1.5rem] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold mb-1 text-lg">Belum Ada Riwayat</h3>
                    <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                      Laporan Anda akan tampil di sini. Mari mulai laporkan masalah di sekitar Anda.
                    </p>
                  </div>
                ) : (
                  // The List Rows (Gaya mirip Screenshot)
                  reports.map((report, idx) => {
                    const status = getStatusConfig(report.status);
                    
                    return (
                      <Link href={`/user/chat/${report.id}`} key={report.id} className="block group">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-300 gap-4 relative overflow-hidden"
                        >
                          {/* Indikator Garis Samping Kiri (Hover) */}
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          <div className="flex items-start sm:items-center gap-4 sm:gap-5 pl-2 sm:pl-1">
                            {/* Icon Kotak */}
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                              <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                                {getCategoryIcon(report.category)}
                              </span>
                            </div>
                            
                            {/* Title & Badge */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                <h3 className="font-bold text-slate-900 text-base md:text-lg group-hover:text-blue-600 transition-colors truncate">
                                  {report.category}
                                </h3>
                                {/* Status Badge (Seragam) */}
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                  {status.text}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 truncate max-w-2xl">
                                {report.description}
                              </p>
                            </div>
                          </div>

                          {/* Kanan: Waktu, Lokasi & Arrow */}
                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 gap-6 sm:gap-8 pl-2 sm:pl-0">
                            <div className="flex flex-col sm:items-end gap-2 text-xs text-slate-500 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[150px] md:max-w-[200px]">{report.address}</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                          </div>

                        </motion.div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
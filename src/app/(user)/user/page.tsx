'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { 
  Plus, MapPin, 
  Activity, FileText,
  AlertCircle, Calendar, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

// 1. UPDATE INTERFACE SESUAI BACKEND BARU
interface Report {
  id: string;
  category_name: string | null; // Sesuaikan dengan response backend
  description?: string;
  address?: string;
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

        setReports(reportData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

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
    return { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'Menunggu' };
  };

  const getCategoryAvatar = (categoryName: string | null) => {
    // 2. TANGANI JIKA CATEGORY NAME NULL
    const initial = categoryName ? categoryName.charAt(0).toUpperCase() : 'U'; 
    return (
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors shadow-sm">
        <span className="font-black text-xl text-blue-600 group-hover:text-white transition-colors">
          {initial}
        </span>
      </div>
    );
  };

  const activeReportsCount = reports.filter(r => ['IN_PROGRESS', 'VERIFIED', 'SUBMITTED'].includes(r.status)).length;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-76px)] w-full bg-slate-50 overflow-hidden relative font-sans">
      
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8 lg:px-12 py-6 lg:py-10 pb-32">
        <div className="w-full max-w-[1600px] mx-auto space-y-6 lg:space-y-8">

          {/* === HERO & STATS === */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 bg-slate-900 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl shadow-slate-900/10"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
              
              <div className="relative z-10">
                <p className="text-blue-400 font-black tracking-widest text-xs uppercase mb-2">
                  {greeting},
                </p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {user?.full_name?.split(' ')[0] || 'Memuat...'}
                </h1>
                <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
                  Mari bersama-sama wujudkan lingkungan yang lebih baik. Suara Anda adalah awal dari perubahan.
                </p>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <Link href="/reports/create" className="group flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 active:scale-95 w-full md:w-auto">
                  <Plus className="w-5 h-5" />
                  <span>Lapor Cepat</span>
                </Link>
              </div>
            </motion.div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-[2rem] p-6 sm:p-8 flex items-center gap-5 border border-slate-200 shadow-sm flex-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <FileText className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Laporan</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 leading-none">{reports.length}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-[2rem] p-6 sm:p-8 flex items-center gap-5 border border-slate-200 shadow-sm flex-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Diproses</p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 leading-none">{activeReportsCount}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* === RIWAYAT AKTIVITAS === */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden"
          >
            <div className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Riwayat Aktivitas</h2>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                {reports.length} Catatan
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-slate-50/50">
              <div className="flex flex-col gap-4">
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="h-24 bg-white border border-slate-100 rounded-[24px] animate-pulse"></div>
                  ))
                ) : reports.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center px-4 bg-white rounded-[24px] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center mb-4 border border-slate-100">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-black mb-1 text-lg">Belum Ada Riwayat</h3>
                    <p className="text-slate-500 text-sm max-w-sm font-medium">
                      Laporan Anda akan tampil di sini. Mari mulai laporkan masalah di sekitar Anda.
                    </p>
                  </div>
                ) : (
                  reports.map((report, idx) => {
                    const status = getStatusConfig(report.status);
                    // 3. AMBIL NAMA KATEGORI DARI STRUKTUR BARU
                    const displayCategory = report.category_name || 'Umum';
                    
                    return (
                      <Link href={`/user/chat/${report.id}`} key={report.id} className="block group">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-200 rounded-[24px] hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 gap-4 relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          <div className="flex items-start sm:items-center gap-4 sm:gap-5 pl-2 sm:pl-1">
                            {/* Panggil fungsi avatar dengan nama kategori */}
                            {getCategoryAvatar(displayCategory)}
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                <h3 className="font-black text-slate-900 text-base md:text-lg group-hover:text-blue-600 transition-colors truncate">
                                  {displayCategory}
                                </h3>
                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.bg} ${status.color} border border-transparent`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                  {status.text}
                                </span>
                              </div>
                              {/* 4. PENANGANAN JIKA DESCRIPTION KOSONG DARI API */}
                              <p className="text-sm font-medium text-slate-500 truncate max-w-2xl">
                                {report.description || report.address || "Tidak ada detail"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 gap-6 sm:gap-8 pl-2 sm:pl-0">
                            <div className="flex flex-col sm:items-end gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(report.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              {report.address && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate max-w-[150px] md:max-w-[200px]">{report.address}</span>
                                </div>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                              <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
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
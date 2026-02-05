'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { 
  Plus, Clock, CheckCircle2, MapPin, 
  Activity, FileText, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Interface Data
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

  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Ambil Data User
        const resMe = await api.get('/me');
        const userData = resMe.data.user || resMe.data.data || resMe.data;
        setUser(userData);

        // 2. Ambil Data Laporan
        // Kita ambil semua report dulu (karena endpoint detail per user mungkin belum ready)
        const resReports = await api.get('/reports/me'); 
        
        let reportData: Report[] = [];
        
        // Handle struktur response yang mungkin beda-beda
        if (Array.isArray(resReports.data)) {
          reportData = resReports.data;
        } else if (resReports.data?.data && Array.isArray(resReports.data.data)) {
          reportData = resReports.data.data;
        } else if (resReports.data?.reports && Array.isArray(resReports.data.reports)) {
          reportData = resReports.data.reports;
        }

        // 3. Filter Laporan Milik User Saja
        if (userData && userData.id) {
          const myReports = reportData.filter((r: any) => 
            r.user_id === userData.id || r.userId === userData.id || r.user?.id === userData.id
          );
          
          if (myReports.length > 0) {
            setReports(myReports);
          } else {
            // Fallback: Jika filter kosong, tampilkan semua (asumsi backend sudah filter by token)
            setReports(reportData);
          }
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

  // Helper Warna Status
  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'RESOLVED' || s === 'DONE') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'IN_PROGRESS' || s === 'VERIFIED') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'REJECTED') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-amber-100 text-amber-700 border-amber-200'; // Default: SUBMITTED
  };

  // Statistik Widget
  const stats = [
    { label: 'Total', count: reports.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Proses', count: reports.filter(r => ['IN_PROGRESS', 'VERIFIED'].includes(r.status)).length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Selesai', count: reports.filter(r => ['RESOLVED', 'DONE'].includes(r.status)).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8 mt-2">
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dashboard Warga</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Halo, {user?.full_name?.split(' ')[0] || 'Warga'}! 👋
          </h1>
        </motion.div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center md:items-start text-center md:text-left"
          >
            <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} mb-2 md:mb-4`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
            </div>
            <h3 className="text-xl md:text-4xl font-black text-slate-900 mb-0 md:mb-1">{stat.count}</h3>
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Reports List Section */}
      <div className="bg-white md:bg-transparent rounded-[2rem] md:rounded-none p-5 md:p-0 shadow-sm md:shadow-none border border-slate-100 md:border-none">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Laporan Terkini</h2>
          <Link href="/reports/create" className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            <Plus className="w-4 h-4" /> Buat Laporan
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {loading ? (
             // Skeleton Loading
             [1,2].map(i => (
              <div key={i} className="h-24 md:h-28 bg-slate-100 rounded-2xl md:rounded-3xl animate-pulse" />
            ))
          ) : reports.length === 0 ? (
            // Empty State
            <div className="py-10 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-sm">Belum ada laporan.</p>
              <Link href="/reports/create" className="md:hidden mt-3 text-blue-600 font-bold text-sm">
                + Buat Sekarang
              </Link>
            </div>
          ) : (
            // List Laporan
            reports.map((report, idx) => (
              <Link href={`/user/chat/${report.id}`} key={report.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-50 md:bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 md:shadow-sm hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer mb-3"
                >
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold border ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-base md:text-lg mb-1 line-clamp-1">{report.category}</h3>
                  <p className="text-slate-500 text-xs md:text-sm line-clamp-2 mb-3 leading-relaxed">{report.description}</p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-slate-500">
                    <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" /> 
                    <span className="truncate max-w-[200px]">{report.address}</span>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
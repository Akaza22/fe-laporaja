'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FileText, Users, Tags, BarChart3, 
  Settings, BellRing, UserCheck, ShieldAlert
} from 'lucide-react';
import api from '@/lib/axios';

// Konfigurasi Menu Grid Utama
const MENU_ITEMS = [
  {
    title: 'Kelola Laporan',
    description: 'Tinjau dan balas aduan warga',
    icon: FileText,
    href: '/reports',
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    title: 'Manajemen Warga',
    description: 'Atur akun dan akses pengguna',
    icon: Users,
    href: '/user-manage',
    color: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    title: 'Statistik & Data',
    description: 'Lihat tren dan performa sistem',
    icon: BarChart3,
    href: '/analytics', // <-- Arahkan ke halaman baru
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    title: 'Master Kategori',
    description: 'Atur jenis klasifikasi laporan',
    icon: Tags,
    href: '/categories',
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
];

// Konfigurasi Menu Aksi Cepat (Bawah)
const QUICK_ACTIONS = [
  { label: 'Verifikasi Akun', icon: UserCheck, href: '/users?tab=unverified' },
  { label: 'Laporan Darurat', icon: ShieldAlert, href: '/reports?filter=urgent' },
  { label: 'Notifikasi', icon: BellRing, href: '#' },
  { label: 'Pengaturan', icon: Settings, href: '#' },
];

export default function AdminHomePage() {
  const [adminName, setAdminName] = useState('Admin');
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mengambil nama admin & jumlah laporan masuk (Opsional, untuk pemanis Header)
  useEffect(() => {
    const fetchMinimalData = async () => {
      try {
        const [resMe, resAnalytics] = await Promise.all([
          api.get('/me'),
          api.get('/admin/dashboard/analytics')
        ]);
        
        const name = resMe.data.user?.full_name || resMe.data.data?.full_name;
        if (name) setAdminName(name.split(' ')[0]); // Ambil nama panggilan

        const pending = resAnalytics.data.data?.summary?.pending_reports;
        if (pending) setPendingCount(pending);

      } catch (err) {
        console.error("Gagal load data awal", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMinimalData();
  }, []);

  return (
    <div className="min-h-full font-sans pb-24 md:pb-8 max-w-5xl mx-auto">
      
      {/* 1. WELCOME HEADER (Gaya App) */}
      <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 mb-8 mt-2">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-blue-400 font-black tracking-widest text-xs uppercase mb-2">Selamat Bertugas,</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Halo, {adminName} 👋</h1>
            <p className="text-slate-400 font-medium text-sm max-w-md leading-relaxed">
              Pilih menu di bawah untuk mengelola sistem atau melihat laporan terbaru hari ini.
            </p>
          </div>
          
          {/* Notifikasi Badge di Header */}
          {!loading && pendingCount > 0 && (
            <Link href="/reports">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-4 hover:bg-white/20 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <BellRing className="w-6 h-6 animate-[wiggle_1s_ease-in-out_infinite]" />
                </div>
                <div>
                  <p className="text-3xl font-black leading-none">{pendingCount}</p>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">Laporan Baru</p>
                </div>
              </motion.div>
            </Link>
          )}
        </div>
      </div>

      {/* 2. MENU GRID UTAMA */}
      <div className="mb-4 px-2">
        <h3 className="text-base font-black text-slate-900 tracking-tight">Menu Utama</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10">
        {MENU_ITEMS.map((item, idx) => (
          <Link href={item.href} key={idx}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex items-center gap-5 cursor-pointer h-full"
            >
              {/* Icon Container */}
              <div className={`w-16 h-16 rounded-[20px] ${item.lightBg} flex items-center justify-center shrink-0 border border-white group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                <item.icon className={`w-7 h-7 ${item.textColor}`} />
              </div>
              
              {/* Text Container */}
              <div>
                <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                  {item.title}
                </h4>
                <p className="text-xs font-bold text-slate-500 line-clamp-2 pr-4">
                  {item.description}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* 3. QUICK ACTIONS (Gaya Pill / Tombol Bulat) */}
      <div className="mb-4 px-2">
        <h3 className="text-base font-black text-slate-900 tracking-tight">Aksi Cepat</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {QUICK_ACTIONS.map((action, idx) => (
          <Link href={action.href} key={idx}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (idx * 0.05) }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 hover:border-slate-900 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-colors group cursor-pointer h-full"
            >
              <action.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-[11px] font-black uppercase tracking-widest">{action.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

    </div>
  );
}
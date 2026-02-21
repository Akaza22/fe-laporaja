'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  ShieldCheck,
  Home,
  BarChart3,
  Tags,
  Settings,
  ChevronRight
} from 'lucide-react';
import { deleteCookie } from 'cookies-next';
import api from '@/lib/axios';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Administrator');
  
  // State untuk animasi hover sidebar
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const isChatPage = pathname.startsWith('/chat/');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const resAuth = await api.get('/me');
        const authData = resAuth.data.user || resAuth.data.data; 

        if (authData && (authData.userId || authData.id)) {
           const id = authData.userId || authData.id;
           const resProfile = await api.get(`/users/${id}`);
           const userProfile = resProfile.data.data || resProfile.data; 
           setAdminName(userProfile.full_name || userProfile.name || 'Administrator');
        }
      } catch (err) {
        console.error("Gagal mengambil data admin:", err);
        setAdminName('Admin');
      }
    };
    fetchAdmin();
  }, []);

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

  // --- KOMPONEN MENU ITEM (Biar kodenya rapi) ---
  const SidebarMenuItem = ({ href, icon: Icon, label, isActive, disabled = false }: any) => {
    return (
      <Link href={disabled ? '#' : href} onClick={(e) => disabled && e.preventDefault()}>
        <div 
          onMouseEnter={() => setHoveredMenu(label)}
          onMouseLeave={() => setHoveredMenu(null)}
          className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${
            isActive 
              ? 'text-white' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {/* Animasi Background Aktif / Hover */}
          <AnimatePresence>
            {isActive && (
              <motion.div 
                layoutId="active-menu"
                className="absolute inset-0 bg-blue-600 z-0"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {(!isActive && hoveredMenu === label && !disabled) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/5 z-0"
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
            <span className="font-semibold text-[15px]">{label}</span>
          </div>

          {/* Icon Panah Muncul Saat Hover (Jika tidak aktif) */}
          {!isActive && hoveredMenu === label && !disabled && (
            <motion.div initial={{ x: -5, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative z-10">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </motion.div>
          )}

          {/* Badge "Soon" untuk fitur yang belum ada */}
          {disabled && (
             <span className="relative z-10 text-[9px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10">
               Soon
             </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* ================= SIDEBAR (DESKTOP) ================= */}
      {!isChatPage && (
        <aside className="hidden lg:flex w-[280px] bg-[#0A0F1C] text-slate-300 flex-col border-r border-slate-800/50 shadow-2xl relative z-50">
          
          {/* LOGO HEADER */}
          <div className="h-24 flex items-center px-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                L
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Lapor<span className="text-blue-500">Aja.</span>
              </span>
            </motion.div>
          </div>

          {/* NAVIGASI MENU */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto hide-scrollbar">
            
            <p className="px-4 text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 mt-2">Menu Utama</p>
            <SidebarMenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === '/dashboard'} />
            <SidebarMenuItem href="/reports" icon={FileText} label="Laporan" isActive={pathname.startsWith('/reports')} />
            <SidebarMenuItem href="/user-manage" icon={Users} label="Manajemen Pengguna" isActive={pathname.startsWith('/users')} />

            {/* IDE FITUR POTENSIAL (Saat ini didisable) */}
            <div className="pt-6">
              <p className="px-4 text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Analitik & Sistem</p>
              <SidebarMenuItem href="/analytics" icon={BarChart3} label="Statistik" disabled />
              <SidebarMenuItem href="/categories" icon={Tags} label="Kategori" disabled />
              <SidebarMenuItem href="/settings" icon={Settings} label="Pengaturan" disabled />
            </div>

          </nav>

          {/* PROFILE FOOTER */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-3 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{adminName}</p>
                <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Admin
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sistem
            </button>
          </div>
        </aside>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className={`flex-1 flex flex-col bg-[#F8FAFC] relative z-0 ${
        isChatPage ? 'h-screen overflow-hidden' : 'overflow-hidden'
      }`}>
        <div className={`flex-1 w-full ${
          isChatPage
            ? 'h-full overflow-hidden'
            : 'overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 hide-scrollbar' // Tambahan padding besar untuk desktop
        }`}>
          {children}
        </div>

        {/* ================= BOTTOM NAV (MOBILE ONLY) ================= */}
        {!isChatPage && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between max-w-sm mx-auto">

              <Link href="/dashboard">
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-400 hover:bg-slate-50'
                }`}>
                  <Home className={`w-6 h-6 ${pathname === '/dashboard' ? 'fill-blue-50' : ''}`} />
                  <span className="text-[10px] font-bold">Home</span>
                </div>
              </Link>

              <Link href="/reports">
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  pathname.startsWith('/reports') ? 'text-blue-600' : 'text-slate-400 hover:bg-slate-50'
                }`}>
                  <FileText className={`w-6 h-6 ${pathname.startsWith('/reports') ? 'fill-blue-50' : ''}`} />
                  <span className="text-[10px] font-bold">Laporan</span>
                </div>
              </Link>

              <Link href="/users">
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  pathname.startsWith('/users') ? 'text-blue-600' : 'text-slate-400 hover:bg-slate-50'
                }`}>
                  <Users className={`w-6 h-6 ${pathname.startsWith('/users') ? 'fill-blue-50' : ''}`} />
                  <span className="text-[10px] font-bold">Warga</span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-[10px] font-bold">Keluar</span>
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}
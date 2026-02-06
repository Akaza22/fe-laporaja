'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Menu,
  ShieldCheck,
  Home
} from 'lucide-react';
import { deleteCookie } from 'cookies-next';
import api from '@/lib/axios';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Administrator');

  const isChatPage = pathname.startsWith('/chat/');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get('/me');
        const user = res.data.user || res.data.data;
        if (user) setAdminName(user.full_name || 'Admin');
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdmin();
  }, []);

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* ================= SIDEBAR (DESKTOP ONLY, HILANG SAAT CHAT) ================= */}
      {!isChatPage && (
        <aside className="hidden lg:flex w-72 bg-[#0F172A] text-slate-300 flex-col border-r border-slate-800">
          <div className="h-20 flex items-center px-8 border-b border-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
              A
            </div>
            <span className="text-xl font-bold text-white">
              Admin<span className="text-blue-500">Panel</span>
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link href="/dashboard">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                pathname.startsWith('/dashboard')
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800/50'
              }`}>
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </div>
            </Link>

            <Link href="/reports">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                pathname.startsWith('/reports')
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800/50'
              }`}>
                <FileText className="w-5 h-5" />
                Laporan
              </div>
            </Link>

            <Link href="/users">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                pathname.startsWith('/users')
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800/50'
              }`}>
                <Users className="w-5 h-5" />
                Users
              </div>
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate">{adminName}</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </aside>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className={`flex-1 flex flex-col ${
        isChatPage ? 'h-screen overflow-hidden' : 'overflow-hidden'
      }`}>
        <div className={`flex-1 w-full ${
          isChatPage
            ? 'h-full overflow-hidden'
            : 'overflow-y-auto p-4 md:p-6 pb-24'
        }`}>
          {children}
        </div>

        {/* ================= BOTTOM NAV (MOBILE ONLY, BUKAN CHAT) ================= */}
        {!isChatPage && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
            <div className="flex items-center justify-between max-w-sm mx-auto">

              {/* Dashboard */}
              <Link href="/dashboard">
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
                  pathname.startsWith('/dashboard')
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}>
                  <Home className="w-6 h-6" />
                  <span className="text-[10px] font-bold">Dashboard</span>
                </div>
              </Link>

              {/* Laporan */}
              <Link href="/reports">
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
                  pathname.startsWith('/reports')
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}>
                  <FileText className="w-6 h-6" />
                  <span className="text-[10px] font-bold">Laporan</span>
                </div>
              </Link>

              {/* Users */}
              <Link href="/users">
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
                  pathname.startsWith('/users')
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}>
                  <Users className="w-6 h-6" />
                  <span className="text-[10px] font-bold">Users</span>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-red-500"
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

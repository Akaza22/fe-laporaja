'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { deleteCookie } from 'cookies-next';
import api from '@/lib/axios';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');

  const isChatPage = pathname.startsWith('/admin/chat/');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get('/me');
        const user = res.data.user || res.data.data;
        if(user) setAdminName(user.full_name || 'Admin');
      } catch (err) { console.error(err); }
    };
    fetchAdmin();
  }, []);

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

  const menuItems = [
    { label: 'Overview', href: 'dashboard', icon: LayoutDashboard },
    { label: 'Laporan Masuk', href: 'reports', icon: FileText }, 
    { label: 'Data Pengguna', href: '/admin/users', icon: Users }, 
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans">
      
      {/* 1. SIDEBAR (Hanya tampil jika BUKAN halaman chat) */}
      {!isChatPage && (
        <>
          {/* Mobile Overlay */}
          <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={() => setIsSidebarOpen(false)} 
          />

          <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col border-r border-slate-800 shadow-2xl`}>
            
            {/* Logo Brand */}
            <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-blue-900/50">
                A
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Admin<span className="text-blue-500">Panel</span></h1>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
              <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-medium' 
                        : 'hover:bg-slate-800/50 hover:text-white'
                    }`}>
                      <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                      <span>{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Profile & Logout */}
            <div className="p-4 border-t border-slate-800/50 bg-[#0B1120]">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                   <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{adminName}</p>
                  <p className="text-xs text-slate-500 truncate">Super Admin</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-medium group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Keluar Sesi
              </button>
            </div>
          </aside>
        </>
      )}

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative bg-[#F8FAFC]">
        
        {/* Mobile Header (Transparan Blur) */}
        {!isChatPage && (
          <div className="lg:hidden absolute top-0 left-0 right-0 h-16 px-4 flex items-center justify-between z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-slate-900 text-lg">Admin Panel</span>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className={`flex-1 w-full relative ${
          isChatPage 
            ? 'h-full overflow-hidden p-0' 
            : 'overflow-y-auto overflow-x-hidden pt-20 lg:pt-0 p-6 lg:p-8'
        }`}>
          {/* Background Decoration (Optional) */}
          {!isChatPage && (
             <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent -z-10" />
          )}
          
          <div className={`max-w-7xl mx-auto ${isChatPage ? 'h-full' : ''}`}>
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
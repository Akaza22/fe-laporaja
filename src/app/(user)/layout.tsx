'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/axios';
import { 
  Home, Plus, LogOut, User as UserIcon, 
} from 'lucide-react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ full_name: string } | null>(null);

  // LOGIC DETEKSI HALAMAN CHAT
  // Jika URL dimulai dengan /user/chat/, maka kita anggap ini mode Chat Fullscreen
  const isChatPage = pathname.startsWith('/user/chat/');

  // Fetch User Info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resMe = await api.get('/me');
        const userData = resMe.data.user || resMe.data.data || resMe.data;
        setUser(userData);
      } catch (err) {
        console.error("Gagal load user info", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* ================= HEADER (HANYA TAMPIL JIKA BUKAN CHAT PAGE) ================= */}
      {!isChatPage && (
        <>
          {/* HEADER DESKTOP */}
          <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">L</div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">LaporAja.</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{user?.full_name || 'Warga'}</p>
                  <p className="text-xs text-slate-500">Warga Aktif</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                  <UserIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors" title="Keluar">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* HEADER MOBILE */}
          <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-slate-900/20">L</div>
              <span className="font-bold text-lg text-slate-900">LaporAja.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                 <UserIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </header>
        </>
      )}

      {/* ================= MAIN CONTENT ================= */}
      {/* LOGIC PENTING DI SINI:
          - Jika Chat Page: Tidak ada padding (p-0), Tinggi Full (h-screen).
          - Jika Halaman Biasa: Ada padding atas/bawah agar konten tidak tertutup header/nav.
      */}
      <main className={isChatPage ? 'h-screen w-full overflow-hidden' : 'pb-32 md:pb-12 pt-4 md:pt-10'}>
        {children}
      </main>

      {/* ================= BOTTOM NAV (HANYA TAMPIL JIKA BUKAN CHAT PAGE) ================= */}
      {!isChatPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {/* Home Button */}
            <Link href="/user/dashboard">
              <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname.includes('/dashboard') ? 'text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Home className={`w-6 h-6 ${pathname.includes('/dashboard') ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-bold">Home</span>
              </div>
            </Link>

            {/* Add Report (Floating) */}
            <Link href="/reports/create">
              <div className="relative -top-8">
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/40 border-[4px] border-[#F8FAFC]"
                >
                  <Plus className="w-7 h-7" />
                </motion.div>
              </div>
            </Link>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-[10px] font-bold">Keluar</span>
            </button>
          </div>
        </nav>
      )}

    </div>
  );
}
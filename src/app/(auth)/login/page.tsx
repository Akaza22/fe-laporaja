'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resLogin = await api.post('/auth/login', { email, password });
      const token = resLogin.data.token;
      
      setCookie('token', token);

      const resMe = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userRole = resMe.data.user?.role;

      if (userRole && userRole.toUpperCase() === 'ADMIN') {
        router.replace('/dashboard'); 
      } else {
        router.replace('/user'); 
      }
    } catch (err) {
      console.error(err);
      alert('Login Gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* === HEADER: LOGO LAPORAJA (CENTERED) === */}
      <div className="flex flex-col items-center justify-center mb-10 sm:mb-12">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
          <span className="font-extrabold text-2xl text-white">L</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          LaporAja.
        </h1>
        <p className="text-slate-500 mt-3 text-sm sm:text-base text-center font-medium">
          Masuk untuk mengelola laporan dan aspirasi Anda.
        </p>
      </div>

      {/* FORM LOGIN */}
      <form onSubmit={handleLogin} className="space-y-5">
        
        {/* Input Email */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Email</label>
          <input 
            type="email" 
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
            placeholder="nama@email.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        {/* Input Password */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-700">Kata Sandi</label>
            <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Lupa Kata Sandi?
            </Link>
          </div>
          <input 
            type="password" 
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
            placeholder="••••••••"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        {/* Tombol Login */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Masuk"}
        </button>
      </form>

      {/* FOOTER LINK */}
      <div className="mt-10 text-center text-sm font-medium text-slate-500">
        Belum memiliki akun? {' '}
        <Link href="/register" className="text-blue-600 font-bold hover:underline transition-all">
          Daftar Sekarang
        </Link>
      </div>
    </motion.div>
  );
}
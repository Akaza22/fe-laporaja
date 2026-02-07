'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
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
        router.push('/dashboard'); 
      } else {
        router.push('/user'); 
      }

    } catch (err) {
      console.error(err);
      alert('Login Gagal. Periksa email/password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[420px] mx-auto px-2" // px-2 agar aman di HP kecil
    >
      {/* === LOGO BRAND (Baru Ditambahkan) === */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
          {/* Ikon L atau Shield */}
          <span className="font-bold text-xl">L</span>
        </div>
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          LaporAja.
        </span>
      </div>

      {/* HEADER LOGIN */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Selamat Datang Kembali
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Masuk untuk mengelola laporan Anda.
        </p>
      </div>

      {/* FORM LOGIN */}
      <form onSubmit={handleLogin} className="space-y-5">
        
        {/* Input Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              type="email" 
              placeholder="nama@email.com" 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-bold text-slate-700">Password</label>
            <Link href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Lupa Password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
        </div>

        {/* Tombol Login */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Masuk Sekarang
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>

      {/* FOOTER LINK */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          Belum punya akun? {' '}
          <Link href="/register" className="text-blue-600 font-bold hover:underline transition-colors">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
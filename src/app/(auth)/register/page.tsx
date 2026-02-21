'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      alert('Registrasi berhasil! Silakan login untuk melanjutkan.');
      router.push('/login');
    } catch (err) {
      alert('Gagal registrasi. Pastikan email atau nomor telepon belum terdaftar.');
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
      {/* === HEADER: UKURAN DIPERKECIL & MARGIN DIRAPATKAN === */}
      <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-3">
          <span className="font-extrabold text-xl text-white">L</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          LaporAja.
        </h1>
        <p className="text-slate-500 mt-1.5 text-xs sm:text-sm text-center font-medium px-4">
          Daftarkan diri Anda untuk mulai menyampaikan aspirasi.
        </p>
      </div>

      {/* FORM REGISTER: Jarak antar elemen dikurangi (space-y-3) */}
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Input Nama Lengkap */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 ml-1">Nama Lengkap</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
              <User className="w-4 h-4" />
            </div>
            {/* Padding vertikal dikurangi (py-2.5) */}
            <input 
              type="text" 
              placeholder="Nama Anda" 
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm focus:bg-white"
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Input Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 ml-1">Email</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
              <Mail className="w-4 h-4" />
            </div>
            <input 
              type="email" 
              placeholder="nama@email.com" 
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm focus:bg-white"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Input Nomor Telepon */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 ml-1">Nomor Telepon</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
              <Phone className="w-4 h-4" />
            </div>
            <input 
              type="tel" 
              placeholder="08123456789" 
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm focus:bg-white"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
              <Lock className="w-4 h-4" />
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm focus:bg-white"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Tombol Register: Padding sedikit dikurangi */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-3"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Akun Sekarang"}
        </button>

      </form>

      {/* FOOTER LINK: Margin dirapatkan */}
      <div className="mt-6 mb-4 text-center text-xs sm:text-sm font-medium text-slate-500">
        Sudah memiliki akun? {' '}
        <Link href="/login" className="text-blue-600 font-bold hover:underline transition-all">
          Masuk di sini
        </Link>
      </div>
    </motion.div>
  );
}
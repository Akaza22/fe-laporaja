'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[420px] mx-auto px-2"
    >
      {/* === LOGO BRAND (Mobile Friendly) === */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
          <span className="font-bold text-xl">L</span>
        </div>
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          LaporAja.
        </span>
      </div>

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Buat Akun Baru
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Gabung sekarang untuk mulai melapor.
        </p>
      </div>

      {/* FORM REGISTER */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Input Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Nama Anda" 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required 
            />
          </div>
        </div>

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
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Input Nomor Telepon */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Nomor Telepon</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <input 
              type="tel" 
              placeholder="08123456789" 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
        </div>

        {/* Tombol Register */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Daftar Sekarang
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>

      {/* FOOTER LINK */}
      <div className="mt-8 text-center pb-8">
        <p className="text-sm text-slate-500">
          Sudah punya akun? {' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
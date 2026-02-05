'use client';

import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden">
      {/* Sisi Kiri: Branding (Hanya muncul di desktop) */}
      <div className="hidden lg:flex relative flex-col justify-center items-center bg-slate-900 p-12 text-white overflow-hidden">
        {/* Dekorasi Cahaya di Background */}
        <div className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[70%] h-[70%] bg-indigo-500 rounded-full blur-[150px] opacity-20" />

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tighter mb-6">
              LaporAja<span className="text-blue-500">.</span>
            </h1>
            <div className="h-1.5 w-20 bg-blue-500 rounded-full mb-8" />
            
            <p className="text-slate-300 text-xl leading-relaxed mb-10">
              Platform modern untuk menyampaikan aspirasi dan keluhan publik secara <span className="text-white font-semibold">cepat, transparan, dan terukur.</span>
            </p>
          </motion.div>

          {/* Statistik Kecil atau Badge untuk mempercantik */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-sm text-slate-400">Layanan Siaga</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">Real-time</p>
              <p className="text-sm text-slate-400">Pantau Status</p>
            </div>
          </motion.div>
        </div>

        {/* Footer Kecil di Sisi Kiri */}
        <div className="absolute bottom-8 left-12 text-slate-500 text-sm font-medium">
          © 2026 LaporAja Ecosystem.
        </div>
      </div>

      {/* Sisi Kanan: Form (Login/Register) */}
      <div className="flex items-center justify-center p-6 bg-slate-50/50">
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
}
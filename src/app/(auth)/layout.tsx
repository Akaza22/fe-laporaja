'use client';

import { motion } from 'framer-motion';
import { MessageSquare, MapPin, ShieldCheck, FileText } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Flex-col di mobile (tumpuk), Flex-row di desktop (sebelahan)
    <section className="flex flex-col lg:flex-row min-h-screen bg-white font-sans overflow-hidden">
      
      {/* Style untuk hide scrollbar di desktop agar rapi */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          body { overflow: hidden !important; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        }
      `}</style>

      {/* ========================================= */}
      {/* SISI KIRI: VISUAL ANIMASI PENGALAMAN      */}
      {/* (Hanya muncul di Desktop LG+)             */}
      {/* ========================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        
        {/* Background Gradient & Cahaya */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950" />
        {/* Ornamen cahaya yang lebih besar untuk mengisi ruang */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[180px] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[180px] opacity-20 mix-blend-overlay pointer-events-none" />

        {/* --- KUMPULAN ANIMASI MELAYANG (Diperbesar sedikit agar megah) --- */}
        <div className="relative z-10 w-full max-w-xl aspect-square flex items-center justify-center pointer-events-none scale-110">
          
          {/* Kartu Tengah */}
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-72 h-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-8 flex flex-col gap-5 relative z-20"
          >
            <div className="w-full h-40 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl mb-2 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-30"></div>
                <FileText className="w-16 h-16 text-white/70 relative z-10" />
            </div>
            <div className="w-3/4 h-4 bg-white/20 rounded-full" />
            <div className="w-1/2 h-4 bg-white/10 rounded-full" />
            <div className="mt-auto w-full h-12 bg-blue-600/80 rounded-xl flex items-center justify-center">
              <span className="text-white/80 text-sm font-medium">Status: Terkirim</span>
            </div>
          </motion.div>

          {/* Ikon-ikon Melayang */}
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute top-10 left-8 bg-gradient-to-br from-emerald-400 to-teal-600 p-5 rounded-3xl shadow-lg border border-white/20 z-30"
          >
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-16 right-8 bg-gradient-to-br from-rose-400 to-pink-600 p-5 rounded-3xl shadow-lg border border-white/20 z-30"
          >
            <MapPin className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-32 right-0 bg-gradient-to-br from-amber-400 to-orange-600 p-5 rounded-3xl shadow-lg border border-white/20 z-10"
          >
            <MessageSquare className="w-9 h-9 text-white" />
          </motion.div>

        </div>

        {/* Teks Deskripsi */}
        <div className="absolute bottom-20 left-0 w-full text-center z-20 px-16 pointer-events-none">
          <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Platform Pengaduan Modern.</h3>
          <p className="text-blue-100/70 text-base max-w-md mx-auto leading-relaxed font-medium">
            Transparansi dan kecepatan dalam satu genggaman. Pantau setiap progres laporan Anda secara real-time.
          </p>
        </div>

      </div>

      {/* ========================================= */}
      {/* SISI KANAN: FORM AREA (Putih Bersih)      */}
      {/* ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative bg-white z-10 h-full max-h-screen overflow-y-auto hide-scrollbar">
        {/* Kontainer Form dipusatkan */}
        <div className="w-full max-w-[400px] mx-auto">
          {children}
        </div>
      </div>

    </section>
  );
}
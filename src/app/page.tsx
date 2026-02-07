'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Activity, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* === NAVBAR (Glass Effect) === */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              L
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">LaporAja.</span>
          </div>

          {/* Desktop Menu (Optional) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">Bantuan</a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="hidden md:block px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      <main className="flex-1 pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        {/* Background Gradient Blob */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content (Text) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Platform Pengaduan No. #1
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Suara Anda, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Perubahan Nyata.
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Laporkan masalah infrastruktur, pelayanan publik, hingga keamanan lingkungan hanya dalam genggaman. Pantau progres laporan secara transparan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                Mulai Melapor
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/about" 
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Pelajari Dulu
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p>Dipercaya oleh <span className="text-slate-900 font-bold">2.000+ Warga</span></p>
            </div>
          </motion.div>

          {/* Right Content (Visual/Mockup Dummy) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden lg:block"
          >
             {/* Abstract Phone Mockup */}
             <div className="relative z-10 bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden max-w-[320px] mx-auto rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                <div className="h-[600px] bg-white flex flex-col relative">
                   {/* Mockup Header */}
                   <div className="bg-blue-600 p-6 pt-10 text-white">
                      <div className="w-12 h-12 bg-white/20 rounded-full mb-4"></div>
                      <div className="h-4 w-32 bg-white/30 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-white/20 rounded"></div>
                   </div>
                   {/* Mockup Chat Items */}
                   <div className="p-4 space-y-4 bg-slate-50 flex-1">
                      <div className="flex gap-3">
                         <div className="w-8 h-8 bg-blue-100 rounded-full shrink-0"></div>
                         <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-400 w-full">
                            Laporan jalan rusak di Jl. Mawar...
                         </div>
                      </div>
                      <div className="flex gap-3 flex-row-reverse">
                         <div className="w-8 h-8 bg-slate-800 rounded-full shrink-0"></div>
                         <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none shadow-sm text-xs text-white/80 w-3/4">
                            Laporan diterima, petugas sedang meluncur 🚀
                         </div>
                      </div>
                      {/* Floating Status */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2 animate-bounce">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                         <span className="text-xs font-bold text-slate-800">Status: Selesai</span>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute top-1/2 right-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-pulse delay-75">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
             </div>
             <div className="absolute bottom-20 left-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-pulse delay-150">
                <Zap className="w-6 h-6 text-amber-500" />
             </div>
          </motion.div>

        </div>
      </main>

      {/* === FEATURE CARDS === */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: "Lapor Cepat", desc: "Tak perlu antri, lapor masalah lingkungan cukup lewat HP.", icon: Zap, color: "bg-amber-100 text-amber-600" },
                 { title: "Real-time Update", desc: "Pantau status pengerjaan laporan Anda secara langsung.", icon: Activity, color: "bg-blue-100 text-blue-600" },
                 { title: "Transparan", desc: "Bukti pengerjaan dan data laporan terbuka untuk publik.", icon: ShieldCheck, color: "bg-emerald-100 text-emerald-600" },
               ].map((item, i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                 >
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                       <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed">
                       {item.desc}
                    </p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-bold">L</div>
             <span className="font-bold text-slate-900">LaporAja.</span>
           </div>
           <p className="text-slate-500 text-sm">© 2026 LaporAja Team. Dibangun untuk Warga.</p>
           <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">Terms</a>
           </div>
        </div>
      </footer>

    </div>
  );
}
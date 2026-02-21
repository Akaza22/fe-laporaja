'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Zap, Activity, 
  MapPin, Lock, Smartphone, MessageSquare, 
  CheckCircle2, Clock, ChevronDown, Menu, X 
} from "lucide-react"; // <-- Menambahkan icon Menu dan X

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // STATE BARU: Untuk mengontrol Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // EFEK BARU: Mencegah layar belakang (body) bisa di-scroll saat Mobile Menu terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden scroll-smooth">
      
      {/* === NAVBAR (Glass Effect) === */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 relative z-50">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30">
              L
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">LaporAja.</span>
          </div>

          {/* Desktop Menu (Sembunyi di Mobile) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">Bantuan</a>
          </div>

          {/* Auth Buttons & Hamburger Icon */}
          <div className="flex items-center gap-2 sm:gap-3 relative z-50">
            <Link 
              href="/login" 
              className="hidden md:block px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              Daftar <span className="hidden sm:inline">Sekarang</span>
            </Link>
            
            {/* Tombol Hamburger (Hanya muncul di Mobile) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* === MOBILE MENU OVERLAY === */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-white pt-24 px-6 md:hidden flex flex-col"
          >
            <div className="flex flex-col gap-6 text-xl font-bold text-slate-900">
              {/* Menu dipisah border & saat diklik akan menutup overlay */}
              <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-slate-100 pb-4">Fitur Utama</a>
              <a href="#cara-kerja" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-slate-100 pb-4">Cara Kerja</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-slate-100 pb-4">Bantuan & FAQ</a>
            </div>
            
            <div className="mt-auto pb-10 flex flex-col gap-3">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 text-center rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Masuk Akun
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 text-center rounded-xl font-bold text-white bg-blue-600 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
              >
                Daftar Sekarang
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === HERO SECTION === */}
      <main className="flex-1 pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-32 relative">
        <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-blue-100/50 rounded-full blur-[60px] sm:blur-[100px] translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-indigo-50/50 rounded-full blur-[60px] sm:blur-[100px] -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center lg:text-left pt-8 sm:pt-0"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-5 sm:mb-6">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Platform Pengaduan No. #1
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.15] lg:leading-[1.1] mb-4 sm:mb-6 tracking-tight px-2 sm:px-0">
              Suara Anda, <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Perubahan Nyata.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-8 sm:mb-10 leading-relaxed max-w-sm sm:max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
              Laporkan masalah infrastruktur, pelayanan publik, hingga keamanan lingkungan hanya dalam genggaman. Pantau progres laporan secara transparan.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start w-full px-4 sm:px-0">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                Mulai Melapor
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#cara-kerja" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-base sm:text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Pelajari Dulu
              </a>
            </div>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p>Dipercaya oleh <span className="text-slate-900 font-bold">2.000+ Warga</span></p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mt-12 lg:mt-0 flex justify-center lg:block"
          >
             <div className="relative z-10 bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border-[6px] sm:border-[8px] border-slate-900 shadow-2xl overflow-hidden w-[280px] sm:w-full max-w-[320px] mx-auto lg:rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                <div className="h-[450px] sm:h-[600px] bg-white flex flex-col relative">
                   <div className="bg-blue-600 p-5 sm:p-6 pt-8 sm:pt-10 text-white">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 w-24 sm:w-32 bg-white/30 rounded mb-2"></div>
                      <div className="h-2 sm:h-3 w-16 sm:w-20 bg-white/20 rounded"></div>
                   </div>
                   <div className="p-4 space-y-4 bg-slate-50 flex-1">
                      <div className="flex gap-2 sm:gap-3">
                         <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full shrink-0"></div>
                         <div className="bg-white p-2.5 sm:p-3 rounded-2xl rounded-tl-none shadow-sm text-[10px] sm:text-xs text-slate-400 w-full">
                            Laporan jalan rusak di Jl. Mawar...
                         </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 flex-row-reverse">
                         <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-800 rounded-full shrink-0"></div>
                         <div className="bg-blue-600 p-2.5 sm:p-3 rounded-2xl rounded-tr-none shadow-sm text-[10px] sm:text-xs text-white/80 w-3/4">
                            Laporan diterima, petugas meluncur 🚀
                         </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-1.5 sm:gap-2 animate-bounce">
                         <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full"></div>
                         <span className="text-[10px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">Status: Selesai</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="hidden sm:block absolute top-1/2 right-0 lg:right-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-pulse delay-75">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
             </div>
             <div className="hidden sm:block absolute bottom-20 left-0 lg:left-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-pulse delay-150">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
             </div>
          </motion.div>
        </div>
      </main>

      {/* === 1. FITUR SECTION === */}
      <section id="fitur" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative scroll-mt-16 sm:scroll-mt-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
               <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Kenapa Memilih LaporAja?</h2>
               <p className="text-base sm:text-lg text-slate-500 mt-4 max-w-2xl mx-auto">Dirancang dengan teknologi terkini untuk memastikan pengalaman melapor yang aman, cepat, dan transparan.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
               {[
                 { title: "Lapor Sekejap", desc: "Tak perlu antri atau urus birokrasi, lapor masalah lingkungan cukup lewat HP.", icon: Zap, color: "bg-amber-100 text-amber-600" },
                 { title: "Real-time Update", desc: "Pantau status pengerjaan laporan Anda secara langsung lewat notifikasi chat.", icon: Activity, color: "bg-blue-100 text-blue-600" },
                 { title: "Transparan", desc: "Setiap laporan direkam ke dalam sistem dan ditangani oleh pihak berwenang.", icon: ShieldCheck, color: "bg-emerald-100 text-emerald-600" },
                 { title: "Deteksi GPS Akurat", desc: "Tinggal klik, sistem otomatis mengunci titik koordinat lokasi kejadian Anda.", icon: MapPin, color: "bg-rose-100 text-rose-600" },
                 { title: "Privasi Terjaga", desc: "Data diri dan identitas pelapor dilindungi dengan enkripsi keamanan tinggi.", icon: Lock, color: "bg-indigo-100 text-indigo-600" },
                 { title: "Mendukung PWA", desc: "Instal aplikasi langsung ke layar utama HP Anda tanpa perlu lewat Play Store.", icon: Smartphone, color: "bg-teal-100 text-teal-600" },
               ].map((item, i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all text-center sm:text-left group"
                 >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform`}>
                       <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                       {item.desc}
                    </p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* === 2. CARA KERJA SECTION === */}
      <section id="cara-kerja" className="py-16 sm:py-24 bg-white border-t border-slate-200 scroll-mt-16 sm:scroll-mt-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
               <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">Alur Singkat</span>
               <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Gimana Cara Kerjanya?</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 relative">
               <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-100"></div>
               {[
                 { step: "1", title: "Tulis Aduan", desc: "Deskripsikan masalah, unggah foto bukti, dan kunci titik lokasi GPS Anda.", icon: MessageSquare },
                 { step: "2", title: "Verifikasi Admin", desc: "Laporan masuk ke sistem dan divalidasi oleh petugas piket kami.", icon: CheckCircle2 },
                 { step: "3", title: "Tindak Lanjut", desc: "Status berubah menjadi 'Diproses', tim lapangan dikerahkan ke lokasi.", icon: Clock },
                 { step: "4", title: "Selesai", desc: "Masalah teratasi! Laporan ditutup dan Anda menerima notifikasi penyelesaian.", icon: ShieldCheck },
               ].map((item, i) => (
                 <div key={i} className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white border-8 border-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                       <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-2xl relative">
                         <item.icon className="absolute opacity-10 w-10 h-10" />
                         {item.step}
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed px-4">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* === 3. BANTUAN / FAQ SECTION === */}
      <section id="faq" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 scroll-mt-16 sm:scroll-mt-20">
         <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
               <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Pertanyaan Umum</h2>
               <p className="text-base text-slate-500 mt-4">Temukan jawaban cepat atas pertanyaan yang sering diajukan warga.</p>
            </div>

            <div className="space-y-4">
              {[
                { q: "Apakah laporan saya anonim dan aman?", a: "Tentu. Data diri dan identitas Anda akan dirahasiakan dari publik. Hanya petugas berwenang (Admin) yang dapat melihat data pelapor untuk keperluan validasi." },
                { q: "Berapa lama laporan saya akan diproses?", a: "Laporan yang masuk akan diverifikasi maksimal dalam 1x24 jam kerja. Durasi penyelesaian di lapangan bervariasi tergantung pada tingkat keparahan masalah." },
                { q: "Apakah aplikasi ini berbayar?", a: "LaporAja 100% gratis! Ini adalah fasilitas pelayanan publik untuk memudahkan warga dalam menyampaikan aspirasi dan keluhan." },
                { q: "Apa yang terjadi jika laporan saya ditolak?", a: "Jika laporan dinilai tidak valid (misal: lokasi salah, foto tidak jelas, atau spam), Admin akan memberikan pesan alasan penolakan melalui fitur Chat Laporan." },
                { q: "Bagaimana cara instal aplikasi di HP?", a: "Buka LaporAja di browser Chrome/Safari HP Anda. Biasanya akan muncul notifikasi 'Add to Home Screen' di bawah, atau Anda bisa klik menu browser (titik tiga) lalu pilih 'Instal Aplikasi'." }
              ].map((faq, i) => (
                <div 
                  key={i} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-colors"
                >
                  <button 
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
                  >
                    <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 sm:p-6 pt-0 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-50 mt-2">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* === CTA BOTTOM SECTION === */}
      <section className="py-20 bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 mix-blend-multiply opacity-20"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
           <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Siap Membuat Perubahan?</h2>
           <p className="text-blue-100 mb-8 sm:mb-10 text-lg">Jangan biarkan fasilitas publik yang rusak mengganggu aktivitas Anda. Laporkan sekarang juga.</p>
           <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-2xl"
            >
              Daftar Akun Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-white border-t border-slate-200 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">L</div>
             <span className="font-bold text-slate-900 text-sm sm:text-base">LaporAja.</span>
           </div>
           <p className="text-slate-500 text-xs sm:text-sm">© 2026 LaporAja Team. Dibangun untuk Warga.</p>
           <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-slate-900">Privasi</a>
              <a href="#" className="hover:text-slate-900">Ketentuan</a>
           </div>
        </div>
      </footer>

    </div>
  );
}
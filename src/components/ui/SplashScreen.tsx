'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Splash screen akan tampil selama 2 detik (2000 ms)
    // Sesuaikan waktunya jika ingin lebih cepat/lama
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8FAFC]"
        >
          {/* Container Animasi Logo */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              type: "spring",
              bounce: 0.5
            }}
            className="flex flex-col items-center"
          >
            {/* Logo Kotak 'L' */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-blue-500/30 relative overflow-hidden">
              {/* Efek kilauan cahaya di logo */}
              <motion.div 
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: 0.5 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-full h-full skew-x-12"
              />
              <span className="relative z-10">L</span>
            </div>

            {/* Teks Nama Aplikasi */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Lapor<span className="text-blue-600">Aja.</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-2">
                Suara Warga
              </p>
            </motion.div>
          </motion.div>

          {/* Loading Indicator (Titik berkedip di bawah) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-16 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
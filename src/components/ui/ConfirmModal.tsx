'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info'; // Menentukan warna tombol
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isLoading = false,
  type = 'warning'
}: ConfirmModalProps) {
  
  // Menentukan gaya tombol berdasarkan tipe peringatan
  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      case 'info': return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20';
      case 'warning':
      default: return 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20';
    }
  };

  const getIconStyle = () => {
    switch (type) {
      case 'danger': return 'bg-rose-100 text-rose-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      case 'warning':
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={!isLoading ? onClose : undefined} // Jangan tutup kalau lagi loading
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 relative">
              {/* Tombol Silang (Atas Kanan) */}
              <button 
                onClick={onClose} 
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${getIconStyle()}`}>
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="p-4 sm:px-6 sm:pb-6 flex items-center gap-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 ${getConfirmButtonStyle()}`}
              >
                {isLoading && <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
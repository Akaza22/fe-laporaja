'use client';

import { Toaster } from 'sonner';

export default function CustomToaster() {
  return (
    <Toaster
      position="top-center" // Posisi notifikasi di atas tengah
      expand={true}
      richColors={false} // Kita matikan warna bawaan agar bisa dikustomisasi dengan Tailwind
      toastOptions={{
        classNames: {
          // Base style untuk semua toast
          toast: 'group flex items-start gap-3 w-full p-4 rounded-2xl border shadow-xl shadow-slate-200/50 backdrop-blur-md font-sans',
          
          // Style text
          title: 'text-sm font-bold',
          description: 'text-xs font-medium opacity-80 mt-0.5',
          
          // Style Icon
          icon: 'mt-0.5 w-5 h-5',

          // Variant Styles
          success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          error: 'bg-rose-50 border-rose-200 text-rose-800',
          warning: 'bg-amber-50 border-amber-200 text-amber-800',
          info: 'bg-blue-50 border-blue-200 text-blue-800',
          
          // Style Loading
          loading: 'bg-white border-slate-200 text-slate-800',
        },
      }}
    />
  );
}
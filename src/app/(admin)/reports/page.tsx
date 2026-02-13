'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/axios';
import { Report } from '@/types/report';
import { motion } from 'framer-motion';
import { Loader2, FileText, Send, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States untuk Filter & Pagination
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Tetapkan statis 5 data per halaman
  const [totalData, setTotalData] = useState(0);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 1. Debounce untuk Search (Menunggu user selesai mengetik)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset ke halaman 1 tiap kali search berubah
    }, 500); // Jeda 500ms
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. Fetch Data API
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: limit,
        status: filterStatus || undefined,
        search: debouncedSearch || undefined,
      };
      
      const res = await api.get('/reports/reports', { params });
      
      const data = res.data.data || res.data || [];
      setReports(Array.isArray(data) ? data : []);
      
      // Jika Backend mengembalikan meta pagination, set total datanya:
      if (res.data.meta?.total) {
         setTotalData(res.data.meta.total);
      } else if (res.data.total) {
         setTotalData(res.data.total);
      }
      
    } catch (err) {
      console.error("Gagal ambil data laporan", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, debouncedSearch]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Total Halaman
  const totalPages = Math.ceil(totalData / limit) || 1;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] space-y-4 relative">
      
      {/* CSS GLOBAL UNTUK HIDE SCROLLBAR DI SELURUH KOMPONEN INI */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HEADER --- */}
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-slate-900">Semua Laporan</h1>
        <p className="text-slate-500">Kelola daftar aduan masyarakat yang masuk.</p>
      </div>

      {/* --- TOOLBAR FILTER & SEARCH --- */}
      <div className="flex-none bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori, alamat, atau deskripsi..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900"
          />
        </div>

        {/* Status Filter Container (Hanya 3 status utama) */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          {['', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === status 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === '' ? 'Semua' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* --- TABEL CONTAINER --- */}
      <div 
        ref={tableContainerRef} 
        className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative"
      >
        {/* Wrapper Tabel (Scroll HANYA muncul di dalam sini, scrollbar disembunyikan) */}
        <div className="flex-1 overflow-auto hide-scrollbar">
          <table className="w-full text-left text-sm text-slate-600 border-collapse relative">
            
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase tracking-wider text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 whitespace-nowrap">Kategori</th>
                <th className="p-4 hidden md:table-cell">Deskripsi</th>
                <th className="p-4 hidden sm:table-cell">Lokasi</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 hidden lg:table-cell whitespace-nowrap">Tanggal</th>
                <th className="p-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-slate-400 text-sm">Mengambil data...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm font-medium">Laporan tidak ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((item, idx) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-4 font-bold text-slate-900 max-w-[120px] truncate" title={item.category}>
                      {item.category}
                    </td>
                    
                    <td className="p-4 max-w-[200px] truncate hidden md:table-cell" title={item.description}>
                      {item.description}
                    </td>
                    
                    <td className="p-4 max-w-[150px] truncate hidden sm:table-cell text-xs" title={item.address}>
                      {item.address}
                    </td>
                    
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide whitespace-nowrap ${
                        ['RESOLVED', 'DONE'].includes(item.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        ['IN_PROGRESS', 'VERIFIED'].includes(item.status) ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="p-4 text-slate-500 font-medium text-xs hidden lg:table-cell whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    
                    <td className="p-4 text-right">
                      <Link href={`/chat/${item.id}`}>
                        <button className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white px-3 py-2 rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-1.5 ml-auto shadow-sm">
                            <Send className="w-3.5 h-3.5" /> 
                            <span className="hidden sm:inline">Balas</span>
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER PAGINATION --- */}
        <div className="flex-none p-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <button 
            disabled={page === 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-xs font-bold text-slate-900">
               Halaman {page} <span className="text-slate-400 font-medium">dari {totalPages}</span>
             </span>
             {totalData > 0 && (
                <span className="text-[10px] text-slate-400">Total {totalData} Data</span>
             )}
          </div>

          <button 
            disabled={page >= totalPages || loading} 
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
      </div>
    </div>
  );
}
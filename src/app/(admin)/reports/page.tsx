'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/axios';
import { Report } from '@/types/report';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, FileText, Send, ChevronLeft, ChevronRight, 
  Search, Hand, Lock, CheckCircle, MessageSquare 
} from 'lucide-react';
import Link from 'next/link';
import { notify } from '@/lib/notify';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  
  // State User yang sedang login (bisa berupa UUID string atau number)
  const [currentAdminId, setCurrentAdminId] = useState<string | number | null>(null);

  // States untuk Filter & Pagination
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalData, setTotalData] = useState(0);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 1. Ambil Profil Admin yang sedang login
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/me');
        // Handle berbagai kemungkinan nama field ID dari backend
        const id = res.data.user?.id || res.data.data?.id || res.data.user?.userId;
        setCurrentAdminId(id);
      } catch (err) {
        console.error("Gagal memuat profil admin:", err);
      }
    };
    fetchProfile();
  }, []);

  // 2. Debounce untuk Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 3. Fetch Data API
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

  // 4. Handle Claim Laporan
  const handleClaim = async (id: number) => {
    setClaimingId(id);
    try {
      await api.patch(`/reports/${id}/claim`);
      notify.success("Berhasil mengklaim laporan.");
      fetchReports(); 
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Gagal mengklaim laporan.");
    } finally {
      setClaimingId(null);
    }
  };

  // Helper untuk mengecek apakah laporan dimiliki admin yang sedang login (Aman dari Case Sensitive / Tipe Data)
  const isOwnedByCurrentAdmin = (assignedId: any) => {
    if (!assignedId || !currentAdminId) return false;
    return String(assignedId).toLowerCase() === String(currentAdminId).toLowerCase();
  };

  const totalPages = Math.ceil(totalData / limit) || 1;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] space-y-4 relative font-sans">
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HEADER --- */}
      <div className="flex-none">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Semua Laporan</h1>
        <p className="text-sm font-bold text-slate-500">Kelola dan ambil alih penanganan aduan masyarakat.</p>
      </div>

      {/* --- TOOLBAR FILTER & SEARCH --- */}
      <div className="flex-none bg-white p-3 md:p-4 rounded-[24px] border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
        
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori, alamat, atau deskripsi..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          {['', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(1); }}
              className={`px-5 py-2.5 rounded-[16px] text-[11px] uppercase tracking-widest font-black whitespace-nowrap transition-all active:scale-95 ${
                filterStatus === status 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status === '' ? 'Semua Status' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* --- TABEL CONTAINER --- */}
      <div 
        ref={tableContainerRef} 
        className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative"
      >
        <div className="flex-1 overflow-auto hide-scrollbar">
          <table className="w-full text-left text-sm text-slate-600 border-collapse relative">
            
            <thead className="bg-slate-50/50 border-b border-slate-100 font-black text-slate-400 uppercase tracking-[0.2em] text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="min-w-[150px] px-8 py-6 whitespace-nowrap">Kategori</th>
                <th className="min-w-[250px] px-8 py-6 hidden md:table-cell">Lokasi</th>
                <th className="min-w-[180px] px-8 py-6 hidden lg:table-cell">Status & Admin</th>
                <th className="min-w-[120px] px-8 py-6 hidden xl:table-cell whitespace-nowrap">Tanggal</th>
                <th className="sticky right-0 bg-slate-50/50 min-w-[220px] px-8 py-6 text-center whitespace-nowrap shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)]">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4 opacity-20" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Mengambil data...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-400">
                    <Search className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest">Laporan tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {reports.map((item: any, idx) => {
                    const isOwnedByMe = isOwnedByCurrentAdmin(item.assigned_admin_id);

                    return (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50/40 transition-colors group"
                      >
                        <td className="px-8 py-5 font-black text-[14px] text-slate-900 truncate" title={item.category}>
                          {item.category || 'UMUM'}
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block md:hidden truncate">{item.address}</p>
                        </td>
                        
                        <td className="px-8 py-5 hidden md:table-cell">
                          <p className="text-[13px] font-bold text-slate-600 line-clamp-2 max-w-[300px]" title={item.description}>
                            {item.description}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{item.address}</p>
                        </td>
                        
                        <td className="px-8 py-5 hidden lg:table-cell">
                          <div className="flex flex-col gap-2 items-start">
                            <span className={`inline-flex px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest whitespace-nowrap ${
                              ['RESOLVED', 'DONE'].includes(item.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              ['IN_PROGRESS', 'VERIFIED'].includes(item.status) ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            
                            {/* Indikator Klaim yang Dinamis */}
                            {item.assigned_admin_id ? (
                              <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                                isOwnedByMe
                                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                  {isOwnedByMe ? (
                                    <><CheckCircle className="w-3.5 h-3.5" /> Diklaim: Anda</>
                                  ) : (
                                    <><Lock className="w-3.5 h-3.5" /> Diklaim: Admin #{String(item.assigned_admin_id).substring(0, 8).toUpperCase()}</>
                                  )}
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 animate-pulse">
                                  <Hand className="w-3.5 h-3.5" /> Menunggu Klaim
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-8 py-5 text-slate-500 font-black text-[11px] hidden xl:table-cell whitespace-nowrap uppercase tracking-widest">
                          {new Date(item.created_at || item.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        
                        {/* KOLOM AKSI (STICKY) */}
                        <td className="sticky right-0 bg-white shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)] px-8 py-5">
                          <div className="flex justify-center items-center gap-2">
                            
                            {!item.assigned_admin_id ? (
                              // 1. Belum ada yang klaim -> Tombol Klaim Hitam
                              <button 
                                onClick={() => handleClaim(item.id)}
                                disabled={claimingId === item.id}
                                className="bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 px-4 py-2.5 rounded-[14px] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md active:scale-95 w-full max-w-[140px]"
                              >
                                {claimingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Hand className="w-3.5 h-3.5" /> Ambil Klaim</>}
                              </button>
                            ) : isOwnedByMe ? (
                              // 2. Sudah diklaim oleh admin ini -> 2 Tombol Sejajar (Diklaim & Chat)
                              <div className="flex items-center justify-center gap-2 w-full max-w-[180px]">
                                <button 
                                  disabled 
                                  className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-2.5 rounded-[14px] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-not-allowed flex-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Diklaim
                                </button>
                                <Link href={`/chat/${item.id}`} className="flex-1">
                                  <button className="w-full bg-blue-600 text-white hover:bg-blue-700 px-3 py-2.5 rounded-[14px] transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95">
                                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                                  </button>
                                </Link>
                              </div>
                            ) : (
                              // 3. Diklaim admin lain -> Tombol abu-abu, BISA DIKLIK untuk memunculkan notif error
                              <button 
                                onClick={() => notify.error(`Akses Ditolak! Laporan ini sudah ditangani oleh Admin lain.`)}
                                className="bg-slate-50 text-slate-400 border border-slate-200 px-4 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all w-full max-w-[140px] active:scale-95"
                              >
                                <Lock className="w-3.5 h-3.5" /> Terkunci
                              </button>
                            )}

                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER PAGINATION --- */}
        <div className="flex-none px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             Database: <span className="text-slate-900">{totalData} Laporan</span>
          </p>

          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="bg-white border border-slate-200 px-5 py-2 rounded-[14px] shadow-sm">
              <span className="text-xs font-black text-slate-800">
                {page} <span className="text-slate-300 mx-1.5">/</span> {totalPages}
              </span>
            </div>

            <button 
              disabled={page >= totalPages || loading} 
              onClick={() => setPage(p => p + 1)}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
            >
               <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
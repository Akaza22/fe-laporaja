'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/axios';
import { Report } from '@/types/report';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, FileText, Send, ChevronLeft, ChevronRight, 
  Search, Hand, Lock, CheckCircle, MessageSquare, Folders, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { notify } from '@/lib/notify';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  
  const [currentAdminId, setCurrentAdminId] = useState<string | number | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Naikkan limit agar view mobile lebih berisi
  const [totalData, setTotalData] = useState(0);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/me');
        const id = res.data.user?.id || res.data.data?.id || res.data.user?.userId;
        setCurrentAdminId(id);
      } catch (err) {
        console.error("Gagal memuat profil admin:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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

  const isOwnedByCurrentAdmin = (assignedId: any) => {
    if (!assignedId || !currentAdminId) return false;
    return String(assignedId).toLowerCase() === String(currentAdminId).toLowerCase();
  };

  const totalPages = Math.ceil(totalData / limit) || 1;

  // Helper untuk rendering status badge
  const renderStatusBadge = (status: string) => {
    const isDone = ['RESOLVED', 'DONE'].includes(status);
    const isProgress = ['IN_PROGRESS', 'VERIFIED'].includes(status);
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-widest whitespace-nowrap ${
        isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        isProgress ? 'bg-blue-50 text-blue-700 border-blue-200' :
        'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] space-y-4 md:space-y-6 relative font-sans max-w-[1600px] mx-auto w-full pb-20 lg:pb-0">
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HEADER DENGAN IKON --- */}
      <div className="flex-none flex items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center shrink-0 border border-blue-100">
          <Folders className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Semua Laporan</h1>
          <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">Kelola dan ambil alih penanganan aduan masyarakat.</p>
        </div>
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
            className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Scrollable filter buttons di mobile */}
        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          {['', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(1); }}
              className={`px-5 py-2.5 md:py-3 rounded-[16px] text-[11px] uppercase tracking-widest font-black whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                filterStatus === status 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status === '' ? 'Semua Status' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="flex-1 flex flex-col relative w-full">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-200 min-h-[300px]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4 opacity-20" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Mengambil data...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-200 min-h-[300px]">
            <Search className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Laporan tidak ditemukan.</p>
          </div>
        ) : (
          <>
            {/* VIEW MOBILE (Tampil Card, disembunyikan di layar md ke atas) */}
            <div className="md:hidden flex flex-col gap-4 w-full">
              <AnimatePresence mode="popLayout">
                {reports.map((item: any, idx) => {
                  const isOwnedByMe = isOwnedByCurrentAdmin(item.assigned_admin_id);
                  const displayCategory = item.category_name || 'Tanpa Kategori';

                  return (
                    <motion.div 
                      key={`mob-${item.id}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-black text-slate-900 text-sm mb-1">{displayCategory}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at || item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                        {renderStatusBadge(item.status)}
                      </div>

                      <div>
                        {/* <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
                          {item.description || <span className="italic opacity-50">Tidak ada deskripsi</span>}
                        </p> */}
                        <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">{item.address || '-'}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        {/* Indikator Klaim Mobile */}
                        <div className="flex-1">
                          {item.assigned_admin_id ? (
                            isOwnedByMe ? (
                              <span className="text-[10px] font-black text-blue-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Milik Anda</span>
                            ) : (
                              <span className="text-[10px] font-black text-slate-400 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Admin #{String(item.assigned_admin_id).substring(0, 4)}</span>
                            )
                          ) : (
                            <span className="text-[10px] font-black text-amber-500 flex items-center gap-1"><Hand className="w-3.5 h-3.5" /> Menunggu Klaim</span>
                          )}
                        </div>

                        {/* Tombol Aksi Mobile */}
                        <div className="shrink-0">
                          {!item.assigned_admin_id ? (
                            <button onClick={() => handleClaim(item.id)} disabled={claimingId === item.id} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                              {claimingId === item.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Klaim'}
                            </button>
                          ) : isOwnedByMe ? (
                            <Link href={`/chat/${item.id}`}>
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-blue-600/20 flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" /> Chat
                              </button>
                            </Link>
                          ) : (
                            <button onClick={() => notify.error(`Akses Ditolak!`)} className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                              Terkunci
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* VIEW DESKTOP (Tampil Tabel, disembunyikan di layar kecil) */}
            <div ref={tableContainerRef} className="hidden md:flex flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex-col relative w-full mb-4">
              <div className="flex-1 overflow-auto hide-scrollbar">
                <table className="w-full text-left text-sm text-slate-600 border-collapse relative">
                  <thead className="bg-slate-50/50 border-b border-slate-100 font-black text-slate-400 uppercase tracking-[0.2em] text-[11px] sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="min-w-[200px] px-6 py-5 whitespace-nowrap">Kategori & Tgl</th>
                      <th className="min-w-[250px] px-6 py-5">Detail Laporan</th>
                      <th className="min-w-[180px] px-6 py-5">Status & Penanganan</th>
                      <th className="sticky right-0 bg-slate-50/50 min-w-[200px] px-6 py-5 text-center whitespace-nowrap shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                      {reports.map((item: any, idx) => {
                        const isOwnedByMe = isOwnedByCurrentAdmin(item.assigned_admin_id);
                        const displayCategory = item.category_name || 'Tanpa Kategori';

                        return (
                          <motion.tr 
                            key={`desk-${item.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                            className="hover:bg-slate-50/40 transition-colors group"
                          >
                            <td className="px-6 py-5">
                              <p className="font-black text-[14px] text-slate-900 truncate mb-1" title={displayCategory}>{displayCategory}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at || item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </td>
                            
                            <td className="px-6 py-5">
                              {/* <p className="text-[13px] font-bold text-slate-600 line-clamp-2 max-w-[300px] mb-1" title={item.description}>
                                {item.description || <span className="italic font-medium opacity-50">Tidak ada deskripsi</span>}
                              </p> */}
                              <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate max-w-[300px]">
                                <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {item.address || '-'}
                              </p>
                            </td>
                            
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2 items-start">
                                {renderStatusBadge(item.status)}
                                
                                {item.assigned_admin_id ? (
                                  <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                                    isOwnedByMe ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                  }`}>
                                      {isOwnedByMe ? <><CheckCircle className="w-3 h-3" /> Anda</> : <><Lock className="w-3 h-3" /> Admin #{String(item.assigned_admin_id).substring(0, 6)}</>}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 animate-pulse">
                                      <Hand className="w-3 h-3" /> Menunggu
                                  </span>
                                )}
                              </div>
                            </td>
                            
                            <td className="sticky right-0 bg-white shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)] px-6 py-5">
                              <div className="flex justify-center items-center gap-2">
                                {!item.assigned_admin_id ? (
                                  <button onClick={() => handleClaim(item.id)} disabled={claimingId === item.id} className="bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 px-4 py-2.5 rounded-[12px] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md active:scale-95 w-full max-w-[130px]">
                                    {claimingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Hand className="w-3.5 h-3.5" /> Ambil Klaim</>}
                                  </button>
                                ) : isOwnedByMe ? (
                                  <div className="flex items-center justify-center gap-2 w-full max-w-[160px]">
                                    <Link href={`/chat/${item.id}`} className="w-full">
                                      <button className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-[12px] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95">
                                          <MessageSquare className="w-3.5 h-3.5" /> Buka Chat
                                      </button>
                                    </Link>
                                  </div>
                                ) : (
                                  <button onClick={() => notify.error(`Akses Ditolak! Laporan ini ditangani Admin lain.`)} className="bg-slate-50 text-slate-400 border border-slate-200 px-4 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all w-full max-w-[130px] active:scale-95">
                                    <Lock className="w-3.5 h-3.5" /> Terkunci
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- FOOTER PAGINATION --- */}
      <div className="flex-none bg-white md:bg-transparent rounded-[24px] md:rounded-none p-4 md:p-0 md:px-4 border border-slate-200 md:border-none shadow-sm md:shadow-none flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
           Database: <span className="text-slate-900">{totalData} Laporan</span>
        </p>

        <div className="flex items-center gap-3">
          <button 
            disabled={page === 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2.5 md:p-3 rounded-[14px] bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <div className="bg-white border border-slate-200 px-4 md:px-5 py-2 md:py-2.5 rounded-[12px] shadow-sm">
            <span className="text-xs font-black text-slate-800">
              {page} <span className="text-slate-300 mx-1">/</span> {totalPages}
            </span>
          </div>

          <button 
            disabled={page >= totalPages || loading} 
            onClick={() => setPage(p => p + 1)}
            className="p-2.5 md:p-3 rounded-[14px] bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
          >
             <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Report } from '@/types/report';
import { motion } from 'framer-motion';
import { Loader2, Filter, Eye, ChevronLeft, ChevronRight, Search, FileText, Send } from 'lucide-react';
import Link from 'next/link';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(''); // '' = Semua, PENDING, IN_PROGRESS, DONE
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Nanti disesuaikan jika API balikin meta total page

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Menggunakan endpoint admin dengan parameter query
      const params = {
        page: page,
        limit: 10,
        status: filterStatus || undefined // Kirim status hanya jika ada filter
      };
      
      const res = await api.get('/reports/reports', { params });
      
      // Sesuaikan dengan struktur response backend Anda (biasanya ada data & meta)
      // Jika backend langsung array: res.data
      // Jika backend ada pagination: res.data.data
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setReports(data);
      
      // Jika backend mengirim info total page, set disini. Contoh:
      // setTotalPages(res.data.meta.lastPage);
      
    } catch (err) {
      console.error("Gagal ambil data laporan", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ulang saat filter atau halaman berubah
  useEffect(() => {
    fetchReports();
  }, [page, filterStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Semua Laporan</h1>
          <p className="text-slate-500">Kelola daftar aduan masyarakat yang masuk.</p>
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari laporan..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filterStatus === status 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === '' ? 'Semua Status' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Laporan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-5">Kategori</th>
                <th className="p-5">Deskripsi</th>
                <th className="p-5">Lokasi</th>
                <th className="p-5">Status</th>
                <th className="p-5">Tanggal</th>
                <th className="p-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-slate-400">Sedang memuat data...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-10 h-10 mb-2 opacity-50" />
                      <p>Belum ada laporan yang sesuai filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((item, idx) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-5 font-semibold text-slate-900">{item.category}</td>
                    <td className="p-5 max-w-[200px] truncate" title={item.description}>
                      {item.description}
                    </td>
                    <td className="p-5 max-w-[150px] truncate">{item.address}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        item.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5 text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-5 text-right">
                      <Link href={`/chat/${item.id}`}>
                        <button className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1 ml-auto">
                            {/* Ganti ikon mata jadi ikon pesan biar lebih relevan */}
                            <Send className="w-4 h-4" /> Chat
                        </button>
                    </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <button 
            disabled={page === 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </button>
          
          <span className="text-sm font-medium text-slate-600">
            Halaman <span className="text-slate-900 font-bold">{page}</span>
          </span>

          <button 
            disabled={reports.length < 10 || loading} // Logic sederhana jika belum ada total page dari BE
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
          >
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
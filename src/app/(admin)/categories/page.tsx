'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2,
  Tags,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { notify } from '@/lib/notify'; 
import ConfirmModal from '../../../components/ui/ConfirmModal'; 
import CustomDropdown from '@/components/CustomDropdown'; // Pastikan path ini benar

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Parameter API
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'true' | 'false'
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Menampilkan 10 data per halaman
  const [metadata, setMetadata] = useState({ totalData: 0, totalPage: 1, currentPage: 1 });

  // Modal States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; type: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'info' });

  const [formModal, setFormModal] = useState({
    isOpen: false, mode: 'add', id: null as number | null, name: '', description: '', isSubmitting: false
  });

  // 1. Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page ke 1 setiap kali search berubah
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 2. Fetch Data (GET /categories dengan Params)
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories', {
        params: { 
          page,
          limit,
          search: debouncedSearch || undefined,
          is_active: statusFilter === '' ? undefined : statusFilter
        }
      });
      
      setCategories(res.data.data || res.data || []);
      
      // Sesuaikan pembacaan metadata dengan struktur response backend Express kamu
      setMetadata({
        totalData: res.data.total || res.data.meta?.total || 0,
        totalPage: res.data.totalPages || res.data.meta?.totalPages || 1,
        currentPage: res.data.page || res.data.meta?.page || 1
      });

    } catch (err) {
      notify.error("Gagal memuat daftar kategori.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 3. Handle Submit Form (POST & PATCH)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const payload = {
        name: formModal.name,
        description: formModal.description
      };

      if (formModal.mode === 'add') {
        await api.post('/categories', payload);
        notify.success("Kategori baru berhasil ditambahkan.");
      } else {
        await api.patch(`/categories/${formModal.id}`, payload);
        notify.success("Kategori berhasil diperbarui.");
      }
      
      setFormModal(prev => ({ ...prev, isOpen: false }));
      fetchCategories();
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Gagal menyimpan kategori.");
    } finally {
      setFormModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // 4. Handle Status Toggle
  const handleToggleStatus = (id: number, currentStatus: boolean, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Nonaktifkan Kategori?' : 'Aktifkan Kategori?',
      message: `Jika dinonaktifkan, warga tidak bisa lagi memilih kategori "${name}" saat membuat laporan baru.`,
      type: currentStatus ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          await api.patch(`/categories/${id}/status`, { is_active: !currentStatus });
          notify.success(`Kategori ${name} berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
          fetchCategories();
        } catch (err) {
          notify.error("Gagal mengubah status kategori.");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 5. Handle Delete
  const handleDelete = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Kategori Permanen?',
      message: `Data kategori "${name}" akan dihapus. Pastikan kategori ini belum pernah digunakan.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/categories/${id}`);
          notify.success(`Kategori ${name} berhasil dihapus.`);
          fetchCategories();
        } catch (err: any) {
          notify.error(err.response?.data?.message || "Gagal menghapus kategori.");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openAddModal = () => {
    setFormModal({ isOpen: true, mode: 'add', id: null, name: '', description: '', isSubmitting: false });
  };

  const openEditModal = (cat: any) => {
    setFormModal({ isOpen: true, mode: 'edit', id: cat.id, name: cat.name, description: cat.description || '', isSubmitting: false });
  };

  return (
    <div className="space-y-6 font-sans relative">
      
      {/* GLOBAL MODALS */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
      />

      <AnimatePresence>
        {formModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">
                  {formModal.mode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
                </h3>
                <button onClick={() => setFormModal(prev => ({ ...prev, isOpen: false }))} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveCategory} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Nama Kategori <span className="text-rose-500">*</span></label>
                  <input type="text" required value={formModal.name} onChange={(e) => setFormModal(prev => ({ ...prev, name: e.target.value }))} placeholder="Misal: Jalan Rusak" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Deskripsi</label>
                  <textarea rows={3} value={formModal.description} onChange={(e) => setFormModal(prev => ({ ...prev, description: e.target.value }))} placeholder="Jelaskan detail kategori ini..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={formModal.isSubmitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed">
                    {formModal.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (formModal.mode === 'add' ? 'Simpan Data' : 'Perbarui Data')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kategori Laporan</h1>
          <p className="text-sm font-bold text-slate-500">Kelola master data klasifikasi untuk pengaduan warga.</p>
        </div>
      </div>

      {/* --- TOOLBAR (Search, Filter, & Add Button) --- */}
      <div className="bg-white p-3 md:p-4 rounded-[24px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Kontainer Kiri: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 relative z-50">
            <div className="flex items-center gap-2 px-4 border-r border-slate-100 hidden sm:flex">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            {/* Tambahkan w-full di mobile, w-fit di desktop agar rapi */}
            <div className="w-full sm:w-fit">
              <CustomDropdown
                value={statusFilter}
                placeholder="Semua Status"
                onChange={(val) => { setStatusFilter(val); setPage(1); }}
                options={[
                  { label: 'Semua Status', value: '' },
                  { label: 'Aktif', value: 'true' },
                  { label: 'Nonaktif', value: 'false' },
                ]}
              />
            </div>
          </div>
        </div>
        
        {/* Tombol Add Kanan */}
        <button 
          onClick={openAddModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> Kategori Baru
        </button>
      </div>

      {/* --- TABEL CONTAINER --- */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 font-black text-slate-400 uppercase tracking-[0.2em] text-[11px] shadow-sm">
              <tr>
                <th className="min-w-[200px] px-8 py-6 whitespace-nowrap">Informasi Kategori</th>
                <th className="min-w-[250px] px-8 py-6 hidden md:table-cell">Deskripsi</th>
                <th className="min-w-[150px] px-8 py-6">Status</th>
                <th className="sticky right-0 bg-slate-50/50 min-w-[180px] px-8 py-6 text-center shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)]">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4 opacity-20" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Sinkronisasi Data...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-slate-400">
                    <Tags className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest">Kategori tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {categories.map((item: any, idx) => (
                    <motion.tr 
                      key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center font-black text-lg shrink-0 shadow-sm ${item.is_active ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-[14px] font-black leading-tight ${item.is_active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{item.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{item.id}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-5 hidden md:table-cell">
                        <p className={`text-[12px] font-bold line-clamp-2 max-w-[350px] ${item.is_active ? 'text-slate-600' : 'text-slate-400'}`}>
                          {item.description || <span className="italic opacity-50">Tidak ada deskripsi</span>}
                        </p>
                      </td>
                      
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest whitespace-nowrap ${
                          item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      
                      {/* KOLOM AKSI (STICKY) */}
                      <td className="sticky right-0 bg-white shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)] px-8 py-5">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => handleToggleStatus(item.id, item.is_active, item.name)} className={`p-2.5 rounded-xl border transition-all active:scale-90 ${item.is_active ? 'bg-slate-50 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`} title={item.is_active ? "Nonaktifkan Kategori" : "Aktifkan Kategori"}>
                            {item.is_active ? <ShieldAlert className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
                          </button>
                          <button onClick={() => openEditModal(item)} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-90 shadow-sm" title="Edit Kategori">
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-90 shadow-sm" title="Hapus Permanen">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Database: <span className="text-slate-900">{metadata?.totalData || 0} Entitas</span>
          </p>
          <div className="flex items-center gap-4">
            <button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm">
              <span className="text-sm font-black text-slate-800">
                {metadata?.currentPage || 1} <span className="text-slate-300 mx-2">/</span> {metadata?.totalPage || 1}
              </span>
            </div>
            <button disabled={page === (metadata?.totalPage || 1) || loading} onClick={() => setPage(p => p + 1)} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
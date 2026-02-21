'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  UserCog,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import Link from 'next/link';
import { notify } from '@/lib/notify'; 
import ConfirmModal from '../../../components/ui/ConfirmModal'; 
import CustomDropdown from '@/components/CustomDropdown';

export default function UserManagePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({ 
    totalData: 0, 
    totalPage: 1, 
    currentPage: 1 
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: { 
          page,
          limit: 10,
          search: search || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined
        }
      });

      setUsers(response.data.data || []);
      setMetadata({
        totalData: response.data.total || 0,
        totalPage: response.data.totalPages || 1,
        currentPage: response.data.page || 1
      });

    } catch (err) {
      notify.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, search, roleFilter, statusFilter]);

  const handleToggleStatus = (id: number, currentStatus: boolean, name: string) => {
    setModalConfig({
      isOpen: true,
      title: currentStatus ? 'Bekukan Akun?' : 'Aktifkan Akun?',
      message: `Apakah Anda yakin ingin ${currentStatus ? 'membekukan' : 'mengaktifkan'} akun ${name}?`,
      type: currentStatus ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          await api.patch(`/users/${id}/status`, { is_active: !currentStatus });
          notify.success(`Akun ${name} berhasil ${!currentStatus ? 'diaktifkan' : 'dibekukan'}.`);
          fetchUsers();
        } catch (err) {
          notify.error("Gagal mengubah status.");
        } finally {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleChangeRole = (id: number, currentRole: string, name: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setModalConfig({
      isOpen: true,
      title: 'Ubah Role?',
      message: `Ubah role ${name} dari ${currentRole} menjadi ${newRole}?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.patch(`/users/${id}/role`, { role: newRole });
          notify.success(`Role ${name} berhasil diubah.`);
          fetchUsers();
        } catch (err) {
          notify.error("Gagal mengubah role.");
        } finally {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDelete = (id: number, name: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Pengguna?',
      message: `Data warga ${name} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`);
          notify.success(`Data warga ${name} berhasil dihapus.`);
          fetchUsers();
        } catch (err) {
          notify.error("Gagal menghapus data.");
        } finally {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
      />

      {/* HEADER: Responsif Stack di Mobile */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Warga</h1>
          <p className="text-sm font-bold text-slate-500">Otoritas manajemen akses dan status pengguna sistem.</p>
        </div>
        <div className="relative group w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* FILTER BAR: Scrollable Horizontal di Mobile */}
      <div className="relative flex items-center gap-4 bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pl-4 pr-4 border-r border-slate-100 shrink-0">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filter</span>
        </div>

        <div className="flex items-center gap-3 pr-4 shrink-0">
          <CustomDropdown
            value={roleFilter}
            placeholder="Semua Role"
            onChange={(val) => { setRoleFilter(val); setPage(1); }}
            options={[
              { label: 'Semua Role', value: '' },
              { label: 'Administrator', value: 'ADMIN' },
              { label: 'Pengguna', value: 'USER' },
            ]}
          />

          <CustomDropdown
            value={statusFilter}
            placeholder="Semua Status"
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            options={[
              { label: 'Semua Status', value: '' },
              { label: 'Aktif', value: 'true' },
              { label: 'Suspended', value: 'false' },
            ]}
          />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="min-w-[280px] px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identitas Warga</th>
                <th className="min-w-[160px] px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Otoritas</th>
                <th className="min-w-[180px] px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Kondisi Akun</th>
                {/* Aksi Dipindah ke Tengah (text-center) */}
                <th className="sticky right-0 bg-slate-50 lg:bg-transparent min-w-[160px] px-8 py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4 opacity-20" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Sinkronisasi...</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {users.length > 0 ? users.map((user: any) => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/10 shrink-0">
                            {user.full_name?.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="text-[14px] font-black text-slate-900 leading-tight truncate">{user.full_name}</p>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => handleChangeRole(user.id, user.role, user.full_name)} 
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                            user.role === 'ADMIN' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <UserCog className="w-3 h-3" />
                          {user.role}
                        </button>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                          user.is_active 
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                            : 'text-rose-600 bg-rose-50 border-rose-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                          <span className="text-[9px] font-black uppercase tracking-widest">{user.is_active ? 'Aktif' : 'Suspended'}</span>
                        </div>
                      </td>
                      {/* Sticky Action Column: Tetap di kanan saat horizontal scroll, Tombol Selalu Muncul (Justify-Center) */}
                      <td className="sticky right-0 bg-white lg:bg-transparent px-8 py-5 shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-center gap-2.5">
                          <button 
                            onClick={() => handleToggleStatus(user.id, user.is_active, user.full_name)} 
                            className={`p-2 rounded-xl border transition-all active:scale-90 ${user.is_active ? 'bg-slate-50 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}
                            title={user.is_active ? "Bekukan" : "Aktifkan"}
                          >
                            {user.is_active ? <ShieldAlert className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
                          </button>
                          <Link href={`/user-manage/${user.id}`} className="p-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-90 shadow-sm">
                            <Eye className="w-4.5 h-4.5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(user.id, user.full_name)} 
                            className="p-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-90 shadow-sm"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION: Responsif Footer */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Database: <span className="text-slate-900">{metadata?.totalData || 0} Entitas</span>
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="bg-white border border-slate-200 px-5 py-2 rounded-[14px] shadow-sm">
              <span className="text-xs font-black text-slate-800">
                {metadata?.currentPage || 1} <span className="text-slate-300 mx-1.5">/</span> {metadata?.totalPage || 1}
              </span>
            </div>
            <button 
              disabled={page === (metadata?.totalPage || 1)} 
              onClick={() => setPage(p => p + 1)} 
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
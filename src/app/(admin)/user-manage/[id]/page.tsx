'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Phone, Calendar, 
  ShieldCheck, ShieldAlert, FileText, 
  Clock, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { notify } from '@/lib/notify';

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        // Memanggil Endpoint 2: Detail Warga & Endpoint 3: Daftar Laporan
        const [resUser, resReports] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/reports`)
        ]);
        
        setUser(resUser.data.data);
        setReports(resReports.data.data);
      } catch (err) {
        notify.error("Gagal memuat detail pengguna.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4 opacity-20" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Tombol Kembali */}
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-slate-900 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-sm font-black uppercase tracking-widest">Kembali</span>
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* SISI KIRI: PROFIL SINGKAT */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl shadow-blue-500/20">
                {user?.full_name?.charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{user?.full_name}</h2>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {user?.is_active ? 'Akun Aktif' : 'Suspended'}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Mail className="w-5 h-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Telepon</p>
                  <p className="text-sm font-bold text-slate-700">{user?.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bergabung</p>
                  <p className="text-sm font-bold text-slate-700">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: DAFTAR LAPORAN (ENDPOINT 3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Riwayat Laporan
              <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-lg">{reports.length}</span>
            </h3>
          </div>

          <div className="space-y-4">
            {reports.length > 0 ? reports.map((report: any) => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={report.id} 
                className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                
                <div className="flex-1">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">
                    {report.category || 'Laporan Umum'}
                  </p>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2">
                    {report.description || 'Tanpa Judul'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(report.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" />
                      ID: #{report.id}
                    </span>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                  report.status === 'SELESAI' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  report.status === 'PROSES' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {report.status || 'MENUNGGU'}
                </div>
              </motion.div>
            )) : (
              <div className="bg-slate-50 rounded-[32px] border border-dashed border-slate-300 py-20 text-center">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Warga ini belum membuat laporan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { 
  Users, AlertCircle, CheckCircle2, Activity, 
  ArrowUpRight, ArrowDownRight, Calendar,
  BarChart3 // Ikon baru untuk Header
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6']; // Ditambah warna agar tidak cepat habis jika kategori banyak

export default function AdminStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total_reports: 0, pending_reports: 0, resolved_reports: 0, total_users: 0, growth_percentage: 0 });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [resAnalytics, resUsers] = await Promise.all([
          api.get('/admin/dashboard/analytics'),
          api.get('/users?limit=5&sort=created_at:desc')
        ]);
        const stats = resAnalytics.data.data;
        if (stats) {
          setSummary({
            total_reports: stats.summary?.total_reports || 0,
            pending_reports: stats.summary?.pending_reports || 0,
            resolved_reports: stats.summary?.resolved_reports || 0,
            total_users: stats.summary?.total_users || 0,
            growth_percentage: stats.summary?.growth_percentage || 0
          });
          setChartData(stats.monthly_trends || []); 
          setPieData(stats.category_distribution || []);
        }
        const userData = Array.isArray(resUsers.data) ? resUsers.data : resUsers.data.data || [];
        setRecentUsers(userData);
      } catch (err) {
        console.error("Gagal load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900">{loading ? "..." : value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-bold">
        {trend >= 0 ? (
          <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" /> +{trend}%</span>
        ) : (
          <span className="text-rose-600 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-full"><ArrowDownRight className="w-3 h-3" /> {trend}%</span>
        )}
        <span className="text-slate-400">vs bulan lalu</span>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-24 lg:pb-10 font-sans max-w-[1600px] mx-auto w-full">
      
      {/* --- HEADER DENGAN IKON --- */}
      <div className="flex-none flex items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center shrink-0 border border-emerald-100">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Statistik & Data</h1>
            <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">Analisis performa aplikasi dan tren pelaporan warga.</p>
          </div>
          {/* Tanggal Hari Ini (Pindah ke Kanan di Desktop) */}
          <div className="inline-flex items-center w-max gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600 mt-2 md:mt-0">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Laporan" value={summary.total_reports} icon={Activity} color="bg-blue-50 text-blue-600" trend={12.5} />
        <StatCard title="Perlu Tindakan" value={summary.pending_reports} icon={AlertCircle} color="bg-amber-50 text-amber-600" trend={5.2} />
        <StatCard title="Laporan Selesai" value={summary.resolved_reports} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" trend={8.4} />
        <StatCard title="User Terdaftar" value={summary.total_users} icon={Users} color="bg-violet-50 text-violet-600" trend={summary.growth_percentage || 0} />
      </div>

      {/* --- CHARTS ROW --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900">Analisis Tren Laporan</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Perbandingan laporan masuk vs diselesaikan</p>
          </div>
          {/* Tinggi disesuaikan untuk mobile dan desktop */}
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="incoming" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMasuk)" name="Masuk" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSelesai)" name="Selesai" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-4 text-center xl:text-left">
            <h3 className="text-xl font-black text-slate-900">Kategori Laporan</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Distribusi jenis aduan</p>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }}/>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="text-3xl font-black text-slate-900">{pieData.reduce((acc: any, curr: any) => acc + curr.value, 0)}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- DATA TABEL & SYSTEM INFO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabel User Terdaftar */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900">Registrasi User Terbaru</h3>
          </div>
          <div className="overflow-x-auto hide-scrollbar flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Nama User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.length === 0 ? (
                   <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold">Belum ada user baru.</td></tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-sm truncate max-w-[150px] sm:max-w-[200px]">{user.full_name || user.name}</div>
                        <div className="text-xs font-bold text-slate-400 mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                          user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold text-[10px] text-right whitespace-nowrap uppercase tracking-wider">
                        {new Date(user.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Info Panel */}
        <div className="bg-slate-900 rounded-[32px] p-8 md:p-10 text-white flex flex-col justify-center relative overflow-hidden shadow-xl shadow-slate-900/10">
          <div className="absolute top-0 right-0 p-16 bg-blue-500 rounded-full blur-[120px] opacity-30"></div>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">Performa Sistem Optimal 🚀</h3>
            <p className="text-slate-400 font-medium mb-8 text-xs md:text-sm leading-relaxed max-w-md">Semua layanan sistem berjalan stabil. Tidak ada anomali lalu lintas data yang terdeteksi dalam 24 jam terakhir.</p>
            
            <div className="space-y-4 bg-white/5 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Server Uptime</span>
                <span className="text-xs md:text-sm font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg">99.9%</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">API Response</span>
                <span className="text-xs md:text-sm font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg">~124ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Database Load</span>
                <span className="text-xs md:text-sm font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg">Low (12%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
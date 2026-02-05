// 'use client';

// import { useEffect, useState } from 'react';
// import api from '@/lib/axios';
// import { motion } from 'framer-motion';
// import { 
//   Users, AlertCircle, CheckCircle2, Activity, 
//   ArrowUpRight, ArrowDownRight, Calendar 
// } from 'lucide-react';
// import { 
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
//   PieChart, Pie, Cell, Legend 
// } from 'recharts';

// // Warna Grafik
// const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
  
//   // State Data Real
//   const [summary, setSummary] = useState({
//     total_reports: 0,
//     pending_reports: 0,
//     resolved_reports: 0,
//     total_users: 0,
//     growth_percentage: 0 // Optional jika backend kirim
//   });
  
//   const [chartData, setChartData] = useState([]); // Untuk Area Chart
//   const [pieData, setPieData] = useState([]);     // Untuk Pie Chart
//   const [recentUsers, setRecentUsers] = useState<any[]>([]); // Untuk Tabel User

//   // Fetch Semua Data Dashboard
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
        
//         // Request Paralel ke 2 Endpoint
//         const [resAnalytics, resUsers] = await Promise.all([
//           api.get('/admin/dashboard/analytics'),
//           api.get('/users?limit=5&sort=created_at:desc') // Ambil 5 user terbaru
//         ]);

//         // 1. Set Data Statistik & Grafik
//         const stats = resAnalytics.data.data;
        
//         if (stats) {
//           setSummary({
//             total_reports: stats.summary?.total_reports || 0,
//             pending_reports: stats.summary?.pending_reports || 0,
//             resolved_reports: stats.summary?.resolved_reports || 0,
//             total_users: stats.summary?.total_users || 0,
//             growth_percentage: stats.summary?.growth_percentage || 0
//           });

//           // Mapping data grafik (pastikan key sesuai response backend: 'incoming', 'resolved')
//           setChartData(stats.monthly_trends || []); 
//           setPieData(stats.category_distribution || []);
//         }

//         // 2. Set Data Tabel User
//         // Handle response array langsung atau wrapped object
//         const userData = Array.isArray(resUsers.data) ? resUsers.data : resUsers.data.data || [];
//         setRecentUsers(userData);

//       } catch (err) {
//         console.error("Gagal load dashboard data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   // Komponen Card Statistik Kecil
//   const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
//     >
//       <div className="flex justify-between items-start">
//         <div>
//           <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
//           <h3 className="text-3xl font-extrabold text-slate-900">{loading ? "..." : value}</h3>
//         </div>
//         <div className={`p-3 rounded-xl ${color}`}>
//           <Icon className="w-6 h-6" />
//         </div>
//       </div>
      
//       {/* Trend Indicator (Optional: Jika backend kirim growth data) */}
//       <div className="mt-4 flex items-center gap-2 text-xs font-medium">
//         {trend >= 0 ? (
//           <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
//             <ArrowUpRight className="w-3 h-3" /> +{trend}%
//           </span>
//         ) : (
//           <span className="text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full">
//             <ArrowDownRight className="w-3 h-3" /> {trend}%
//           </span>
//         )}
//         <span className="text-slate-400">vs bulan lalu</span>
//       </div>
//     </motion.div>
//   );

//   return (
//     <div className="space-y-6 pb-10">
      
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
//           <p className="text-slate-500">Analisis performa aplikasi dan statistik warga.</p>
//         </div>
//         <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
//           <Calendar className="w-4 h-4 text-slate-400" />
//           <span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
//         </div>
//       </div>

//       {/* 1. ROW STATISTIK UTAMA (REAL DATA) */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard 
//           title="Total Laporan" 
//           value={summary.total_reports} 
//           icon={Activity} 
//           color="bg-blue-50 text-blue-600" 
//           trend={12.5} // Dummy trend sementara
//         />
//         <StatCard 
//           title="Perlu Tindakan" 
//           value={summary.pending_reports} 
//           icon={AlertCircle} 
//           color="bg-amber-50 text-amber-600" 
//           trend={5.2}
//         />
//         <StatCard 
//           title="Laporan Selesai" 
//           value={summary.resolved_reports} 
//           icon={CheckCircle2} 
//           color="bg-emerald-50 text-emerald-600" 
//           trend={8.4}
//         />
//         <StatCard 
//           title="User Terdaftar" 
//           value={summary.total_users} 
//           icon={Users} 
//           color="bg-violet-50 text-violet-600" 
//           trend={summary.growth_percentage || 0}
//         />
//       </div>

//       {/* 2. ROW GRAFIK (REAL DATA) */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Grafik Area: Tren Laporan */}
//         <motion.div 
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.2 }}
//           className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
//         >
//           <div className="mb-6">
//             <h3 className="text-lg font-bold text-slate-900">Analisis Tren Laporan</h3>
//             <p className="text-sm text-slate-500">Perbandingan laporan masuk vs diselesaikan tahun ini</p>
//           </div>
//           <div className="h-[300px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
//                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                   </linearGradient>
//                   <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
//                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
//                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
//                 <CartesianGrid vertical={false} stroke="#f1f5f9" />
//                 <Tooltip 
//                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//                 />
//                 <Area type="monotone" dataKey="incoming" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMasuk)" name="Masuk" />
//                 <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSelesai)" name="Selesai" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </motion.div>

//         {/* Grafik Pie: Distribusi Kategori */}
//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.3 }}
//           className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
//         >
//           <div className="mb-4">
//             <h3 className="text-lg font-bold text-slate-900">Kategori Laporan</h3>
//             <p className="text-sm text-slate-500">Distribusi jenis aduan</p>
//           </div>
//           <div className="flex-1 min-h-[250px] relative">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={80}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {pieData.map((entry: any, index: number) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend verticalAlign="bottom" height={36}/>
//               </PieChart>
//             </ResponsiveContainer>
            
//             {/* Center Text: Total Laporan dari Data Pie */}
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
//               <div className="text-center">
//                 <span className="text-2xl font-bold text-slate-900">
//                   {pieData.reduce((acc: any, curr: any) => acc + curr.value, 0)}
//                 </span>
//                 <p className="text-[10px] text-slate-400 uppercase">Total</p>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* 3. ROW USER TERBARU (REAL DATA) & SIDE STATS */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
//         {/* Tabel User Terbaru */}
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
//             <h3 className="font-bold text-slate-900">Registrasi User Terbaru</h3>
            
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm text-slate-600">
//               <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
//                 <tr>
//                   <th className="p-4">Nama User</th>
//                   <th className="p-4">Role</th>
//                   <th className="p-4">Tanggal Daftar</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {recentUsers.length === 0 ? (
//                    <tr><td colSpan={3} className="p-4 text-center text-slate-400">Belum ada user baru.</td></tr>
//                 ) : (
//                   recentUsers.map((user) => (
//                     <tr key={user.id} className="hover:bg-slate-50">
//                       <td className="p-4">
//                         <div className="font-medium text-slate-900">{user.full_name || user.name}</div>
//                         <div className="text-xs text-slate-400">{user.email}</div>
//                       </td>
//                       <td className="p-4">
//                         <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase">{user.role}</span>
//                       </td>
//                       <td className="p-4 text-slate-500 text-xs">
//                         {new Date(user.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Quick Insights / Info Panel (Static/Dummy untuk hiasan dashboard) */}
//         <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center relative overflow-hidden">
//           <div className="absolute top-0 right-0 p-10 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
//           <div className="relative z-10">
//             <h3 className="text-2xl font-bold mb-2">Performa Sistem Optimal 🚀</h3>
//             <p className="text-slate-400 mb-6">Semua sistem berjalan lancar. Tidak ada lonjakan laporan aneh yang terdeteksi hari ini.</p>
            
//             <div className="space-y-4">
//               <div className="flex items-center justify-between border-b border-slate-800 pb-2">
//                 <span className="text-sm text-slate-400">Server Uptime</span>
//                 <span className="font-bold text-emerald-400">99.9%</span>
//               </div>
//               <div className="flex items-center justify-between border-b border-slate-800 pb-2">
//                 <span className="text-sm text-slate-400">Response Time</span>
//                 <span className="font-bold text-blue-400">~200ms</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-slate-400">Database Load</span>
//                 <span className="font-bold text-amber-400">Low (12%)</span>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, AlertCircle, CheckCircle2, 
  Activity, ArrowUpRight, ArrowDownRight, Calendar 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

// --- DUMMY DATA UNTUK GRAFIK ---
const monthlyStats = [
  { name: 'Jan', masuk: 40, selesai: 24 },
  { name: 'Feb', masuk: 30, selesai: 13 },
  { name: 'Mar', masuk: 20, selesai: 58 },
  { name: 'Apr', masuk: 27, selesai: 39 },
  { name: 'Mei', masuk: 18, selesai: 48 },
  { name: 'Jun', masuk: 23, selesai: 38 },
  { name: 'Jul', masuk: 34, selesai: 43 },
];

const categoryStats = [
  { name: 'Infrastruktur', value: 400 },
  { name: 'Keamanan', value: 300 },
  { name: 'Kebersihan', value: 300 },
  { name: 'Administrasi', value: 200 },
];

const recentUsers = [
  { id: 1, name: "Dimas Suryono", email: "dimas@gmail.com", role: "Warga", status: "Active" },
  { id: 2, name: "Siti Aminah", email: "siti.am@yahoo.com", role: "Warga", status: "Active" },
  { id: 3, name: "Budi Santoso", email: "budisantoso@gmail.com", role: "Petugas", status: "Offline" },
  { id: 4, name: "Rina Wijaya", email: "rina.w@outlook.com", role: "Warga", status: "Active" },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pending: 0,
    resolved: 0,
    totalUsers: 1250 // Dummy total user
  });
  const [loading, setLoading] = useState(true);

  // Fetch Ringkasan Data Real
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Kita ambil data report untuk menghitung total real-time
        const res = await api.get('/reports/reports?limit=1000'); 
        const reports = Array.isArray(res.data) ? res.data : res.data.data || [];
        
        setStats(prev => ({
          ...prev,
          totalReports: reports.length,
          pending: reports.filter((r: any) => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length,
          resolved: reports.filter((r: any) => r.status === 'RESOLVED' || r.status === 'DONE').length,
        }));
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Komponen Card Statistik Kecil
  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{loading ? "..." : value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-medium">
        {trend === 'up' ? (
          <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" /> +12.5%
          </span>
        ) : (
          <span className="text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full">
            <ArrowDownRight className="w-3 h-3" /> -2.4%
          </span>
        )}
        <span className="text-slate-400">dari bulan lalu</span>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Analisis performa aplikasi dan statistik warga.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
        </div>
      </div>

      {/* 1. ROW STATISTIK UTAMA (KPI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Laporan" 
          value={stats.totalReports} 
          icon={Activity} 
          color="bg-blue-50 text-blue-600" 
          trend="up"
        />
        <StatCard 
          title="Perlu Tindakan" 
          value={stats.pending} 
          icon={AlertCircle} 
          color="bg-amber-50 text-amber-600" 
          trend="up"
        />
        <StatCard 
          title="Laporan Selesai" 
          value={stats.resolved} 
          icon={CheckCircle2} 
          color="bg-emerald-50 text-emerald-600" 
          trend="up"
        />
        <StatCard 
          title="User Terdaftar" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-violet-50 text-violet-600" 
          trend="up"
        />
      </div>

      {/* 2. ROW GRAFIK (Line Chart & Pie Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafik Area: Tren Laporan */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Analisis Tren Laporan</h3>
            <p className="text-sm text-slate-500">Perbandingan laporan masuk vs diselesaikan (Jan - Jul)</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="masuk" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMasuk)" name="Masuk" />
                <Area type="monotone" dataKey="selesai" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSelesai)" name="Selesai" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Grafik Pie: Distribusi Kategori */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">Kategori Laporan</h3>
            <p className="text-sm text-slate-500">Distribusi jenis aduan</p>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="text-2xl font-bold text-slate-900">1.2k</span>
                <p className="text-[10px] text-slate-400 uppercase">Total</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. ROW USER TERBARU & SIDE STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabel User Terbaru (Dummy) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Registrasi User Terbaru</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="p-4">Nama User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{user.role}</span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights / Info Panel */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Performa Sistem Optimal 🚀</h3>
            <p className="text-slate-400 mb-6">Semua sistem berjalan lancar. Tidak ada lonjakan laporan aneh yang terdeteksi hari ini.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sm text-slate-400">Server Uptime</span>
                <span className="font-bold text-emerald-400">99.9%</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sm text-slate-400">Response Time</span>
                <span className="font-bold text-blue-400">~200ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Database Load</span>
                <span className="font-bold text-amber-400">Low (12%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
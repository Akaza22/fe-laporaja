'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, UserCog, Shield, BellRing, 
  ServerCog, Save, Loader2, Mail, Smartphone
} from 'lucide-react';
import api from '@/lib/axios';
import { notify } from '@/lib/notify';

const TABS = [
  { id: 'profile', label: 'Profil & Keamanan', icon: UserCog, desc: 'Kelola data diri dan kata sandi' },
  { id: 'system', label: 'Pengaturan Sistem', icon: ServerCog, desc: 'Konfigurasi global aplikasi' },
  { id: 'notifications', label: 'Notifikasi', icon: BellRing, desc: 'Preferensi pemberitahuan' },
];

// OPTIMASI 1: Pisahkan komponen ke luar main function dan gunakan React.memo
// Agar komponen ini tidak dirender ulang secara sia-sia setiap kali kita mengetik di input form lain
const ToggleSwitch = memo(({ checked, onChange, label, desc }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={onChange}>
    <div className="flex-1 pr-4">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
    <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </div>
));
ToggleSwitch.displayName = 'ToggleSwitch';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: '', phone: '', email: '',
    old_password: '', new_password: ''
  });

  const [systemForm, setSystemForm] = useState({
    maintenance_mode: false,
    max_upload_size: 2 
  });

  const [notifForm, setNotifForm] = useState({
    email_new_report: true, email_urgent_only: false
  });

  // OPTIMASI 2: Paralel Fetch Data menggunakan Promise.allSettled
  useEffect(() => {
    const fetchSettingsData = async () => {
      setLoadingInit(true);
      try {
        // Fetch dua endpoint secara bersamaan agar waktu tunggu 2x lebih cepat
        const [resMeResult, resSysResult] = await Promise.allSettled([
          api.get('/users/profile'),
          api.get('/system/settings')
        ]);

        // Proses Data Profil
        if (resMeResult.status === 'fulfilled') {
          const user = resMeResult.value.data?.user || resMeResult.value.data?.data;
          if (user) {
            setProfileForm(prev => ({ 
              ...prev, 
              full_name: user.full_name || user.name || '', 
              phone: user.phone || '',
              email: user.email || ''
            }));
          }
        } else {
          console.error("Gagal load profil admin", resMeResult.reason);
          notify.error("Gagal memuat data profil.");
        }

        // Proses Data Sistem
        if (resSysResult.status === 'fulfilled') {
          const sysData = resSysResult.value.data?.data || resSysResult.value.data;
          if (sysData) {
            setSystemForm({
              maintenance_mode: Boolean(sysData.maintenance_mode),
              max_upload_size: sysData.max_upload_size || 2
            });
          }
        } else {
          console.warn("Info: Endpoint system/settings belum siap atau kosong.", resSysResult.reason);
        }
        
      } finally {
        setLoadingInit(false);
      }
    };
    fetchSettingsData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/profile', { 
        full_name: profileForm.full_name, 
        phone: profileForm.phone 
      });

      if (profileForm.old_password && profileForm.new_password) {
        await api.patch('/auth/change-password', { 
          old_password: profileForm.old_password, 
          new_password: profileForm.new_password 
        });
      }

      notify.success("Profil berhasil diperbarui!");
      setProfileForm(prev => ({ ...prev, old_password: '', new_password: '' })); 
    } catch(err: any) { 
      notify.error(err.response?.data?.message || "Gagal memperbarui profil."); 
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/system/settings', {
        maintenance_mode: systemForm.maintenance_mode,
        max_upload_size: Number(systemForm.max_upload_size)
      });
      notify.success("Pengaturan sistem berhasil disimpan.");
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Gagal menyimpan pengaturan sistem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] xl:h-[calc(100vh-100px)] space-y-4 md:space-y-6 relative font-sans max-w-[1400px] mx-auto w-full pb-24 xl:pb-0">
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HEADER --- */}
      <div className="flex-none flex items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 text-white rounded-[20px] flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
          <Settings className="w-7 h-7 md:w-8 md:h-8 animate-[spin_6s_linear_infinite]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Pengaturan</h1>
          <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">Kelola preferensi akun dan konfigurasi sistem.</p>
        </div>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* KIRI: SIDEBAR NAVIGASI TABS */}
        <div className="w-full xl:w-72 shrink-0 flex flex-row xl:flex-col gap-2 bg-white xl:bg-transparent p-2 xl:p-0 rounded-[24px] xl:rounded-none border border-slate-200 xl:border-none shadow-sm xl:shadow-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 xl:flex-none flex items-center justify-center xl:justify-start gap-2 xl:gap-4 p-3.5 xl:p-4 rounded-2xl text-left transition-all xl:w-full ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-none' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-100 xl:hover:bg-slate-200/50 hover:text-slate-900'
              }`}
              title={tab.label}
            >
              <tab.icon className={`w-5 h-5 xl:w-6 xl:h-6 shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
              <div className="hidden xl:block">
                <p className="font-black text-sm">{tab.label}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {tab.desc}
                </p>
              </div>
              <span className="hidden sm:block xl:hidden font-black text-[10px] md:text-xs truncate px-1">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* KANAN: AREA FORM BERDASARKAN TAB */}
        <div className="flex-1 w-full bg-white rounded-[32px] border border-slate-200 shadow-sm p-5 md:p-8 xl:p-10 min-h-[500px]">
          {loadingInit ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-slate-300 mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Pengaturan...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: PROFIL & KEAMANAN */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-black text-slate-900">Profil & Keamanan</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Perbarui data diri dan kata sandi untuk keamanan akun Anda.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[11px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserCog className="w-4 h-4"/> Informasi Pribadi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                          <input type="text" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Email (Tidak bisa diubah)</label>
                          <div className="flex items-center gap-3 px-4 py-3 md:py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed shadow-sm">
                            <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{profileForm.email}</span>
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2 xl:col-span-1">
                          <label className="text-xs font-bold text-slate-700">Nomor Telepon</label>
                          <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[11px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Shield className="w-4 h-4"/> Ubah Kata Sandi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Kata Sandi Lama</label>
                          <input type="password" placeholder="••••••••" value={profileForm.old_password} onChange={e => setProfileForm({...profileForm, old_password: e.target.value})} className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Kata Sandi Baru</label>
                          <input type="password" placeholder="••••••••" value={profileForm.new_password} onChange={e => setProfileForm({...profileForm, new_password: e.target.value})} className="w-full px-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                        </div>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-400 font-medium italic">*Kosongkan kolom kata sandi jika tidak ingin mengubahnya.</p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={saving} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-[16px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-70">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Profil
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: PENGATURAN SISTEM */}
              {activeTab === 'system' && (
                <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-black text-slate-900">Pengaturan Sistem</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Atur konfigurasi global yang berdampak pada warga dan antarmuka aplikasi.</p>
                  </div>

                  <form onSubmit={handleSaveSystem} className="space-y-5 md:space-y-6">
                    <ToggleSwitch 
                      label="Maintenance Mode (Mode Pemeliharaan)" 
                      desc="Jika aktif, warga tidak dapat membuat laporan baru sementara waktu."
                      checked={systemForm.maintenance_mode}
                      onChange={() => setSystemForm({...systemForm, maintenance_mode: !systemForm.maintenance_mode})}
                    />

                    <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-[20px]">
                      <label className="text-sm font-bold text-slate-900 block mb-1">Batas Ukuran File Lampiran</label>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">Tentukan batas maksimal ukuran foto bukti yang bisa diunggah warga.</p>
                      <select 
                        value={systemForm.max_upload_size}
                        onChange={(e) => setSystemForm({...systemForm, max_upload_size: Number(e.target.value)})}
                        className="w-full md:w-1/2 px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                      >
                        <option value={2}>2 Megabytes (Disarankan)</option>
                        <option value={5}>5 Megabytes</option>
                        <option value={10}>10 Megabytes</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={saving} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-[16px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-70">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Pengaturan
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 3: NOTIFIKASI */}
              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-black text-slate-900">Preferensi Notifikasi</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Atur kapan sistem harus memberitahu Anda tentang aktivitas terbaru.</p>
                  </div>

                  <div className="space-y-4">
                    <ToggleSwitch 
                      label="Email Laporan Baru" 
                      desc="Kirim saya email setiap kali ada warga yang membuat laporan baru."
                      checked={notifForm.email_new_report}
                      onChange={() => setNotifForm({...notifForm, email_new_report: !notifForm.email_new_report})}
                    />
                    
                    <ToggleSwitch 
                      label="Hanya Laporan Darurat" 
                      desc="Sistem hanya akan mengirim email jika laporan ditandai berisiko tinggi / darurat."
                      checked={notifForm.email_urgent_only}
                      onChange={() => setNotifForm({...notifForm, email_urgent_only: !notifForm.email_urgent_only})}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={(e) => { e.preventDefault(); notify.info("Preferensi Notifikasi sedang dibangun 🛠️"); }} 
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-[16px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                      <Save className="w-4 h-4" /> Simpan Preferensi
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>

    </div>
  );
}
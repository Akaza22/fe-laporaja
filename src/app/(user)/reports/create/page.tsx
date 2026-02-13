'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Camera, X, 
  Loader2, Send, CalendarClock, ListPlus, AlignLeft, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Jalan Rusak',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    incident_time: '' 
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleGetLocation = () => {
    toast.loading("Mencari titik koordinat GPS...", { id: 'gps' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          toast.success("Titik GPS berhasil dikunci!", { id: 'gps' });
        },
        (error) => {
          toast.error("Gagal mengambil lokasi. Pastikan GPS aktif dan izin diberikan.", { id: 'gps' });
        }
      );
    } else {
      toast.error("Browser tidak mendukung fitur GPS.", { id: 'gps' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        toast.warning("Maksimal hanya bisa mengunggah 5 foto.");
        return;
      }
      setFiles(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      toast.success(`${selectedFiles.length} foto berhasil ditambahkan.`);
    }
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    toast.info("Foto dihapus dari daftar.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      toast.warning("Mohon ambil titik GPS kejadian terlebih dahulu.");
      return;
    }

    setLoading(true);
    toast.loading("Sedang mengirim laporan Anda...", { id: 'submit' });

    try {
      const resReport = await api.post('/reports', {
        category: formData.category,
        description: formData.description,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        incident_time: formData.incident_time ? new Date(formData.incident_time).toISOString() : new Date().toISOString()
      });

      const reportId = resReport.data.report?.id || resReport.data.data?.id || resReport.data.id;
      if (!reportId) throw new Error("ID Laporan tidak ditemukan dalam response.");

      if (files.length > 0) {
        const imageFormData = new FormData();
        files.forEach((file) => imageFormData.append('images', file));
        await api.post(`/upload/reports/${reportId}/images/multiple`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success("Laporan berhasil dikirim!", { id: 'submit' });
      router.replace('/user');
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim laporan. Periksa koneksi Anda.", { id: 'submit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // KANVAS UTAMA: bg-white murni, menyatu, tidak ada jarak abu-abu di pinggir
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-76px)] w-full bg-white overflow-hidden relative">
      
      {/* Sembunyikan Scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* === HEADER MENYATU (Bukan kotak terpisah) === */}
      <div className="flex-none border-b border-slate-100 px-4 sm:px-8 py-5 lg:py-6 bg-white z-10 flex items-center gap-4">
        <Link href="/user" className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Buat Laporan Baru</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">Lengkapi formulir di bawah untuk menyampaikan aduan Anda.</p>
        </div>
      </div>

      {/* === KONTEN FORM (Seamless, menyatu dengan background) === */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8 py-8 lg:py-10">
        <div className="max-w-4xl mx-auto">
          
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            
            {/* Baris 1: Kategori & Waktu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-900">Kategori Masalah</label>
                <div className="relative group">
                  <ListPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none font-semibold"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Jalan Rusak">Jalan Rusak</option>
                    <option value="Sampah Menumpuk">Sampah Menumpuk</option>
                    <option value="Lampu Jalan Mati">Lampu Jalan Mati</option>
                    <option value="Banjir">Banjir</option>
                    <option value="Pencurian">Pencurian</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-900">Waktu Kejadian</label>
                <div className="relative group">
                  <CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input 
                    type="datetime-local"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-semibold"
                    value={formData.incident_time}
                    onChange={(e) => setFormData({...formData, incident_time: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Baris 2: Lokasi & Titik GPS */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-900">Lokasi Detail</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Contoh: Jl. Sudirman No. 15, samping warung bakso..." 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  className="bg-slate-900 text-white px-6 py-4 sm:py-0 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 shrink-0"
                >
                  <MapPin className="w-5 h-5" /> 
                  <span>Ambil Titik GPS</span>
                </button>
              </div>
              
              <div className="min-h-[24px] mt-2">
                {formData.latitude ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> GPS Terkunci: {formData.latitude.substring(0,8)}, {formData.longitude.substring(0,8)}
                  </motion.div>
                ) : (
                  <span className="text-xs text-rose-500 font-medium">* Titik GPS wajib diambil untuk akurasi laporan.</span>
                )}
              </div>
            </div>

            {/* Baris 3: Deskripsi */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-900">Deskripsi Masalah</label>
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                <textarea 
                  rows={5}
                  placeholder="Ceritakan kronologi atau detail masalah secara jelas di sini..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none font-medium placeholder:text-slate-400"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Baris 4: Upload Foto */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900">Bukti Foto</label>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-md">{previews.length} / 5 Terunggah</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {previews.map((src, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    key={i} 
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group"
                  >
                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-rose-600 rounded-full p-2 shadow-md hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                
                {previews.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer hover:bg-blue-50/50 transition-all group">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 mb-2 group-hover:scale-110 group-hover:text-blue-600 transition-all text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-slate-500 font-bold group-hover:text-blue-600 transition-colors">Pilih Foto</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-6 pb-12">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 lg:py-5 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> 
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" /> 
                    <span>Kirim Laporan</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
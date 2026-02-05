'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Camera, X, 
  Loader2, Send, CalendarClock 
} from 'lucide-react';
import Link from 'next/link';

export default function CreateReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State Data Form
  const [formData, setFormData] = useState({
    category: 'Jalan Rusak',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    incident_time: '' // Field untuk waktu kejadian
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // 1. Fungsi Ambil Lokasi
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          alert("Lokasi berhasil ditemukan!");
        },
        (error) => {
          alert("Gagal mengambil lokasi. Pastikan GPS aktif.");
        }
      );
    } else {
      alert("Browser tidak mendukung Geolocation.");
    }
  };

  // 2. Handle File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // 3. Hapus Gambar
  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 4. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.latitude || !formData.longitude) {
        alert("Mohon ambil lokasi kejadian terlebih dahulu.");
        setLoading(false);
        return;
      }

      // TAHAP A: Kirim Data Laporan
      const resReport = await api.post('/reports', {
        category: formData.category,
        description: formData.description,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        // Pastikan format waktu sesuai (ISO String aman untuk PostgreSQL)
        incident_time: formData.incident_time ? new Date(formData.incident_time).toISOString() : new Date().toISOString()
      });

      console.log("RESPONSE CREATE:", resReport.data); // Cek di console strukturnya

      // --- PERBAIKAN LOGIC ID ---
      // Kita coba akses resReport.data.report.id sesuai saran Anda
      const reportId = 
        resReport.data.report?.id ||  // Coba key 'report'
        resReport.data.data?.id ||    // Coba key 'data'
        resReport.data.id;            // Coba langsung 'id'

      if (!reportId) {
        throw new Error("ID Laporan tidak ditemukan dalam response.");
      }

      // TAHAP B: Upload Gambar
      if (files.length > 0) {
        const imageFormData = new FormData();
        files.forEach((file) => {
          imageFormData.append('images', file);
        });

        await api.post(`/upload/reports/${reportId}/images/multiple`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert("Laporan berhasil dikirim!");
      router.push('/user');

    } catch (err) {
      console.error(err);
      alert("Gagal mengirim laporan. Cek koneksi atau kelengkapan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/user" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Buat Laporan Baru</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Kategori */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Kategori</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
            </div>

            {/* Waktu Kejadian (FIELD BARU) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Waktu Kejadian</label>
              <div className="relative">
                <CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input 
                  type="datetime-local"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.incident_time}
                  onChange={(e) => setFormData({...formData, incident_time: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Lokasi</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nama jalan / patokan..." 
                  className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  className="bg-blue-50 text-blue-600 px-4 rounded-2xl font-bold hover:bg-blue-100 transition flex items-center gap-2 whitespace-nowrap"
                >
                  <MapPin className="w-5 h-5" /> 
                  <span className="hidden md:inline">Ambil Lokasi</span>
                </button>
              </div>
              {formData.latitude && (
                <div className="text-xs text-emerald-600 font-medium ml-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Koordinat: {formData.latitude}, {formData.longitude}
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Deskripsi</label>
              <textarea 
                rows={4}
                placeholder="Ceritakan detail masalah..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            {/* Upload Gambar */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Bukti Foto</label>
              <div className="grid grid-cols-3 gap-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition group">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition">
                    <Camera className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Tambah</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <hr className="border-slate-100" />

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Kirim Laporan
                </>
              )}
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
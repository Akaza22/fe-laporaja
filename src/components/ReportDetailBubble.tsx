// src/components/chat/ReportDetailBubble.tsx
import { MapPin, ImageIcon, Calendar } from 'lucide-react';

interface ReportDetailProps {
  report: {
    category: string;
    description: string;
    address: string;
    created_at: string;
    images?: { url: string }[]; // Sesuaikan struktur dari backend Anda
  };
}

export default function ReportDetailBubble({ report }: ReportDetailProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="max-w-[90%] md:max-w-[70%] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header Bubble */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
             DETAIL LAPORAN
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Isi Laporan */}
        <div className="p-4 space-y-3">
          
          {/* Kategori & Deskripsi */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">{report.category}</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Lokasi */}
          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-slate-700 font-medium leading-tight">{report.address}</span>
          </div>

          {/* Grid Gambar (Jika ada) */}
          {report.images && report.images.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> LAMPIRAN FOTO
              </p>
              <div className={`grid gap-2 ${report.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {report.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group cursor-pointer">
                    {/* Ganti src dengan property URL gambar yang benar dari backend */}
                    <img 
                      src={img.url} 
                      alt={`Bukti ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
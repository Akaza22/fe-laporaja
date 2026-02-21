'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  Loader2,
  MapPin,
  ChevronDown,
  Circle,
  X,          
  Download,   
  Lock,
  CheckCircle2
} from 'lucide-react';
import ReportDetailBubble from '@/components/ReportDetailBubble';
import { notify } from '@/lib/notify'; // HELPER TOAST
import ConfirmModal from '@/components/ui/ConfirmModal'; // KOMPONEN MODAL

interface Message {
  id: string;
  sender_role: 'USER' | 'ADMIN';
  message: string;
  created_at: string;
  sender_id: string;
  sender_name?: string;
}

interface ReportDetail {
  id: string;
  category: string;
  description: string;
  status: string;
  address: string;
  created_at: string;
  images?: { url: string }[];
}

export default function AdminChatPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const hasScrolledInitialRef = useRef(false);
  const isUserAtBottomRef = useRef(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // States untuk fitur Tutup Laporan & Preview
  const [closing, setClosing] = useState(false); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State Modal
  const [showNewMessageBtn, setShowNewMessageBtn] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isChatClosed = ['RESOLVED', 'DONE', 'REJECTED'].includes(report?.status || '');

  /* =======================
      STATUS STYLE
   ======================== */
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'IN_PROGRESS':
      case 'VERIFIED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
      case 'DONE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const fetchData = async () => {
    try {
      const [msgRes, reportRes] = await Promise.allSettled([
        api.get(`/message/reports/${reportId}/messages`),
        api.get(`/reports/${reportId}`)
      ]);

      if (msgRes.status === 'fulfilled') {
        const data = msgRes.value.data;
        setMessages(data.messages || data.data || []);
      }

      if (reportRes.status === 'fulfilled') {
        const data = reportRes.value.data;
        setReport(data.data || data);
      }
    } catch (err) {
      console.error('Error fetching chat data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [reportId]);

  /* =======================
      AUTO SCROLL LOGIC
   ======================== */

  useEffect(() => {
    if (!loading && messages.length > 0 && !hasScrolledInitialRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        hasScrolledInitialRef.current = true;
      }, 100);
    }
  }, [loading, messages]);

  useEffect(() => {
    if (!loading && isUserAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowNewMessageBtn(false);
    } else if (!loading) {
      setShowNewMessageBtn(true);
    }
  }, [messages]);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;

    const threshold = 80;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    isUserAtBottomRef.current = atBottom;
    setShowNewMessageBtn(!atBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    isUserAtBottomRef.current = true;
    setShowNewMessageBtn(false);
  };

  /* =======================
      HANDLERS
   ======================== */

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isChatClosed) return;

    setSending(true);
    try {
      await api.post(`/message/reports/${reportId}/messages`, {
        message: newMessage
      });

      setNewMessage('');
      await fetchData();
      setTimeout(scrollToBottom, 100);
    } catch {
      notify.error("Gagal Mengirim", "Pesan kamu gagal terkirim.");
    } finally {
      setSending(false);
    }
  };

  // 1. Membuka Modal (Tidak langsung tembak API)
  const handleOpenCloseReportModal = () => {
    setShowConfirmModal(true);
  };

  // 2. Mengeksekusi penutupan laporan jika dikonfirmasi di Modal
  const executeCloseReport = async () => {
    setShowConfirmModal(false); // Tutup modal dulu biar UX mulus
    setClosing(true);
    
    const toastId = notify.loading('Memproses...', 'Sedang menutup laporan aduan.');
    
    try {
      // ===== PERUBAHANNYA DI SINI =====
      // Tambahkan 'message' default otomatis dari sistem agar validasi backend lolos
      await api.post(`/message/reports/${reportId}/messages`, {
        message: "Sesi percakapan ini telah diselesaikan dan ditutup oleh Petugas.",
        close: true
      });
      // ================================
      
      notify.update(toastId, 'success', 'Berhasil Ditutup!', 'Sesi laporan telah selesai.');
      await fetchData(); 
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
      notify.update(toastId, 'error', 'Gagal', 'Terjadi kesalahan saat menutup laporan.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#EFEAE2] overflow-hidden relative">

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER */}
      <div className="px-4 py-3 bg-[#F0F2F5] border-b border-slate-200 flex items-center justify-between z-10 shadow-sm flex-none">
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/reports')}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-base truncate">
                {report?.category || 'Memuat...'}
              </h2>
              
              <span className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide shadow-sm ${getStatusStyle(report?.status)}`}>
                <Circle className="w-2 h-2 fill-current" />
                {report?.status?.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
              <span className="truncate">{report?.address || 'Lokasi...'}</span>
            </p>
          </div>
        </div>

        {/* TOMBOL TUTUP LAPORAN DI KANAN ATAS */}
        {!isChatClosed && !loading && (
          <button
            onClick={handleOpenCloseReportModal} // PANGGIL MODAL DI SINI
            disabled={closing}
            title="Tutup Laporan"
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-70 shadow-sm shrink-0"
          >
            {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span className="hidden sm:block">Tutup Laporan</span>
          </button>
        )}

      </div>

      {/* CHAT AREA */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#EFEAE2] relative hide-scrollbar"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {report && <ReportDetailBubble report={report} onImageClick={setSelectedImage} />}

            {messages.map((msg, idx) => {
              const isAdmin = msg.sender_role === 'ADMIN';
              const showAvatar =
                idx === 0 || messages[idx - 1].sender_role !== msg.sender_role;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${
                      isAdmin ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* AVATAR */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-end">
                      {showAvatar && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center
                            text-[10px] font-bold text-white shadow-sm
                            ${isAdmin ? 'bg-emerald-600' : 'bg-slate-700'}
                          `}
                        >
                          {isAdmin ? 'Adm' : (msg.sender_name?.charAt(0) || 'U')}
                        </div>
                      )}
                    </div>

                    {/* BUBBLE */}
                    <div
                      className={`px-4 py-2.5 rounded-[1.2rem] shadow-sm text-[15px]
                        leading-relaxed relative border
                        ${
                          isAdmin
                            ? 'bg-[#d9fdd3] text-slate-900 rounded-br-none border-[#bcecb6]'
                            : 'bg-white text-slate-900 rounded-bl-none border-slate-200'
                        }
                      `}
                    >
                      {!isAdmin && (
                        <p className="text-[10px] font-semibold text-orange-600 mb-0.5 uppercase tracking-wide">
                          {msg.sender_name || 'Pelapor'}
                        </p>
                      )}

                      <p className="whitespace-pre-wrap">{msg.message}</p>

                      <div className="flex justify-end mt-1">
                        <span
                          className={`text-[10px] font-medium ${
                            isAdmin ? 'text-emerald-800/60' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* FLOATING BUTTON (New Message) */}
      <AnimatePresence>
        {showNewMessageBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <span className="text-xs font-bold">Pesan Baru</span> <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* INPUT AREA */}
      <div className="p-3 bg-[#F0F2F5] border-t border-slate-200 z-10 flex-none">
        {isChatClosed ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-4 flex items-center justify-center gap-3 border border-dashed border-slate-300 shadow-sm max-w-4xl mx-auto"
          >
            <div className="p-2 bg-slate-100 rounded-full">
                <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Laporan Selesai / Ditutup</p>
              <p className="text-xs text-slate-500">Kamu tidak dapat lagi membalas pesan ini.</p>
            </div>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan balasan..."
              className="flex-1 p-3 rounded-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
              disabled={sending}
            />
            <button
              disabled={sending || !newMessage.trim()}
              className="p-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 disabled:opacity-50 transition shadow-md flex-shrink-0"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
          </form>
        )}
      </div>

      {/* ======================================= */}
      {/* RENDER MODAL KONFIRMASI DI SINI          */}
      {/* ======================================= */}
      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeCloseReport}
        title="Tutup Laporan?"
        message="Yakin ingin menutup sesi pelaporan ini? Kamu dan Warga tidak akan bisa saling membalas pesan lagi."
        confirmText="Ya"
        cancelText="Batal"
        type="warning" 
      />

      {/* MODAL LIGHTBOX FULLSCREEN UNTUK GAMBAR */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage} 
              alt="Fullscreen Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={selectedImage ? selectedImage.replace('/upload/', '/upload/fl_attachment/') : '#'}
              download
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-10 px-6 py-3 bg-white text-slate-900 font-extrabold text-sm rounded-full flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-xl hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Unduh Gambar
            </a>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
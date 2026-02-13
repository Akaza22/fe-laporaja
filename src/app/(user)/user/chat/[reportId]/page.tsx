'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Send, ArrowLeft, Loader2, Lock, 
  CheckCircle2, ShieldAlert, MapPin, 
  X, Download, ChevronDown // Ditambahkan ChevronDown untuk tombol floating
} from 'lucide-react';
import ReportDetailBubble from '@/components/ReportDetailBubble';

interface Message {
  id: string;
  sender_role: 'USER' | 'ADMIN';
  message: string;
  created_at: string;
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

export default function UserChatPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  
  // --- REFS UNTUK SCROLLING LOGIC ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitialRef = useRef(false);
  const isUserAtBottomRef = useRef(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // STATE BARU: Tombol Floating & Preview Gambar
  const [showNewMessageBtn, setShowNewMessageBtn] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isChatClosed = ['RESOLVED', 'DONE', 'REJECTED'].includes(report?.status || '');

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!reportId) return;
    try {
      const [msgResult, reportResult] = await Promise.allSettled([
        api.get(`/message/reports/${reportId}/messages`),
        api.get(`/reports/${reportId}`) 
      ]);

      if (msgResult.status === 'fulfilled') {
        const resMsg = msgResult.value;
        const msgData = resMsg.data?.messages || resMsg.data?.data || [];
        setMessages(msgData);
      }

      if (reportResult.status === 'fulfilled') {
        const resReports = reportResult.value;
        const repData = resReports.data?.data || resReports.data;
        setReport(repData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await fetchData();
      if (isMounted) setInitialLoading(false);
    };
    if (reportId) init();

    const interval = setInterval(() => fetchData(), 4000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [reportId]);

  /* =======================
     AUTO SCROLL LOGIC (Seragam dengan Admin)
   ======================== */

  // 1. Scroll ke bawah hanya saat pertama kali loading selesai
  useEffect(() => {
    if (!initialLoading && messages.length > 0 && !hasScrolledInitialRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        hasScrolledInitialRef.current = true;
      }, 100);
    }
  }, [initialLoading, messages]);

  // 2. Deteksi apakah ada pesan baru. Scroll jika user di bawah, munculkan tombol jika user di atas.
  useEffect(() => {
    if (!initialLoading && isUserAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowNewMessageBtn(false);
    } else if (!initialLoading) {
      setShowNewMessageBtn(true);
    }
  }, [messages]);

  // 3. Event handler ketika user scroll manual
  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;

    // Anggap "berada di bawah" jika jarak scroll dengan bawah < 80px
    const threshold = 80;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    isUserAtBottomRef.current = atBottom;
    setShowNewMessageBtn(!atBottom);
  };

  // 4. Fungsi memanggil scroll ke bawah paksa (dipakai tombol & setelah kirim pesan)
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
    } catch (err) {
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Laporan-${reportId.substring(0,6)}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    // CONTAINER UTAMA: Full Screen
    <div className="flex flex-col h-screen w-full bg-[#EFEAE2] overflow-hidden relative">
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* === 1. HEADER CHAT === */}
      <div className="flex-none bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <Link href="/user" className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          
          <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-slate-900 text-base leading-tight truncate">
              {report?.category || 'Memuat Laporan...'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isChatClosed ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></span>
              <p className="text-[11px] font-medium text-slate-500">
                {isChatClosed ? 'Sesi Selesai' : 'Petugas Online'}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 pl-2">
           <div className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase shadow-sm ${
             isChatClosed ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-blue-100 text-blue-700 border-blue-200'
           }`}>
             {report?.status?.replace('_', ' ')}
           </div>
        </div>
      </div>

      {/* === 2. CHAT AREA (Scrollable) === */}
      {/* REF DITAMBAHKAN & ONSCROLL DITAMBAHKAN */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 space-y-4 relative hide-scrollbar bg-[#EFEAE2]"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <div className="w-full max-w-5xl mx-auto flex flex-col min-h-full">
          {initialLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 relative z-10">
              <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
              <p className="text-xs font-medium text-slate-400">Menghubungkan...</p>
            </div>
          ) : (
            <>
              {report && (
                <ReportDetailBubble 
                  report={report} 
                  onImageClick={setSelectedImage} 
                />
              )}

              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-6 relative z-10">
                  <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <ShieldAlert className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Belum ada percakapan</h3>
                  <p className="text-sm text-slate-600 max-w-xs mt-1">
                    Halo! Petugas akan segera merespons laporan Anda di sini.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_role?.toUpperCase() === 'USER';
                  const showAvatar = idx === 0 || messages[idx - 1].sender_role !== msg.sender_role;

                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex w-full z-10 relative mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          
                          <div className="flex-shrink-0 w-8 h-8 flex items-end">
                                {showAvatar && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                                        isMe ? 'bg-slate-700' : 'bg-emerald-600'
                                    }`}>
                                        {isMe ? 'You' : 'Adm'}
                                    </div>
                                )}
                          </div>

                          <div className={`px-4 py-2.5 rounded-[1.2rem] shadow-sm text-[15px] leading-relaxed relative border ${
                            isMe 
                              ? 'bg-[#d9fdd3] text-slate-900 rounded-br-none border-[#bcecb6]' 
                              : 'bg-white text-slate-900 rounded-bl-none border-slate-200' 
                          }`}>
                            {!isMe && (
                              <p className="text-[10px] font-semibold text-emerald-700 mb-0.5 uppercase tracking-wide">Petugas</p>
                            )}
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-emerald-800/60' : 'text-slate-400'}`}>
                              <span className="text-[10px] font-medium">
                                {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && <CheckCircle2 className="w-3 h-3" />} 
                            </div>
                          </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-4" />
            </>
          )}
        </div>
      </div>

      {/* === FLOATING BUTTON (New Message) === */}
      <AnimatePresence>
        {showNewMessageBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <span className="text-xs font-bold">Pesan Baru</span> <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* === 3. FOOTER INPUT (Mentok Full Width) === */}
      <div className="flex-none bg-[#F0F2F5] px-4 py-3 sm:px-6 lg:px-8 border-t border-slate-200 z-30 w-full">
        <div className="max-w-5xl mx-auto w-full">
          {isChatClosed ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-4 flex items-center justify-center gap-3 border border-dashed border-slate-300 shadow-sm w-full"
            >
              <div className="p-2 bg-slate-100 rounded-full">
                  <Lock className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Laporan Selesai</p>
                <p className="text-xs text-slate-500">Sesi percakapan ini telah ditutup.</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-end gap-3 w-full">
              <div className="flex-1 bg-white focus-within:bg-white rounded-full border border-slate-300 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all flex items-center px-5 py-1.5 shadow-sm">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="w-full py-2.5 bg-transparent text-slate-900 placeholder:text-slate-500 focus:outline-none text-[15px] font-medium"
                  disabled={sending}
                />
              </div>
              <button 
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-70 disabled:scale-95 transition-all active:scale-90 shrink-0"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* MODAL LIGHTBOX FULLSCREEN UNTUK GAMBAR */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={selectedImage} 
              alt="Fullscreen Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (selectedImage) handleDownload(selectedImage);
              }}
              className="absolute bottom-10 px-6 py-3 bg-white text-slate-900 font-extrabold text-sm rounded-full flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-xl hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Unduh Gambar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
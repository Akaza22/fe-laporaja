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
  Circle
} from 'lucide-react';
import ReportDetailBubble from '@/components/ReportDetailBubble';

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
  const [showNewMessageBtn, setShowNewMessageBtn] = useState(false);

  /* =======================
      STATUS STYLE
   ======================== */
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await api.post(`/message/reports/${reportId}/messages`, {
        message: newMessage
      });

      setNewMessage('');
      await fetchData();
      setTimeout(scrollToBottom, 100);
    } catch {
      alert('Gagal kirim');
    } finally {
      setSending(false);
    }
  };

  return (
    // PARENT: h-screen dan overflow-hidden KUNCI untuk full screen & no double scroll
    <div className="flex flex-col h-screen bg-[#EFEAE2] overflow-hidden relative">

      {/* CSS KHUSUS UNTUK MENGHILANGKAN SCROLLBAR */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* HEADER */}
      <div className="px-4 py-3 bg-[#F0F2F5] border-b border-slate-200 flex items-center gap-3 z-10 shadow-sm flex-none">
        <button
          onClick={() => router.push('/reports')}
          className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900 text-base truncate">
              {report?.category || 'Memuat...'}
            </h2>
            
            {/* STATUS BADGE */}
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

      {/* CHAT AREA */}
      {/* Tambahkan class 'hide-scrollbar' di sini */}
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
            {report && <ReportDetailBubble report={report} />}

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
                      {/* NAMA PELAPOR */}
                      {!isAdmin && (
                        <p className="text-[10px] font-semibold text-orange-600 mb-0.5 uppercase tracking-wide">
                          {msg.sender_name || 'Pelapor'}
                        </p>
                      )}

                      {/* MESSAGE */}
                      <p className="whitespace-pre-wrap">{msg.message}</p>

                      {/* TIME */}
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
      </div>

    </div>
  );
}
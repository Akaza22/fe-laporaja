'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  Loader2,
  MapPin,
  ChevronDown
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
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
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
     AUTO SCROLL
  ======================== */

  useEffect(() => {
    if (!loading && messages.length > 0 && !hasScrolledInitialRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      hasScrolledInitialRef.current = true;
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
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden relative">

      {/* HEADER */}
      <div className="p-4 bg-white border-b flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/reports')}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>

          <div>
            <h2 className="font-bold text-black">
              {report?.category || 'Memuat...'}
            </h2>
            <p className="text-xs text-black flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {report?.address?.substring(0, 30)}...
            </p>
          </div>
        </div>

        {/* STATUS */}
        <motion.span
          key={report?.status}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`text-xs px-3 py-1 rounded-full border font-semibold whitespace-nowrap
            ${getStatusStyle(report?.status)}
          `}
        >
          {report?.status}
        </motion.span>
      </div>

      {/* CHAT */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]"
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {report && <ReportDetailBubble report={report} />}

            {messages.map((msg) => {
              const isAdmin = msg.sender_role === 'ADMIN';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-xl text-sm shadow text-black
                      ${isAdmin ? 'bg-[#d9fdd3]' : 'bg-white'}`}
                  >
                    <p className="text-[10px] font-semibold mb-1 text-slate-600">
                    {isAdmin ? 'Admin' : msg.sender_name || 'Pelapor'}
                    </p>
                    <p>{msg.message}</p>
                    <p className="text-[10px] text-right text-slate-400 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* FLOATING BUTTON */}
      {showNewMessageBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          Pesan Baru <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 flex gap-2 border-t bg-[#F0F2F5]"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 p-3 rounded-full border text-black"
          disabled={sending}
        />
        <button
          disabled={sending || !newMessage.trim()}
          className="p-3 bg-blue-600 text-white rounded-full"
        >
          {sending ? <Loader2 className="animate-spin" /> : <Send />}
        </button>
      </form>
    </div>
  );
}

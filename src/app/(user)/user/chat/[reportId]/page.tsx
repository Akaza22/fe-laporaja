'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Send, ArrowLeft, Loader2, Lock, 
  CheckCircle2, ShieldAlert, MapPin, MoreVertical 
} from 'lucide-react';

interface Message {
  id: string;
  sender_role: 'USER' | 'ADMIN';
  message: string;
  created_at: string;
}

interface Report {
  id: string;
  category: string;
  status: string;
  address: string;
}

export default function UserChatPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const isChatClosed = ['RESOLVED', 'DONE', 'REJECTED'].includes(report?.status || '');

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!reportId) return;
    try {
      const [msgResult, reportResult] = await Promise.allSettled([
        api.get(`/message/reports/${reportId}/messages`),
        api.get('/reports/me')
      ]);

      if (msgResult.status === 'fulfilled') {
        const resMsg = msgResult.value;
        const msgData = resMsg.data?.messages || resMsg.data?.data || [];
        setMessages(msgData);
      }

      if (reportResult.status === 'fulfilled') {
        const resReports = reportResult.value;
        let allReports: any[] = [];
        if (Array.isArray(resReports.data)) allReports = resReports.data;
        else if (resReports.data?.data && Array.isArray(resReports.data.data)) allReports = resReports.data.data;
        else if (resReports.data?.reports && Array.isArray(resReports.data.reports)) allReports = resReports.data.reports;

        const foundReport = allReports.find((r: any) => r.id === reportId);
        if (foundReport) setReport(foundReport);
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

    const interval = setInterval(() => fetchData(), 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [reportId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    } catch (err) {
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return (
    // PARENT UTAMA: h-screen (Tinggi Layar Penuh) & overflow-hidden (Anti Double Scroll)
    <div className="flex flex-col h-screen w-full bg-[#F0F2F5] overflow-hidden relative">
      
      {/* CSS INJECTION: Untuk menyembunyikan scrollbar tapi tetap bisa scroll */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* === HEADER (Fixed Height) === */}
      <div className="flex-none bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <Link href="/user" className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
               {report?.category?.charAt(0) || 'L'}
            </div>
            
            <div className="flex flex-col">
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                {report?.category || 'Memuat...'}
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isChatClosed ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                <p className="text-xs font-medium text-slate-500">
                  {isChatClosed ? 'Selesai' : 'Admin Online'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
           <div className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase ${
             isChatClosed ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-200'
           }`}>
             {report?.status?.replace('_', ' ')}
           </div>
        </div>
      </div>

      {/* === CONTENT WRAPPER (Flex Grow) === */}
      {/* flex-1 artinya dia akan memakan sisa ruang antara header dan footer */}
      <div className="flex-1 flex justify-center w-full overflow-hidden"> 
        <div className="w-full max-w-5xl flex flex-col h-full bg-[#efeae2] md:bg-white md:shadow-xl md:border-x md:border-slate-200">
          
          {/* === CHAT AREA (Scrollable) === */}
          {/* overflow-y-auto: HANYA bagian ini yang bisa discroll */}
          {/* hide-scrollbar: Class custom untuk menghilangkan batang scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative hide-scrollbar">
            
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {initialLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
                <p className="text-xs font-medium text-slate-400">Menghubungkan...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 z-10 relative">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                   <ShieldAlert className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Belum ada percakapan</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-1">
                  Halo! Admin akan segera merespons laporan <strong>{report?.category}</strong> Anda di sini.
                </p>
                {report?.address && (
                    <div className="mt-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-medium text-slate-700">{report.address}</span>
                    </div>
                )}
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
                    className={`flex w-full z-10 relative ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        <div className="flex-shrink-0 w-8 h-8 flex items-end">
                             {showAvatar && (
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                                     isMe ? 'bg-slate-800' : 'bg-blue-600'
                                 }`}>
                                     {isMe ? 'You' : 'Adm'}
                                 </div>
                             )}
                        </div>

                        <div className={`px-4 py-2.5 rounded-[1.2rem] shadow-sm text-[15px] leading-relaxed relative border ${
                          isMe 
                            ? 'bg-slate-900 text-white rounded-br-none border-slate-900' 
                            : 'bg-white text-slate-900 rounded-bl-none border-slate-200' 
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
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
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* === FOOTER INPUT (Fixed Height) === */}
          <div className="flex-none bg-white p-4 border-t border-slate-200 z-30">
            {isChatClosed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center gap-3 border border-dashed border-slate-300"
              >
                <div className="p-2 bg-slate-200 rounded-full">
                    <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-bold text-slate-800">Laporan Selesai</p>
                  <p className="text-xs text-slate-500">Sesi percakapan ini telah ditutup oleh sistem.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto w-full">
                <div className="flex-1 bg-slate-100 hover:bg-slate-50 focus-within:bg-white rounded-[1.5rem] border border-transparent focus-within:border-blue-500/30 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all flex items-center px-4 py-1">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="w-full py-3 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm font-medium"
                    disabled={sending}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:scale-95 transition-all active:scale-90"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
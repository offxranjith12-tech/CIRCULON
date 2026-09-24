'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getMessages, sendMessage, markMessagesAsRead } from '@/lib/actions/messages';
import { motion } from 'framer-motion';

export function ChatBox({ 
  currentUserId, 
  contactId, 
  contactName,
  contactRole 
}: { 
  currentUserId: string;
  contactId: string;
  contactName: string;
  contactRole?: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!currentUserId || !contactId) return;

    // Fetch existing messages
    const fetchChat = async () => {
      const data = await getMessages(contactId);
      setMessages(data || []);
      // Mark as read
      await markMessagesAsRead(contactId);
    };

    fetchChat();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${contactId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === currentUserId && msg.receiver_id === contactId) ||
            (msg.sender_id === contactId && msg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, msg]);
            if (msg.sender_id === contactId) {
              markMessagesAsRead(contactId);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, contactId, supabase]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage(contactId, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
          {contactName[0]?.toUpperCase() || <User className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{contactName}</h2>
          {contactRole && <p className="text-xs text-gray-500 capitalize">{contactRole}</p>}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || idx}
                className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div 
                  className={`px-4 py-2.5 rounded-2xl ${
                    isMe 
                      ? 'bg-emerald-600 text-white rounded-br-sm shadow-md shadow-emerald-200' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none py-2.5 px-3 text-sm"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-2.5 bg-emerald-600 text-white rounded-lg shrink-0 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

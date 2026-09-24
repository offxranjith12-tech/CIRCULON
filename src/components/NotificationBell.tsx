'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/actions/notifications';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    init();
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n: any) => !n.read).length);
    };

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleMarkAsRead = async (id: string, link: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (link) {
      window.location.href = link;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (!userId) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-green-950 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id, notif.link)}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-emerald-50/50' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{notif.content}</p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getInbox } from '@/lib/actions/messages';
import { ChatBox } from '@/components/ChatBox';
import { MessageSquare, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const [inbox, setInbox] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndInbox = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);
      
      const inboxData = await getInbox();
      setInbox(inboxData);
      
      // Auto-select first contact if none selected
      if (inboxData.length > 0 && !selectedContact) {
        setSelectedContact(inboxData[0]);
      }
      setLoading(false);
    };

    fetchUserAndInbox();

    // Setup realtime listener to refresh inbox order and unread counts
    const channel = supabase
      .channel('inbox_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Simply refetch inbox when any message is sent/received
          getInbox().then(setInbox);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, selectedContact]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Left Sidebar: Inbox List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            Messages
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {inbox.length === 0 ? (
            <div className="text-center text-sm text-gray-400 mt-10">
              No conversations yet.
            </div>
          ) : (
            inbox.map((chat) => (
              <button
                key={chat.contactId}
                onClick={() => setSelectedContact(chat)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedContact?.contactId === chat.contactId 
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm' 
                    : 'bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  {chat.contactName[0]?.toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 text-left truncate">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-sm text-gray-900 truncate pr-2">{chat.contactName}</h3>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate pr-2 ${chat.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Area: ChatBox */}
      <div className="w-2/3 h-full bg-gray-50/30">
        {selectedContact && currentUserId ? (
          <ChatBox 
            currentUserId={currentUserId}
            contactId={selectedContact.contactId}
            contactName={selectedContact.contactName}
            contactRole={selectedContact.contactRole}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

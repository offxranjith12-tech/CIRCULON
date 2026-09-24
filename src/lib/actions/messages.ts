'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendMessage(receiverId: string, message: string) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  
  if (authErr || !user) throw new Error('Not authenticated');

  // Insert message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      message
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }

  // Fetch sender name for notification
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('company_name')
    .eq('id', user.id)
    .single();

  const senderName = senderProfile?.company_name || 'A user';

  // Create notification for receiver
  await supabase
    .from('notifications')
    .insert({
      user_id: receiverId,
      type: 'message',
      title: `New message from ${senderName}`,
      content: message.length > 50 ? message.substring(0, 47) + '...' : message,
      link: '/messages'
    });

  revalidatePath('/messages');
  return data;
}

export async function getMessages(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data;
}

export async function getInbox() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch all unique users we've chatted with
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, receiver_id, message, created_at, read')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inbox:', error);
    return [];
  }

  // Group by unique contact
  const inboxMap = new Map();
  
  data.forEach(msg => {
    const contactId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!inboxMap.has(contactId)) {
      inboxMap.set(contactId, {
        contactId,
        lastMessage: msg.message,
        lastMessageAt: msg.created_at,
        unreadCount: (msg.receiver_id === user.id && !msg.read) ? 1 : 0
      });
    } else {
      const existing = inboxMap.get(contactId);
      if (msg.receiver_id === user.id && !msg.read) {
        existing.unreadCount += 1;
      }
    }
  });

  const inboxDetails = Array.from(inboxMap.values());
  
  // Fetch profiles for these contacts
  if (inboxDetails.length > 0) {
    const contactIds = inboxDetails.map(i => i.contactId);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, company_name, role')
      .in('id', contactIds);
      
    if (profiles) {
      inboxDetails.forEach(inboxItem => {
        const profile = profiles.find(p => p.id === inboxItem.contactId);
        inboxItem.contactName = profile?.company_name || 'Unknown User';
        inboxItem.contactRole = profile?.role || 'user';
      });
    }
  }

  return inboxDetails;
}

export async function markMessagesAsRead(senderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', user.id)
    .eq('read', false);
    
  revalidatePath('/messages');
}

import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, CalendarCheck, MessageSquare, Menu, Bell, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ bookings: 0, messages: 0, pending: 0 });
  useEffect(() => {
    const load = async () => {
      const [{ count: bookings }, { count: messages }, { count: pending }] = await Promise.all([
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      setStats({ bookings: bookings || 0, messages: messages || 0, pending: pending || 0 });
    };
    load();
  }, []);
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[{ label: 'Total Bookings', value: stats.bookings, color: 'bg-primary' }, { label: 'Pending Bookings', value: stats.pending, color: 'bg-yellow-500' }, { label: 'Messages', value: stats.messages, color: 'bg-blue-500' }].map((s) => (
        <div key={s.label} className="bg-card rounded-xl p-6">
          <div className={`w-12 h-12 rounded-lg ${s.color} flex items-center justify-center mb-4`}><LayoutDashboard className="h-6 w-6 text-primary-foreground" /></div>
          <p className="text-3xl font-bold">{s.value}</p>
          <p className="text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  useEffect(() => { supabase.from('table_bookings').select('*').order('created_at', { ascending: false }).then(({ data }) => setBookings(data || [])); }, []);
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('table_bookings').update({ status }).eq('id', id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };
  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted"><tr>{['Name', 'Date', 'Time', 'Guests', 'Status', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
          <tbody>{bookings.map((b) => (
            <tr key={b.id} className="border-t border-border">
              <td className="px-4 py-3">{b.name}</td>
              <td className="px-4 py-3">{b.date}</td>
              <td className="px-4 py-3">{b.time}</td>
              <td className="px-4 py-3">{b.guests}</td>
              <td className="px-4 py-3"><Badge variant={b.status === 'accepted' ? 'default' : b.status === 'rejected' ? 'destructive' : 'secondary'}>{b.status}</Badge></td>
              <td className="px-4 py-3 space-x-2">
                {b.status === 'pending' && <>
                  <Button size="sm" onClick={() => updateStatus(b.id, 'accepted')}>Accept</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, 'rejected')}>Reject</Button>
                </>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  useEffect(() => { supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setMessages(data || [])); }, []);
  return (
    <div className="space-y-4">{messages.map((m) => (
      <div key={m.id} className="bg-card rounded-xl p-6">
        <div className="flex justify-between items-start mb-2">
          <div><h4 className="font-semibold">{m.name}</h4><p className="text-sm text-muted-foreground">{m.email}</p></div>
          <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
        </div>
        <p className="font-medium text-primary mb-2">{m.subject}</p>
        <p className="text-muted-foreground">{m.message}</p>
      </div>
    ))}</div>
  );
};

const AdminChat = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const { user } = useAuth();

  useEffect(() => { supabase.from('chat_conversations').select('*, profiles(full_name)').order('updated_at', { ascending: false }).then(({ data }) => setConversations(data || [])); }, []);
  useEffect(() => { if (selected) supabase.from('chat_messages').select('*').eq('conversation_id', selected).order('created_at').then(({ data }) => setMessages(data || [])); }, [selected]);

  const sendReply = async () => {
    if (!input.trim() || !selected || !user) return;
    await supabase.from('chat_messages').insert({ conversation_id: selected, sender_id: user.id, message: input, is_from_admin: true });
    setMessages((prev) => [...prev, { id: Date.now(), message: input, is_from_admin: true, created_at: new Date().toISOString() }]);
    setInput('');
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[600px]">
      <div className="bg-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Conversations</div>
        <div className="divide-y divide-border">{conversations.map((c) => (
          <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full p-4 text-left hover:bg-muted/50 ${selected === c.id ? 'bg-muted' : ''}`}>
            <p className="font-medium">{c.profiles?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</p>
          </button>
        ))}</div>
      </div>
      <div className="md:col-span-2 bg-card rounded-xl flex flex-col">
        {selected ? <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">{messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.is_from_admin ? 'chat-bubble-user' : 'chat-bubble-admin'}`}>{m.message}</div>
          ))}</div>
          <div className="p-4 border-t border-border flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Reply..." className="flex-1 bg-muted rounded-lg px-4 py-2" onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
            <Button onClick={sendReply}>Send</Button>
          </div>
        </> : <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>}
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => { if (!isLoading && (!user || !isAdmin)) navigate('/'); }, [user, isAdmin, isLoading, navigate]);
  useEffect(() => {
    if (isAdmin) {
      supabase.from('notifications').select('*').eq('is_read', false).order('created_at', { ascending: false }).limit(10).then(({ data }) => setNotifications(data || []));
      const channel = supabase.channel('admin-notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => setNotifications((prev) => [payload.new as any, ...prev])).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: Users, label: 'Chat', path: '/admin/chat' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="admin-sidebar">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="font-display text-3xl">zayka<span className="text-primary">.</span></h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">{navItems.map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-left">
            <item.icon className="h-5 w-5" />{item.label}
          </button>
        ))}</nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}><LogOut className="h-5 w-5" />Sign Out</Button>
        </div>
      </aside>
      <main className="admin-content">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading text-2xl">Welcome, Admin</h2>
          <div className="relative">
            <Bell className="h-6 w-6" />
            {notifications.length > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">{notifications.length}</Badge>}
          </div>
        </div>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/bookings" element={<AdminBookings />} />
          <Route path="/messages" element={<AdminMessages />} />
          <Route path="/chat" element={<AdminChat />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;

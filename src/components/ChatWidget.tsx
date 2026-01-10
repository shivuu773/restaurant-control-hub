import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isOpen) {
      loadOrCreateConversation();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel('chat-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
      setMessages((prev) => [...prev, payload.new]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadOrCreateConversation = async () => {
    const { data: existing } = await supabase.from('chat_conversations').select('id').eq('user_id', user!.id).eq('is_active', true).maybeSingle();
    if (existing) {
      setConversationId(existing.id);
      const { data: msgs } = await supabase.from('chat_messages').select('*').eq('conversation_id', existing.id).order('created_at');
      setMessages(msgs || []);
    } else {
      const { data: newConv } = await supabase.from('chat_conversations').insert({ user_id: user!.id }).select().single();
      if (newConv) setConversationId(newConv.id);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !user) return;
    await supabase.from('chat_messages').insert({ conversation_id: conversationId, sender_id: user.id, message: input, is_from_admin: false });
    setInput('');
  };

  if (!user) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => navigate('/auth')} className="rounded-full w-14 h-14 shadow-lg animate-pulse-glow">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border animate-scale-in">
          <div className="bg-primary p-4 flex justify-between items-center">
            <h3 className="font-heading text-primary-foreground font-semibold">Chat with Us</h3>
            <button onClick={() => setIsOpen(false)}><X className="h-5 w-5 text-primary-foreground" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.is_from_admin ? 'chat-bubble-admin' : 'chat-bubble-user'}`}>
                {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-14 h-14 shadow-lg animate-pulse-glow">
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, Users, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Profile {
  user_id: string;
  full_name: string | null;
}

interface Conversation {
  id: string;
  user_id: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
}

const AdminChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();

    // Real-time subscription for new conversations
    const conversationChannel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations' },
        () => loadConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      
      // Real-time subscription for messages
      const messageChannel = supabase
        .channel(`chat-${selectedConversation}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `conversation_id=eq.${selectedConversation}`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            if (!newMessage.is_from_admin) {
              setMessages(prev => [...prev, newMessage]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const { data: convs } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (convs && convs.length > 0) {
      const userIds = convs.map(c => c.user_id).filter(Boolean) as string[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);
      
      const convsWithProfiles = convs.map(c => ({
        ...c,
        profile: profiles?.find(p => p.user_id === c.user_id) || null
      }));
      setConversations(convsWithProfiles);
    } else {
      setConversations([]);
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    setMessages(data || []);

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_from_admin', false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConversation || !user) return;

    const newMessage = {
      conversation_id: selectedConversation,
      sender_id: user.id,
      message: input,
      is_from_admin: true,
      is_read: false,
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(newMessage)
      .select()
      .single();

    if (error) {
      console.error('Failed to send message:', error);
      return;
    }

    setMessages(prev => [...prev, data]);
    setInput('');

    // Update conversation timestamp
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', selectedConversation);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Conversations List */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Conversations ({conversations.length})
          </h3>
        </div>
        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {(conv.profile?.full_name || 'User').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {conv.is_active && (
                      <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conv.profile?.full_name || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(conv.updated_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 bg-card border-border flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {(selectedConv?.profile?.full_name || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
                {selectedConv?.is_active && (
                  <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {selectedConv?.profile?.full_name || 'Anonymous User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedConv?.is_active ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_from_admin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.is_from_admin
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="break-words">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.is_from_admin ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your reply..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose from the list to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminChat;

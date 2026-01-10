import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Message {
  id: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isOpen) {
      loadOrCreateConversation();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages', 
          filter: `conversation_id=eq.${conversationId}` 
        }, 
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's from admin (user messages are added optimistically)
          if (newMsg.is_from_admin) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();
      
    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [conversationId]);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const loadOrCreateConversation = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Check for existing conversation
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (existing) {
        setConversationId(existing.id);
        
        // Load existing messages
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', existing.id)
          .order('created_at');
        
        setMessages(msgs || []);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating conversation:', error);
          toast.error('Failed to start chat. Please try again.');
          return;
        }
        
        if (newConv) {
          setConversationId(newConv.id);
          
          // Add welcome message
          const welcomeMsg: Message = {
            id: 'welcome',
            message: `Hello ${profile?.full_name || 'there'}! 👋 Welcome to Zayka. How can we help you today?`,
            is_from_admin: true,
            created_at: new Date().toISOString(),
          };
          setMessages([welcomeMsg]);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !user) return;
    
    const messageText = input.trim();
    setInput('');
    
    // Optimistically add message to UI
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      message: messageText,
      is_from_admin: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ 
          conversation_id: conversationId, 
          sender_id: user.id, 
          message: messageText, 
          is_from_admin: false 
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        setInput(messageText);
        return;
      }
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
      
      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
        
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setInput(messageText);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => navigate('/auth')} 
          className="rounded-full w-14 h-14 shadow-lg animate-pulse-glow"
          title="Login to chat with us"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[500px] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border animate-scale-in">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading text-primary-foreground font-semibold">Chat with Us</h3>
                <p className="text-xs text-primary-foreground/80">We typically reply instantly</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 p-1 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
          
          {/* User Info Bar */}
          <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">
              Chatting as <span className="font-medium text-foreground">{profile?.full_name || 'Guest'}</span>
            </span>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.is_from_admin
                          ? 'bg-muted rounded-bl-md'
                          : 'bg-primary text-primary-foreground rounded-br-md'
                      }`}
                    >
                      <p className="break-words text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.is_from_admin ? 'text-muted-foreground' : 'text-primary-foreground/70'
                      }`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..." 
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full w-14 h-14 shadow-lg animate-pulse-glow"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, UserCog, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  message: string;
  is_from_admin: boolean;
  is_ai_response?: boolean;
  created_at: string;
}

type ChatMode = 'bot' | 'manager';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('bot');
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
          if (newMsg.is_from_admin && !newMsg.is_ai_response) {
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
        .select('id, chat_mode')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (existing) {
        setConversationId(existing.id);
        setChatMode((existing.chat_mode as ChatMode) || 'bot');
        
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
          .insert({ user_id: user.id, chat_mode: 'bot' })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating conversation:', error);
          toast.error('Failed to start chat. Please try again.');
          return;
        }
        
        if (newConv) {
          setConversationId(newConv.id);
          setChatMode('bot');
          
          // Add welcome message
          const welcomeMsg: Message = {
            id: 'welcome',
            message: `Hello ${profile?.full_name || 'there'}! 👋 I'm Zayka's AI assistant. I can help you with menu recommendations, reservations, and general questions. How can I assist you today?`,
            is_from_admin: true,
            is_ai_response: true,
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

  const switchToManagerMode = async () => {
    if (!conversationId) return;
    
    try {
      await supabase
        .from('chat_conversations')
        .update({ chat_mode: 'manager' })
        .eq('id', conversationId);
      
      setChatMode('manager');
      
      // Add system message about mode switch
      const switchMsg: Message = {
        id: `switch-${Date.now()}`,
        message: "You're now connected with our restaurant manager. They'll respond to you shortly. 👨‍💼",
        is_from_admin: true,
        is_ai_response: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, switchMsg]);
      
      // Save switch message to database
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        message: switchMsg.message,
        is_from_admin: true,
        is_ai_response: false,
      });
      
      toast.success('Connected to restaurant manager');
    } catch (error) {
      console.error('Error switching mode:', error);
      toast.error('Failed to switch mode');
    }
  };

  const switchToBotMode = async () => {
    if (!conversationId) return;
    
    try {
      await supabase
        .from('chat_conversations')
        .update({ chat_mode: 'bot' })
        .eq('id', conversationId);
      
      setChatMode('bot');
      
      // Add system message about mode switch
      const switchMsg: Message = {
        id: `switch-${Date.now()}`,
        message: "You're now chatting with Zayka's AI assistant. How can I help you? 🤖",
        is_from_admin: true,
        is_ai_response: true,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, switchMsg]);
      
      toast.success('Switched to AI assistant');
    } catch (error) {
      console.error('Error switching mode:', error);
      toast.error('Failed to switch mode');
    }
  };

  const getAIResponse = async (userMessage: string) => {
    setIsAiTyping(true);
    
    try {
      // Prepare conversation history for AI
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10) // Last 10 messages for context
        .map(m => ({
          role: m.is_from_admin ? 'assistant' : 'user',
          content: m.message,
        }));
      
      conversationHistory.push({ role: 'user', content: userMessage });

      const { data, error } = await supabase.functions.invoke('chat-bot', {
        body: { 
          messages: conversationHistory,
          restaurantName: 'Zayka'
        }
      });

      if (error) {
        console.error('AI response error:', error);
        throw error;
      }

      const aiMessage = data.message || "I'm sorry, I couldn't process that. Please try again.";
      const shouldEscalate = data.shouldEscalate;

      // Save AI response to database
      const { data: savedMsg, error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user!.id,
          message: aiMessage,
          is_from_admin: true,
          is_ai_response: true,
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving AI message:', saveError);
      }

      // Add AI response to UI
      const aiResponseMsg: Message = {
        id: savedMsg?.id || `ai-${Date.now()}`,
        message: aiMessage,
        is_from_admin: true,
        is_ai_response: true,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponseMsg]);

      // If AI suggests escalation, offer to switch modes
      if (shouldEscalate) {
        setTimeout(() => {
          toast('Would you like to speak with a manager?', {
            action: {
              label: 'Yes, connect me',
              onClick: switchToManagerMode,
            },
          });
        }, 1000);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add fallback message
      const fallbackMsg: Message = {
        id: `fallback-${Date.now()}`,
        message: "I'm having trouble responding right now. Would you like to speak with our restaurant manager instead?",
        is_from_admin: true,
        is_ai_response: true,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
      
      toast('AI is unavailable', {
        action: {
          label: 'Talk to Manager',
          onClick: switchToManagerMode,
        },
      });
    } finally {
      setIsAiTyping(false);
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
          is_from_admin: false,
          is_ai_response: false,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
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
      
      // If in bot mode, get AI response
      if (chatMode === 'bot') {
        await getAIResponse(messageText);
      }
        
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
                {chatMode === 'bot' ? (
                  <Bot className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <UserCog className="h-5 w-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-heading text-primary-foreground font-semibold flex items-center gap-2">
                  {chatMode === 'bot' ? 'AI Assistant' : 'Restaurant Manager'}
                  <Badge variant="secondary" className="text-xs">
                    {chatMode === 'bot' ? '🤖 Bot' : '👨‍💼 Live'}
                  </Badge>
                </h3>
                <p className="text-xs text-primary-foreground/80">
                  {chatMode === 'bot' ? 'Instant AI responses' : 'Manager will reply soon'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 p-1 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
          
          {/* Mode Toggle Bar */}
          <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{profile?.full_name || 'Guest'}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={chatMode === 'bot' ? switchToManagerMode : switchToBotMode}
              className="text-xs gap-1"
            >
              <ArrowLeftRight className="h-3 w-3" />
              {chatMode === 'bot' ? 'Talk to Manager' : 'Back to AI'}
            </Button>
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
                      {msg.is_from_admin && (
                        <div className="flex items-center gap-1 mb-1">
                          {msg.is_ai_response ? (
                            <Bot className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <UserCog className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {msg.is_ai_response ? 'AI' : 'Manager'}
                          </span>
                        </div>
                      )}
                      <p className="break-words text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.is_from_admin ? 'text-muted-foreground' : 'text-primary-foreground/70'
                      }`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* AI Typing Indicator */}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Bot className="h-3 w-3 text-muted-foreground mr-2" />
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={chatMode === 'bot' ? "Ask me anything..." : "Message the manager..."} 
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isLoading || isAiTyping}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isAiTyping}
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

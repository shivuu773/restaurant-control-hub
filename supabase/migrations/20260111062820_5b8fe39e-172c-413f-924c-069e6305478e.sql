-- Add chat_mode column to track AI bot vs Manager mode
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS chat_mode TEXT NOT NULL DEFAULT 'bot' CHECK (chat_mode IN ('bot', 'manager'));

-- Add is_ai_response column to messages
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS is_ai_response BOOLEAN DEFAULT false;
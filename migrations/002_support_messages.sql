-- Migration 002: Isabel Pepe Support Messages & Concierge Inbox Schema
-- Table: public.support_messages

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'pending', 'replied', 'closed')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    replied_by TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for status, created_at, and customer_email
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON public.support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_customer_email ON public.support_messages(customer_email);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_support_messages_updated_at ON public.support_messages;
CREATE TRIGGER set_support_messages_updated_at
BEFORE UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access on support_messages" ON public.support_messages;
CREATE POLICY "Service role full access on support_messages"
ON public.support_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public and authenticated users to submit contact messages
DROP POLICY IF EXISTS "Public can insert support messages" ON public.support_messages;
CREATE POLICY "Public can insert support messages"
ON public.support_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

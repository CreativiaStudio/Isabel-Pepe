-- Elimina le tabelle se esistono (per pulizia in fase di test)
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

-- 1. Creazione della tabella Prodotti
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    image_primary VARCHAR(255),
    image_secondary VARCHAR(255),
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Creazione della tabella Ordini
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id VARCHAR(255) UNIQUE,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    amount_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address JSONB,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sicurezza: Impostiamo le Policy (Row Level Security) per permettere l'accesso
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permettiamo a tutti (utenti anonimi) di leggere i prodotti (per mostrarli nella Home)
CREATE POLICY "Public profiles are viewable by everyone." 
ON products FOR SELECT 
USING (true);

-- L'inserimento, modifica e cancellazione saranno fatti tramite la Secret Key (Service Role) del backend, 
-- che scavalca in automatico queste regole, quindi non serve abilitare insert/update pubblici.

-- 3. Creazione della tabella Messaggi di Supporto & Concierge
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

CREATE INDEX IF NOT EXISTS idx_support_messages_status ON public.support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_customer_email ON public.support_messages(customer_email);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on support_messages"
ON public.support_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can insert support messages"
ON public.support_messages FOR INSERT TO anon, authenticated WITH CHECK (true);


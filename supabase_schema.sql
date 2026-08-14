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

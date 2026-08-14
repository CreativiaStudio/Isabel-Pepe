import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import ProductGallery from '@/components/ProductGallery';
import StickyMobileAddToCart from '@/components/StickyMobileAddToCart';

// Questa funzione genera in automatico i Meta Tag SEO per Google e Facebook
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: product } = await supabase
    .from('products')
    .select('seo_title, seo_description, image_primary')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!product) return { title: 'Prodotto non trovato' };

  return {
    title: product.seo_title,
    description: product.seo_description,
    openGraph: {
      title: product.seo_title,
      description: product.seo_description,
      images: [product.image_primary],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  // 1. Fetching dati dal database
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !product) {
    notFound(); // Reindirizza alla pagina 404 se lo slug non esiste
  }

  // Check auth per mostrare il tasto "Modifica Prodotto"
  const ADMIN_EMAILS = ['sviluppo@creativiastudio.com'];
  let isAdmin = false;
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    isAdmin = !!user && ADMIN_EMAILS.includes(user.email || '');
  } catch (e) {
    // Non autenticato o eroe SSR
  }

  // 2. Prepariamo la galleria immagini (ordine esatto della scheda prodotto: 1_modella, 2_sfondo, 3_panoramica)
  // L'array product.gallery salvato dal sync script contiene già i file nell'ordine numerico corretto.
  const allImages = (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : [product.image_secondary, product.image_primary].filter(Boolean);

  // 3. Fetch varianti del gioiello (es. Oro / Argento per lo stesso modello)
  const baseSku = product.sku ? product.sku.split('-')[0] : null;
  let variants: any[] = [];
  if (baseSku && baseSku.length >= 3) {
    const { data: siblings } = await supabase
      .from('products')
      .select('id, name, sku, slug, plating, image_primary, gallery')
      .ilike('sku', `${baseSku}%`);
    if (siblings && siblings.length > 1) {
      variants = siblings;
    }
  }

  // 4. Logica Sconto
  const hasDiscount = product.discount_price && product.discount_price > 0 && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Navigazione Veloce */}
        <nav className="flex text-[11px] uppercase tracking-widest text-gray-400 mb-8 items-center gap-2">
          <Link href="/" className="hover:text-gray-900 transition">Home</Link>
          <ChevronRight size={12} />
          <Link href="#" className="hover:text-gray-900 transition">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Layout a 2 Colonne (Scorrimento Infinito Stile Zara) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          <ProductGallery images={allImages} productName={product.name} />

          {/* COLONNA DESTRA: DETTAGLI STICKY */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 flex flex-col">
            
            {/* Tagline Materiali */}
            <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-3">
              {product.materials} {product.plating && product.plating !== 'Nessuna' ? ` • ${product.plating}` : ''}
            </p>

            {/* Titolo Principale e Bottone Modifica */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl lg:text-4xl font-light text-gray-900 tracking-tight">
                {product.name}
              </h1>
              {isAdmin && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    SKU: {product.sku}
                  </span>
                  <Link 
                    href={`/admin?edit=${product.id}`}
                    className="px-3 py-1.5 bg-gray-900 text-white text-[10px] uppercase tracking-wider hover:bg-gray-800 transition flex items-center gap-1"
                  >
                    Modifica
                  </Link>
                </div>
              )}
            </div>

            {/* Prezzo */}
            <div className="flex items-end gap-3 mb-2">
              {hasDiscount ? (
                <>
                  <span className="text-2xl lg:text-3xl font-medium text-gray-900">
                    €{Number(product.discount_price).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through mb-1">
                    €{Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded tracking-wide mb-1.5">
                    -{discountPercentage}%
                  </span>
                </>
              ) : (
                <span className="text-2xl lg:text-3xl font-medium text-gray-900">
                  €{Number(product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Pagamento a rate info visuale */}
            <div className="flex flex-wrap items-center gap-2 mb-8 mt-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 mr-1">Oppure paga in 3 rate con:</span>
              <span className="bg-[#003087] text-white italic font-bold px-2 py-0.5 rounded text-[9px] tracking-wide shadow-sm">
                PayPal
              </span>
              <span className="bg-[#FFB3C7] text-black font-bold px-2 py-0.5 rounded-full text-[9px] tracking-wide shadow-sm">
                Klarna.
              </span>
              <span className="bg-[#FCE5E7] text-[#D81E5B] font-bold px-2 py-0.5 rounded-full text-[9px] tracking-wide shadow-sm">
                scalapay
              </span>
            </div>

            {/* Selettore Variante (es. Oro 18K / Argento) */}
            {variants.length > 1 && (
              <div className="mb-6 bg-[#FAF8F5] p-4 rounded-xl border border-[#F0E6E1]">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2.5 font-medium">
                  Seleziona Variante: <span className="text-gray-900 font-semibold">{product.plating || product.name}</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v) => {
                    const isCurrent = v.id === product.id;
                    const isGold = v.sku?.includes('GOLD') || v.plating?.toLowerCase().includes('oro') || v.name?.toLowerCase().includes('gold');
                    const isSilver = v.sku?.includes('SILVER') || v.plating?.toLowerCase().includes('argento') || v.name?.toLowerCase().includes('silver');
                    const label = v.plating || (isGold ? 'Oro 18K' : isSilver ? 'Argento' : v.name);
                    const dotColor = isGold ? 'bg-amber-400 border-amber-500' : isSilver ? 'bg-gray-300 border-gray-400' : 'bg-rose-300 border-rose-400';

                    return (
                      <Link
                        key={v.id}
                        href={`/prodotto/${v.slug}`}
                        className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition flex items-center gap-2 ${
                          isCurrent
                            ? 'border-gray-900 bg-gray-900 text-white shadow-sm ring-2 ring-gray-900/10'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border shrink-0 ${dotColor}`}></span>
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Misure (Se è un anello) */}
            {product.category === 'Anelli' && product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Seleziona Misura</span>
                  <button className="text-[11px] underline text-gray-500 hover:text-gray-900">Guida alle Taglie</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string | number) => (
                    <button key={size} className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center text-sm hover:border-gray-900 transition">
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottone Aggiungi al Carrello Reattivo */}
            <AddToCartButton product={product} />

            {/* Mini-Banner Fiducia */}
            <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-6 mb-8">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={20} className="text-[#C0A09A]" />
                <span className="text-[10px] uppercase tracking-wider text-gray-500">Spedizione Gratuita</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw size={20} className="text-[#C0A09A]" />
                <span className="text-[10px] uppercase tracking-wider text-gray-500">Reso 30 Giorni</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={20} className="text-[#C0A09A]" />
                <span className="text-[10px] uppercase tracking-wider text-gray-500">Qualità Garantita</span>
              </div>
            </div>

            {/* Descrizione */}
            <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Dettagli Tecnici (Accordion semplice) */}
            <div className="space-y-4">
              <details className="group border-b border-gray-200 pb-4">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-gray-900 uppercase tracking-widest">
                  Dettagli Materiali
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-gray-500 text-sm mt-4 space-y-2">
                  <p><span className="text-gray-800 font-medium">Materiale base:</span> {product.materials}</p>
                  <p><span className="text-gray-800 font-medium">Placcatura:</span> {product.plating}</p>
                  {product.gemstone && product.gemstone !== 'Nessuna' && (
                    <p><span className="text-gray-800 font-medium">Pietra principale:</span> {product.gemstone}</p>
                  )}
                  {product.carats && (
                    <p><span className="text-gray-800 font-medium">Carati:</span> {product.carats}</p>
                  )}
                </div>
              </details>

              <details className="group border-b border-gray-200 pb-4">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-gray-900 uppercase tracking-widest">
                  Cura del Gioiello
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-gray-500 text-sm mt-4 leading-relaxed">
                  Per mantenere inalterata la lucentezza della speciale placcatura Isabel Pepe, si consiglia di pulire il gioiello con un panno morbido. Pur essendo resistente all'acqua, evitare il contatto prolungato con profumi e detergenti aggressivi aiuterà a conservarne lo splendore per anni.
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>
      <StickyMobileAddToCart product={product} />
    </div>
  );
}

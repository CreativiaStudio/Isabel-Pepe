import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Gift, Heart } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import ProductGallery from '@/components/ProductGallery';
import StickyMobileAddToCart from '@/components/StickyMobileAddToCart';
import RingSizeSection from '@/components/RingSizeSection';
import ProductTrustBadges from '@/components/ProductTrustBadges';

// Questa funzione genera in automatico i Meta Tag SEO per Google e Facebook
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: product } = await supabase
    .from('products')
    .select('name, category, seo_title, seo_description, image_primary')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!product) return { title: 'Gioiello non trovato | Isabel Pepe' };

  const title = product.seo_title || `${product.name} — Gioiello Demi-Fine in Argento 925 & Oro 18K | Isabel Pepe`;
  const description = product.seo_description || `Scopri ${product.name} di Isabel Pepe: creazione demi-fine in Argento 925 con doppio scudo protettivo, pietre di pura luce e cofanetto di lusso incluso.`;

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      images: product.image_primary ? [product.image_primary] : [],
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
  const ADMIN_EMAILS = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com'];
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

  // 3. Fetch varianti colore reali dello stesso modello (es. Oro 18K / Rodio Silver per BTN005 o White/Pink per ASB4054)
  const skuParts = product.sku ? product.sku.split('-') : [];
  let variants: any[] = [];
  if (skuParts.length >= 2 && ['GOLD', 'SILVER', 'WHITE', 'PINK'].includes(skuParts[1]?.toUpperCase())) {
    const basePrefix = skuParts[0];
    const { data: siblings } = await supabase
      .from('products')
      .select('id, name, sku, slug, plating, gemstone, image_primary, gallery')
      .eq('category', product.category)
      .ilike('sku', `${basePrefix}-%`);
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
            
            {/* Tagline Materiali & Anteprima Specifiche */}
            {(() => {
              const baseMaterial = 'Argento 925 Nichel-Free';
              let cleanPlating = '';
              if (product.plating && product.plating !== 'Nessuna') {
                if (product.plating.toLowerCase().includes('oro')) {
                  cleanPlating = 'Oro 18K 1 Micron (20x Spessore) + E-Coating';
                } else if (product.plating.toLowerCase().includes('rodio')) {
                  cleanPlating = 'Finitura Rodio Puro a Specchio + E-Coating';
                } else {
                  cleanPlating = product.plating;
                }
              }

              let cleanGemstone = '';
              if (product.gemstone && product.gemstone !== 'Nessuna') {
                if (product.gemstone.toLowerCase().includes('moissanite')) {
                  cleanGemstone = 'Moissanite Certificata GRA VVS1';
                } else if (product.gemstone.toLowerCase().includes('perle')) {
                  cleanGemstone = "Perle d'Acqua Dolce Naturali";
                } else if (product.gemstone.toLowerCase().includes('rosa')) {
                  cleanGemstone = 'Cristalli di Luce Rosa';
                } else {
                  cleanGemstone = product.gemstone;
                }
              }

              return (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gray-500 font-medium mb-3 leading-relaxed">
                  <span>{baseMaterial}</span>
                  {cleanPlating && (
                    <>
                      <span className="text-[#C0A09A] font-bold">•</span>
                      <span>{cleanPlating}</span>
                    </>
                  )}
                  {cleanGemstone && (
                    <>
                      <span className="text-[#C0A09A] font-bold">•</span>
                      <span className="text-[#9E7D77] font-semibold">{cleanGemstone}</span>
                    </>
                  )}
                </div>
              );
            })()}

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

            {/* Selettore Varianti Reali (Finitura Metallo per Brera o Colore Pietra per Harmonie / Eden Rose) */}
            {variants.length > 1 && (() => {
              const isStoneColorVariant = variants.some(v => v.sku?.includes('PINK') || v.sku?.includes('WHITE'));
              const sectionTitle = isStoneColorVariant ? 'Colore Pietra Moissanite' : 'Finitura Metallo';

              return (
                <div className="mb-6 bg-[#FAF8F5] p-4 rounded-xl border border-[#F0E6E1]">
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2.5 font-medium">
                    {sectionTitle}: <span className="text-gray-900 font-semibold">{product.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {variants.map((v) => {
                      const isCurrent = v.id === product.id;
                      const isGold = v.sku?.includes('GOLD') || v.plating?.toLowerCase().includes('oro');
                      const isPink = v.sku?.includes('PINK') || v.gemstone?.toLowerCase().includes('rosa');
                      const isWhite = v.sku?.includes('WHITE');
                      
                      const label = isStoneColorVariant
                        ? isPink 
                          ? 'Moissanite Rosa Pink' 
                          : 'Moissanite Bianca D-Color'
                        : isGold 
                          ? 'Placcatura Oro 18K' 
                          : 'Rodio Puro Silver';

                      const dotColor = isPink 
                        ? 'bg-rose-300 border-rose-400' 
                        : isGold 
                          ? 'bg-amber-400 border-amber-500' 
                          : isWhite 
                            ? 'bg-gray-100 border-gray-300 shadow-inner' 
                            : 'bg-gray-300 border-gray-400';

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
              );
            })()}

            {/* Misure (Se è un anello) */}
            {(product.category === 'Anelli' || product.name.toLowerCase().includes('anello')) && (
              <RingSizeSection />
            )}

            {/* Bottone Aggiungi al Carrello Reattivo */}
            <AddToCartButton product={product} />

            {/* Mini-Banner Fiducia & 4 Pilastri con Popup Certificato */}
            <ProductTrustBadges product={product} />

            {/* Descrizione Formattata ad Alta Leggibilità */}
            <div className="mb-8">
              {(() => {
                const text = product.description || '';
                const firstBulletIndex = text.indexOf('•');
                
                let intro = text;
                let bullets: string[] = [];

                if (firstBulletIndex !== -1) {
                  intro = text.substring(0, firstBulletIndex)
                    .replace(/CARATTERISTICHE & VALORI ISABEL PEPE:?/gi, '')
                    .replace(/DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:?/gi, '')
                    .trim();
                  bullets = text.substring(firstBulletIndex)
                    .split('•')
                    .map((b: string) => b.trim())
                    .filter(Boolean);
                } else {
                  const paragraphs = text.split('\n').map((p: string) => p.trim()).filter(Boolean);
                  intro = paragraphs[0] || text;
                  bullets = paragraphs.slice(1);
                }

                return (
                  <div className="space-y-6">
                    {intro && (
                      <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed font-light">
                        {intro}
                      </p>
                    )}

                    {bullets.length > 0 && (
                      <div className="bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl p-5 sm:p-6 shadow-sm">
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-4">
                          Caratteristiche & Dettagli
                        </span>
                        <ul className="space-y-3">
                          {bullets.map((b: string, idx: number) => {
                            const clean = b
                              .replace(/^(CARATTERISTICHE & VALORI ISABEL PEPE:?|DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:?)/gi, '')
                              .trim();
                            if (!clean) return null;

                            const colonIdx = clean.indexOf(':');
                            if (colonIdx > 0 && colonIdx < 45) {
                              const title = clean.substring(0, colonIdx + 1);
                              const rest = clean.substring(colonIdx + 1);
                              return (
                                <li key={idx} className="flex items-start gap-3 text-xs sm:text-[13px] text-gray-600 leading-relaxed font-light">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0A09A] shrink-0 mt-2"></span>
                                  <span>
                                    <strong className="font-medium text-gray-900">{title}</strong>{rest}
                                  </span>
                                </li>
                              );
                            }

                            return (
                              <li key={idx} className="flex items-start gap-3 text-xs sm:text-[13px] text-gray-600 leading-relaxed font-light">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C0A09A] shrink-0 mt-2"></span>
                                <span>{clean}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
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
                <div className="text-gray-600 text-xs sm:text-[13px] mt-4 space-y-3 font-light leading-relaxed">
                  <div>
                    <strong className="text-gray-900 font-medium block mb-0.5">💎 Metallo Nobile di Base:</strong>
                    <p>100% Argento Sterling 925 anallergico e nichel-free (conforme agli standard europei REACH per la massima tollerabilità cutanea).</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 font-medium block mb-0.5">🛡️ Trattamento & Placcatura:</strong>
                    <p>{product.plating?.toLowerCase().includes('oro') 
                      ? "Placcatura in Oro 18K da 1.0 Micron — uno spessore fino a 20 volte superiore rispetto alla comune bigiotteria (che usa solo 0.05 micron), per una lucentezza calda e duratura che non si usura."
                      : "Finitura in Rodio Puro a specchio — il metallo più raro e nobile del platino, per una brillantezza metallica purissima e una protezione naturale contro l'annerimento dell'argento."
                    }</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 font-medium block mb-0.5">✨ Nano-Sigillo E-Coating:</strong>
                    <p>Uno scudo molecolare trasparente e ipoallergenico applicato sopra il metallo. Sigilla la superficie proteggendo il gioiello da acqua, sudore, ossidazione e piccoli graffi quotidiani.</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 font-medium block mb-0.5">🏷️ Sigillo di Autenticità & Punzone:</strong>
                    <p>Ogni singola creazione porta incise a laser le <strong>iniziali ufficiali "IP" (Isabel Pepe)</strong> e la punzonatura di garanzia legale <strong>"S925"</strong> che ne certifica l'autenticità e la purezza.</p>
                  </div>
                  {product.gemstone && product.gemstone !== 'Nessuna' && (
                    <div>
                      <strong className="text-gray-900 font-medium block mb-0.5">⭐ Pietre & Perle:</strong>
                      <p>{product.gemstone}</p>
                    </div>
                  )}
                  {product.carats && (
                    <div>
                      <strong className="text-gray-900 font-medium block mb-0.5">📏 Specifiche / Caratura:</strong>
                      <p>{product.carats}</p>
                    </div>
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
                  Per mantenere inalterata la lucentezza della speciale placcatura Isabel Pepe, si consiglia di pulire delicatamente il gioiello con il <strong>panno morbido in microfibra incluso nel tuo cofanetto luxury</strong>. Pur essendo resistente all'acqua, evitare il contatto prolungato con profumi e detergenti aggressivi aiuterà a conservarne lo splendore per anni.
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

import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import HeroVideoSlider from '@/components/HeroVideoSlider';
import CategoryCardSlider from '@/components/CategoryCardSlider';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Gift, HeartHandshake } from 'lucide-react';

export default async function Home() {
  // Fetch di 4 prodotti in evidenza dal DB per la sezione "I Più Amati"
  let featuredProducts: any[] = [];
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .not('image_primary', 'is', null)
      .limit(4);
    if (data) featuredProducts = data;
  } catch (err) {
    console.error('Home product fetch error:', err);
  }

  return (
    <main className="min-h-screen bg-white selection:bg-[#C0A09A] selection:text-white text-[#1A1A1A]">
      
      {/* 1. Cinematic Hero Section con Slider a 3 Video CDN */}
      <HeroVideoSlider />

      {/* 2. Sezione Esplora Le Collezioni (Griglia a 4 Categorie con 3 Foto Modella in Rotazione Ciascuna) */}
      <section className="py-24 bg-[#FAF8F5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-sans text-[11px] uppercase tracking-[0.35em] text-[#C0A09A] mb-3 block font-semibold">
              Esplora
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-widest text-[#1A1A1A] uppercase">
              Le Collezioni
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Categoria 1: Collane (3 Foto Modella) */}
            <CategoryCardSlider
              title="Collane"
              subtitle="Punti Luce & Pendenti"
              categoryLink="/shop?category=Collane"
              ctaText="Scopri la selezione"
              images={[
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-vend-me-pearl-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-siena-gold-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-isabel-romance-slot1.webp',
              ]}
            />

            {/* Categoria 2: Orecchini (3 Foto Modella) */}
            <CategoryCardSlider
              title="Orecchini"
              subtitle="Scintille di Luce"
              categoryLink="/shop?category=Orecchini"
              ctaText="Esplora gli stili"
              images={[
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-orecchini-duchesse-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-orecchini-soir-e-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-orecchini-r-ve-slot1.webp',
              ]}
            />

            {/* Categoria 3: Anelli (3 Foto Modella) */}
            <CategoryCardSlider
              title="Anelli"
              subtitle="Solitari & Pavé"
              categoryLink="/shop?category=Anelli"
              ctaText="Trova la misura"
              images={[
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-imperial-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-ch-telaine-silver-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-lune-d-argent-slot1.webp',
              ]}
            />

            {/* Categoria 4: I Set Royale (3 Foto Modella) */}
            <CategoryCardSlider
              title="I Set Royale"
              subtitle="Edizioni Esclusive"
              categoryLink="/shop?category=Set"
              ctaText="Vedi la Parure"
              images={[
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-vivienne-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-versailles-slot1.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-papillon-splendeur-slot1.webp',
              ]}
            />
          </div>
        </div>
      </section>

      {/* 3. Prodotti Dinamici dal Database (I Più Amati) */}
      <section className="py-28 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-100 pb-8">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] mb-3 block font-semibold">
                Selezione Esclusiva
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl tracking-widest text-[#1A1A1A] uppercase">
                I Più Amati
              </h2>
            </div>
            <Link 
              href="/shop" 
              className="hidden md:inline-block border-b border-gray-900 pb-1 text-[11px] tracking-[0.25em] uppercase hover:text-[#C0A09A] hover:border-[#C0A09A] transition-colors duration-500 font-medium"
            >
              Vedi Tutti i Gioielli
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {featuredProducts && featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link 
              href="/shop" 
              className="inline-block border-b border-gray-900 pb-1 text-[11px] tracking-[0.2em] uppercase hover:text-[#C0A09A] hover:border-[#C0A09A] transition-colors duration-500 font-medium"
            >
              Vedi Tutti I Gioielli
            </Link>
          </div>
        </div>
      </section>

      {/* 4. I 4 Pilastri Isabel Pepe (Doppio Scudo, Cofanetto Signature, Pietre di Luce, L'Arte del Dono) */}
      {/* 4. Pilastri del Valore Isabel Pepe */}
      <section className="py-24 bg-[#141414] text-white border-y border-white/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-center items-stretch">
            
            {/* Pilastro 1: Doppio Scudo Protettivo */}
            <div className="flex flex-col items-center px-2 h-full">
              <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 border border-[#C0A09A]/30 flex items-center justify-center mb-6 shadow-inner shrink-0">
                <ShieldCheck size={28} className="text-[#C0A09A]" />
              </div>
              <h4 className="font-serif text-lg tracking-widest uppercase mb-3 text-white leading-snug min-h-[48px] flex items-center justify-center">
                Doppio Scudo<br />Protettivo
              </h4>
              <p className="font-sans text-gray-400 text-xs tracking-wider leading-relaxed font-light max-w-xs">
                Base in puro Argento 925 con placcatura Oro 18K da 1 Micron (20 volte più spessa) o Rodio a specchio e nanoprotezione E-Coating.
              </p>
            </div>

            {/* Pilastro 2: Cofanetto Luxury */}
            <div className="flex flex-col items-center px-2 h-full">
              <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 border border-[#C0A09A]/30 flex items-center justify-center mb-6 shadow-inner shrink-0">
                <Gift size={28} className="text-[#C0A09A]" />
              </div>
              <h4 className="font-serif text-lg tracking-widest uppercase mb-3 text-white leading-snug min-h-[48px] flex items-center justify-center">
                Cofanetto Luxury<br />& Certificato
              </h4>
              <p className="font-sans text-gray-400 text-xs tracking-wider leading-relaxed font-light max-w-xs">
                Astuccio rigido di alta gamma, panno in microfibra per la cura del gioiello e Certificato Ufficiale di Autenticità in ogni ordine.
              </p>
            </div>

            {/* Pilastro 3: Pietre di Pura Luce */}
            <div className="flex flex-col items-center px-2 h-full">
              <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 border border-[#C0A09A]/30 flex items-center justify-center mb-6 shadow-inner shrink-0">
                <Sparkles size={28} className="text-[#C0A09A]" />
              </div>
              <h4 className="font-serif text-lg tracking-widest uppercase mb-3 text-white leading-snug min-h-[48px] flex items-center justify-center">
                Pietre Scelte<br />di Pura Luce
              </h4>
              <p className="font-sans text-gray-400 text-xs tracking-wider leading-relaxed font-light max-w-xs">
                Moissanite certificata GRA Taglio Brillante VVS1 D-Color e perle d'acqua dolce naturali ad altissima rifrazione di luce eterna.
              </p>
            </div>

            {/* Pilastro 4: L'Arte del Dono */}
            <div className="flex flex-col items-center px-2 h-full">
              <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 border border-[#C0A09A]/30 flex items-center justify-center mb-6 shadow-inner shrink-0">
                <HeartHandshake size={28} className="text-[#C0A09A]" />
              </div>
              <h4 className="font-serif text-lg tracking-widest uppercase mb-3 text-white leading-snug min-h-[48px] flex items-center justify-center">
                L'Arte del Dono<br />per gli Animali
              </h4>
              <p className="font-sans text-gray-400 text-xs tracking-wider leading-relaxed font-light max-w-xs">
                Il 5% di ogni tuo acquisto sostiene direttamente i volontari sul campo dedicati alla salvezza e alla cura di animali in pericolo.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Manifesto Brand Isabel Pepe con Sfondo Luxury & Bagliore Caldo */}
      <section className="relative py-32 sm:py-40 px-6 text-center overflow-hidden bg-[#141414] text-white">
        {/* Immagine di Sfondo Editoriale (Seta & Marmo Nero con Punto Luce & Tennis Isabel Pepe) */}
        <img 
          src="/Brand/manifesto_bg.jpg?v=p1" 
          alt="Isabel Pepe Luxury Atmosphere" 
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter brightness-[0.8] contrast-[1.05]"
        />

        {/* Overlay Gradiente Scuro Caldo & Vignettatura */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-[#161211]/85 to-[#141414]"></div>
        
        {/* Bagliore Radiale Rosa Isabel Pepe al Centro */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(192,160,154,0.18)_0%,_transparent_65%)] pointer-events-none"></div>

        {/* Contenuto Manifesto */}
        <div className="max-w-[850px] mx-auto relative z-10">
          
          {/* Logo Monogramma IP in Puro Rosa Champagne con Shimmer Lento */}
          <div className="relative inline-block mx-auto mb-8 sm:mb-10">
            <div 
              role="img"
              aria-label="Isabel Pepe Monogramma Ufficiale Rosa Champagne"
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto logo-champagne-shimmer" 
            />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl tracking-wide leading-tight mb-8 drop-shadow-md text-white font-light">
            L'eleganza senza tempo incontra l'essenza dell'anima.
          </h2>
          <p className="font-sans text-gray-300 text-xs sm:text-sm tracking-[0.25em] uppercase leading-loose max-w-xl mx-auto font-light mb-10 drop-shadow-sm">
            Gioielli demi-fine disegnati per vivere, viaggiare e risplendere ogni giorno. Perché il vero lusso è sentirsi uniche.
          </p>
          <Link 
            href="/chi-siamo" 
            className="inline-block bg-gradient-to-r from-[#C0A09A] via-[#B8938C] to-[#A8827B] hover:from-[#B8938C] hover:via-[#A8827B] hover:to-[#9E7770] text-white px-10 py-4 text-xs uppercase tracking-[0.3em] font-medium transition-all duration-300 rounded-xl shadow-[0_8px_25px_-4px_rgba(192,160,154,0.5)] border border-white/20 active:scale-95"
          >
            Esplora il Mondo Isabel Pepe
          </Link>
        </div>
      </section>

    </main>
  );
}

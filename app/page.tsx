import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import HeroVideoSlider from '@/components/HeroVideoSlider';
import CategoryCardSlider from '@/components/CategoryCardSlider';
import Link from 'next/link';
import { Sparkles, Crown, PackageCheck } from 'lucide-react';

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
              subtitle="Haute Joaillerie"
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
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-moissanite-slot1-1786131084980.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-multi-moissanite-slot1-1786110533604.webp',
                'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-s925-moissanite-silver-slot1-1786102405179.webp',
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

      {/* 4. Sezione Valori & Garanzia Materiali Preziosi (Icone Vettoriali Premium Rose-Gold) */}
      <section className="py-24 bg-[#141414] text-white border-y border-white/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            {/* Valore 1: Argento 925 & Moissanite */}
            <div className="flex flex-col items-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 border border-[#C0A09A]/30 flex items-center justify-center mb-6 shadow-inner">
                <Sparkles size={28} className="text-[#C0A09A]" />
              </div>
              <h4 className="font-serif text-xl tracking-widest uppercase mb-3 text-white">
                Argento 925 & Moissanite
              </h4>
              <p className="font-sans text-gray-400 text-xs tracking-wider leading-relaxed font-light max-w-sm">
                Utilizziamo solo Argento 925 anallergico nichel-free ed incastoniamo Moissanite di altissima purezza.
              </p>
            </div>

            {/* Valore 2: Placcatura Oro 18K */}
            <div className="flex flex-col items-center px-4 border-y md:border-y-0 md:border-x border-white/10 py-10 md:py-0">
              <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 border border-[#C0A09A]/30 flex items-center justify-center mb-6 shadow-inner">
                <Crown size={28} className="text-[#C0A09A]" />
              </div>
              <h4 className="font-serif text-xl tracking-widest uppercase mb-3 text-white">
                Placcatura Oro 18K
              </h4>
              <p className="font-sans text-gray-400 text-xs tracking-wider leading-relaxed font-light max-w-sm">
                Placcatura ad alto spessore in Oro 18K per garantire una brillantezza inalterabile ed una resistenza unica nel tempo.
              </p>
            </div>

            {/* Valore 3: Packaging & Consegna */}
            <div className="flex flex-col items-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 border border-[#C0A09A]/30 flex items-center justify-center mb-6 shadow-inner">
                <PackageCheck size={28} className="text-[#C0A09A]" />
              </div>
              <h4 className="font-serif text-xl tracking-widest uppercase mb-3 text-white">
                Packaging & Consegna 24/48h
              </h4>
              <p className="font-sans text-gray-400 text-xs tracking-wider leading-relaxed font-light max-w-sm">
                Ogni gioiello viaggia all'interno del nostro speciale cofanetto regalo con etichetta express e reso garantito 30 giorni.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Manifesto Brand Isabel Pepe */}
      <section className="bg-black text-white py-32 px-6 text-center relative overflow-hidden">
        <div className="max-w-[850px] mx-auto relative z-10">
          <img 
            src="/Brand/logotipo-isabel.png" 
            alt="Isabel Pepe Logotipo" 
            className="h-14 mx-auto mb-10 opacity-90 invert brightness-200" 
          />
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl tracking-widest leading-tight mb-8">
            L'arte orafa incontra l'essenza dell'anima.
          </h2>
          <p className="font-sans text-gray-400 text-xs sm:text-sm tracking-[0.25em] uppercase leading-loose max-w-xl mx-auto font-light mb-10">
            Disegnati a mano, realizzati con etica e passione. Perché il vero lusso non si ostenta, si vive.
          </p>
          <Link 
            href="/shop" 
            className="inline-block bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 px-10 py-4 text-xs uppercase tracking-[0.3em] font-medium transition-all duration-500"
          >
            Esplora il Mondo Isabel Pepe
          </Link>
        </div>
      </section>

    </main>
  );
}

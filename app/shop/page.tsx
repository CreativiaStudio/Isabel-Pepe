import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import type { Metadata } from 'next';

const categorySeo: Record<string, { title: string; desc: string; h1: string; intro: string }> = {
  Collane: {
    title: 'Collane Punto Luce & Pendenti Demi-Fine in Oro 18K',
    desc: 'Collane girocollo e punti luce di scintillio puro in Argento 925 placcato Oro 18K. L\'idea regalo ideale per illuminare il decolleté con grazia e raffinatezza.',
    h1: 'Collane & Pendenti di Luce',
    intro: 'Punti luce e pendenti progettati per catturare ogni raggio di luce. Argento 925 rifinito in Oro 18K o Rodio e cofanetto luxury incluso.',
  },
  Orecchini: {
    title: 'Orecchini Ipoallergenici di Luce in Oro 18K & Rodio',
    desc: 'Cerchi, pendenti e punti luce ipoallergenici in Argento 925 e Oro 18K. Brillantezza inalterabile ed eleganza per pelli sensibili. Cofanetto velluto incluso.',
    h1: 'Orecchini di Pura Luce',
    intro: 'Scintille delicate per ogni giorno: orecchini anallergici in Argento 925 con doppio scudo protettivo per una brillantezza eterna.',
  },
  Anelli: {
    title: 'Anelli Solitari, Pavé & Verette Demi-Fine in Oro 18K',
    desc: 'Anelli di fidanzamento, solitari taglio brillante e verette pavé in Argento 925 e Oro 18K. Un pegno d\'amore senza tempo custodito nel cofanetto regalo rigido.',
    h1: 'Anelli Solitari & Verette',
    intro: 'Linee pure e scintillio eterno: creazioni nate per celebrare i momenti più speciali con l’eleganza del lusso accessibile.',
  },
  Bracciali: {
    title: 'Bracciali Tennis & Catene Eleganti in Oro 18K & Rodio',
    desc: 'Bracciali tennis scintillanti e catene a maglia morbida in Argento 925 nobilitato in Oro 18K. Chiusure di sicurezza rinforzate per il lusso di ogni giorno.',
    h1: 'Bracciali & Tennis Royale',
    intro: 'Scintille al polso per ogni occasione: bracciali in Argento 925 con finiture nobili in Oro 18K o Rodio Puro e chiusure di sicurezza rinforzate.',
  },
  Set: {
    title: 'Parure & Set Regalo Royale | Gioielli Coordinati di Lusso',
    desc: 'Parure coordinate esclusive Isabel Pepe per cerimonie, anniversari e regali indimenticabili. Cofanetto Luxury, panno microfibra e Certificato inclusi.',
    h1: 'I Set Royale & Parure',
    intro: 'Parure coordinate pensate per un dono memorabile o per un look impeccabile. Cofanetto Luxury, panno microfibra e Certificato di Autenticità inclusi.',
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const cat = resolvedParams.category as string | undefined;

  if (cat && categorySeo[cat]) {
    const seo = categorySeo[cat];
    return {
      title: seo.title,
      description: seo.desc,
      openGraph: {
        title: `${seo.title} | Isabel Pepe`,
        description: seo.desc,
      },
    };
  }

  return {
    title: 'Collezione Gioielli Demi-Fine | Idee Regalo Donna & Parure',
    description:
      'Esplora l\'intera collezione di gioielli demi-fine Isabel Pepe: solitari, collane punto luce, orecchini e bracciali tennis in Oro 18K. Cofanetto luxury in velluto in omaggio.',
    openGraph: {
      title: 'Collezione Completa Gioielli Demi-Fine | Isabel Pepe',
      description:
        'Trova il regalo perfetto o concediti un tocco di luce quotidiana. Creazioni in Argento 925 placcato Oro 18K con cofanetto signature.',
    },
  };
}

// Gestione dei parametri in Next.js 15 (asincroni)
export default async function ShopPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;
  const categoryFilter = resolvedParams.category as string | undefined;
  const activeSeo = categoryFilter ? categorySeo[categoryFilter] : null;

  // Query al database: mostra solo prodotti attivi (is_active = true)
  let query = supabase.from('products').select('*').eq('is_active', true);
  
  if (categoryFilter) {
    query = query.eq('category', categoryFilter);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Errore fetch prodotti shop:', error);
  }

  const categorie = ['Tutti', 'Bracciali', 'Collane', 'Anelli', 'Orecchini', 'Set'];

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-2">
            Demi-Fine Jewelry
          </span>
          <h1 className="font-serif text-4xl md:text-5xl tracking-widest text-[#1A1A1A] mb-4 uppercase">
            {activeSeo?.h1 || categoryFilter || 'Tutta la Collezione'}
          </h1>
          <p className="font-sans text-gray-500 text-xs sm:text-sm tracking-wide leading-relaxed mb-3">
            {activeSeo?.intro || 'Creazioni demi-fine realizzate con Argento 925 Sterling, placcatura spessa Oro 18K e Rodio.'}
          </p>
          <p className="font-sans text-gray-400 text-xs tracking-widest uppercase">
            {products?.length || 0} Gioielli Disponibili
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filtri (Desktop) */}
          <aside className="w-full lg:w-1/4 xl:w-1/5 hidden lg:block">
            <div className="sticky top-32">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-gray-100 pb-2">
                Categorie
              </h2>
              <ul className="space-y-4">
                {categorie.map((cat) => {
                  const href = cat === 'Tutti' ? '/shop' : `/shop?category=${cat}`;
                  const isActive = (cat === 'Tutti' && !categoryFilter) || categoryFilter === cat;
                  
                  return (
                    <li key={cat}>
                      <Link 
                        href={href}
                        className={`font-sans text-sm tracking-widest uppercase transition-colors duration-300 hover:text-[#C0A09A] ${
                          isActive ? 'text-[#1A1A1A] font-semibold' : 'text-gray-500'
                        }`}
                      >
                        {cat}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Filtri Mobile (Orizzontali a scorrimento) */}
          <div className="lg:hidden flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
            {categorie.map((cat) => {
              const href = cat === 'Tutti' ? '/shop' : `/shop?category=${cat}`;
              const isActive = (cat === 'Tutti' && !categoryFilter) || categoryFilter === cat;
              
              return (
                <Link 
                  key={cat}
                  href={href}
                  className={`snap-start whitespace-nowrap px-6 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-colors ${
                    isActive 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#C0A09A]'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Griglia Prodotti */}
          <main className="w-full lg:w-3/4 xl:w-4/5">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 lg:gap-x-8 lg:gap-y-16">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border border-gray-100 bg-[#FAFAFA]">
                <p className="font-serif text-2xl text-gray-400 mb-4">Nessun gioiello trovato</p>
                <Link href="/shop" className="text-sm border-b border-gray-900 pb-1 hover:text-[#C0A09A] hover:border-[#C0A09A] transition">
                  Torna alla collezione completa
                </Link>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

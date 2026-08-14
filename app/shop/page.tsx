import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

// Gestione dei parametri in Next.js 15 (asincroni)
export default async function ShopPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;
  const categoryFilter = resolvedParams.category as string | undefined;

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
        
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl tracking-widest text-[#1A1A1A] mb-4 uppercase">
            {categoryFilter || 'Tutta la Collezione'}
          </h1>
          <p className="font-sans text-gray-500 text-sm tracking-widest uppercase">
            {products?.length || 0} Gioielli
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

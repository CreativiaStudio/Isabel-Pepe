import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateInventoryValue() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, sku, category, price, discount_price, stock, is_active')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  let totalRevenueFullPrice = 0;
  let totalRevenueActualPrice = 0;
  let totalUnits = 0;
  let activeProductsCount = 0;

  const categoryStats: Record<string, { count: number; units: number; revenue: number; items: any[] }> = {};

  console.log('========================================================================');
  console.log('              💎 ISABEL PEPE — ANALISI VALORE MAGAZZINO 💎             ');
  console.log('========================================================================\n');

  products.forEach(p => {
    const unitPrice = (p.discount_price && p.discount_price > 0 && p.discount_price < p.price) ? p.discount_price : p.price;
    const stockUnits = p.stock || 0;
    const itemRevenue = unitPrice * stockUnits;
    const fullPriceRevenue = p.price * stockUnits;

    if (p.is_active !== false) {
      activeProductsCount++;
      totalUnits += stockUnits;
      totalRevenueActualPrice += itemRevenue;
      totalRevenueFullPrice += fullPriceRevenue;

      const cat = p.category || 'Altro';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { count: 0, units: 0, revenue: 0, items: [] };
      }
      categoryStats[cat].count++;
      categoryStats[cat].units += stockUnits;
      categoryStats[cat].revenue += itemRevenue;
      categoryStats[cat].items.push({
        name: p.name,
        sku: p.sku,
        price: p.price,
        effectivePrice: unitPrice,
        stock: stockUnits,
        total: itemRevenue
      });
    }
  });

  for (const cat in categoryStats) {
    console.log(`📦 CATEGORIA: ${cat.toUpperCase()} (${categoryStats[cat].count} Modelli | ${categoryStats[cat].units} Pezzi Totali)`);
    console.log('------------------------------------------------------------------------');
    categoryStats[cat].items.forEach(item => {
      console.log(`  • ${item.name.padEnd(28)} | SKU: ${(item.sku || '-').padEnd(14)} | Q.tà: ${String(item.stock).padStart(2)} | Prezzo: €${String(item.effectivePrice).padStart(4)} | Totale: €${String(item.total).padStart(6)}`);
    });
    console.log(`  👉 Totale Categoria ${cat}: €${categoryStats[cat].revenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}\n`);
  }

  console.log('========================================================================');
  console.log('                         RIASSUNTO GLOBALE                              ');
  console.log('========================================================================');
  console.log(`✨ Modelli Attivi a Catalogo: ${activeProductsCount}`);
  console.log(`📦 Pezzi Totali in Magazzino: ${totalUnits} unità`);
  console.log(`💰 FATTURATO TOTALE POTENZIALE (Sold Out): €${totalRevenueActualPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
  console.log(`🏷️  Valore di Listino Pieno: €${totalRevenueFullPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`);
  console.log(`📊 Scontrino Medio Stimato per Pezzo (AOV/Unit): €${(totalRevenueActualPrice / totalUnits).toFixed(2)}`);
  console.log('========================================================================');
}

calculateInventoryValue().catch(console.error);

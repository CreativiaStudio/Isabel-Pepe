import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carica variabili d'ambiente
const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const invoiceData: any[] = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/invoice_data.json'), 'utf8'));

async function audit() {
  console.log("================ INIZIO AUDIT FATTURA vs DATABASE ================");
  const { data: dbProducts, error } = await supabaseAdmin.from('products').select('*').order('sku');
  if (error || !dbProducts) {
    console.error("Errore fetch DB:", error);
    return;
  }

  console.log(`Prodotti in DB: ${dbProducts.length}`);
  console.log(`Voci in Fattura: ${invoiceData.length}\n`);

  const report: any[] = [];

  for (const inv of invoiceData) {
    const dbMatch = dbProducts.find(p => p.sku?.toLowerCase() === inv.sku?.toLowerCase() || p.sku?.toLowerCase().startsWith(inv.sku?.toLowerCase()));
    
    report.push({
      sku: inv.sku,
      invoiceName: inv.name,
      invoicePlating: inv.plating,
      invoiceCarats: inv.carats,
      invoiceGemstone: inv.gemstone,
      invoiceCategory: inv.category,
      invoiceCost: inv.cost,
      dbFound: !!dbMatch,
      dbName: dbMatch?.name || 'NON TROVATO',
      dbPlating: dbMatch?.plating || 'N/A',
      dbCarats: dbMatch?.carats || 'N/A',
      dbGemstone: dbMatch?.gemstone || 'N/A',
      dbPrice: dbMatch?.price || 'N/A'
    });
  }

  console.table(report);

  // Trova prodotti nel DB che non hanno riscontro in fattura
  const orphanDb = dbProducts.filter(p => !invoiceData.some(inv => p.sku?.toLowerCase() === inv.sku?.toLowerCase() || p.sku?.toLowerCase().startsWith(inv.sku?.toLowerCase())));
  if (orphanDb.length > 0) {
    console.log("\nProdotti nel DB senza SKU esatto in fattura:", orphanDb.map(p => ({ id: p.id, name: p.name, sku: p.sku })));
  }
}

audit();

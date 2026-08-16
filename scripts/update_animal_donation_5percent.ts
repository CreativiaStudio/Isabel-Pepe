import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDonations() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabase.from('products').select('id, name, description');

  if (error || !products) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Updating donation copy to "Il 5%"...`);

  let updatedCount = 0;

  for (const product of products) {
    let desc = product.description || '';
    
    // Replace old variants of donation copy with exact "Il 5%"
    const oldPatterns = [
      /• L'Arte del Dono: Una quota di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi\./gi,
      /• 🐾 L'Arte del Dono: Una parte di ogni acquisto viene devoluta per sostenere rifugi e cure veterinarie per animali in difficoltà\./gi,
      /• L'Arte del Dono: Una parte di ogni acquisto viene devoluta per sostenere rifugi e cure veterinarie per animali in difficoltà\./gi,
      /• L'Arte del Dono:.*?salvaguardia degli animali.*?\./gi
    ];

    let newDesc = desc;
    let replaced = false;

    for (const pattern of oldPatterns) {
      if (pattern.test(newDesc)) {
        newDesc = newDesc.replace(pattern, "• L'Arte del Dono: Il 5% di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi.");
        replaced = true;
        break;
      }
    }

    if (!replaced && desc.includes("L'Arte del Dono")) {
      newDesc = desc.replace(/L'Arte del Dono:.*?$/m, "L'Arte del Dono: Il 5% di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi.");
      replaced = true;
    }

    if (newDesc !== desc) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ description: newDesc })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.name} (${product.id}):`, updateError);
      } else {
        updatedCount++;
        console.log(`✓ Updated [${product.name}]`);
      }
    } else {
      console.log(`- Already up to date: [${product.name}]`);
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} products to exact "Il 5%" donation phrasing!`);
}

updateDonations();

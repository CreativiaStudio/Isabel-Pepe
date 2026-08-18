import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function auditAndFixPearlProducts() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*');

  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Auditing ${products.length} products for pearls and certificate accuracy...\n`);

  const pearlProducts = [];
  const moissaniteProducts = [];
  const metalOnlyProducts = [];

  for (const prod of products) {
    const combinedText = `${prod.name} ${prod.description} ${prod.gemstone} ${prod.materials} ${prod.category}`.toLowerCase();
    const isPearl = combinedText.includes('perl');
    const isMoissanite = combinedText.includes('moissanite') || combinedText.includes('vvs1') || combinedText.includes('d-color');

    if (isPearl) {
      pearlProducts.push(prod);
    } else if (isMoissanite) {
      moissaniteProducts.push(prod);
    } else {
      metalOnlyProducts.push(prod);
    }
  }

  console.log(`=== AUDIT SUMMARY ===`);
  console.log(`• Pearl Products found: ${pearlProducts.length}`);
  console.log(`• Moissanite Products (with official GRA certificate): ${moissaniteProducts.length}`);
  console.log(`• Metal-only Products: ${metalOnlyProducts.length}\n`);

  console.log(`=== PEARL PRODUCTS DETAILS ===`);
  for (const prod of pearlProducts) {
    console.log(`\nSKU: ${prod.sku} | Name: ${prod.name} | Slug: ${prod.slug}`);
    console.log(`Gemstone: ${prod.gemstone}`);
    
    let desc = prod.description || '';
    let updated = false;

    // Check for certificate mentions in description
    if (desc.includes('Certificato Ufficiale di Autenticità') || desc.includes('Certificato di Autenticità') || desc.includes('Certificato') || desc.includes('certificato')) {
      console.log('⚠️ Found certificate mention in pearl product description! Fixing...');
      
      // Standard packaging for pearls (NO certificate)
      desc = desc
        .replace(/• Packaging Esclusivo:[^\n]+\n?/g, '• Packaging Esclusivo: Cofanetto Luxury Isabel Pepe e panno speciale in microfibra inclusi in ogni ordine.\n')
        .replace(/Certificato Ufficiale di Autenticità e Qualità/gi, 'Cofanetto Luxury e panno in microfibra')
        .replace(/Certificato Ufficiale di Autenticità inclusi/gi, 'Cofanetto Luxury e panno in microfibra inclusi')
        .replace(/Certificato di Autenticità inclusi/gi, 'Cofanetto Luxury e panno in microfibra inclusi')
        .replace(/Certificato di Autenticità e Cofanetto Luxury inclusi/gi, 'Cofanetto Luxury e panno in microfibra inclusi')
        .replace(/e Certificato Ufficiale di Autenticità/gi, '')
        .replace(/e Certificato di Autenticità/gi, '')
        .replace(/, Certificato di Autenticità/gi, '')
        .replace(/Certificato Ufficiale di Autenticità/gi, 'Cofanetto Luxury');
      
      updated = true;
    }

    let seoDesc = prod.seo_description || '';
    if (seoDesc.includes('certificat') || seoDesc.includes('Certificat')) {
      console.log('⚠️ Found certificate mention in pearl SEO description! Fixing...');
      seoDesc = seoDesc
        .replace(/, certificato di garanzia/gi, '')
        .replace(/certificato di garanzia e /gi, '')
        .replace(/e garanzia inclusi/gi, 'inclusi')
        .replace(/e certificato inclusi/gi, 'inclusi')
        .replace(/e certificato di autenticità/gi, '')
        .replace(/certificato di autenticità e /gi, '');
      updated = true;
    }

    if (updated) {
      console.log('Saving cleaned pearl product to Supabase...');
      const { error: updateErr } = await supabaseAdmin
        .from('products')
        .update({
          description: desc,
          seo_description: seoDesc
        })
        .eq('id', prod.id);

      if (updateErr) {
        console.error(`Error updating ${prod.name}:`, updateErr);
      } else {
        console.log(`✅ ${prod.name} updated successfully without certificate claims.`);
      }
    } else {
      console.log(`✅ ${prod.name} is already clean (no certificate claims).`);
    }
  }
}

auditAndFixPearlProducts().catch(console.error);

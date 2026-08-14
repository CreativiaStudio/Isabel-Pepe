const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync('./.agents/explorer_catalog/db_dump.json', 'utf8'));

console.log("=== COMPREHENSIVE PRODUCT AUDIT ===");

// 1. Check schema & missing fields
const fields = [
  'sku', 'name', 'slug', 'description', 'price', 'discount_price',
  'weight', 'dimensions', 'image_primary', 'image_secondary', 'gallery',
  'category', 'stock', 'materials', 'plating', 'gemstone', 'carats', 'sizes',
  'seo_title', 'seo_description', 'stripe_product_id', 'stripe_price_id', 'is_active'
];

const counts = {};
fields.forEach(f => counts[f] = 0);

let provisionalDescCount = 0;
let activeCount = 0;
let inactiveCount = 0;

const productRows = [];

products.forEach(p => {
  if (p.is_active) activeCount++;
  else inactiveCount++;

  if (p.description && p.description.includes('Descrizione provvisoria')) {
    provisionalDescCount++;
  }

  const missingInThisProduct = [];
  fields.forEach(f => {
    const val = p[f];
    let isMissing = false;
    if (val === undefined || val === null) isMissing = true;
    else if (typeof val === 'string' && val.trim() === '') isMissing = true;
    else if (Array.isArray(val) && val.length === 0) isMissing = true;
    else if (f === 'gallery' && Array.isArray(val)) {
      const nonArrayEmpty = val.filter(x => typeof x === 'string' && x.trim() !== '');
      if (nonArrayEmpty.length === 0) isMissing = true;
    }

    if (isMissing) {
      counts[f]++;
      missingInThisProduct.push(f);
    }
  });

  // Calculate gallery completeness
  let filledSlots = 0;
  if (Array.isArray(p.gallery)) {
    filledSlots = p.gallery.filter(x => typeof x === 'string' && x.trim() !== '').length;
  }

  productRows.push({
    sku: p.sku || 'MISSING',
    name: p.name || 'MISSING',
    category: p.category || 'MISSING',
    price: p.price ?? 'MISSING',
    stock: p.stock ?? 'MISSING',
    is_active: p.is_active,
    has_provisional_desc: p.description ? p.description.includes('Descrizione provvisoria') : false,
    image_primary_url: p.image_primary || 'NULL',
    filled_gallery_slots: filledSlots,
    missing_fields_count: missingInThisProduct.length,
    missing_fields_list: missingInThisProduct.join(', ')
  });
});

console.log("Field Missing Counts:", counts);
console.log(`Active: ${activeCount}, Inactive: ${inactiveCount}`);
console.log(`Provisional Description Count: ${provisionalDescCount} / ${products.length}`);

// Write JSON audit
fs.writeFileSync('./.agents/explorer_catalog/detailed_audit.json', JSON.stringify({
  totalProducts: products.length,
  activeCount,
  inactiveCount,
  provisionalDescCount,
  missingCountsPerField: counts,
  products: productRows
}, null, 2));


const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./.agents/explorer_catalog/db_dump.json', 'utf8'));

console.log(`Analyzing ${products.length} products...`);

// List of expected fields in standard e-commerce & project spec:
// SKU, title (name), description, price, weight, dimensions, images (primary, secondary, gallery), category, inventory (stock), materials, SEO fields (seo_title, seo_description)

const fieldsToAudit = [
  'sku',
  'name',
  'slug',
  'description',
  'price',
  'discount_price',
  'weight',
  'dimensions',
  'image_primary',
  'image_secondary',
  'gallery',
  'category',
  'stock',
  'materials',
  'plating',
  'gemstone',
  'carats',
  'sizes',
  'seo_title',
  'seo_description',
  'stripe_product_id',
  'stripe_price_id',
  'is_active'
];

const missingCounts = {};
fieldsToAudit.forEach(f => missingCounts[f] = 0);

const perProductAnalysis = [];

let r2PrimaryCount = 0;
let localPrimaryCount = 0;
let unsplashPrimaryCount = 0;
let nullPrimaryCount = 0;
let otherPrimaryCount = 0;

let slotStats = { slot1: 0, slot2: 0, slot3: 0, slot4: 0, slot5: 0 };
let r2GalleryCount = 0;
let localGalleryCount = 0;
let emptyGalleryCount = 0;

products.forEach((p, idx) => {
  const missingInProduct = [];

  // Check each field
  fieldsToAudit.forEach(field => {
    let val = p[field];
    let isMissing = false;

    if (val === undefined || val === null) {
      isMissing = true;
    } else if (typeof val === 'string' && val.trim() === '') {
      isMissing = true;
    } else if (Array.isArray(val) && val.length === 0) {
      isMissing = true;
    } else if (field === 'gallery' && Array.isArray(val)) {
      // Check if gallery is all empty strings or contains valid images
      const nonArrayEmpty = val.filter(item => typeof item === 'string' && item.trim() !== '');
      if (nonArrayEmpty.length === 0) {
        isMissing = true;
      }
    } else if (field === 'description' && val.includes('Descrizione provvisoria')) {
      // Dummy description flag
      // We will note it
    }

    if (isMissing) {
      missingCounts[field]++;
      missingInProduct.push(field);
    }
  });

  // Image primary audit
  const primary = p.image_primary;
  if (!primary) nullPrimaryCount++;
  else if (primary.includes('r2.dev') || primary.includes('cloudflarestorage.com')) r2PrimaryCount++;
  else if (primary.startsWith('/Products/') || primary.startsWith('/')) localPrimaryCount++;
  else if (primary.includes('unsplash.com')) unsplashPrimaryCount++;
  else otherPrimaryCount++;

  // Gallery audit
  const gal = Array.isArray(p.gallery) ? p.gallery : [];
  if (gal[0] && gal[0].trim()) slotStats.slot1++;
  if (gal[1] && gal[1].trim()) slotStats.slot2++;
  if (gal[2] && gal[2].trim()) slotStats.slot3++;
  if (gal[3] && gal[3].trim()) slotStats.slot4++;
  if (gal[4] && gal[4].trim()) slotStats.slot5++;

  gal.forEach(url => {
    if (!url || !url.trim()) emptyGalleryCount++;
    else if (url.includes('r2.dev') || url.includes('cloudflarestorage.com')) r2GalleryCount++;
    else if (url.startsWith('/Products/') || url.startsWith('/')) localGalleryCount++;
  });

  perProductAnalysis.push({
    id: p.id,
    sku: p.sku || 'N/A',
    name: p.name || 'N/A',
    category: p.category || 'N/A',
    price: p.price,
    stock: p.stock,
    is_active: p.is_active,
    image_primary: p.image_primary,
    gallery_slots_filled: gal.filter(x => x && x.trim()).length,
    missingFields: missingInProduct,
    has_provisional_description: p.description ? p.description.includes('Descrizione provvisoria') : false,
    has_seo_title: !!(p.seo_title && p.seo_title.trim()),
    has_seo_description: !!(p.seo_description && p.seo_description.trim()),
  });
});

const reportData = {
  totalProducts: products.length,
  missingCounts,
  imagePrimaryBreakdown: {
    r2: r2PrimaryCount,
    local: localPrimaryCount,
    unsplash: unsplashPrimaryCount,
    null: nullPrimaryCount,
    other: otherPrimaryCount
  },
  gallerySlotBreakdown: slotStats,
  galleryUrlBreakdown: {
    r2: r2GalleryCount,
    local: localGalleryCount,
    emptyOrNull: emptyGalleryCount
  },
  perProductAnalysis
};

fs.writeFileSync('./.agents/explorer_catalog/analysis_summary.json', JSON.stringify(reportData, null, 2));
console.log("Analysis summary saved to .agents/explorer_catalog/analysis_summary.json");

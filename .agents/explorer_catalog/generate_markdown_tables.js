const fs = require('fs');

const audit = JSON.parse(fs.readFileSync('./.agents/explorer_catalog/detailed_audit.json', 'utf8'));

console.log("Generating Markdown Tables...");

let mdSummaryTable = `| Field | Status / DB Column Exists | Total Missing Count (out of 48) | Missing % | Notes |
|---|---|---|---|---|
| **SKU** | ✅ Exists | 0 | 0% | Complete |
| **Title (Name)** | ✅ Exists | 0 | 0% | Complete |
| **Slug** | ✅ Exists | 0 | 0% | Complete |
| **Description** | ✅ Exists | 0 | 0% | 46/48 have provisional text ("Descrizione provvisoria da fattura.") |
| **Price** | ✅ Exists | 0 | 0% | Complete |
| **Discount Price** | ✅ Exists | 45 | 93.8% | Only 3 products have promotional pricing set |
| **Category** | ✅ Exists | 0 | 0% | Complete (Collane, Bracciali, Anelli, Orecchini, Set) |
| **Stock (Inventory)** | ✅ Exists | 0 | 0% | Complete |
| **Materials** | ✅ Exists | 0 | 0% | Complete (defaulted to Argento 925 nichel free) |
| **Plating** | ✅ Exists | 1 | 2.1% | SKU ASB3093 is empty |
| **Gemstone** | ✅ Exists | 0 | 0% | Complete |
| **Carats** | ✅ Exists | 13 | 27.1% | Missing on pearls & non-moissanite pieces |
| **Ring Sizes (\`sizes\`)** | ✅ Exists | 48 | 100% | Empty across all products (including Anelli category) |
| **Weight** | ❌ **Column Missing in DB** | 48 | 100% | Column does not exist in \`products\` table schema |
| **Dimensions** | ❌ **Column Missing in DB** | 48 | 100% | Column does not exist in \`products\` table schema |
| **Primary Image (\`image_primary\`)** | ✅ Exists | 26 | 54.2% | 26 products have NULL image_primary |
| **Secondary Image (\`image_secondary\`)** | ✅ Exists | 34 | 70.8% | 34 products have NULL image_secondary |
| **Gallery (\`gallery\`)** | ✅ Exists | 37 | 77.1% | 37 products have empty gallery array |
| **SEO Title (\`seo_title\`)** | ✅ Exists | 6 | 12.5% | 6 products missing custom SEO title |
| **SEO Description (\`seo_description\`)** | ✅ Exists | 6 | 12.5% | 6 products missing custom SEO description |
| **Stripe Product ID** | ✅ Exists | 1 | 2.1% | SKU PL-15-BRACELET missing Stripe product ID |
| **Stripe Price ID** | ✅ Exists | 1 | 2.1% | SKU PL-15-BRACELET missing Stripe price ID |
| **Active Status (\`is_active\`)** | ✅ Exists | 0 | 0% | 3 active, 45 inactive (hidden) |
`;

let mdProductTable = `| SKU | Product Name | Category | Price (€) | Stock | Status | Primary Image | Gallery Slots Filled | Missing Key Fields |
|---|---|---|---|---|---|---|---|---|
`;

audit.products.forEach(p => {
  const hasImg = p.image_primary_url !== 'NULL';
  const imgStatus = hasImg ? '✅ R2 URL' : '❌ NULL';
  const statusStr = p.is_active ? '🟢 Active' : '🔴 Inactive';
  const provDesc = p.has_provisional_desc ? ' (Prov. Desc)' : '';
  mdProductTable += `| \`${p.sku}\` | ${p.name}${provDesc} | ${p.category} | €${p.price} | ${p.stock} | ${statusStr} | ${imgStatus} | ${p.filled_gallery_slots}/5 | ${p.missing_fields_list} |\n`;
});

fs.writeFileSync('./.agents/explorer_catalog/table_summary.md', mdSummaryTable);
fs.writeFileSync('./.agents/explorer_catalog/table_products.md', mdProductTable);

console.log("Tables saved successfully!");

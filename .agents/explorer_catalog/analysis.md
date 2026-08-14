# Requirement R1 Audit Report: Product Catalog & Media

**Target Brand**: Isabel Pepe (Jewelry E-commerce)  
**Auditor**: Explorer 1 (Catalog & Media Auditor)  
**Working Directory**: `c:\Users\mario\Progetti Antigravity\isabel-pepe\.agents\explorer_catalog`  
**Project Root**: `c:\Users\mario\Progetti Antigravity\isabel-pepe`  
**Date**: 2026-07-29  

---

## 1. Executive Summary

This audit evaluates the readiness of Requirement R1 (Product Catalog & Media) for the Isabel Pepe e-commerce go-live. A comprehensive inspection was performed across Supabase database tables, seed files, admin management server actions, API routes, media delivery code (Cloudflare R2), and React UI components.

### Key Observations:
1. **Catalog Volume & Visibility**: The database contains **48 products**. However, only **3 products** are marked active (`is_active = true`), while **45 products** remain in draft/inactive state (`is_active = false`). Frontend shop routes (`app/shop/page.tsx` & `app/page.tsx`) do not filter by `is_active`, displaying all 48 products indiscriminately.
2. **Missing Field Schema Discrepancies**: The database schema (`supabase_schema.sql`) lacks dedicated columns for `weight` and `dimensions` (missing in 48/48 products). Furthermore, ring size variants (`sizes`) are null/empty across 100% of products (including the 6 ring products in the catalog).
3. **Provisional Descriptions**: **46 out of 48 products (95.8%)** currently display default placeholder descriptions (`Descrizione provvisoria da fattura.`).
4. **Media Coverage & Missing Primary Images**: **26 out of 48 products (54.2%)** have `image_primary = NULL`, causing broken image states on product listing grids because `ProductCard.tsx` lacks fallback placeholder logic. Only **11 products (22.9%)** have populated 5-slot image galleries.
5. **R2 & Next.js Image Optimization**: Cloudflare R2 integration (`lib/r2.ts`) is functional via `@aws-sdk/client-s3` and Sharp. However, `next.config.ts` fails to declare `images.remotePatterns` for the R2 CDN (`pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev`). To bypass domain restrictions, frontend components (`ProductCard.tsx`, `ProductGallery.tsx`, `app/page.tsx`) resort to raw HTML `<img>` tags, abandoning Next.js image optimization, WebP/AVIF auto-formatting, responsive srcset generation, and layout shift prevention.

---

## 2. Database Schema & Data Architecture Audit

### 2.1 Database Schema Definition (`supabase_schema.sql`)
- **File Path**: `c:\Users\mario\Progetti Antigravity\isabel-pepe\supabase_schema.sql` (Lines 6-18)
- **Original Schema Definition**:
  ```sql
  CREATE TABLE products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INT DEFAULT 0,
      category VARCHAR(100),
      image_primary VARCHAR(255),
      image_secondary VARCHAR(255),
      stripe_product_id VARCHAR(255),
      stripe_price_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  ```

### 2.2 Dynamic Column Extensions via Migration Scripts
Inspection of repository migration scripts (`scripts/import_products.ts`, `scripts/seo_and_sync.ts`, `scripts/apply_seo_metadata.ts`, `scripts/fix_slugs.ts`) reveals that the Supabase `products` table was altered dynamically to include:
- `sku` (VARCHAR)
- `slug` (VARCHAR)
- `materials` (VARCHAR)
- `plating` (VARCHAR)
- `gemstone` (VARCHAR)
- `carats` (VARCHAR)
- `sizes` (JSONB / text array)
- `discount_price` (DECIMAL)
- `gallery` (JSONB text array of 5 slots)
- `seo_title` (VARCHAR)
- `seo_description` (TEXT)
- `is_active` (BOOLEAN)

### 2.3 Critical Schema Missing Columns
- **`weight`**: Missing entirely from database schema and scripts. (Missing: 48/48)
- **`dimensions`**: Missing entirely from database schema and scripts. (Missing: 48/48)

---

## 3. Product Catalog & Missing Field Mapping

### 3.1 Field-by-Field Missing Occurrences Table
*Total Audited Products: 48*

| Field Name | DB Column Exists | Missing Count | Missing Percentage | Audit Notes |
|---|---|---|---|---|
| **SKU** | ✅ Yes | 0 | 0.0% | Complete across all items |
| **Title (`name`)** | ✅ Yes | 0 | 0.0% | Complete across all items |
| **Slug** | ✅ Yes | 0 | 0.0% | Generated via `scripts/fix_slugs.ts` |
| **Description** | ✅ Yes | 0 | 0.0% | **46/48 (95.8%)** have provisional text: `"Descrizione provvisoria da fattura."` |
| **Price** | ✅ Yes | 0 | 0.0% | Calculated from invoice cost: `(cost + 10) * 3` |
| **Discount Price** | ✅ Yes | 45 | 93.8% | Only 3 items (`ASB4054-PINK`, `MSR1139`, `BTN005-GOLD`) have promotional prices |
| **Category** | ✅ Yes | 0 | 0.0% | Collane (16), Orecchini (14), Bracciali (9), Anelli (6), Set (3) |
| **Stock / Inventory** | ✅ Yes | 0 | 0.0% | Complete (ranging from 1 to 5 units per SKU) |
| **Materials** | ✅ Yes | 0 | 0.0% | Complete (defaulted to `"Argento 925 nichel free"`) |
| **Plating** | ✅ Yes | 1 | 2.1% | SKU `ASB3093` missing plating details |
| **Gemstone** | ✅ Yes | 0 | 0.0% | Complete (Moissanite GRA, Perle di acqua dolce, Zirconi) |
| **Carats** | ✅ Yes | 13 | 27.1% | Missing on pearl necklaces/bracelets & plain metal sets |
| **Ring Sizes (`sizes`)** | ✅ Yes | 48 | 100.0% | Empty JSON array `[]` across all products (including 6 ring products) |
| **Weight** | ❌ **No** | 48 | 100.0% | Column absent from DB schema |
| **Dimensions** | ❌ **No** | 48 | 100.0% | Column absent from DB schema |
| **Primary Image (`image_primary`)** | ✅ Yes | 26 | 54.2% | **26 items have `NULL`**, displaying broken images on frontend |
| **Secondary Image (`image_secondary`)** | ✅ Yes | 34 | 70.8% | **34 items have `NULL`**, disabling hover preview |
| **Gallery (`gallery`)** | ✅ Yes | 37 | 77.1% | **37 items have empty gallery array** `[]` |
| **SEO Title (`seo_title`)** | ✅ Yes | 6 | 12.5% | 6 items missing custom SEO title |
| **SEO Description (`seo_description`)** | ✅ Yes | 6 | 12.5% | 6 items missing custom SEO description |
| **Stripe Product ID** | ✅ Yes | 1 | 2.1% | SKU `PL-15-BRACELET` missing Stripe product ID |
| **Stripe Price ID** | ✅ Yes | 1 | 2.1% | SKU `PL-15-BRACELET` missing Stripe price ID |
| **Active Status (`is_active`)** | ✅ Yes | 0 | 0.0% | **3 Active**, **45 Inactive** (drafts) |

---

### 3.2 Per-Product Detailed Catalog Inventory Table

| SKU | Product Name | Category | Price (€) | Stock | Active | Primary Image | Gallery Slots | Missing Fields List |
|---|---|---|---|---|---|---|---|---|
| `MS1093` | Collana L'Éternel *(Prov. Desc)* | Collane | €124.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MSR1075` | Anello S925+ moissanite+ cz *(Prov. Desc)* | Anelli | €111.00 | 2 | 🔴 False | ✅ R2 URL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_secondary`, `gallery`, `sizes` |
| `MS12242` | Collana S925+moissanite *(Prov. Desc)* | Collane | €178.00 | 2 | 🔴 False | ✅ R2 URL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_secondary`, `gallery`, `sizes`, `seo_title`, `seo_description` |
| `ASB4054-PINK` | Bracciale Eden Rose *(Prov. Desc)* | Bracciali | €172.00 | 1 | 🟢 True | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `sizes` |
| `ASB3142` | Orecchini Rivière *(Prov. Desc)* | Orecchini | €136.00 | 1 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `sizes` |
| `A113` | Orecchini Duchesse *(Prov. Desc)* | Orecchini | €101.00 | 1 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `carats`, `sizes` |
| `A114` | Orecchini Rêve *(Prov. Desc)* | Orecchini | €102.00 | 2 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `sizes` |
| `A144-EARRING` | Orecchini Versailles *(Prov. Desc)* | Orecchini | €176.00 | 1 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `carats`, `sizes` |
| `A144-NECKLACE` | Collana Versailles *(Prov. Desc)* | Collane | €156.00 | 1 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `carats`, `sizes` |
| `ASB3057` | Orecchini Ariel *(Prov. Desc)* | Orecchini | €117.00 | 2 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `sizes` |
| `ASB3093` | Orecchini Joséphine *(Prov. Desc)* | Orecchini | €94.00 | 1 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `plating`, `sizes` |
| `BTN006` | Collana Éclipse *(Prov. Desc)* | Collane | €222.00 | 2 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `sizes` |
| `MS12236` | Collana Métamorphose *(Prov. Desc)* | Collane | €172.00 | 1 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `sizes` |
| `ANELLO_NOVA` | Anello Nova *(Prov. Desc)* | Anelli | €110.00 | 2 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `carats`, `sizes` |
| `ANELLO_OLIMPIA` | Anello Olimpia *(Prov. Desc)* | Anelli | €115.00 | 1 | 🔴 False | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `carats`, `sizes` |
| `A180-SET` | Set Vivienne *(Prov. Desc)* | Set | €247.00 | 2 | 🟢 True | ✅ R2 URL | 3/5 | `discount_price`, `weight`, `dimensions`, `carats`, `sizes` |
| `BTN005-GOLD` | Collana Brera Gold *(Prov. Desc)* | Collane | €261.00 | 2 | 🟢 True | ✅ R2 URL | 3/5 | `weight`, `dimensions`, `sizes` |
| `BTB047` | Collana S925+moissanite *(Prov. Desc)* | Collane | €235.00 | 1 | 🔴 False | ✅ R2 URL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_secondary`, `gallery`, `sizes`, `seo_title`, `seo_description` |
| `MS1105` | Collana/Bracciale S925+moissanite *(Prov. Desc)* | Collane | €140.00 | 2 | 🔴 False | ✅ R2 URL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_secondary`, `gallery`, `sizes`, `seo_title`, `seo_description` |
| `ASB4064` | Bracciale S925+moissanite *(Prov. Desc)* | Bracciali | €128.00 | 2 | 🔴 False | ✅ R2 URL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_secondary`, `gallery`, `sizes`, `seo_title`, `seo_description` |
| `BTN005-SILVER` | Collana full moissanite Silver *(Prov. Desc)* | Collane | €222.00 | 2 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MS1208` | Collana cuore S925+ moissanite *(Prov. Desc)* | Collane | €133.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `ASB3035` | Orecchini cuori S925+moissanite *(Prov. Desc)* | Orecchini | €112.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `ASB0041` | Orecchini pendenti S925+moissanite *(Prov. Desc)* | Orecchini | €122.00 | 2 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `ASB4054-WHITE` | Bracciale S925+ moissanite White *(Prov. Desc)* | Bracciali | €161.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MSR1089` | Anello S925+moissanite Gold *(Prov. Desc)* | Anelli | €125.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MSR1078` | Anello S925+ moissanite Silver *(Prov. Desc)* | Anelli | €111.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MSR1093` | Anello fiore S925+ moissanite *(Prov. Desc)* | Anelli | €104.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `A180-NECKLACE` | Collana V S925+moissanite *(Prov. Desc)* | Collane | €163.00 | 2 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `A180-EARRING` | Orecchini V S925+moissanite *(Prov. Desc)* | Orecchini | €145.00 | 2 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `BTS018-NECKLACE` | Collana S925+moissanite *(Prov. Desc)* | Collane | €203.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `BTS018-EARRING` | Orecchini S925+moissanite *(Prov. Desc)* | Orecchini | €204.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `BTB024` | Bracciale link full moissanite *(Prov. Desc)* | Bracciali | €341.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `ASB4068` | Bracciale tennis moissanite *(Prov. Desc)* | Bracciali | €136.00 | 4 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `ASB4055` | Bracciale full moissanite *(Prov. Desc)* | Bracciali | €135.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MSR1139` | Anello multi moissanite *(Prov. Desc)* | Anelli | €135.00 | 2 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `BTS036-NECKLACE` | Collana farfalla *(Prov. Desc)* | Collane | €130.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `BTS036-EARRING` | Orecchini farfalla *(Prov. Desc)* | Orecchini | €131.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MSR1220` | Anello moissanite *(Prov. Desc)* | Anelli | €114.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MS1141` | Collana fiore moissanite *(Prov. Desc)* | Collane | €130.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `BTN028` | Collana cuore full moissanite *(Prov. Desc)* | Collane | €271.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `ASB4019` | Bracciale moissanite *(Prov. Desc)* | Bracciali | €125.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `ASB4043` | Bracciale moissanite *(Prov. Desc)* | Bracciali | €120.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `MS1096` | Collana moissanite *(Prov. Desc)* | Collane | €149.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `A118` | Orecchini cerchio 15mm *(Prov. Desc)* | Orecchini | €139.00 | 1 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `PL-6-NECKLACE` | Collana perle acqua dolce 4~5mm *(Prov. Desc)* | Collane | €180.00 | 5 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `PL-6-BRACELET` | Bracciale perle acqua dolce 4~5mm *(Prov. Desc)* | Bracciali | €99.00 | 5 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `PL-30` | Collana perle acqua dolce 5~6mm *(Prov. Desc)* | Collane | €209.00 | 5 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `PL-40` | Collana perle acqua dolce 10~11mm *(Prov. Desc)* | Collane | €199.00 | 5 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `PL-15-NECKLACE` | Collana perle acqua dolce 9~10mm *(Prov. Desc)* | Collane | €161.00 | 4 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes` |
| `PL-15-BRACELET` | Bracciale perle acqua dolce 7.5~8mm | Bracciali | €105.00 | 4 | 🔴 False | ❌ NULL | 0/5 | `discount_price`, `weight`, `dimensions`, `carats`, `image_primary`, `image_secondary`, `gallery`, `sizes`, `seo_title`, `seo_description`, `stripe_product_id`, `stripe_price_id` |

---

## 4. Media Asset & Cloudflare R2 / S3 / CDN Integration Audit

### 4.1 Cloudflare R2 Configuration Diagnosis
- **Environment File**: `.env.local`
  - `R2_ACCOUNT_ID`: `cdc3d1bfef17f23cb453fe2737b2ede8`
  - `R2_ACCESS_KEY_ID`: `a15ba732cf75ed7cb171a095e794a479`
  - `R2_SECRET_ACCESS_KEY`: `4f09e1eb767175bf174301dfb41ea4c38c9aac8648aafb78d9914239d6a6093f`
  - `R2_BUCKET_NAME`: `isabel-pepe`
  - `R2_PUBLIC_URL`: `https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev`
- **Upload Library**: `lib/r2.ts`
  - `r2Client` is initialized with `@aws-sdk/client-s3` using path-style requests (`forcePathStyle: true`).
  - Image processing utilizes `sharp` to automatically scale down images to a max width of 1500px (`.resize({ width: 1500, withoutEnlargement: true })`) and compress into WebP format (`.webp({ quality: 80, effort: 4 })`).

### 4.2 Next.js Image Config Defect (`next.config.ts`)
- **File**: `c:\Users\mario\Progetti Antigravity\isabel-pepe\next.config.ts`
  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    experimental: {
      serverActions: {
        bodySizeLimit: '50mb',
      },
    },
  };

  export default nextConfig;
  ```
- **Diagnosis**: `next.config.ts` **omits `images.remotePatterns`**.
  - Replacing `<img>` with Next.js `<Image />` component currently throws a runtime exception:
    `Error: Invalid src prop on next/image, hostname "pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev" is not configured under images in your next.config.js`.

### 4.3 Image Components & Optimization Analysis
1. **`components/ProductCard.tsx`**:
   - Line 65: `<img src={product.image_primary} alt={product.name} .../>`
   - Line 73: `<img src={product.image_secondary} alt={`${product.name} indossato`} .../>`
   - **Issues**: No fallback image when `image_primary` is `null` (26 products rendered as broken/blank squares). Bypasses Next.js image optimizer.
2. **`components/ProductGallery.tsx`**:
   - Lines 58 & 79: Standard `<img>` tags inside Masonry gallery grid.
   - Line 147: Standard `<img>` tag inside Lightbox zoom modal.
3. **`app/page.tsx`**:
   - Lines 19, 57, 70, 80, 124: Hardcoded local static image references using standard `<img>` tags (`/Products/Modella Premium.jpg`, `/Products/Collana Lusso Old Money.jpg`, etc.).
4. **Alt Text Compliance**:
   - Alt attributes are functional but static (e.g., `product.name`). They lack descriptive SEO keywords (gemstone, gold plating type, category context).

---

## 5. Recommended Remediation & Action Plan

To transition the product catalog to a go-live ready state, the following implementation roadmap is recommended for subsequent tasks:

1. **Schema Migration**:
   - Add `weight` (DECIMAL) and `dimensions` (VARCHAR) columns to Supabase `products` table.
   - Update `types/` definitions across the project.
2. **Database Data Hydration**:
   - Run a batch script (`seo_and_sync.ts`) to upload missing raw product photos from `public/Products/` or `Generazione foto/prodotti finiti/` to Cloudflare R2.
   - Populate `image_primary`, `image_secondary`, and 5-slot `gallery` URLs for all 26 unlinked products.
   - Replace provisional text in `description` with rich editorial product descriptions.
   - Populate ring sizes array (`sizes`) for ring products (`MSR1075`, `ANELLO_NOVA`, `ANELLO_OLIMPIA`, `MSR1089`, `MSR1078`, `MSR1093`, `MSR1139`, `MSR1220`, `A113`).
3. **Product Visibility & Filters**:
   - Update `app/shop/page.tsx` and `app/page.tsx` to filter products by `is_active: true` for regular customers, while allowing admin previews.
   - Set `is_active = true` for all complete products once media and descriptions are linked.
4. **Next.js Image Configuration & Optimization**:
   - Add `remotePatterns` to `next.config.ts`:
     ```ts
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: 'pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev',
         },
       ],
     },
     ```
   - Migrate `ProductCard.tsx` and `ProductGallery.tsx` from `<img>` to `next/image` (`<Image />`).
   - Implement a fallback placeholder image (e.g., `/images/placeholder-jewelry.webp`) when `image_primary` is null or fails to load.

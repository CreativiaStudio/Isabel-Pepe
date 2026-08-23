# Original User Request

## 2026-08-23T19:48:48Z

Fix and definitively stabilize the product image upload system across the Isabel Pepe Admin panel. Eliminate all `Unexpected token '<', '<!DOCTYPE '... is not valid JSON` errors, handle large files (up to 20MB from iPhone/cameras), implement graceful error handling with automatic client-side WebP compression, server-side Sharp optimization with fallback, safe JSON/text response parsing, and a reliable Server Action / direct fallback pipeline.

Working directory: c:/Users/mario/Progetti Antigravity/isabel-pepe
Integrity mode: development

## Requirements

### R1. Resilient Upload Ingestion & Safe Response Handling
- In `app/admin/ProductForm.tsx`, replace unsafe `res.json()` calls with robust content-type checking and safe error parsing (read `res.text()` if HTML or non-JSON is returned, displaying a human-readable error rather than syntax crash).
- Upgrade `app/api/upload/route.ts` with explicit file size limits (support up to 20MB files), robust `try...catch` blocks, sanitized filenames, and guaranteed JSON error responses (`application/json`) in all scenarios (400, 413, 500) to prevent Next.js from emitting raw HTML error pages.

### R2. High-Performance Client-Side Image Pre-Processing & Compression
- Upgrade `compressImageClient` in `ProductForm.tsx` to handle all formats (JPEG, PNG, WebP, HEIC/HEIF) with canvas downscaling (max width 2000px, 85% WebP quality) so that 10-20MB smartphone uploads are compressed smoothly to ~200-500KB in the browser before hitting the wire, preventing 413 payload limits.
- Provide immediate instant blob previews with loading spinner per slot and retry button on network glitch.

### R3. Server-Side Cloudflare R2 Upload Pipeline & Fallback
- In `lib/r2.ts`, ensure `uploadToR2` cleanly catches Sharp processing exceptions with automatic raw buffer fallback if Sharp fails, guaranteeing that valid image files are always saved to Cloudflare R2 without 500 crashes.
- Support Server Action upload (`uploadProductImageAction` / `uploadPhotoServerAction`) as a seamless second-chance fallback if the REST `/api/upload` endpoint fails.

### R4. Complete 5-Slot Gallery & Admin Editing Stability
- Ensure adding, editing, replacing, and removing photos across all 5 slots (`slot1` Model, `slot2` Studio White/Pink, `slot3`, `slot4`, `slot5`) in `ProductForm.tsx` and `actions.ts` persists perfectly in Supabase `products.gallery`, `image_primary`, and `image_secondary`.
- Verify that editing existing products (like `Set Isabel Rose (A145)`) does not overwrite existing slot URLs when modifying other slots or metadata.

## Acceptance Criteria

### Error Prevention & Upload Reliability
- [ ] Uploading a large image (> 5MB) or raw phone photo in any slot completes successfully with valid WebP URL on Cloudflare R2.
- [ ] If network is abruptly interrupted or server errors, UI displays an informative luxury error banner with a 1-click retry button instead of a JSON parse exception.
- [ ] No `Unexpected token '<'` or unhandled syntax error occurs under any upload scenario.

### Product Form & Gallery Integrity
- [ ] Editing `Set Isabel Rose (A145)` and replacing slot1 photo successfully uploads to R2 and saves to Supabase without errors.
- [ ] All 5 slots correctly preview and persist on both `addProduct` and `updateFullProduct`.
- [ ] Production build (`npm run build`) passes cleanly with 0 TypeScript/Turbopack errors and is pushed to `origin/main`.

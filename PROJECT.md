# Project: Isabel Pepe Admin Upload System Stabilization & 5-Slot Gallery Architecture

## Architecture
The Isabel Pepe image ingestion and catalog persistence architecture is organized into four core layers:
1. **Client Processing Layer (`ProductForm.tsx`, `MediaLibraryModal.tsx`)**:
   - High-performance browser image pre-processing with Canvas WebP compression (max 2000px, 85% quality) supporting JPEG, PNG, WebP, AVIF, and HEIC/HEIF photos up to 20MB.
   - Instant local blob previews with slot spinners.
   - Safe response parsing with explicit content-type checking (`application/json`) and friendly error translation to prevent `Unexpected token '<'` syntax crashes.
   - 2-Tier upload resilience: primary REST `POST /api/upload` with automatic fallback to Server Action `uploadProductImageAction`.
   - Luxury error banner with 1-click slot retry.
2. **Server Upload & Storage Pipeline (`lib/r2.ts`, `app/api/upload/route.ts`, `app/admin/actions.ts`)**:
   - `app/api/upload/route.ts`: Node.js runtime endpoint enforcing 20MB file limits, input sanitization, and guaranteed JSON error responses (`application/json`) for all HTTP status codes (400, 413, 500).
   - `lib/r2.ts`: Cloudflare R2 S3 SDK integration with Sharp optimization (`.rotate()`, 2000px max, WebP 85%), dynamic MIME/extension resolution, and seamless raw buffer fallback if Sharp fails.
   - `app/admin/actions.ts`: Next.js 16 Server Actions providing `uploadProductImageAction` (fallback upload) and modernized `updateProductImage` using R2 storage.
3. **Database & Persistence Layer (`app/admin/actions.ts`, `app/api/admin/products/route.ts`, Supabase PostgreSQL `products`)**:
   - 5-Slot gallery schema contract: `products.gallery` as a 5-element `TEXT[]` array `[slot1, slot2, slot3, slot4, slot5]`.
   - Deterministic column derivations: `image_secondary = gallery[0]`, `image_primary = gallery[1] || gallery[0]`.
   - Non-destructive updates: untouched slots on existing products (e.g. `Set Isabel Rose (A145)`) remain strictly preserved during metadata or single-slot edits.
4. **E2E Quality Assurance Layer (`tests/` & test runner scripts)**:
   - 4-Tier requirement-driven opaque-box and integration test suite validating payload limits, Sharp fallbacks, response parser resilience, 5-slot persistence, and full production build (`npm run build`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Safe JSON Response Parsing | Replace unsafe `res.json()` with `Content-Type` header verification and safe error extraction to eliminate `Unexpected token '<'`. | M2 | ORIGINAL_REQUEST §R1 |
| 2 | Route Handler Size Limit & JSON Error Guarantee | Enforce 20MB file limit (HTTP 413) and wrap `app/api/upload/route.ts` with guaranteed JSON responses (`application/json`) for 400, 413, 500. | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Upgraded Client-Side WebP Compression | Canvas-based image resizer in `ProductForm.tsx` & `MediaLibraryModal.tsx` (max 2000px, 85% WebP) for JPEG, PNG, WebP, HEIC/HEIF. | M2 | ORIGINAL_REQUEST §R2 |
| 4 | Instant Blob Previews & Slot Retry | Display instant blob preview with spinner during upload, with luxury error banner and 1-click retry button on failure. | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Sharp Optimization with Auto-Rotate & Fallback | Auto-orient EXIF metadata with `.rotate()`, optimize to WebP 85%, and fall back cleanly to raw buffer with proper MIME/extension in `lib/r2.ts`. | M1 | ORIGINAL_REQUEST §R3 |
| 6 | Server Action Upload Fallback Pipeline | Export `uploadProductImageAction` in `actions.ts` as a seamless fallback if REST `/api/upload` fails. | M1 | ORIGINAL_REQUEST §R3 |
| 7 | Modernized Quick Thumbnail Upload in Admin Table | Refactor `updateProductImage` in `actions.ts` to upload to R2 and update both column and `products.gallery`. | M1 | ORIGINAL_REQUEST §R4 |
| 8 | 5-Slot Gallery Synchronization & Non-Destructive Editing | Ensure slot1-slot5 mapping to `gallery`, `image_primary`, `image_secondary` preserves untouched slots (e.g. `Set Isabel Rose (A145)`). | M3 | ORIGINAL_REQUEST §R4 |
| 9 | Multi-Slot Preview & Persistence Verification | Verify all 5 slots preview, upload, and persist on both `addProduct` and `updateFullProduct`. | M3 | ORIGINAL_REQUEST §R4 |
| 10 | E2E Testing Suite (Tiers 1-4) | Comprehensive test harness validating uploads, fallbacks, 5-slot consistency, error states, and production build. | E2E-TEST | ORIGINAL_REQUEST Acceptance Criteria |
| 11 | Production Build Verification | Verify `npm run build` succeeds with 0 TypeScript/Turbopack errors. | M4 | ORIGINAL_REQUEST Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Server Upload & Storage Pipeline Hardening | `lib/r2.ts`, `app/api/upload/route.ts`, `app/admin/actions.ts: uploadProductImageAction, updateProductImage` | none | DONE |
| E2E | E2E Testing Suite Creation | Requirement-driven test suite (Tiers 1-4) published to `TEST_READY.md` (49/49 passing) | none | DONE |
| M2 | Client-Side Pre-Processing & Safe Parsing | `ProductForm.tsx`, `MediaLibraryModal.tsx`, `compressImageClient`, `safeParseUploadResponse`, 2-tier fallback | M1 | DONE |
| M3 | 5-Slot Gallery State & Non-Destructive Persistence | `ProductForm.tsx`, `actions.ts`, `app/api/admin/products/route.ts`, slot preservation for `Set Isabel Rose (A145)` | M1, M2 | PLANNED |
| M4 | Final E2E Test Pass, Adversarial Hardening & Build Verification | Pass 100% of E2E tests, execute Tier 5 adversarial checks, and verify `npm run build` | M1, M2, M3, E2E | PLANNED |

## Interface Contracts

### 1. REST Endpoint: `POST /api/upload`
- **Request**: `multipart/form-data`
  - `file`: `File` (Binary payload, max 20MB)
  - `folder`: `string` (`'products'`)
  - `customName`: `string` (Slugified identifier)
- **Response**: `application/json`
  - HTTP 200: `{ "success": true, "url": "https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/..." }`
  - HTTP 400: `{ "error": "Nessun file fornito o file vuoto." }`
  - HTTP 413: `{ "error": "La dimensione del file supera il limite massimo di 20MB." }`
  - HTTP 500: `{ "error": "Errore durante il caricamento su Cloudflare R2: [Dettaglio]" }`

### 2. Server Action: `uploadProductImageAction`
- **Signature**: `export async function uploadProductImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }>`
- **Behavior**: Accepts `file`, `folder`, `customName` in `FormData`, uploads to R2 via `uploadToR2`, returns structured JSON object.

### 3. Server Action: `updateProductImage`
- **Signature**: `export async function updateProductImage(productId: string, file: File, type: 'primary' | 'secondary'): Promise<{ success: boolean; url?: string; error?: string }>`
- **Behavior**: Uploads `file` to R2, updates `image_primary` or `image_secondary`, and synchronizes corresponding index in `products.gallery` (`gallery[1]` for primary, `gallery[0]` for secondary).

### 4. Client Safe Response Parser: `safeParseUploadResponse`
- **Signature**: `async function safeParseUploadResponse(res: Response): Promise<{ success: boolean; url?: string; error?: string }>`
- **Behavior**: Inspects `res.headers.get('content-type')`, parses JSON if available, or extracts human-readable error from `res.text()` with HTTP status code mapping (413 -> "File troppo grande", 500 -> "Errore server R2", 502/504 -> "Timeout gateway").

### 5. Supabase 5-Slot Gallery Contract
- `products.gallery`: `TEXT[]` with 5 elements `[slot1, slot2, slot3, slot4, slot5]`.
- `image_secondary`: `gallery[0] || null` (Slot 1 On-Model 2:3).
- `image_primary`: `gallery[1] || gallery[0] || null` (Slot 2 Still Life 1:1).

## Code Layout
- `app/admin/ProductForm.tsx` — Admin product creation and editing form with 5 image slots
- `app/admin/MediaLibraryModal.tsx` — Cloudflare R2 media browser modal with direct upload
- `app/admin/ProductTable.tsx` — Product catalog management table
- `app/admin/actions.ts` — Server Actions for catalog mutations, uploads, and Stripe sync
- `app/api/upload/route.ts` — REST API endpoint for Cloudflare R2 image uploads
- `app/api/admin/products/route.ts` — REST API routes for product CRUD operations
- `lib/r2.ts` — Cloudflare R2 S3 SDK client wrapper with Sharp image optimization
- `lib/supabase.ts` — Supabase database client
- `tests/` — Opaque-box E2E test suite and runner scripts

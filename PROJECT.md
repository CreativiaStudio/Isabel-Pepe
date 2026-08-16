# Project: Isabel Pepe — Cloudflare R2 & Media Administration Resilience

## Architecture
- **Backend / Storage**: Cloudflare R2 object storage via `@aws-sdk/client-s3` (bucket: `isabel-pepe`), custom CDN endpoint `pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev`.
- **API Endpoints**:
  - `GET /api/media`: Returns array of media objects from R2 `products/` prefix.
  - `POST /api/upload`: Receives multipart file, compresses to WebP via `sharp`, uploads to R2, returns public CDN URL.
- **Admin UI Components**:
  - `app/admin/ProductForm.tsx`: 5-slot product gallery manager, slot-level "+ Foto" upload, "Sfoglia" modal trigger with smart search.
  - `app/admin/MediaLibraryModal.tsx`: Grid view of all R2 images with tokenized search by product name / SKU, direct upload with client pre-compression, and 1-click slot insertion.
- **Database & Persistence**:
  - Supabase `products` table: `gallery` (text[5]), `image_primary` (Slot 2, packshot 1:1), `image_secondary` (Slot 1, model 2:3).
  - Server Actions: `updateFullProduct`, `addProduct`, `deleteProduct`, `updateProductField` with full multi-path cache revalidation (`/admin`, `/shop`, `/`, `/prodotto/[slug]`).
- **Storefront Display**:
  - `components/ProductGallery.tsx`: Adaptive 1-5 image layout with full lightbox.
  - `components/ProductCard.tsx`: Primary image at rest, secondary model image cross-fade on hover.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R2 Fallback Credentials Synchronization | Sync fallback credentials in `lib/r2.ts` with production credentials to guarantee operation across all environments without external env vars | M1 | ORIGINAL_REQUEST R1 |
| 2 | R2 Pagination & Clean Listing in `getMediaLibrary` | Support multi-page listing via `NextContinuationToken` and filter virtual directory keys | M1 | Survey Findings |
| 3 | Upload Cache-Control Headers | Set immutable CDN caching headers on R2 `PutObjectCommand` | M1 | Survey Findings |
| 4 | Tokenized Search in "Sfoglia" Modal | Multi-token search matching product names / SKU against hyphenated R2 object keys | M1 | ORIGINAL_REQUEST R2 |
| 5 | Media Modal Upload Pre-compression | Client-side WebP compression for direct uploads within `MediaLibraryModal.tsx` | M1 | Survey Findings |
| 6 | Slot Thumbnail Zoom CSS Fix | Relocate `overflow-hidden` so hover zoom preview displays properly in `ProductForm.tsx` | M1 | Survey Findings |
| 7 | Smart Search Pre-fill in "Sfoglia" | Pass product name / SKU as initial search to "Sfoglia" modal from `ProductForm.tsx` | M1 | ORIGINAL_REQUEST R2 |
| 8 | Comprehensive Cache Revalidation Parity | Add `/shop` and `/` revalidation to `addProduct`, `deleteProduct`, and `updateProductField` | M1 | ORIGINAL_REQUEST R3 |
| 9 | E2E Testing & Acceptance Verification | Verify 138+ R2 media items, `/api/upload` WebP generation, modal UI, product persistence, and `npm run build` compilation | M2 | ORIGINAL_REQUEST AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Core R2, Media Modal & Cache Revalidation Implementation | `lib/r2.ts`, `app/admin/actions.ts`, `app/admin/MediaLibraryModal.tsx`, `app/admin/ProductForm.tsx` | none | IN_PROGRESS |
| 2 | M2: E2E Acceptance Verification & Build Integrity | `scripts/`, automated E2E test runner, Next.js build | M1 | PLANNED |

## Interface Contracts
### `lib/r2.ts` ↔ Server Actions & API Routes
- `getR2Config()`: returns `{ accountId, accessKeyId, secretAccessKey, bucketName, publicUrl }` with verified production defaults.
- `getR2Client()`: returns configured S3Client with `region: 'auto'`, endpoint `https://${accountId}.r2.cloudflarestorage.com`, credentials, and checksum parameters.
- `uploadToR2(file: File, folder?: string, customName?: string)`: returns `Promise<string>` (full CDN URL).
- `getMediaLibrary()`: returns `Promise<Array<{ key: string, url: string, size: number, lastModified?: Date, name: string }>>`.

### `MediaLibraryModal.tsx` ↔ `ProductForm.tsx`
- Props: `isOpen: boolean`, `onClose: () => void`, `onSelect: (url: string) => void`, `initialSearch?: string`.
- On thumbnail select: calls `onSelect(url)` and `onClose()`.

## Code Layout
- `lib/r2.ts`: Cloudflare R2 client configuration, upload functions, credentials.
- `app/api/media/route.ts`: Public/Admin HTTP GET endpoint for media listing.
- `app/api/upload/route.ts`: HTTP POST endpoint for file upload & WebP conversion.
- `app/admin/actions.ts`: Server actions for product CRUD, media library querying, cache revalidation.
- `app/admin/ProductForm.tsx`: Product edit drawer, 5-slot gallery management.
- `app/admin/MediaLibraryModal.tsx`: Media library browser modal.
- `scripts/`: Verification test scripts.

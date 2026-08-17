# E2E Test Infra: Isabel Pepe Surgical Apparel Replacement

## Test Philosophy
- Opaque-box, requirement-driven, mathematically rigorous.
- Zero-tolerance on jewel pixel alteration (0.00% difference in core Moissanite stone matrix).
- Visual and structural verification of 1024x1536 WebP output format and seamless boundary integration.

## Feature Inventory Coverage Matrix
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|--------|:------:|:------:|:------:|:------:|
| 1 | Master Asset Integrity (F1) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Mathematical ROI Extraction (F2) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | Surgical Mask Generation (F3) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 4 | Photorealistic Apparel Inpainting (F4) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 5 | Anatomical Contact Shadows (F5) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 6 | Sandwich Alpha Compositing (F6) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 7 | Anello Imperial WebP Production (F7) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 8 | Batch Catalog CLI Automation (F8) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |

## Test Tiers Overview
1. **Tier 1 — Feature Unit Tests**:
   - Verify master asset resolution (1024x1536), format (WebP), color profile.
   - Verify uncompressed ROI extraction at exact coordinates `[X: 430..550, Y: 680..780]`.
   - Verify mask generation covering collar `[Y: 330..460]` and lower dress panels while strictly zeroing the jewel zone.
   - Verify WebP exporter generates valid 1024x1536 WebP.
   - Verify CLI argument parsing and error handling for missing files.

2. **Tier 2 — Boundary & Edge Cases**:
   - Mask boundaries clamping to canvas limits `[0..1024, 0..1536]`.
   - Feather radius variations ($\sigma \in [2.0, 6.0]$ px) without clipping or alpha bleed.
   - Empty/corrupt input handling.
   - Quality factor boundaries (80 to 100).
   - High aspect ratio preservation checks.

3. **Tier 3 — Cross-Feature Integration**:
   - End-to-end sandwich compositor pipeline test from original -> mask -> composite -> output.
   - Mathematical pixel-diff between original master jewel buffer and final composite output (Max Delta = 0 in core jewel ROI).
   - Skin transition gradient verification across the neck/hand interface.

4. **Tier 4 — Real-World Application & Storefront Acceptance**:
   - Storefront Lightbox 300% zoom simulation on the final WebP asset.
   - Verification of `public/Archive/isabel-pepe-anello-imperial-slot1_ORIGINAL.webp` non-mutation.
   - Production readiness inspection for product gallery Slot 1.

## Test Runner
- Command: `node tests/e2e_restyle_pipeline.test.mjs`

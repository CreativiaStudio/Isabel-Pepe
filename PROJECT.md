# Project: Isabel Pepe — Surgical Apparel Replacement & Jewel Preservation Pipeline

## Architecture
A multi-stage, non-destructive image compositing and inpainting pipeline engineered to replace model apparel on e-commerce catalog photography while preserving 100% mathematical pixel fidelity of high-end Moissanite jewelry and contact anatomy.

```
[Master Original (1024x1536 WebP)]
      │
      ├──> [Pristine Jewel & Hand Extraction (Sharp)] ────────────────────────┐
      │                                                                       │
      └──> [Surgical Mask Generation] ──> [FAL AI FLUX Fill Inpainting]       │
                                                 │                            │
                                                 ▼                            │
                                    [Inpainted Base Canvas]                   │
                                                 │                            │
                                                 ▼                            ▼
                                      [Gaussian Feathered Sandwich Compositor (Sharp)]
                                                 │
                                                 ▼
                                    [High-Res 1024x1536 WebP Export]
                                                 │
                                                 ▼
                                  [Pixel-Diff & Zoom Fidelity Validator]
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Master Asset Isolation & Archival | Verify and preserve untouched master original in `public/Archive/` | M1 | ORIGINAL_REQUEST §R1 |
| F2 | Mathematical ROI Extraction | Extract raw uncompressed pixel buffer of jewel & contact fingers without downsampling | M1 | ORIGINAL_REQUEST §R1 |
| F3 | Surgical Mask Generation | Generate precise binary & feathered masks isolating collar and fabric | M1 | ORIGINAL_REQUEST §R2 |
| F4 | Photorealistic Apparel Inpainting | Inpaint black silk slip dress with delicate straps & exposed clavicle via FAL AI FLUX Fill | M2 | ORIGINAL_REQUEST §R2 |
| F5 | Anatomical Shadow & Seam Blending | Synthesize realistic ambient occlusion shadows on neck/clavicle with zero seam artifacts | M2 | ORIGINAL_REQUEST §R2 |
| F6 | Sandwich Alpha Re-Compositing | Layer untouched jewel buffer back onto inpainted canvas with Gaussian feathered alpha boundary ($\sigma = 4.0\text{px}$) | M2 | ORIGINAL_REQUEST §R1 |
| F7 | Anello Imperial WebP Production | Generate high-res 1024x1536 WebP asset for Anello Imperial Slot 1 | M2 | ORIGINAL_REQUEST §R3 |
| F8 | Catalog Replicable Automation CLI | Create automated CLI script (`scripts/restyle_jewel_pipeline.mjs`) for batch processing any catalog product | M3 | ORIGINAL_REQUEST §R3 |
| F9 | E2E Pixel-Diff & Macro Zoom Verification | Automated test suite verifying 0.00% pixel distortion in the jewel zone under 200%-300% zoom | M4 | ORIGINAL_REQUEST Acceptance Criteria |
| F10 | Forensic Integrity Audit & Gate | Comprehensive audit ensuring no hardcoded mocks or lossy regressions | M4 | Orchestrator Governance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Masking & ROI Extraction Engine | Surgical ROI bounding, mask generator, buffer isolation | Survey | IN_PROGRESS |
| 2 | M2: Inpainting, Blending & Imperial Production | FLUX Fill inpainting, sandwich compositing, Anello Imperial 1024x1536 WebP | M1 | PLANNED |
| 3 | M3: Standardized CLI & Batch Automation | Replicable CLI script with configurable ROIs for catalog products | M2 | PLANNED |
| 4 | M4: Comprehensive E2E Verification & Forensic Audit | 4-tier E2E tests, pixel diff validation, 2x reviewer + 2x challenger + auditor gate | M3 | PLANNED |

## Interface Contracts
### Mask & ROI Pipeline (`lib/jewel-masking.mjs` / `scripts/restyle_jewel_pipeline.mjs`)
- `extractJewelBuffer(inputPath: string, roi: { left, top, width, height }) -> Promise<Buffer>`
- `createDressMask(inputPath: string, options: { collarZone, dressZone, preserveZone }) -> Promise<{ maskBuffer: Buffer, visualMaskPath: string }>`
- `inpaintApparel(imageBuffer: Buffer, maskBuffer: Buffer, prompt: string) -> Promise<Buffer>`
- `compositeSandwich(inpaintedBuffer: Buffer, originalBuffer: Buffer, jewelMaskBuffer: Buffer, sigma: number) -> Promise<Buffer>`
- `exportWebP(buffer: Buffer, outputPath: string, options: { width: 1024, height: 1536, quality: 92 }) -> Promise<{ width, height, size, format }>`

## Code Layout
- `public/Archive/isabel-pepe-anello-imperial-slot1_ORIGINAL.webp`: Master untouched source
- `public/Brand/isabel-pepe-anello-imperial-slot1.webp`: High-res production WebP output
- `scripts/restyle_jewel_pipeline.mjs`: Core production pipeline CLI
- `scripts/verify_pixel_integrity.mjs`: Automated pixel-diff and macro-zoom verification suite
- `tests/e2e_restyle_pipeline.test.mjs`: E2E test harness

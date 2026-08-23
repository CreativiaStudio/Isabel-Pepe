# E2E Test Infra: Isabel Pepe Admin Upload System

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internals.
- Methodology: Category-Partition + BVA (Boundary Value Analysis) + Pairwise + Workload Testing.

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------|:------:|:------:|:------:|:------:|
| 1 | Resilient Upload Ingestion & Safe Parsing | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Route Handler 20MB Limit & Guaranteed JSON | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Client-Side Pre-processing & WebP 85% | R2 | 5 | 5 | ✓ | ✓ |
| 4 | Instant Blob Previews & Slot Retry | R2 | 5 | 5 | ✓ | ✓ |
| 5 | Cloudflare R2 Upload & Sharp Auto-Rotate Fallback | R3 | 5 | 5 | ✓ | ✓ |
| 6 | Server Action Upload Fallback (`uploadProductImageAction`) | R3 | 5 | 5 | ✓ | ✓ |
| 7 | 5-Slot Gallery Synchronization & Persistence | R4 | 5 | 5 | ✓ | ✓ |
| 8 | Untouched Slot Preservation (`Set Isabel Rose A145`) | R4 | 5 | 5 | ✓ | ✓ |
| 9 | Modernized Admin Table Thumbnail Upload | R4 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test runner: Node.js test runner / vitest / custom test scripts in `tests/`
- Command: `node tests/run-all-tests.mjs` or `npm test`
- Pass/Fail Semantics: Exit code 0 on 100% pass, non-zero on failure.

## Coverage Goals
- Tier 1: ≥5 per feature (isolated happy path)
- Tier 2: ≥5 per feature (boundaries: empty, 20MB limit, invalid formats, HTML server responses, sharp crash)
- Tier 3: Pairwise combinations (e.g. 20MB + Server Action fallback, slot1 replace + slot2 unchanged, etc.)
- Tier 4: Real-world scenarios (e.g. `Set Isabel Rose (A145)` full multi-slot update, camera photo compression to R2).

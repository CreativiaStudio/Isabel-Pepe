import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Global Mocking for Next.js 16 Server Action & revalidatePath runtime context
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { workAsyncStorage } = require('next/dist/server/app-render/work-async-storage.external');
  if (workAsyncStorage) {
    workAsyncStorage.getStore = () => ({
      incrementalCache: {
        revalidateTag: () => {},
      },
      route: '/admin',
      page: '/admin',
    });
  }
} catch {
  // Ignore if not available
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { workUnitAsyncStorage } = require('next/dist/server/app-render/work-unit-async-storage.external');
  if (workUnitAsyncStorage) {
    workUnitAsyncStorage.getStore = () => ({
      phase: 'action',
      type: 'action',
    });
  }
} catch {
  // Ignore if not available
}

import sharp from 'sharp';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '../../lib/supabase';
import { getR2Config, getR2Client } from '../../lib/r2';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export class TestRunner {
  private results: TestResult[] = [];
  private suiteName: string;

  constructor(suiteName: string) {
    this.suiteName = suiteName;
  }

  async test(name: string, fn: () => Promise<void> | void): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({
        suite: this.suiteName,
        name,
        passed: true,
        durationMs,
      });
      console.log(`  \x1b[32m✔\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
    } catch (err: unknown) {
      const durationMs = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.results.push({
        suite: this.suiteName,
        name,
        passed: false,
        durationMs,
        error: errorMsg,
      });
      console.error(`  \x1b[31m✖\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
      console.error(`    \x1b[31mError: ${errorMsg}\x1b[0m`);
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  summary(): { total: number; passed: number; failed: number; totalDurationMs: number } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    const totalDurationMs = this.results.reduce((acc, r) => acc + r.durationMs, 0);
    return { total, passed, failed, totalDurationMs };
  }
}

// Assertions
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      `Assertion Failed: ${message || ''}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}`
    );
  }
}

export function assertIncludes(actual: string, expectedSubstring: string, message?: string): void {
  if (!actual || !actual.includes(expectedSubstring)) {
    throw new Error(
      `Assertion Failed: ${message || ''}\n  Expected string to include: "${expectedSubstring}"\n  Actual string: "${actual}"`
    );
  }
}

export function assertDefined<T>(val: T | null | undefined, message?: string): asserts val is T {
  if (val === undefined || val === null) {
    throw new Error(`Assertion Failed: Expected value to be defined. ${message || ''}`);
  }
}

// Image Generator Helpers
export async function createSampleImageBuffer(options: {
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp';
  color?: { r: number; g: number; b: number };
} = {}): Promise<Buffer> {
  const width = options.width || 200;
  const height = options.height || 200;
  const format = options.format || 'jpeg';
  const color = options.color || { r: 212, g: 175, b: 55 }; // Gold

  const pipeline = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color,
    },
  });

  if (format === 'jpeg') {
    return pipeline.jpeg({ quality: 85 }).toBuffer();
  } else if (format === 'png') {
    return pipeline.png().toBuffer();
  } else if (format === 'webp') {
    return pipeline.webp({ quality: 85 }).toBuffer();
  }
  return pipeline.jpeg().toBuffer();
}

export async function createMockImageFile(options: {
  name?: string;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp';
  sizeBytes?: number;
  corrupted?: boolean;
} = {}): Promise<File> {
  const name = options.name || `test-image-${Date.now()}.${options.format || 'jpg'}`;
  const mimeType = options.format === 'png' ? 'image/png' : options.format === 'webp' ? 'image/webp' : 'image/jpeg';

  if (options.corrupted) {
    const corruptBuffer = Buffer.from('NOT_A_VALID_IMAGE_HEADER_CORRUPTED_STREAM_' + Date.now());
    return new File([corruptBuffer], name, { type: mimeType });
  }

  if (options.sizeBytes) {
    // Generate valid raw JPEG or buffer of target size
    const imgBuffer = await createSampleImageBuffer({ width: options.width || 500, height: options.height || 500, format: options.format });
    if (imgBuffer.length >= options.sizeBytes) {
      return new File([imgBuffer.subarray(0, options.sizeBytes)], name, { type: mimeType });
    }
    const targetBuffer = Buffer.alloc(options.sizeBytes);
    imgBuffer.copy(targetBuffer, 0, 0, imgBuffer.length);
    return new File([targetBuffer], name, { type: mimeType });
  }

  const imgBuffer = await createSampleImageBuffer({
    width: options.width,
    height: options.height,
    format: options.format,
  });

  return new File([imgBuffer], name, { type: mimeType });
}

// Mock Request Factory for Route Handlers
export function createMockUploadRequest(formData: FormData): NextRequest {
  return new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });
}

// Client Safe Response Parser implementation according to PROJECT.md Contract #4
export async function safeParseUploadResponse(res: Response): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, error: data.error || `Errore HTTP ${res.status}` };
      }
      return { success: true, url: data.url };
    }

    // Non-JSON response (e.g. HTML 500/502/413 error page from Next.js / Cloudflare / Nginx)
    const rawText = await res.text().catch(() => '');
    
    if (res.status === 413) {
      return { success: false, error: 'La dimensione del file supera il limite massimo di 20MB.' };
    }
    if (res.status === 502 || res.status === 504) {
      return { success: false, error: 'Gateway di caricamento temporaneamente non disponibile. Riprova.' };
    }
    if (res.status >= 500) {
      return { success: false, error: 'Errore interno del server durante il caricamento su Cloudflare R2.' };
    }

    // Try to extract text error or fallback
    const cleanText = rawText.replace(/<[^>]*>?/gm, '').trim();
    return {
      success: false,
      error: cleanText.slice(0, 100) || `Errore imprevisto di rete (Status ${res.status})`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore imprevisto durante l\'elaborazione della risposta.',
    };
  }
}

// Client-Side Image Pre-Processing reference implementation matching PROJECT.md Contract #3
export async function compressImageClientNode(file: File, options: { maxDim?: number; quality?: number } = {}): Promise<File> {
  if (file.size < 1024 * 1024 || !file.type.startsWith('image/')) {
    return file;
  }
  const maxDim = options.maxDim || 2000;
  const quality = options.quality || 85;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    let pipeline = sharp(buffer).rotate(); // auto-rotate EXIF

    if (width > maxDim || height > maxDim) {
      pipeline = pipeline.resize({
        width: width > height ? maxDim : undefined,
        height: height >= width ? maxDim : undefined,
        withoutEnlargement: true,
      });
    }

    const compressedBuffer = await pipeline.webp({ quality }).toBuffer();
    const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
    return new File([compressedBuffer], newName, { type: 'image/webp' });
  } catch {
    // If sharp fails to parse client-side (e.g. unknown format), fallback to original file
    return file;
  }
}

// Database Cleanup Helpers
export async function cleanupTestProducts(productIds: string[]): Promise<void> {
  if (!productIds || productIds.length === 0) return;
  try {
    await supabaseAdmin.from('products').delete().in('id', productIds);
  } catch (err) {
    console.warn('Warning during test products cleanup:', err);
  }
}

export async function cleanupTestR2Object(urlOrKey: string): Promise<void> {
  try {
    const { bucketName, publicUrl } = getR2Config();
    let key = urlOrKey;
    if (key.startsWith(publicUrl)) {
      key = key.replace(`${publicUrl}/`, '');
    }
    const client = getR2Client();
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
  } catch {
    // Non-blocking cleanup
  }
}

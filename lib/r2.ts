import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const DEFAULT_R2_ACCOUNT_ID = 'cdc3d1bfef17f23cb453fe2737b2ede8';
const DEFAULT_R2_ACCESS_KEY_ID = 'a15ba732cf75ed7cb171a095e794a479';
const DEFAULT_R2_SECRET_ACCESS_KEY = '4f09e1eb767175bf174301dfb41ea4c38c9aac8648aafb78d9914239d6a6093f';
const DEFAULT_R2_BUCKET_NAME = 'isabel-pepe';
const DEFAULT_R2_PUBLIC_URL = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev';

export function getR2Config() {
  const accountId = (process.env.R2_ACCOUNT_ID || DEFAULT_R2_ACCOUNT_ID).trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || DEFAULT_R2_ACCESS_KEY_ID).trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || DEFAULT_R2_SECRET_ACCESS_KEY).trim();
  const bucketName = (process.env.R2_BUCKET_NAME || DEFAULT_R2_BUCKET_NAME).trim();
  const publicUrl = (process.env.R2_PUBLIC_URL || DEFAULT_R2_PUBLIC_URL).trim();

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

export function getR2Client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    forcePathStyle: true,
  });
}

// Proxy getter for backwards compatibility
export const r2Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    const client = getR2Client();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? (val as (...args: unknown[]) => unknown).bind(client) : val;
  }
});

export type UploadableFile = File | Blob | Buffer | Uint8Array;

export interface UploadToR2Options {
  originalName?: string;
  mimeType?: string;
}

function sanitizeKeyPart(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function detectMimeAndExt(originalName?: string, mimeType?: string): { ext: string; mime: string; isImage: boolean } {
  let ext = '';
  let mime = mimeType || '';

  if (originalName && originalName.includes('.')) {
    ext = originalName.split('.').pop()?.toLowerCase() || '';
  }

  if (!mime && ext) {
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
      heic: 'image/heic',
      heif: 'image/heif',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
      pdf: 'application/pdf',
    };
    if (mimeMap[ext]) mime = mimeMap[ext];
  }

  if (!ext && mime) {
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/gif': 'gif',
      'image/heic': 'heic',
      'image/heif': 'heif',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'application/pdf': 'pdf',
    };
    if (extMap[mime]) ext = extMap[mime];
  }

  const isImage = (mime && mime.startsWith('image/')) || /^(jpg|jpeg|png|webp|avif|gif|heic|heif|svg|bmp|tiff)$/i.test(ext);
  return {
    ext: ext || (isImage ? 'jpg' : 'bin'),
    mime: mime || (isImage ? 'image/jpeg' : 'application/octet-stream'),
    isImage: Boolean(isImage),
  };
}

export async function uploadToR2(
  file: UploadableFile,
  folder: string = 'products',
  customName?: string,
  options?: UploadToR2Options
): Promise<string> {
  const { bucketName, publicUrl } = getR2Config();

  // 1. Normalize buffer and extract metadata
  let buffer: Buffer;
  let originalName = options?.originalName;
  let originalMime = options?.mimeType;

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if (file instanceof Uint8Array) {
    buffer = Buffer.from(file.buffer, file.byteOffset, file.byteLength);
  } else if (typeof (file as Blob).arrayBuffer === 'function') {
    const arrayBuffer = await (file as Blob).arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    if ('name' in file && typeof (file as { name: unknown }).name === 'string') {
      originalName = originalName || (file as { name: string }).name;
    }
    if ('type' in file && typeof (file as { type: unknown }).type === 'string') {
      originalMime = originalMime || (file as { type: string }).type;
    }
  } else {
    throw new Error('Tipo di file non supportato per uploadToR2');
  }

  const { ext: originalExt, mime: initialMime, isImage } = detectMimeAndExt(originalName, originalMime);

  let finalBuffer = buffer;
  let finalContentType = initialMime;
  let finalExt = originalExt;

  // 2. Sharp Image Optimization with Auto-Rotate and Fallback
  if (isImage) {
    try {
      finalBuffer = await sharp(buffer)
        .rotate()
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
      finalContentType = 'image/webp';
      finalExt = 'webp';
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('[uploadToR2] Sharp optimization skipped or failed, fallback to raw buffer:', errMsg);
      finalBuffer = buffer;
      finalContentType = initialMime;
      finalExt = originalExt;
    }
  }

  // 3. Key Generation & Sanitization
  const cleanFolder = folder.replace(/\.\./g, '').replace(/^\/+|\/+$/g, '').trim() || 'products';
  let baseFileName = '';
  if (customName && customName.trim()) {
    const strippedName = customName.replace(/\.[^/.]+$/, '').trim();
    baseFileName = sanitizeKeyPart(strippedName) || `upload-${Date.now()}`;
  } else {
    baseFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  const key = `${cleanFolder}/${baseFileName}.${finalExt}`;

  // 4. Upload to Cloudflare R2
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: finalBuffer,
    ContentLength: finalBuffer.length,
    ContentType: finalContentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await client.send(command);

  const cleanPublicUrl = publicUrl.replace(/\/+$/, '');
  return `${cleanPublicUrl}/${key}`;
}

export async function renameR2Object(oldKey: string, newKey: string): Promise<boolean> {
  try {
    const { bucketName } = getR2Config();
    const client = getR2Client();

    // 1. Copia l'oggetto
    await client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey
    }));

    // 2. Cancella il vecchio oggetto
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldKey
    }));

    return true;
  } catch (error) {
    console.error("Errore nella rinominazione su R2:", error);
    return false;
  }
}

export async function deleteR2Object(key: string): Promise<boolean> {
  try {
    const { bucketName } = getR2Config();
    const client = getR2Client();

    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    }));

    return true;
  } catch (error) {
    console.error("Errore nella cancellazione da R2:", error);
    return false;
  }
}

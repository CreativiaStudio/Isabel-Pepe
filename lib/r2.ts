import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';

export function getR2Client(): S3Client {
  const accountId = (process.env.R2_ACCOUNT_ID || '').trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn("Attenzione: Credenziali Cloudflare R2 non ancora caricate:", {
      hasAccountId: !!accountId,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
    });
  }

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
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

export async function uploadToR2(file: File, folder: string = 'products', customName?: string): Promise<string> {
  const isImage = file.type.startsWith('image/');
  const ext = isImage ? 'webp' : file.name.split('.').pop();
  
  let fileName = '';
  if (customName) {
    fileName = `${customName}.${ext}`;
  } else {
    fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
  }
  
  const key = `${folder}/${fileName}`;
  
  const arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  let contentType = file.type;

  // Ottimizzazione Immagini con Sharp
  if (isImage) {
    try {
      buffer = await sharp(buffer)
        .resize({ width: 1500, withoutEnlargement: true }) // Scala intelligente
        .webp({ quality: 80, effort: 4 }) // Compressione ottimizzata
        .toBuffer();
      contentType = 'image/webp';
    } catch (err) {
      console.error("Errore elaborazione Sharp:", err);
      // Se fallisce (es. formato non supportato), proseguiamo col buffer originale
    }
  }

  const uint8Array = new Uint8Array(buffer);
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: uint8Array,
    ContentLength: uint8Array.length,
    ContentType: contentType,
  });

  await client.send(command);

  // Ritorna l'URL pubblico
  const publicUrlBase = process.env.R2_PUBLIC_URL || 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev';
  return `${publicUrlBase}/${key}`;
}

export async function renameR2Object(oldKey: string, newKey: string): Promise<boolean> {
  try {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) return false;
    const client = getR2Client();

    // 1. Copia l'oggetto
    await client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`,
      Key: newKey
    }));

    // 2. Cancella il vecchio oggetto
    await client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: oldKey
    }));

    return true;
  } catch (error) {
    console.error("Errore nella rinominazione su R2:", error);
    return false;
  }
}

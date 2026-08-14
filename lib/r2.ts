import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${(process.env.R2_ACCOUNT_ID || '').trim()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: (process.env.R2_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || '').trim(),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  forcePathStyle: true,
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
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: uint8Array,
    ContentLength: uint8Array.length,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Ritorna l'URL pubblico (necessita di R2_PUBLIC_URL in .env)
  // Se R2_PUBLIC_URL non c'è, mettiamo un segnaposto temporaneo
  const publicUrlBase = process.env.R2_PUBLIC_URL || 'https://INSERIRE_DOMINIO_PUBBLICO_R2';
  return `${publicUrlBase}/${key}`;
}

export async function renameR2Object(oldKey: string, newKey: string): Promise<boolean> {
  try {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) return false;

    // 1. Copia l'oggetto
    await r2Client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`,
      Key: newKey
    }));

    // 2. Cancella il vecchio oggetto
    await r2Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: oldKey
    }));

    return true;
  } catch (error) {
    console.error("Errore nella rinominazione su R2:", error);
    return false;
  }
}

import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const DEFAULT_R2_ACCOUNT_ID = '1e5fb92e860959f6d4d1421fec22aee7';
const DEFAULT_R2_ACCESS_KEY_ID = 'e26a7eef46c26b5289f666f437021707';
const DEFAULT_R2_SECRET_ACCESS_KEY = 'b8b548b8137350cb4a5e2f7c006fcbb5dbb1a806ea5561a007f59d57a2c67ce7';
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
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

export async function uploadToR2(file: File, folder: string = 'products', customName?: string): Promise<string> {
  const { bucketName, publicUrl } = getR2Config();
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
        .resize({ width: 1500, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
      contentType = 'image/webp';
    } catch (err) {
      console.error("Errore elaborazione Sharp:", err);
    }
  }

  const uint8Array = new Uint8Array(buffer);
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: uint8Array,
    ContentLength: uint8Array.length,
    ContentType: contentType,
  });

  await client.send(command);

  return `${publicUrl}/${key}`;
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

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const env: any = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true
});

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function uploadToR2(filePath: string, bucket: string, key: string) {
  const fileContent = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'image/jpeg';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.webp') contentType = 'image/webp';

  await r2Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  }));

  return `${env.R2_PUBLIC_URL}/${key}`;
}

async function addProduct() {
  const name = "Collana Éclipse";
  const sku = "BTN006";
  const slug = slugify(name);
  const folderPath = 'C:/Users/mario/Progetti Antigravity/isabel-pepe/Generazione foto/prodotti finiti/BTN006-NECKLACE - Collana Éclipse';

  console.log(`Sto caricando le immagini da: ${folderPath}`);
  
  const files = fs.readdirSync(folderPath);
  const galleryUrls = ["", "", "", "", ""];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file);
    const customName = `isabel-pepe-${slug}-slot${i+1}${ext}`;
    const key = `products/${customName}`;
    
    console.log(`Carico ${file} in R2 come ${key}...`);
    const publicUrl = await uploadToR2(path.join(folderPath, file), env.R2_BUCKET_NAME, key);
    galleryUrls[i] = publicUrl;
  }

  const primaryUrl = galleryUrls[1] || galleryUrls[0] || null;
  const secondaryUrl = galleryUrls[0] || null;

  console.log(`Inserisco ${name} nel DB...`);
  const { data, error } = await supabaseAdmin.from('products').insert({
    name,
    slug,
    sku,
    description: "Collana Éclipse in Argento 925",
    materials: "Argento 925 nichel free",
    price: 90,
    stock: 10,
    category: "Collane",
    image_primary: primaryUrl,
    image_secondary: secondaryUrl,
    gallery: galleryUrls,
    is_active: true
  }).select().single();

  if (error) {
    console.error('Errore DB:', error);
  } else {
    console.log('Prodotto creato con successo!', data);
  }
}

addProduct().catch(console.error);

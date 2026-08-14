import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Carica variabili d'ambiente
const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const r2AccountId = env.R2_ACCOUNT_ID;
const r2AccessKey = env.R2_ACCESS_KEY_ID;
const r2SecretKey = env.R2_SECRET_ACCESS_KEY;
const r2Bucket = env.R2_BUCKET_NAME;

if (!r2AccountId || !r2AccessKey || !r2SecretKey || !r2Bucket) {
  console.error("Mancano le chiavi API per R2 in .env.local");
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKey,
    secretAccessKey: r2SecretKey,
  },
});

const baseDir = path.resolve(process.cwd(), 'public/Products');

async function massUploadRaw() {
  console.log("🚀 Inizio Upload Massivo Raw su Cloudflare R2...");

  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  const folders = items.filter(i => i.isDirectory() && i.name !== 'Ispirazioni_e_Bozze' && i.name !== 'transparent_temp').map(i => i.name);

  let uploadedCount = 0;

  for (const folder of folders) {
    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath);

    if (files.length === 0) continue;

    console.log(`\n📁 Cartella: ${folder}`);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const ext = path.extname(file).toLowerCase();
      
      // Ignora file di sistema o non multimediali (opzionale)
      if (ext === '.DS_Store' || ext === '') continue;

      try {
        const fileBuffer = fs.readFileSync(filePath);
        
        // Manteniamo la struttura della cartella: products/NOME_CARTELLA/NOME_FILE.ext
        // R2 accetta spazi, ma è buona norma non farli url-encoded nel nome della Key. Lo fa S3 internamente se necessario.
        const r2Key = `products/${folder}/${file}`;
        
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.mp4') contentType = 'video/mp4';

        const command = new PutObjectCommand({
          Bucket: r2Bucket,
          Key: r2Key,
          Body: fileBuffer,
          ContentType: contentType,
        });

        await r2Client.send(command);
        console.log(`   -> ☁️ Uploaded: ${file}`);
        uploadedCount++;

      } catch (uploadError: any) {
        console.error(`   ❌ Errore upload di ${file}:`, uploadError.message);
      }
    }
  }

  console.log(`\n🎉 Completato! Caricati ${uploadedCount} file raw in R2.`);
}

massUploadRaw();

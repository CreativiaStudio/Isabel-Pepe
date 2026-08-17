import fs from 'fs';
import path from 'path';
import https from 'https';

const downloadFile = (url: string, dest: string) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function updateMegaMenuImages() {
  const images = {
    anelli: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-anello-ch-telaine-silver-slot2.webp',
    orecchini: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-orecchini-op-ra-slot2.webp',
    set: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-vivienne-slot2.webp'
  };

  const productsDir = path.resolve(process.cwd(), 'public/Products');

  console.log('Downloading Anelli slot2...');
  await downloadFile(images.anelli, path.join(productsDir, 'mega_menu_anelli.webp'));

  console.log('Downloading Orecchini slot2...');
  await downloadFile(images.orecchini, path.join(productsDir, 'mega_menu_orecchini.webp'));

  console.log('Downloading Set slot2...');
  await downloadFile(images.set, path.join(productsDir, 'mega_menu_set.webp'));

  console.log('Done downloading mega menu images!');
}

updateMegaMenuImages().catch(console.error);

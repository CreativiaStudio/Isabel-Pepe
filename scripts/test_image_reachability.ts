import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getMediaLibrary } from '../app/admin/actions';

async function testImagesHttp() {
  const media = await getMediaLibrary();
  console.log(`Testing HTTP reachability for ${media.length} items on R2...`);

  let reachableCount = 0;
  let failedCount = 0;

  for (let i = 0; i < Math.min(media.length, 20); i++) {
    const item = media[i];
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      if (res.ok) {
        reachableCount++;
        console.log(`[OK ${res.status}] ${item.name}`);
      } else {
        failedCount++;
        console.log(`[FAIL ${res.status}] ${item.url}`);
      }
    } catch (e: any) {
      failedCount++;
      console.log(`[ERR] ${item.url} -> ${e.message}`);
    }
  }

  console.log(`\nReachable: ${reachableCount}, Failed: ${failedCount}`);
}

testImagesHttp();

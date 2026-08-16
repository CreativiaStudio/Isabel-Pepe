import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getMediaLibrary } from '../app/admin/actions';

async function testGetMedia() {
  console.log('Calling getMediaLibrary()...');
  try {
    const res = await getMediaLibrary();
    console.log('Result count:', res.length);
    if (res.length > 0) {
      console.log('First item:', res[0]);
    }
  } catch (err: any) {
    console.error('Error:', err);
  }
}

testGetMedia();

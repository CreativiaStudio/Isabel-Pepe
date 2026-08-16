import * as fs from 'fs';
import * as path from 'path';

const htmlDir = path.resolve(process.cwd(), '.next/server/app');
console.log(`Checking HTML files in: ${htmlDir}`);

if (!fs.existsSync(htmlDir)) {
  console.error("HTML directory does not exist!");
  process.exit(1);
}

const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html') && !f.startsWith('_'));

console.log(`\nFound ${files.length} static HTML pages:\n`);

let failed = false;

for (const file of files) {
  const content = fs.readFileSync(path.join(htmlDir, file), 'utf8');
  
  // 1. Title
  const titleMatch = content.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';
  const titleLen = title.length;
  const titleOk = titleLen <= 60 && titleLen > 0;

  // 2. Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                    content.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const desc = descMatch ? descMatch[1] : '';
  const descLen = desc.length;
  const descOk = descLen >= 140 && descLen <= 155;

  // 3. H1 tag
  const h1Matches = content.match(/<h1[\s\S]*?<\/h1>/gi) || [];
  const h1Count = h1Matches.length;
  const h1Ok = h1Count === 1;

  // 4. Forbidden terms
  const hasMoiss = /moissanite/i.test(content);
  const hasMadeInItaly = /made\s+in\s+italy|manifattura\s+italiana|alta\s+gioielleria|alta\s+oreficeria/i.test(content);
  const termsOk = !hasMoiss && !hasMadeInItaly;

  console.log(`📄 Page: ${file}`);
  console.log(`   Title (${titleLen} chars): [${titleOk ? '✅' : '❌'}] "${title}"`);
  console.log(`   Description (${descLen} chars): [${descOk ? '✅' : '❌'}] "${desc}"`);
  console.log(`   H1 Count (${h1Count}): [${h1Ok ? '✅' : '❌'}] ${h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).join(' | ')}`);
  console.log(`   Banned terms: [${termsOk ? '✅' : '❌'}] moiss=${hasMoiss}, madeInItaly=${hasMadeInItaly}`);
  console.log('');

  if (!titleOk || !descOk || !h1Ok || !termsOk) {
    failed = true;
  }
}

if (failed) {
  console.error("❌ PRE-RENDERED HTML VALIDATION FAILED!");
  process.exit(1);
} else {
  console.log("🎉 ALL PRE-RENDERED HTML PAGES PASSED 100% OF VALIDATION CHECKS!");
}

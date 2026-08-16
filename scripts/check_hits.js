import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.cwd();
const scriptFiles = [];
function walkScripts(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walkScripts(full);
    else if (/\.(tsx|ts|js|mjs|py)$/i.test(full)) scriptFiles.push(full);
  }
}
walkScripts(path.join(projectRoot, 'scripts'));
const scriptMoissHits = [];
for (const f of scriptFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (/moissanite/i.test(l) && !/\/moissanite\//i.test(l) && !/includes\(['"]moissanite['"]\)/i.test(l) && !/zero\s+moissanite/i.test(l) && !/zero\s+'moissanite'/i.test(l)) {
      scriptMoissHits.push({ file: path.relative(projectRoot, f), line: idx + 1, text: l.trim() });
    }
  });
}
console.log('Script moiss hits count:', scriptMoissHits.length);
scriptMoissHits.forEach(h => console.log(h.file + ':' + h.line + ' -> ' + h.text.substring(0, 80)));

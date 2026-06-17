import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));

const copy = (src, dst) => {
  const s = join(dir, src);
  const d = join(dir, dst);
  if (!existsSync(s)) {
    console.log(`❌ לא נמצא: ${src}`);
    return;
  }
  copyFileSync(s, d);
  console.log(`✅ הועתק: ${src} → ${dst}`);
};

copy('4601600-SARUSI INBAR MS.pdf', 'public/boarding-inbar.pdf');
copy('4601600-BASHARI OZ MR.pdf',   'public/boarding-oz.pdf');

console.log('\n🎫 סיום! הכרטיסים מוכנים ב-public/');

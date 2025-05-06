import fs from 'fs/promises';
import path from 'path';

const src = path.resolve('dist');
const dest = path.resolve('cdn');

try {
  await fs.mkdir(dest, {recursive: true});

  const files = await fs.readdir(src);

  for (const file of files) {
    const fullPath = path.join(src, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await copyDtsFiles(fullPath, dest);
    } else if (file.endsWith('.d.ts')) {
      const destPath = path.join(dest, path.basename(fullPath));
      await fs.copyFile(fullPath, destPath);
      console.log(`Copied: ${fullPath} -> ${destPath}`);
    }
  }
} catch (error) {
  console.error(`Error copying files: ${error.message}`);
}

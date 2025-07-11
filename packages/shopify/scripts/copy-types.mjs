import fs from 'node:fs/promises';
import path from 'node:path';

const src = path.resolve('dist');
const dest = path.resolve('cdn');

async function copyFiles(src, dest) {
  try {
    await fs.mkdir(dest, {recursive: true});

    const files = await fs.readdir(src);

    for (const file of files) {
      const fullPath = path.join(src, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await copyFiles(fullPath, path.join(dest, file));
      } else if (file.endsWith('.d.ts')) {
        const destPath = path.join(dest, path.basename(fullPath));
        await fs.copyFile(fullPath, destPath);
        console.log(`Copied: ${fullPath} -> ${destPath}`);
      }
    }
  } catch (error) {
    console.error(`Error copying files: ${error.message}`);
  }
}

await copyFiles(src, dest);

import {promises as fs} from 'node:fs';
import path from 'node:path';

const files = [
  path.resolve('src/components/stencil-generated/commerce/index.ts'),
  path.resolve('src/components/stencil-generated/search/index.ts'),
];

const oldImport =
  "import { defineCustomElements } from '@coveo/atomic/dist/atomic/loader';";
const newImport =
  "import { defineCustomElements } from '@coveo/atomic/loader';";

const updateFiles = async () => {
  await Promise.all(
    files.map(async (filePath) => {
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const updatedData = data.replace(oldImport, newImport);
        await fs.writeFile(filePath, updatedData, 'utf8');
        console.log(`File updated: ${filePath}`);
      } catch (err) {
        console.error(`Error updating file: ${filePath}`, err);
      }
    })
  );
};

updateFiles();

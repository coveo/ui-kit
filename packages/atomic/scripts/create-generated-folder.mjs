import fs from 'node:fs';
import {promisify} from 'util';

const rm = promisify(fs.rm);
const mkdir = promisify(fs.mkdir);

async function createGeneratedFolder() {
  const generatedPath = 'src/generated';
  await rm(generatedPath, {recursive: true, force: true});
  await mkdir(generatedPath);
}

void createGeneratedFolder();

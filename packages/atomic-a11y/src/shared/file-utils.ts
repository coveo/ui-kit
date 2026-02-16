import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function wasExecutedDirectly(): boolean {
  const currentFilePath = fileURLToPath(import.meta.url);
  const entryFile = process.argv[1];

  if (!entryFile) {
    return false;
  }

  return path.resolve(entryFile) === currentFilePath;
}

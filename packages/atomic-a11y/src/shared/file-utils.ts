import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function wasExecutedDirectly(callerMetaUrl: string): boolean {
  const currentFilePath = fileURLToPath(callerMetaUrl);
  const entryFile = process.argv[1];

  if (!entryFile) {
    return false;
  }

  return path.resolve(entryFile) === currentFilePath;
}

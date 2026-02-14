import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isRecord} from './guards.js';

export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(content) as unknown;

  if (!isRecord(parsed)) {
    throw new Error(`Invalid JSON file: ${filePath}`);
  }

  return parsed as T;
}

export function wasExecutedDirectly(): boolean {
  const currentFilePath = fileURLToPath(import.meta.url);
  const entryFile = process.argv[1];

  if (!entryFile) {
    return false;
  }

  return path.resolve(entryFile) === currentFilePath;
}

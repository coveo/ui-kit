import {readFile} from 'node:fs/promises';
import {isRecord} from './guards.js';

export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(content) as unknown;

  if (!isRecord(parsed)) {
    throw new Error(`Invalid JSON file: ${filePath}`);
  }

  return parsed as T;
}

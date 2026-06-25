import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {TemplateId} from './types.js';

const templateCache = new Map<TemplateId, string>();

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatesDir = resolve(packageRoot, 'templates');

export async function loadTemplate(templateId: TemplateId): Promise<string> {
  const cached = templateCache.get(templateId);
  if (cached !== undefined) {
    return cached;
  }

  const filePath = resolve(templatesDir, `${templateId}.txt`);
  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch {
    throw new Error(
      `Fatal: template file not found: ${filePath}. Ensure all template files exist before starting the server.`
    );
  }

  templateCache.set(templateId, content);
  return content;
}

export function clearTemplateCache(): void {
  templateCache.clear();
}

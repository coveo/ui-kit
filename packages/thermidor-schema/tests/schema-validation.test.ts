import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');

async function loadJsonFiles(
  directory: string
): Promise<Array<{path: string; value: Record<string, unknown>}>> {
  const entries = await readdir(directory, {withFileTypes: true});
  const files: Array<{path: string; value: Record<string, unknown>}> = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await loadJsonFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push({path: entryPath, value: JSON.parse(await readFile(entryPath, 'utf8'))});
    }
  }
  return files;
}

const schemas = await loadJsonFiles(schemaDirectory);

describe('JSON Schema structural validation', () => {
  const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: true});
  addFormats(ajv);

  it('all schema files have a non-empty absolute $id', () => {
    for (const {path: schemaPath, value: schema} of schemas) {
      expect(typeof schema.$id).toBe('string');
      expect((schema.$id as string).length).toBeGreaterThan(0);
      expect((schema.$id as string).startsWith('https://')).toBe(true);
    }
  });

  it('all schema files are structurally valid JSON Schema 2020-12', () => {
    for (const {path: schemaPath, value: schema} of schemas) {
      const valid = ajv.validateSchema(schema);
      expect(valid, `Schema ${schemaPath} is invalid: ${JSON.stringify(ajv.errors)}`).toBe(true);
      ajv.addSchema(schema);
    }
  });

  it('all $ref references resolve correctly', () => {
    for (const {value: schema} of schemas) {
      const id = schema.$id as string;
      expect(ajv.getSchema(id), `Schema ${id} not resolvable`).toBeDefined();
    }
  });

  it('rejects a schema with missing $id', () => {
    const invalid = {type: 'object', properties: {x: {type: 'string'}}};
    expect(typeof invalid.$id).toBe('undefined');
  });

  it('rejects a schema with relative $id', () => {
    const relative = {$id: 'relative/path.json', type: 'object'};
    expect(relative.$id.startsWith('https://')).toBe(false);
  });
});

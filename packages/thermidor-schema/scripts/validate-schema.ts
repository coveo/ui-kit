import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');

interface SchemaFile {
  path: string;
  value: Record<string, unknown>;
}

async function loadJsonFiles(directory: string): Promise<SchemaFile[]> {
  const entries = await readdir(directory, {withFileTypes: true});
  const files: SchemaFile[] = [];
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
const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: true});
addFormats(ajv);

for (const {path: schemaPath, value: schema} of schemas) {
  if (typeof schema.$id !== 'string' || (schema.$id as string).length === 0) {
    console.error(
      JSON.stringify({
        phase: 'schema-validation',
        artifact: schemaPath,
        expected: 'non-empty absolute $id',
        observed: schema.$id,
        cause: 'Missing or empty $id',
      })
    );
    process.exit(1);
  }
  if (!ajv.validateSchema(schema)) {
    console.error(
      JSON.stringify({
        phase: 'schema-validation',
        artifact: schemaPath,
        expected: 'valid JSON Schema',
        observed: ajv.errors,
        cause: 'Schema validation failed',
      })
    );
    process.exit(1);
  }
  ajv.addSchema(schema);
}

// Verify all $ref resolution works
for (const {value: schema} of schemas) {
  const id = schema.$id as string;
  if (!ajv.getSchema(id)) {
    console.error(
      JSON.stringify({
        phase: 'schema-validation',
        artifact: id,
        expected: 'resolvable schema',
        observed: 'not found',
        cause: '$ref resolution failed',
      })
    );
    process.exit(1);
  }
}

console.log(`Validated ${schemas.length} JSON Schema documents.`);

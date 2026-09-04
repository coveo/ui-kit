import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fc from 'fast-check';
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
const ajv = new Ajv2020({allErrors: true, strict: false, validateFormats: true});
addFormats(ajv);
for (const {path: schemaPath, value: schema} of schemas) {
  ajv.addSchema(schema);
  const fileUrl = new URL(
    path.relative(schemaDirectory, schemaPath).split(path.sep).join('/'),
    'https://schema.thermidor.coveo.com/'
  ).href;
  if (fileUrl !== (schema as {$id?: string}).$id) {
    ajv.addSchema({$id: fileUrl, $ref: (schema as {$id?: string}).$id});
  }
}

// Facet ordering is modeled as the facet-manager component's backend-owned
// state.facetIds, not a catalog field.
const facetOrderingStateSchemaId =
  'https://schema.thermidor.coveo.com/components/facet-manager.schema.json#/$defs/FacetManagerState';

/**
 * Feature: commerce-facet-schemas, Property 5: Facet ordering preserves sequence
 *
 * For any list of facet identifiers (including the empty list, each id matching
 * ^[a-z][a-z0-9-]*$) supplied as a facet-manager component's state.facetIds,
 * the validated representation preserves the input order: for any two positions
 * i < j, the id at i precedes the id at j after validation against the
 * FacetManagerState schema AND after a JSON serialization round-trip.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */
describe('Feature: commerce-facet-schemas, Property 5: Facet ordering preserves sequence', () => {
  const NUM_RUNS = 100;

  // Facet identifiers matching the componentId pattern ^[a-z][a-z0-9-]*$.
  const componentIdArb = fc
    .tuple(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), {
        maxLength: 12,
      })
    )
    .map(([head, tail]) => `${head}${tail}`);

  // Empty list must be valid (Requirement 5.4), so minLength is 0.
  const facetIdsArb = fc.array(componentIdArb, {minLength: 0, maxLength: 15});

  it('preserves state.facetIds sequence after validation and JSON round-trip', () => {
    const validate = ajv.getSchema(facetOrderingStateSchemaId);
    expect(validate, `Ajv did not register ${facetOrderingStateSchemaId}`).toBeDefined();

    fc.assert(
      fc.property(facetIdsArb, (facetIds) => {
        const state = {facetIds};

        // The facet-manager state must be valid.
        expect(validate?.(state)).toBe(true);

        // Order is unchanged after validation (Ajv does not mutate order here).
        expect(state.facetIds).toStrictEqual(facetIds);

        // Order is unchanged after a JSON serialization round-trip.
        const roundTripped = JSON.parse(JSON.stringify(state)) as typeof state;
        expect(roundTripped.facetIds).toStrictEqual(facetIds);
        expect(validate?.(roundTripped)).toBe(true);

        // For any two positions i < j, the id at position i in the validated,
        // round-tripped output matches the id at position i in the input, and
        // likewise for j — so the relative order of every pair is preserved.
        for (let i = 0; i < facetIds.length; i++) {
          for (let j = i + 1; j < facetIds.length; j++) {
            expect(roundTripped.facetIds[i]).toBe(facetIds[i]);
            expect(roundTripped.facetIds[j]).toBe(facetIds[j]);
            expect(i).toBeLessThan(j);
          }
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });
});

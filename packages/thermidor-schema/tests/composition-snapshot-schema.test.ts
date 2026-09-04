import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');
const compositionDirectory = path.join(schemaDirectory, 'composition');
const componentsDirectory = path.join(schemaDirectory, 'components');

const COMPOSITION_SNAPSHOT_ID =
  'https://schema.thermidor.coveo.com/composition/composition-snapshot.schema.json';
const COMPONENT_CONTRACTS_ID =
  'https://schema.thermidor.coveo.com/components/component-contracts.schema.json';
const ID_PATTERN = '^[a-z][a-z0-9-]*$';
const TRIAD_REF = `${COMPONENT_CONTRACTS_ID}#/$defs/ComponentContractsTriad`;

async function readSchema(filePath: string): Promise<Record<string, any>> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

const snapshot = await readSchema(
  path.join(compositionDirectory, 'composition-snapshot.schema.json')
);

describe('composition-snapshot.schema.json structural conventions', () => {
  it('sets $id to the absolute namespace URI under /composition/', () => {
    expect(snapshot.$id).toBe(COMPOSITION_SNAPSHOT_ID);
    expect(snapshot.$id.startsWith('https://schema.thermidor.coveo.com/')).toBe(true);
  });

  it('requires exactly rootId and components (Req 4.1, 4.2)', () => {
    expect(snapshot.required).toEqual(['rootId', 'components']);
  });

  describe('rootId (Req 4.2)', () => {
    it('is a string constrained to the component-id pattern', () => {
      const rootId = snapshot.properties?.rootId;
      expect(rootId?.type).toBe('string');
      expect(rootId?.pattern).toBe(ID_PATTERN);
    });
  });

  describe('components (Req 4.4, 4.5, 4.7)', () => {
    const components = () => snapshot.properties?.components;

    it('is an object', () => {
      expect(components()?.type).toBe('object');
    });

    it('does NOT declare propertyNames (map-key pattern is intentionally not enforced; key integrity is backend-owned)', () => {
      expect(components()?.propertyNames).toBeUndefined();
    });

    it('routes map values through the identity-free ComponentContractsTriad view (Req 4.5)', () => {
      expect(components()?.additionalProperties?.$ref).toBe(TRIAD_REF);
    });

    it('does NOT reference the identity-bearing ComponentContracts union', () => {
      expect(components()?.additionalProperties?.$ref).not.toBe(
        `${COMPONENT_CONTRACTS_ID}#/$defs/ComponentContracts`
      );
    });

    it('does NOT set minProperties so an empty map is allowed (Req 4.7)', () => {
      expect(components()?.minProperties).toBeUndefined();
    });
  });

  describe('no cross-field referential constraint tying rootId to components (Req 4.8)', () => {
    it('declares no if/then/else, dependencies, or dependentSchemas linking the two', () => {
      expect(snapshot.if).toBeUndefined();
      expect(snapshot.then).toBeUndefined();
      expect(snapshot.else).toBeUndefined();
      expect(snapshot.dependencies).toBeUndefined();
      expect(snapshot.dependentSchemas).toBeUndefined();
      expect(snapshot.dependentRequired).toBeUndefined();
      expect(snapshot.allOf).toBeUndefined();
    });
  });
});

describe('ComponentContractsTriad view is identity-free (Req 4.5)', () => {
  it('exists as a oneOf in component-contracts.schema.json', async () => {
    const contracts = await readSchema(
      path.join(componentsDirectory, 'component-contracts.schema.json')
    );
    const triad = contracts.$defs?.ComponentContractsTriad;
    expect(triad).toBeDefined();
    expect(Array.isArray(triad?.oneOf)).toBe(true);
    expect(triad.oneOf.length).toBeGreaterThan(0);
  });
});

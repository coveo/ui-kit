import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {CommerceSearchSchema, ComponentContractsSchema} from '../src/index.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(packageRoot, 'schema');
const componentsDirectory = path.join(schemaDirectory, 'components');
const baseDirectory = path.join(schemaDirectory, 'base');

const BASE_COMPONENT_ID = 'https://schema.thermidor.coveo.com/base/component.schema.json';
const CHILD_REF_ID = 'https://schema.thermidor.coveo.com/definitions/child-ref.schema.json';
const COMMERCE_SEARCH_ID =
  'https://schema.thermidor.coveo.com/components/commerce-search.schema.json';
const COMPONENT_CONTRACTS_ID =
  'https://schema.thermidor.coveo.com/components/component-contracts.schema.json';

async function readSchema(filePath: string): Promise<Record<string, any>> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function collectRefs(node: unknown, refs: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectRefs(item, refs);
    }
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === '$ref' && typeof value === 'string') {
        refs.add(value);
      } else {
        collectRefs(value, refs);
      }
    }
  }
}

const baseSchema = await readSchema(path.join(baseDirectory, 'component.schema.json'));
const commerceSearchSchema = await readSchema(
  path.join(componentsDirectory, 'commerce-search.schema.json')
);
const componentContractsSchema = await readSchema(
  path.join(componentsDirectory, 'component-contracts.schema.json')
);

describe('base component contract composition additions (Req 1.7, 3.2)', () => {
  it('leaves required exactly the base set, excluding children/child', () => {
    expect(baseSchema.required).toEqual([
      'componentId',
      'displayName',
      'componentType',
      'state',
      'actions',
    ]);
    expect(baseSchema.required).not.toContain('children');
    expect(baseSchema.required).not.toContain('child');
  });

  it('declares children and child in its own properties', () => {
    expect(baseSchema.properties?.children).toBeDefined();
    expect(baseSchema.properties?.child).toBeDefined();
  });

  it('children is an array whose items reference the child-ref definition', () => {
    expect(baseSchema.properties?.children?.type).toBe('array');
    expect(baseSchema.properties?.children?.items?.$ref).toBe(CHILD_REF_ID);
  });

  it('child references the child-ref definition', () => {
    expect(baseSchema.properties?.child?.$ref).toBe(CHILD_REF_ID);
  });

  it('children is a string ref (no recursion into a component-object ref)', () => {
    // child-ref is a string definition, not a component document.
    // Guard against a component-document ref sneaking under children/child.
    const compositionRefs = new Set<string>();
    collectRefs(baseSchema.properties?.children, compositionRefs);
    collectRefs(baseSchema.properties?.child, compositionRefs);
    expect(compositionRefs).toEqual(new Set([CHILD_REF_ID]));
    for (const ref of compositionRefs) {
      expect(ref.includes('/components/')).toBe(false);
    }
  });

  it('the child-ref definition itself is a string, not a component object', async () => {
    const childRef = await readSchema(
      path.join(schemaDirectory, 'definitions', 'child-ref.schema.json')
    );
    expect(childRef.$id).toBe(CHILD_REF_ID);
    expect(childRef.type).toBe('string');
    expect(childRef.pattern).toBe('^[a-z][a-z0-9-]*$');
  });
});

describe('commerce-search component contract (Req 5.1, 5.2, 5.5)', () => {
  it('sets $id to the expected absolute id', () => {
    expect(commerceSearchSchema.$id).toBe(COMMERCE_SEARCH_ID);
  });

  it('constrains componentType to the commerce-search constant', () => {
    expect(commerceSearchSchema.properties?.componentType?.const).toBe('commerce-search');
  });

  it('references base/component.schema.json through the top-level allOf', () => {
    expect(Array.isArray(commerceSearchSchema.allOf)).toBe(true);
    const refs = (commerceSearchSchema.allOf as Array<{$ref?: string}>).map((entry) => entry.$ref);
    expect(refs).toContain(BASE_COMPONENT_ID);
  });

  it('adds no required beyond the base set (effective required equals base required)', () => {
    // The document composes required only through the base allOf; it declares
    // no required of its own, so the effective required set equals the base set.
    expect(commerceSearchSchema.required).toBeUndefined();
    const allOfRequired = (commerceSearchSchema.allOf as Array<Record<string, any>>).flatMap(
      (entry) => entry.required ?? []
    );
    expect(allOfRequired).toEqual([]);
    // Effective required is exactly what the base contributes.
    expect(baseSchema.required).toEqual([
      'componentId',
      'displayName',
      'componentType',
      'state',
      'actions',
    ]);
  });

  it('declares children/child in its own properties', () => {
    expect(commerceSearchSchema.properties?.children?.type).toBe('array');
    expect(commerceSearchSchema.properties?.children?.items?.$ref).toBe(CHILD_REF_ID);
    expect(commerceSearchSchema.properties?.child?.$ref).toBe(CHILD_REF_ID);
  });
});

describe('commerce-search discriminated-union membership (Req 5.3, 5.4)', () => {
  it('is a member of the ComponentContracts oneOf', () => {
    const refs = (
      componentContractsSchema.$defs?.ComponentContracts?.oneOf as Array<{$ref?: string}>
    ).map((entry) => entry.$ref);
    expect(refs).toContain(COMMERCE_SEARCH_ID);
  });

  it('references component-contracts through the expected document $id', () => {
    expect(componentContractsSchema.$id).toBe(COMPONENT_CONTRACTS_ID);
  });

  it('has a discriminant distinct from every other union member', async () => {
    const memberRefs = (
      componentContractsSchema.$defs?.ComponentContracts?.oneOf as Array<{$ref?: string}>
    ).map((entry) => entry.$ref!);

    const discriminants = await Promise.all(
      memberRefs.map(async (ref) => {
        const fileName = ref.substring(ref.lastIndexOf('/') + 1);
        const memberSchema = await readSchema(path.join(componentsDirectory, fileName));
        return memberSchema.properties?.componentType?.const as string;
      })
    );

    // Every member exposes a componentType const.
    for (const discriminant of discriminants) {
      expect(typeof discriminant).toBe('string');
    }
    // All discriminants are unique (no collisions across members).
    expect(new Set(discriminants).size).toBe(discriminants.length);
    // commerce-search participates with its own distinct discriminant.
    expect(discriminants).toContain('commerce-search');
  });

  it('exposes commerce-search through the generated ComponentContracts Zod union', () => {
    const option = ComponentContractsSchema.options.find(
      (candidate: any) => candidate.shape.componentType.value === 'commerce-search'
    );
    expect(option).toBe(CommerceSearchSchema);
  });
});

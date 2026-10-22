import path from 'node:path';
import {beforeAll, describe, expect, it} from 'vitest';
import {packageRoot} from './manifest.mjs';
import {createCatalog, findUsageDocs, validateUsageDoc} from './snippets.mjs';
import {analyzeAtomic} from './testing/analyze.mjs';

describe('usage docs', () => {
  let catalog;

  beforeAll(async () => {
    catalog = createCatalog(await analyzeAtomic());
  });

  const docs = findUsageDocs();

  it('should exist', () => {
    expect(docs).not.toHaveLength(0);
  });

  describe.each(docs.map((doc) => [path.relative(packageRoot, doc), doc]))('%s', (_, doc) => {
    it('should only show markup that Atomic accepts', () => {
      expect(validateUsageDoc(doc, catalog)).toEqual([]);
    });
  });
});

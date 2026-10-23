import path from 'node:path';
import {
  createCatalog,
  findSourceTags,
  findUsageDocs,
  validateUsageDoc,
} from '@coveo/atomic-agent-kit';
import {analyzeManifest} from '@coveo/atomic-agent-kit/testing';
import {beforeAll, describe, expect, it} from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');

describe('usage docs', () => {
  let catalog;

  beforeAll(async () => {
    catalog = createCatalog(await analyzeManifest(root), findSourceTags(root));
  });

  const docs = findUsageDocs(root);

  it('should exist', () => {
    expect(docs).not.toHaveLength(0);
  });

  describe.each(docs.map((doc) => [path.relative(root, doc), doc]))('%s', (_, doc) => {
    it('should only show markup that Atomic accepts', () => {
      expect(validateUsageDoc(doc, catalog, root)).toEqual([]);
    });
  });
});

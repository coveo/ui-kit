import path from 'node:path';
import {beforeAll, describe, expect, it} from 'vitest';
import {packageRoot} from './manifest.mjs';
import {createCatalog, findUsageDocs, TEMPLATE_HOSTS, validateUsageDoc} from './snippets.mjs';
import {analyzeAtomic} from './testing/analyze.mjs';

describe('the usage docs of Atomic', () => {
  let catalog;

  beforeAll(async () => {
    catalog = createCatalog(await analyzeAtomic());
  });

  const docs = findUsageDocs();

  it('should document the components', () => {
    expect(docs.length).toBeGreaterThan(100);
  });

  it('should list every item template and its hosts in the manifest', () => {
    const templates = [...catalog.byTag.keys()].filter((tag) => tag.endsWith('-template'));
    expect(Object.keys(TEMPLATE_HOSTS).toSorted()).toEqual(templates.toSorted());
    for (const hosts of Object.values(TEMPLATE_HOSTS)) {
      for (const host of hosts) {
        expect(catalog.byTag.has(host), `${host} is in the manifest`).toBe(true);
      }
    }
  });

  describe.each(docs.map((doc) => [path.relative(packageRoot, doc), doc]))('%s', (_, doc) => {
    it('should only show markup that Atomic accepts', () => {
      expect(validateUsageDoc(doc, catalog)).toEqual([]);
    });
  });
});

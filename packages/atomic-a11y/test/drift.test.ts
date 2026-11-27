import {describe, expect, it} from 'vitest';

import {detectOpenAcrDrift} from '../src/openacr/drift.js';

const committed = {
  product: {name: 'Coveo Atomic', version: '3.65.1'},
  report_date: '2026-11-11',
  last_modified_date: '2026-11-11',
  evaluation_methods_used: 'axe-core 4.14.0',
};

describe('detectOpenAcrDrift', () => {
  it('reports no drift for identical reports', () => {
    expect(detectOpenAcrDrift(committed, structuredClone(committed))).toBe('none');
  });

  it('reports a product-version drift when only the version and last_modified_date differ', () => {
    const generated = {
      ...committed,
      product: {...committed.product, version: '3.66.0'},
      last_modified_date: '2026-11-24',
    };

    expect(detectOpenAcrDrift(committed, generated)).toBe('product-version');
  });

  it('reports a content drift when the evaluation differs', () => {
    const generated = {...committed, evaluation_methods_used: 'axe-core 4.14.1'};

    expect(detectOpenAcrDrift(committed, generated)).toBe('content');
  });

  it('reports a content drift when report_date differs, even with a new version', () => {
    const generated = {
      ...committed,
      product: {...committed.product, version: '3.66.0'},
      report_date: '2026-11-24',
    };

    expect(detectOpenAcrDrift(committed, generated)).toBe('content');
  });

  it('does not mutate its inputs', () => {
    const generated = {...committed, product: {...committed.product, version: '3.66.0'}};
    detectOpenAcrDrift(committed, generated);

    expect(committed.product.version).toBe('3.65.1');
    expect(generated.product.version).toBe('3.66.0');
  });
});

import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  isValidManualBaselineEntry,
  loadManualAuditData,
  parseManualBaseline,
  resolveManualConformance,
} from '../openacr/manual-audit.js';
import type {ManualAuditAggregate} from '../openacr/types.js';

async function createTempDirectory(prefix: string): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), `atomic-a11y-${prefix}-`));
}

function createMockManualAggregate(
  overrides: Partial<ManualAuditAggregate> = {}
): ManualAuditAggregate {
  return {
    componentName: 'atomic-search-box',
    criterionId: '1.1.1',
    conformance: 'supports',
    ...overrides,
  };
}

describe('isValidManualBaselineEntry()', () => {
  it('should return true for valid entry with all required fields', () => {
    const entry = {
      name: 'atomic-search-box',
      category: 'search',
      manual: {
        status: 'complete',
        wcag22Criteria: {
          '1.1.1-non-text-content': 'pass',
        },
      },
    };

    expect(isValidManualBaselineEntry(entry)).toBe(true);
  });

  it('should return false when name is empty string', () => {
    const entry = {
      name: '',
      category: 'search',
      manual: {
        status: 'complete',
        wcag22Criteria: {},
      },
    };

    expect(isValidManualBaselineEntry(entry)).toBe(false);
  });

  it('should return false when name is missing', () => {
    const entry = {
      category: 'search',
      manual: {
        status: 'complete',
        wcag22Criteria: {},
      },
    };

    expect(isValidManualBaselineEntry(entry)).toBe(false);
  });

  it('should return false when manual property is missing', () => {
    const entry = {
      name: 'atomic-search-box',
      category: 'search',
    };

    expect(isValidManualBaselineEntry(entry)).toBe(false);
  });

  it('should return false when manual.status is missing', () => {
    const entry = {
      name: 'atomic-search-box',
      category: 'search',
      manual: {
        wcag22Criteria: {},
      },
    };

    expect(isValidManualBaselineEntry(entry)).toBe(false);
  });

  it('should return false when manual.wcag22Criteria is missing', () => {
    const entry = {
      name: 'atomic-search-box',
      category: 'search',
      manual: {
        status: 'complete',
      },
    };

    expect(isValidManualBaselineEntry(entry)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isValidManualBaselineEntry(null)).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isValidManualBaselineEntry('string')).toBe(false);
    expect(isValidManualBaselineEntry(42)).toBe(false);
    expect(isValidManualBaselineEntry(undefined)).toBe(false);
  });
});

describe('parseManualBaseline()', () => {
  it('should parse completed manual baseline entries', () => {
    const content = JSON.stringify([
      {
        name: 'atomic-search-box',
        category: 'search',
        manual: {
          status: 'complete',
          wcag22Criteria: {
            '1.1.1-non-text-content': 'pass',
            '1.3.1-info-and-relationships': 'partial',
          },
        },
      },
    ]);

    const parsed = parseManualBaseline(
      content,
      '/tmp/manual-audit-search.json'
    );

    expect(parsed.size).toBe(2);
    expect(parsed.get('atomic-search-box:1.1.1')?.[0].conformance).toBe(
      'supports'
    );
    expect(parsed.get('atomic-search-box:1.3.1')?.[0].conformance).toBe(
      'partially-supports'
    );
  });

  it('should skip entries with pending status', () => {
    const content = JSON.stringify([
      {
        name: 'atomic-result-list',
        category: 'search',
        manual: {
          status: 'pending',
          wcag22Criteria: {
            '1.1.1-non-text-content': 'fail',
          },
        },
      },
    ]);

    const parsed = parseManualBaseline(content, '/tmp/test.json');

    expect(parsed.size).toBe(0);
  });

  it('should handle multiple entries and only process completed ones', () => {
    const content = JSON.stringify([
      {
        name: 'atomic-search-box',
        category: 'search',
        manual: {
          status: 'complete',
          wcag22Criteria: {
            '1.1.1-non-text-content': 'pass',
          },
        },
      },
      {
        name: 'atomic-result-list',
        category: 'search',
        manual: {
          status: 'pending',
          wcag22Criteria: {
            '1.1.1-non-text-content': 'fail',
          },
        },
      },
    ]);

    const parsed = parseManualBaseline(content, '/tmp/test.json');

    expect(parsed.size).toBe(1);
    expect(parsed.has('atomic-search-box:1.1.1')).toBe(true);
    expect(parsed.has('atomic-result-list:1.1.1')).toBe(false);
  });

  it('should map manual status values to OpenACR conformance', () => {
    const content = JSON.stringify([
      {
        name: 'atomic-test',
        category: 'search',
        manual: {
          status: 'complete',
          wcag22Criteria: {
            '1.1.1-non-text-content': 'pass',
            '1.3.1-info-and-relationships': 'fail',
            '1.4.3-contrast-minimum': 'partial',
            '2.4.1-bypass-blocks': 'not-applicable',
          },
        },
      },
    ]);

    const parsed = parseManualBaseline(content, '/tmp/test.json');

    expect(parsed.get('atomic-test:1.1.1')?.[0].conformance).toBe('supports');
    expect(parsed.get('atomic-test:1.3.1')?.[0].conformance).toBe(
      'does-not-support'
    );
    expect(parsed.get('atomic-test:1.4.3')?.[0].conformance).toBe(
      'partially-supports'
    );
    expect(parsed.get('atomic-test:2.4.1')?.[0].conformance).toBe(
      'not-applicable'
    );
  });

  it('should return empty map for invalid JSON content', () => {
    const parsed = parseManualBaseline('not valid json', '/tmp/test.json');

    expect(parsed.size).toBe(0);
  });

  it('should return empty map when content is not an array', () => {
    const parsed = parseManualBaseline('{"key": "value"}', '/tmp/test.json');

    expect(parsed.size).toBe(0);
  });

  it('should skip entries with invalid structure', () => {
    const content = JSON.stringify([
      {name: '', manual: {status: 'complete', wcag22Criteria: {}}},
      {
        name: 'atomic-valid',
        category: 'search',
        manual: {
          status: 'complete',
          wcag22Criteria: {'1.1.1-test': 'pass'},
        },
      },
    ]);

    const parsed = parseManualBaseline(content, '/tmp/test.json');

    expect(parsed.size).toBe(1);
    expect(parsed.has('atomic-valid:1.1.1')).toBe(true);
  });
});

describe('loadManualAuditData()', () => {
  it('should read and aggregate baseline files from directory', async () => {
    const tempDir = await createTempDirectory('manual-baselines');

    try {
      await mkdir(tempDir, {recursive: true});
      await writeFile(
        path.join(tempDir, 'manual-audit-commerce.json'),
        JSON.stringify([
          {
            name: 'atomic-product',
            category: 'commerce',
            manual: {
              status: 'complete',
              wcag22Criteria: {
                '2.4.1-bypass-blocks': 'not-applicable',
              },
            },
          },
        ])
      );

      const aggregates = await loadManualAuditData(tempDir);

      expect(aggregates.size).toBe(1);
      expect(aggregates.get('atomic-product:2.4.1')?.[0].conformance).toBe(
        'not-applicable'
      );
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should skip files matching the violations pattern', async () => {
    const tempDir = await createTempDirectory('manual-violations');

    try {
      await mkdir(tempDir, {recursive: true});
      await writeFile(
        path.join(tempDir, 'manual-audit-commerce-violations.json'),
        JSON.stringify([])
      );

      const aggregates = await loadManualAuditData(tempDir);

      expect(aggregates.size).toBe(0);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should return empty map when directory does not exist', async () => {
    const aggregates = await loadManualAuditData(
      '/nonexistent/path/to/baselines'
    );

    expect(aggregates.size).toBe(0);
  });

  it('should aggregate entries from multiple baseline files', async () => {
    const tempDir = await createTempDirectory('multi-baselines');

    try {
      await mkdir(tempDir, {recursive: true});
      await writeFile(
        path.join(tempDir, 'manual-audit-search.json'),
        JSON.stringify([
          {
            name: 'atomic-search-box',
            category: 'search',
            manual: {
              status: 'complete',
              wcag22Criteria: {'1.1.1-non-text-content': 'pass'},
            },
          },
        ])
      );
      await writeFile(
        path.join(tempDir, 'manual-audit-commerce.json'),
        JSON.stringify([
          {
            name: 'atomic-product',
            category: 'commerce',
            manual: {
              status: 'complete',
              wcag22Criteria: {'1.1.1-non-text-content': 'fail'},
            },
          },
        ])
      );

      const aggregates = await loadManualAuditData(tempDir);

      expect(aggregates.has('atomic-search-box:1.1.1')).toBe(true);
      expect(aggregates.has('atomic-product:1.1.1')).toBe(true);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });
});

describe('resolveManualConformance()', () => {
  it('should return undefined when aggregates are undefined', () => {
    expect(resolveManualConformance(undefined)).toBeUndefined();
  });

  it('should return undefined when aggregates array is empty', () => {
    expect(resolveManualConformance([])).toBeUndefined();
  });

  it('should return "does-not-support" when any aggregate has fail status (highest precedence)', () => {
    const aggregates: ManualAuditAggregate[] = [
      createMockManualAggregate({conformance: 'supports'}),
      createMockManualAggregate({conformance: 'does-not-support'}),
    ];

    expect(resolveManualConformance(aggregates)).toBe('does-not-support');
  });

  it('should return "partially-supports" when partial exists but no fail', () => {
    const aggregates: ManualAuditAggregate[] = [
      createMockManualAggregate({conformance: 'partially-supports'}),
      createMockManualAggregate({conformance: 'supports'}),
    ];

    expect(resolveManualConformance(aggregates)).toBe('partially-supports');
  });

  it('should return "supports" when all aggregates pass', () => {
    const aggregates: ManualAuditAggregate[] = [
      createMockManualAggregate({conformance: 'supports'}),
      createMockManualAggregate({conformance: 'supports'}),
    ];

    expect(resolveManualConformance(aggregates)).toBe('supports');
  });

  it('should return "not-applicable" when only not-applicable exists', () => {
    const aggregates: ManualAuditAggregate[] = [
      createMockManualAggregate({conformance: 'not-applicable'}),
    ];

    expect(resolveManualConformance(aggregates)).toBe('not-applicable');
  });

  it('should prioritize fail over partial over pass over not-applicable', () => {
    const aggregates: ManualAuditAggregate[] = [
      createMockManualAggregate({conformance: 'not-applicable'}),
      createMockManualAggregate({conformance: 'supports'}),
      createMockManualAggregate({conformance: 'partially-supports'}),
      createMockManualAggregate({conformance: 'does-not-support'}),
    ];

    expect(resolveManualConformance(aggregates)).toBe('does-not-support');
  });
});

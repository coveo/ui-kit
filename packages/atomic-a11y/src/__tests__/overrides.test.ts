import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {loadOverrides} from '../openacr/overrides.js';

async function createTempDirectory(prefix: string): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), `atomic-a11y-${prefix}-`));
}

describe('loadOverrides()', () => {
  it('should load valid overrides from file', async () => {
    const tempDir = await createTempDirectory('overrides');
    const filePath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(
        filePath,
        JSON.stringify({
          overrides: [
            {
              criterion: '1.1.1',
              conformance: 'not-applicable',
              reason: 'Not relevant for this product',
            },
            {
              criterion: '2.4.1',
              conformance: 'supports',
              reason: 'Verified manually',
            },
          ],
        })
      );

      const overrides = await loadOverrides(filePath);

      expect(overrides.size).toBe(2);
      expect(overrides.get('1.1.1')?.conformance).toBe('not-applicable');
      expect(overrides.get('1.1.1')?.reason).toBe(
        'Not relevant for this product'
      );
      expect(overrides.get('2.4.1')?.conformance).toBe('supports');
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should return empty map when file does not exist', async () => {
    const overrides = await loadOverrides('/nonexistent/path/overrides.json');

    expect(overrides.size).toBe(0);
  });

  it('should return empty map when file contains empty overrides array', async () => {
    const tempDir = await createTempDirectory('overrides-empty');
    const filePath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(filePath, '{"overrides": []}');

      const overrides = await loadOverrides(filePath);

      expect(overrides.size).toBe(0);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should skip invalid override entries', async () => {
    const tempDir = await createTempDirectory('overrides-invalid');
    const filePath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(
        filePath,
        JSON.stringify({
          overrides: [
            {criterion: '1.1.1', conformance: 'invalid-value', reason: 'Test'},
            {
              criterion: '2.4.1',
              conformance: 'supports',
              reason: 'Valid entry',
            },
            {criterion: '1.4.3', conformance: 'supports', reason: ''},
          ],
        })
      );

      const overrides = await loadOverrides(filePath);

      expect(overrides.size).toBe(1);
      expect(overrides.has('2.4.1')).toBe(true);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should return empty map when file contains invalid JSON', async () => {
    const tempDir = await createTempDirectory('overrides-badjson');
    const filePath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(filePath, 'not valid json');

      const overrides = await loadOverrides(filePath);

      expect(overrides.size).toBe(0);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should return empty map when file lacks overrides property', async () => {
    const tempDir = await createTempDirectory('overrides-noprop');
    const filePath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(filePath, '{"key": "value"}');

      const overrides = await loadOverrides(filePath);

      expect(overrides.size).toBe(0);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });

  it('should accept all valid conformance values', async () => {
    const tempDir = await createTempDirectory('overrides-allvalues');
    const filePath = path.join(tempDir, 'a11y-overrides.json');

    try {
      await writeFile(
        filePath,
        JSON.stringify({
          overrides: [
            {criterion: '1.1.1', conformance: 'supports', reason: 'Pass'},
            {
              criterion: '1.3.1',
              conformance: 'partially-supports',
              reason: 'Partial',
            },
            {
              criterion: '1.4.3',
              conformance: 'does-not-support',
              reason: 'Fail',
            },
            {
              criterion: '2.4.1',
              conformance: 'not-applicable',
              reason: 'N/A',
            },
            {
              criterion: '4.1.2',
              conformance: 'not-evaluated',
              reason: 'Pending',
            },
          ],
        })
      );

      const overrides = await loadOverrides(filePath);

      expect(overrides.size).toBe(5);
    } finally {
      await rm(tempDir, {recursive: true, force: true});
    }
  });
});

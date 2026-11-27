import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {parse} from 'yaml';

import {serializeOpenAcr} from '../src/openacr/json-to-openacr.js';
import {syncOpenAcrVersionFile} from '../src/openacr/sync-version-file.js';
import type {OpenAcrReport} from '../src/openacr/types.js';

const report = {
  title: 'Coveo Accessibility Conformance Report',
  product: {name: 'Coveo Atomic', version: '3.65.1', description: 'Atomic'},
  report_date: '2026-11-11',
  last_modified_date: '2026-11-11',
  version: 1,
  evaluation_methods_used: 'axe-core 4.14.0 via Storybook addon-a11y',
} as unknown as OpenAcrReport;

describe('syncOpenAcrVersionFile', () => {
  let dir: string;
  let file: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'a11y-openacr-'));
    file = path.join(dir, 'openacr.yaml');
  });

  afterEach(async () => {
    await rm(dir, {recursive: true, force: true});
  });

  it('writes the new version and last_modified_date, keeping report_date', async () => {
    await writeFile(file, serializeOpenAcr(report));

    const result = await syncOpenAcrVersionFile(file, '3.66.0', '2026-11-24');

    expect(result).toEqual({changed: true, previousVersion: '3.65.1'});
    const written = parse(await readFile(file, 'utf8'));
    expect(written.product.version).toBe('3.66.0');
    expect(written.report_date).toBe('2026-11-11');
    expect(written.last_modified_date).toBe('2026-11-24');
  });

  it('leaves the file untouched when the version already matches', async () => {
    const contents = `# kept as is\n${serializeOpenAcr(report)}`;
    await writeFile(file, contents);

    const result = await syncOpenAcrVersionFile(file, '3.65.1', '2026-11-24');

    expect(result).toEqual({changed: false, previousVersion: '3.65.1'});
    expect(await readFile(file, 'utf8')).toBe(contents);
  });

  it('throws when the file cannot be parsed', async () => {
    await writeFile(file, 'product: [unclosed\n');

    await expect(syncOpenAcrVersionFile(file, '3.66.0')).rejects.toThrow(
      /Could not parse the OpenACR report/
    );
  });

  it('throws when the file has no dates', async () => {
    await writeFile(file, "product: {name: 'Coveo Atomic', version: '3.65.1'}\n");

    await expect(syncOpenAcrVersionFile(file, '3.66.0')).rejects.toThrow(
      /has no report_date or last_modified_date/
    );
  });

  it('throws when the file is missing', async () => {
    await expect(syncOpenAcrVersionFile(file, '3.66.0')).rejects.toThrow(/No OpenACR report/);
  });
});

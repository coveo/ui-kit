import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import type {Vitest} from 'vitest/node';

import {VitestA11yReporter} from '../src/reporter/vitest-a11y-reporter.js';

const vitestWithShard = (shard?: {index: number; count: number}) =>
  ({config: {shard}}) as unknown as Vitest;

describe('VitestA11yReporter — shard resolution', () => {
  let tmpDir: string;
  let outputFile: string;
  let packageJsonPath: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'a11y-reporter-shard-'));
    outputFile = path.join(tmpDir, 'a11y-report.json');
    packageJsonPath = path.resolve(__dirname, '..', '..', 'atomic', 'package.json');
  });

  afterEach(async () => {
    await rm(tmpDir, {recursive: true, force: true});
  });

  it('writes a shard report next to the base report when Vitest runs a shard', async () => {
    const reporter = new VitestA11yReporter({outputFile, packageJsonPath});

    reporter.onInit(vitestWithShard({index: 2, count: 4}));
    await reporter.onTestRunEnd([], [], 'passed');

    expect((await readdir(tmpDir)).sort()).toEqual([
      'a11y-report.json',
      'a11y-report.shard-2.json',
    ]);
  });

  it('writes only the base report when Vitest does not run a shard', async () => {
    const reporter = new VitestA11yReporter({outputFile, packageJsonPath});

    reporter.onInit(vitestWithShard());
    await reporter.onTestRunEnd([], [], 'passed');

    expect(await readdir(tmpDir)).toEqual(['a11y-report.json']);
  });
});

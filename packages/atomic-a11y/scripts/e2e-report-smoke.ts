#!/usr/bin/env npx tsx

/**
 * E2E Smoke Test: a11y Report Generation Pipeline
 *
 * Verifies the full pipeline:
 *   pnpm --filter @coveo/atomic run test:storybook -> VitestA11yReporter -> a11y-report.json
 *
 * Usage:
 *   npx tsx packages/atomic-a11y/scripts/e2e-report-smoke.ts
 *
 * Prerequisites:
 *   - packages/atomic must be built (pnpm build)
 *   - Run from the monorepo root
 */

import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {isA11yReport} from '../src/shared/guards.js';
import type {A11yReport} from '../src/shared/types.js';

const REPORT_DIR = path.resolve(import.meta.dirname, '../reports');
const REPORT_FILE = path.join(REPORT_DIR, 'a11y-report.json');
const ATOMIC_DIR = path.resolve(import.meta.dirname, '../../atomic');

const fail = (message: string): never => {
  console.error(`FAIL: ${message}`);
  process.exit(1);
};

const run = (): void => {
  try {
    if (fs.existsSync(REPORT_FILE)) {
      fs.rmSync(REPORT_FILE);
    }

    let storybookCommandFailed = false;
    let primaryCommandError = '';

    try {
      execSync(
        'npx vitest run --project=storybook --testPathPattern="atomic-search-box" --reporter=default',
        {
          cwd: ATOMIC_DIR,
          stdio: 'pipe',
          timeout: 180_000,
          env: {...process.env, CI: 'true'},
        }
      );
    } catch (error) {
      storybookCommandFailed = true;
      primaryCommandError =
        error instanceof Error ? error.message : String(error);
    }

    if (storybookCommandFailed && !fs.existsSync(REPORT_FILE)) {
      try {
        execSync('npx vitest run --project=storybook atomic-search-box', {
          cwd: ATOMIC_DIR,
          stdio: 'pipe',
          timeout: 180_000,
          env: {...process.env, CI: 'true'},
        });
      } catch {}
    }

    if (!fs.existsSync(REPORT_FILE)) {
      fail(
        storybookCommandFailed
          ? `storybook command failed and no report file was created. Command error: ${primaryCommandError}`
          : 'report file was not created.'
      );
    }

    const rawReport = fs.readFileSync(REPORT_FILE, 'utf-8');
    let parsedReport: unknown;

    try {
      parsedReport = JSON.parse(rawReport);
    } catch {
      fail('report file is not valid JSON.');
    }

    if (!isA11yReport(parsedReport)) {
      fail('report does not match isA11yReport() shape guard.');
    }

    const report = parsedReport as A11yReport;

    if (report.report.product !== 'Coveo Atomic') {
      fail(`unexpected product: ${String(report.report.product)}`);
    }

    if (report.report.standard !== 'WCAG 2.2 AA') {
      fail(`unexpected standard: ${String(report.report.standard)}`);
    }

    if (report.components.length === 0) {
      fail('components array is empty.');
    }

    if (report.criteria.length === 0) {
      fail('criteria array is empty.');
    }

    const atomicPrefixCount = report.components.filter((component) =>
      component.name.startsWith('atomic-')
    ).length;

    if (atomicPrefixCount === 0) {
      fail('no component name starts with "atomic-".');
    }

    const criterionPattern = /^\d+\.\d+\.\d+$/;
    const matchingCriteriaCount = report.criteria.filter((criterion) =>
      criterionPattern.test(criterion.id)
    ).length;

    if (matchingCriteriaCount === 0) {
      fail('no criterion id matches X.Y.Z format.');
    }

    if (!report.summary.automatedCoverage.endsWith('%')) {
      fail(
        `automatedCoverage does not end with %: ${String(report.summary.automatedCoverage)}`
      );
    }

    const relativeReportPath = path.relative(process.cwd(), REPORT_FILE);

    console.log(`PASS: Report file created: ${relativeReportPath}`);
    console.log('PASS: Report passes isA11yReport() guard');
    console.log(`PASS: Product: ${report.report.product}`);
    console.log(`PASS: Standard: ${report.report.standard}`);
    console.log(
      `PASS: Components: ${report.components.length} (${atomicPrefixCount} with atomic- prefix)`
    );
    console.log(
      `PASS: Criteria: ${report.criteria.length} (${matchingCriteriaCount} with X.Y.Z format)`
    );
    console.log(
      `PASS: Automated coverage: ${report.summary.automatedCoverage}`
    );
    console.log();
    console.log('E2E SMOKE TEST PASSED');

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL: unexpected error: ${message}`);
    process.exit(1);
  }
};

run();

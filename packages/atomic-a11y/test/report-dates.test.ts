import {describe, expect, it} from 'vitest';
import {parse} from 'yaml';

import {serializeOpenAcr} from '../src/openacr/json-to-openacr.js';
import {reconcileReportDates} from '../src/openacr/report-dates.js';
import type {OpenAcrReport} from '../src/openacr/types.js';

const buildReport = (overrides: Partial<OpenAcrReport> = {}): OpenAcrReport =>
  ({
    title: 'Coveo Accessibility Conformance Report',
    product: {name: 'Coveo Atomic', version: '3.65.1', description: 'Atomic'},
    report_date: '2026-11-11',
    last_modified_date: '2026-11-11',
    version: 1,
    evaluation_methods_used: 'axe-core 4.14.0 via Storybook addon-a11y',
    chapters: {
      success_criteria_level_a: {
        criteria: [{num: '1.1.1', components: [{name: 'web', adherence: {level: 'supports'}}]}],
      },
    },
    ...overrides,
  }) as OpenAcrReport;

const regenerated = (overrides: Partial<OpenAcrReport> = {}) =>
  buildReport({report_date: '2026-11-24', last_modified_date: '2026-11-24', ...overrides});

describe('reconcileReportDates', () => {
  it('keeps both dates when nothing changed', () => {
    const result = reconcileReportDates(buildReport(), regenerated());

    expect(result.report_date).toBe('2026-11-11');
    expect(result.last_modified_date).toBe('2026-11-11');
  });

  it('keeps report_date but updates last_modified_date when only the Atomic version changed', () => {
    const next = regenerated({
      product: {name: 'Coveo Atomic', version: '3.66.0', description: 'Atomic'},
    });

    const result = reconcileReportDates(buildReport(), next);

    expect(result.product.version).toBe('3.66.0');
    expect(result.report_date).toBe('2026-11-11');
    expect(result.last_modified_date).toBe('2026-11-24');
  });

  it('keeps report_date but updates last_modified_date when only metadata changed', () => {
    const next = regenerated({
      product: {name: 'Coveo Atomic', version: '3.65.1', description: 'A new description'},
    });

    const result = reconcileReportDates(buildReport(), next);

    expect(result.report_date).toBe('2026-11-11');
    expect(result.last_modified_date).toBe('2026-11-24');
  });

  it('updates both dates when the evaluation tools changed', () => {
    const next = regenerated({
      evaluation_methods_used: 'axe-core 4.14.1 via Storybook addon-a11y',
    });

    const result = reconcileReportDates(buildReport(), next);

    expect(result.report_date).toBe('2026-11-24');
    expect(result.last_modified_date).toBe('2026-11-24');
  });

  it('updates both dates when conformance results changed', () => {
    const next = regenerated({
      chapters: {
        success_criteria_level_a: {
          criteria: [
            {num: '1.1.1', components: [{name: 'web', adherence: {level: 'partially-supports'}}]},
          ],
        },
      } as OpenAcrReport['chapters'],
    });

    const result = reconcileReportDates(buildReport(), next);

    expect(result.report_date).toBe('2026-11-24');
    expect(result.last_modified_date).toBe('2026-11-24');
  });

  it('treats a report read back from its YAML file as unchanged', () => {
    const tricky = buildReport({
      notes: `${'A long note that the serializer folds over several lines. '.repeat(4)}yes`,
      evaluation_methods_used: 'on; 1:20; null',
    });
    const committed = parse(serializeOpenAcr(tricky), {version: '1.1'});

    const result = reconcileReportDates(committed, {
      ...tricky,
      report_date: '2026-11-24',
      last_modified_date: '2026-11-24',
    });

    expect(result.report_date).toBe('2026-11-11');
    expect(result.last_modified_date).toBe('2026-11-11');
  });

  it('uses the regenerated dates when there is no committed report', () => {
    expect(reconcileReportDates(undefined, regenerated()).report_date).toBe('2026-11-24');
  });
});

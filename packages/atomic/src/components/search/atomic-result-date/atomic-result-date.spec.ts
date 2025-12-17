import type {Result} from '@coveo/headless';
import dayjs from 'dayjs';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicResultDate} from './atomic-result-date';
import './atomic-result-date';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-date', () => {
  let i18n: i18n;
  let mockResult: Result;

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        'calendar-same-day': '[Today]',
        'calendar-next-day': '[Tomorrow]',
        'calendar-next-week': 'dddd',
        'calendar-last-day': '[Yesterday]',
        'calendar-last-week': '[Last] dddd',
      },
      true
    );

    mockResult = buildFakeResult({
      title: 'Test Result',
      raw: {
        date: '2021/09/03@10:31:23',
        invalidDate: 'not-a-date',
        urihash: '',
      },
    });
  });

  const renderComponent = async (
    options: {
      field?: string;
      format?: string;
      relativeTime?: boolean;
      result?: Result | null;
    } = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultDate>({
        template: html`<atomic-result-date
          field=${ifDefined(options.field)}
          format=${ifDefined(options.format)}
          ?relative-time=${options.relativeTime}
        ></atomic-result-date>`,
        selector: 'atomic-result-date',
        result: resultToUse === null ? undefined : resultToUse,
        bindings: (bindings) => {
          bindings.i18n = i18n;
          bindings.store = {
            ...bindings.store,
            onChange: vi.fn(),
            state: {
              ...bindings.store?.state,
              loadingFlags: [],
            },
          };
          // Mock interfaceElement with language property
          bindings.interfaceElement = {
            ...bindings.interfaceElement,
            language: 'en',
            // biome-ignore lint/suspicious/noExplicitAny: mock interface element
          } as any;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return element;
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-date');
    expect(el).toBeInstanceOf(AtomicResultDate);
  });

  describe('when the field is valid', () => {
    it('should render the date with default format', async () => {
      const element = await renderComponent({field: 'date'});

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toBe('3/9/2021');
    });

    it('should render the date with custom format', async () => {
      const element = await renderComponent({
        field: 'date',
        format: 'YYYY-MM-DD',
      });

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toBe('2021-09-03');
    });
  });

  it('should not render the component when the field does not exist', async () => {
    const element = await renderComponent({field: 'nonexistent_field'});

    // Element is null because it's removed from DOM
    expect(element).toBeNull();
  });

  it('should not render the component when the field value is not a valid date', async () => {
    const element = await renderComponent({field: 'invalidDate'});

    // Element is null because it's removed from DOM after error
    expect(element).toBeNull();
  });

  describe('when #field is empty', () => {
    // TODO V4: KIT-5197 - Remove skip
    it.skip('should set error', async () => {
      const element = await renderComponent({field: 'date'});

      expect(element.error).toBeUndefined();

      element.field = '';
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/field/i);
    });

    // TODO V4: KIT-5197 - Remove this test
    it('should log validation warning', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const element = await renderComponent({field: 'date'});

      element.field = '';
      await element.updateComplete;

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Prop validation failed for component atomic-result-date'
        ),
        element
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('field'),
        element
      );

      consoleWarnSpy.mockRestore();
    });
  });

  it.each([
    {result: null, description: '#result is null'},
    {result: undefined, description: '#result is undefined'},
  ])(
    'should render error component when result is not available and $description',
    async ({result}) => {
      const element = await renderComponent({
        result: result as unknown as Result,
      });

      // Since there's no result context, the error component should be rendered
      expect(element).toBeDefined();
    }
  );

  describe('when #relativeTime is true', () => {
    it('should render relative time for yesterday date', async () => {
      const yesterdayDate = dayjs().subtract(1, 'day').toISOString();
      const resultWithYesterday = buildFakeResult({
        raw: {
          customDate: yesterdayDate,
          urihash: '',
        },
      });

      const element = await renderComponent({
        field: 'customDate',
        relativeTime: true,
        result: resultWithYesterday,
      });

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toContain('Yesterday');
    });

    it('should render relative time for today date', async () => {
      const todayDate = dayjs().toISOString();
      const resultWithToday = buildFakeResult({
        raw: {
          customDate: todayDate,
          urihash: '',
        },
      });

      const element = await renderComponent({
        field: 'customDate',
        relativeTime: true,
        result: resultWithToday,
      });

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toContain('Today');
    });

    it('should render relative time for tomorrow date', async () => {
      const tomorrowDate = dayjs().add(1, 'day').toISOString();
      const resultWithTomorrow = buildFakeResult({
        raw: {
          customDate: tomorrowDate,
          urihash: '',
        },
      });

      const element = await renderComponent({
        field: 'customDate',
        relativeTime: true,
        result: resultWithTomorrow,
      });

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toContain('Tomorrow');
    });

    it('should use format for older dates', async () => {
      const oldDate = '2020/01/15@10:00:00';
      const resultWithOldDate = buildFakeResult({
        raw: {
          customDate: oldDate,
          urihash: '',
        },
      });

      const element = await renderComponent({
        field: 'customDate',
        relativeTime: true,
        result: resultWithOldDate,
      });

      expect(element).toBeDefined();
      // For dates older than a week, it falls back to sameElse format
      // The rendered date includes the date in some format
      expect(element.textContent?.trim()).toMatch(/2020|01|15/);
    });
  });
});

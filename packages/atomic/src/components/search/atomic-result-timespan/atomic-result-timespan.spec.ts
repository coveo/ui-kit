import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AtomicResultTimespan} from './atomic-result-timespan';
import './atomic-result-timespan';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-timespan', () => {
  let i18n: i18n;
  let mockResult: Result;

  beforeEach(async () => {
    i18n = await createTestI18n();

    mockResult = buildFakeResult({
      raw: {
        duration: 3600000,
      },
    });

    vi.mocked(ResultTemplatesHelpers.getResultProperty).mockImplementation(
      (result: Result, property: string) => {
        return result.raw[property] ?? null;
      }
    );
  });

  const renderResultTimespan = async ({
    props = {},
    result,
  }: {
    props?: Partial<{field: string; unit: string; format: string}>;
    result?: Result;
  } = {}) => {
    const resultToUse = result ?? mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultTimespan>({
        template: html`<atomic-result-timespan
          field=${ifDefined(props.field)}
          unit=${ifDefined(props.unit)}
          format=${ifDefined(props.format)}
        ></atomic-result-timespan>`,
        selector: 'atomic-result-timespan',
        result: resultToUse,
        bindings: (bindings) => {
          bindings.i18n = i18n;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return {element, atomicInterface};
  };

  describe('when validating props', () => {
    it('should not set error when field is a non-empty string', async () => {
      const {element} = await renderResultTimespan({
        props: {field: 'duration'},
      });

      expect(element.error).toBeUndefined();
    });

    it('should set error when field is an empty string', async () => {
      const {element} = await renderResultTimespan({props: {field: ''}});

      expect(element.error).toBeInstanceOf(Error);
    });

    it('should set error when field is undefined', async () => {
      const {element} = await renderResultTimespan();

      expect(element.error).toBeInstanceOf(Error);
    });

    it('should not set error when unit is a valid value', async () => {
      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'seconds'},
      });

      expect(element.error).toBeUndefined();
    });

    it('should set error when unit is an invalid value', async () => {
      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'invalid'},
      });

      expect(element.error).toBeInstanceOf(Error);
    });

    it('should not set error when format is a non-empty string', async () => {
      const {element} = await renderResultTimespan({
        props: {field: 'duration', format: 'HH:mm:ss'},
      });

      expect(element.error).toBeUndefined();
    });

    it('should set error when format is an empty string', async () => {
      const {element} = await renderResultTimespan({
        props: {field: 'duration', format: ''},
      });

      expect(element.error).toBeInstanceOf(Error);
    });

    it('should not set error when format is undefined', async () => {
      const {element} = await renderResultTimespan({
        props: {field: 'duration'},
      });

      expect(element.error).toBeUndefined();
    });
  });

  describe('when initializing', () => {
    it('should not set error when field value exists and is a number', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        3600000
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration'},
      });

      expect(element.error).toBeUndefined();
    });

    it('should set error when field value does not exist', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(null);

      const {element} = await renderResultTimespan({props: {field: 'missing'}});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe('No value found for field missing');
    });

    it('should set error when field value is NaN', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(NaN);

      const {element} = await renderResultTimespan({
        props: {field: 'invalid'},
        result: buildFakeResult({raw: {invalid: NaN}}),
      });

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe('No value found for field invalid');
    });
  });

  describe('when rendering with HH:mm:ss format (durations under a day)', () => {
    it('should render 1 hour in milliseconds', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        3600000
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'ms'},
      });

      expect(element).toHaveTextContent('01:00:00');
    });

    it('should render 1 hour in seconds', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(3600);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 's'},
      });

      expect(element).toHaveTextContent('01:00:00');
    });

    it('should render 60 minutes', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(60);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'm'},
      });

      expect(element).toHaveTextContent('01:00:00');
    });

    it('should render 3 seconds', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(3000);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'ms'},
      });

      expect(element).toHaveTextContent('00:00:03');
    });

    it('should set error for zero duration', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(0);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'ms'},
      });

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe('No value found for field duration');
    });

    it('should handle negative duration values', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        -3600000
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'ms'},
      });

      expect(element).toHaveTextContent('-1:00:00');
    });

    it('should handle very large duration values', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        Number.MAX_SAFE_INTEGER
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'ms'},
      });

      expect(element.error).toBeUndefined();
    });

    it('should handle very small duration values', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(1);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'ms'},
      });

      expect(element).toHaveTextContent('00:00:00');
    });

    it('should handle decimal values', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        1500.5
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'ms'},
      });

      expect(element).toHaveTextContent('00:00:01');
    });
  });

  describe('when rendering with approximation format (durations over a day)', () => {
    it('should render day approximation for 24 hours', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(24);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'h'},
      });

      expect(element).toHaveTextContent('About a day');
    });

    it('should render day approximation for 150 hours', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(150);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'h'},
      });

      expect(element).toHaveTextContent('About a day');
    });

    it('should render month approximation for 60 days', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(60);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'd'},
      });

      expect(element).toHaveTextContent('About 2 months');
    });

    it('should render year approximation for 365 days', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(365);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'd'},
      });

      expect(element).toHaveTextContent('About a year');
    });

    it('should render years approximation for 730 days', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(730);

      const {element} = await renderResultTimespan({
        props: {field: 'duration', unit: 'd'},
      });

      expect(element).toHaveTextContent('About 2 years');
    });
  });

  describe('when rendering with custom format', () => {
    it('should render with custom format pattern', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        3600000
      );

      const {element} = await renderResultTimespan({
        props: {
          field: 'duration',
          unit: 'ms',
          format: 'H [hours,] m [minutes and] s [seconds]',
        },
      });

      expect(element).toHaveTextContent('1 hours, 0 minutes and 0 seconds');
    });

    it('should render seconds with custom format', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(3000);

      const {element} = await renderResultTimespan({
        props: {
          field: 'duration',
          unit: 'ms',
          format: 'H [hours,] m [minutes and] s [seconds]',
        },
      });

      expect(element).toHaveTextContent('0 hours, 0 minutes and 3 seconds');
    });
  });
});

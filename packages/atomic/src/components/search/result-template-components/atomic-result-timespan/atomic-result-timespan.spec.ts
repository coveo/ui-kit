import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AtomicResultTimespan} from './atomic-result-timespan';
import './atomic-result-timespan';

vi.mock('@coveo/headless', () => ({
  ResultTemplatesHelpers: {
    getResultProperty: vi.fn(() => 3600000),
  },
}));

describe('atomic-result-timespan', () => {
  let i18n: i18n;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  const mockedEngine = buildFakeSearchEngine();

  const renderResultTimespan = async ({
    props = {},
    result = {},
  }: {
    props?: Partial<{field: string; unit: string; format: string}>;
    result?: Partial<Result>;
  } = {}) => {
    const {element, atomicResult} =
      await renderInAtomicResult<AtomicResultTimespan>({
        template: html`<atomic-result-timespan
          field=${ifDefined(props.field)}
          unit=${ifDefined(props.unit)}
          format=${ifDefined(props.format)}
        ></atomic-result-timespan>`,
        selector: 'atomic-result-timespan',
        result: result as Result,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.i18n = i18n;
          return bindings;
        },
      });

    return {
      element,
      atomicResult,
    };
  };

  describe('when added to the DOM', () => {
    it('should not set the error when the field prop is a non-empty string and field has a value', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        3600000
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration'},
      });

      expect(element.error).toBeUndefined();
    });

    it('should set the error when the field prop is an empty string', async () => {
      const {element} = await renderResultTimespan({props: {field: ''}});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is an empty string/i);
    });

    it('should set the error when the field prop is undefined', async () => {
      const {element} = await renderResultTimespan();

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is required/i);
    });

    it('should set the error when the field value does not exist', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(null);

      const {element} = await renderResultTimespan({props: {field: 'missing'}});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe('No value found for field missing');
    });

    it('should set the error when the field value is not a number', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        'not a number'
      );

      const {element} = await renderResultTimespan({props: {field: 'invalid'}});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe(
        'Value not a number for field invalid is not a number'
      );
    });
  });

  describe('when the field property changes', () => {
    it('should not set the error when updating to a non-empty string', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        3600000
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration'},
      });

      element.field = 'newField';
      await element.updateComplete;

      expect(element.error).toBeUndefined();
    });

    it('should set the error when updating to an empty string', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        3600000
      );

      const {element} = await renderResultTimespan({
        props: {field: 'duration'},
      });

      element.field = '';
      await element.updateComplete;

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is an empty string/i);
    });
  });

  describe('when rendering', () => {
    describe('with default format (HH:mm:ss for durations under a day)', () => {
      it('should render duration in HH:mm:ss format for 1 hour in milliseconds', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          3600000
        );

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'ms'},
        });

        expect(element).toHaveTextContent('01:00:00');
      });

      it('should render duration in HH:mm:ss format for 1 hour in seconds', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          3600
        );

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 's'},
        });

        expect(element).toHaveTextContent('01:00:00');
      });

      it('should render duration in HH:mm:ss format for 3 seconds in milliseconds', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          3000
        );

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'ms'},
        });

        expect(element).toHaveTextContent('00:00:03');
      });
    });

    describe('with default format (approximations for durations over a day)', () => {
      it('should render "About a day" for 60 minutes', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(60);

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'm'},
        });

        expect(element).toHaveTextContent('About a day');
      });

      it('should render month approximation for 150 hours', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          150
        );

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'h'},
        });

        expect(element).toHaveTextContent('About 5 months');
      });

      it('should render year approximation for 365 days', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          365
        );

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'd'},
        });

        expect(element).toHaveTextContent('About 1 year');
      });
    });

    describe('with custom format', () => {
      it('should render duration with custom format', async () => {
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

      it('should render small duration with custom format', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          3000
        );

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

    describe('with different units', () => {
      it('should handle seconds unit', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          3600
        );

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 's'},
        });

        expect(element).toHaveTextContent('01:00:00');
      });

      it('should handle minutes unit', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(60);

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'm'},
        });

        expect(element).toHaveTextContent('About a day');
      });

      it('should handle hours unit', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(24);

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'h'},
        });

        expect(element).toHaveTextContent('About a day');
      });

      it('should handle days unit', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          365
        );

        const {element} = await renderResultTimespan({
          props: {field: 'duration', unit: 'd'},
        });

        expect(element).toHaveTextContent('About 1 year');
      });
    });
  });

  it('should set the error when not used in a result template', async () => {
    const {atomicInterface} =
      await renderInAtomicSearchInterface<AtomicResultTimespan>({
        template: html`<atomic-result-timespan
          field="duration"
        ></atomic-result-timespan>`,
        selector: undefined,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    const element = atomicInterface.querySelector<AtomicResultTimespan>(
      'atomic-result-timespan'
    );

    expect(element).toBeInTheDocument();
    expect(element!.error).toBeInstanceOf(Error);
    expect(element!.error.message).toBe(
      'The "atomic-result-timespan" element must be the child of an "atomic-result" element.'
    );
  });
});

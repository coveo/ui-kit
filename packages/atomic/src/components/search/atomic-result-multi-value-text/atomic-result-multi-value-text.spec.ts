import {
  type BreadcrumbManager,
  buildBreadcrumbManager,
  type Result,
} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AtomicResultMultiValueText} from './atomic-result-multi-value-text';
import './atomic-result-multi-value-text';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-multi-value-text', () => {
  let i18n: i18n;
  let mockResult: Result;
  let mockBreadcrumbManager: BreadcrumbManager;

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        'n-more': '{{value}} more',
      },
      true
    );

    mockResult = buildFakeResult({
      raw: {
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        categories: 'cat1;cat2;cat3',
        single_value: 'single',
        empty_field: '',
        urihash: '',
      },
    });

    mockBreadcrumbManager = buildFakeBreadcrumbManager();
    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockBreadcrumbManager);
  });

  const renderComponent = async (
    options: {
      field?: string;
      maxValuesToDisplay?: number;
      delimiter?: string;
      result?: Result | null;
      slottedContent?: string;
    } = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultMultiValueText>({
        template: html`<atomic-result-multi-value-text
          field=${ifDefined(options.field)}
          max-values-to-display=${ifDefined(options.maxValuesToDisplay)}
          delimiter=${ifDefined(options.delimiter)}
          >${options.slottedContent}</atomic-result-multi-value-text
        >`,
        selector: 'atomic-result-multi-value-text',
        result: resultToUse === null ? undefined : resultToUse,
        bindings: (bindings) => {
          bindings.i18n = i18n;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return {
      element,
      parts: (el: AtomicResultMultiValueText) => ({
        list: el.shadowRoot?.querySelector(
          '[part="result-multi-value-text-list"]'
        ),
        values: el.shadowRoot?.querySelectorAll(
          '[part="result-multi-value-text-value"]'
        ),
        separators: el.shadowRoot?.querySelectorAll(
          '[part="result-multi-value-text-separator"]'
        ),
        more: el.shadowRoot?.querySelector(
          '[part="result-multi-value-text-value-more"]'
        ),
      }),
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-multi-value-text');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  describe('#initialize', () => {
    it('should build breadcrumb manager with engine', async () => {
      const {element} = await renderComponent({field: 'tags'});
      expect(buildBreadcrumbManager).toHaveBeenCalled();
      expect(element.breadcrumbManager).toBe(mockBreadcrumbManager);
    });
  });

  describe('prop validation', () => {
    it('should not set error when #field is valid', async () => {
      const {element} = await renderComponent({field: 'tags'});
      expect(element.error).toBeUndefined();
    });

    it('should set error when #field is empty', async () => {
      const {element} = await renderComponent({field: 'tags'});
      expect(element.error).toBeUndefined();

      element.field = '';
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/field/i);
    });

    it('should set error when #maxValuesToDisplay is negative', async () => {
      const {element} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 3,
      });
      expect(element.error).toBeUndefined();

      element.maxValuesToDisplay = -1;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/maxValuesToDisplay/i);
    });
  });

  describe('rendering with array field', () => {
    it('should render all values when array is smaller than max', async () => {
      const {element, parts} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 10,
      });

      const {values, more} = parts(element);
      expect(values?.length).toBe(5);
      expect(more).toBeNull();
    });

    it('should truncate values when array exceeds max', async () => {
      const {element, parts} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 3,
      });

      const {values, more} = parts(element);
      expect(values?.length).toBe(3);
      expect(more).toBeDefined();
      expect(more!.textContent).toContain('2 more');
    });

    it('should render separators between values', async () => {
      const {element, parts} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 3,
      });

      const {separators} = parts(element);
      // 2 separators between 3 values + 1 before "more" label = 3
      expect(separators?.length).toBe(3);
    });

    it('should render nothing when maxValuesToDisplay is 0', async () => {
      const {element, parts} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 0,
      });

      const {values, more} = parts(element);
      expect(values?.length).toBe(0);
      expect(more).toBeDefined();
      expect(more!.textContent).toContain('5 more');
    });
  });

  describe('rendering with delimited string field', () => {
    it('should split string by delimiter', async () => {
      const {element, parts} = await renderComponent({
        field: 'categories',
        delimiter: ';',
      });

      const {values} = parts(element);
      expect(values?.length).toBe(3);
      expect(values![0].textContent).toContain('cat1');
      expect(values![1].textContent).toContain('cat2');
      expect(values![2].textContent).toContain('cat3');
    });

    it('should treat as single value when no delimiter specified', async () => {
      const {element, parts} = await renderComponent({
        field: 'categories',
      });

      const {values} = parts(element);
      expect(values?.length).toBe(1);
      expect(values![0].textContent).toContain('cat1;cat2;cat3');
    });
  });

  describe('rendering with single value field', () => {
    it('should render single value', async () => {
      const {element, parts} = await renderComponent({
        field: 'single_value',
      });

      const {values, more} = parts(element);
      expect(values?.length).toBe(1);
      expect(more).toBeNull();
      expect(values![0].textContent).toContain('single');
    });
  });

  describe('rendering with empty or missing field', () => {
    it('should render nothing when field value is empty string', async () => {
      const {element, parts} = await renderComponent({
        field: 'empty_field',
      });

      const {list} = parts(element);
      expect(list).toBeNull();
    });

    it('should render nothing when field does not exist', async () => {
      const {element, parts} = await renderComponent({
        field: 'nonexistent_field',
      });

      const {list} = parts(element);
      expect(list).toBeNull();
    });

    it('should set error when field value is not a string or array', async () => {
      const consoleErrorSpy: MockInstance = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidResult = buildFakeResult({
        raw: {
          number_field: 42,
          urihash: '',
        },
      });

      const {element} = await renderComponent({
        field: 'number_field',
        result: invalidResult,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain('Could not parse');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('facet selected values sorting', () => {
    it('should prioritize selected facet values', async () => {
      mockBreadcrumbManager.state.facetBreadcrumbs = [
        {
          field: 'tags',
          facetId: 'tags-facet',
          values: [
            {value: {value: 'tag3'}, deselect: vi.fn()},
            {value: {value: 'tag5'}, deselect: vi.fn()},
          ],
        },
      ];

      const {element, parts} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 5,
      });

      const {values} = parts(element);
      expect(values?.length).toBe(5);
      // Selected values (tag3, tag5) should appear first
      expect(values![0].textContent).toContain('tag3');
      expect(values![1].textContent).toContain('tag5');
    });

    it('should ignore facet values for different field', async () => {
      mockBreadcrumbManager.state.facetBreadcrumbs = [
        {
          field: 'other_field',
          facetId: 'other-facet',
          values: [{value: {value: 'other_value'}, deselect: vi.fn()}],
        },
      ];

      const {element, parts} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 5,
      });

      const {values} = parts(element);
      expect(values?.length).toBe(5);
      // No reordering should occur
      expect(values![0].textContent).toContain('tag1');
    });
  });

  describe('slots', () => {
    it('should use custom slot content when provided', async () => {
      const {element, parts} = await renderComponent({
        field: 'tags',
        maxValuesToDisplay: 5,
        slottedContent:
          '<span slot="result-multi-value-text-value-tag2">Custom Tag 2</span>',
      });

      const {values} = parts(element);
      const tag2Value = Array.from(values!).find(
        (v) =>
          v.textContent?.includes('Custom Tag 2') || v.querySelector('[slot]')
      );
      expect(tag2Value).toBeDefined();
    });
  });

  describe('when result is not available', () => {
    it('should render error when result is null', async () => {
      const {element} = await renderComponent({
        field: 'tags',
        result: null,
      });

      const errorComponent = element?.querySelector('atomic-component-error');
      expect(errorComponent).toBeDefined();
    });
  });
});

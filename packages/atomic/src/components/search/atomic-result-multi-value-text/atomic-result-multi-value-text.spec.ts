import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  type Result,
} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicResultMultiValueText} from './atomic-result-multi-value-text';
import './atomic-result-multi-value-text';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-multi-value-text', () => {
  let i18n: i18n;
  let mockBreadcrumbManager: BreadcrumbManager;

  interface RenderResultMultiValueTextProps {
    resultState?: Partial<Result>;
    field?: string;
    delimiter?: string;
    maxValuesToDisplay?: number;
    breadcrumbState?: Partial<BreadcrumbManagerState>;
  }

  const renderComponent = async ({
    resultState = {},
    field = 'tags',
    delimiter,
    maxValuesToDisplay,
    breadcrumbState = {},
  }: RenderResultMultiValueTextProps = {}) => {
    mockBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbState,
    });
    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockBreadcrumbManager);

    const {element} = await renderInAtomicResult<AtomicResultMultiValueText>({
      template: html`<atomic-result-multi-value-text
        field=${field}
        delimiter=${ifDefined(delimiter)}
        max-values-to-display=${ifDefined(maxValuesToDisplay)}
      ></atomic-result-multi-value-text>`,
      selector: 'atomic-result-multi-value-text',
      result: buildFakeResult(resultState),
      bindings: (bindings) => {
        bindings.i18n = i18n;
        return bindings;
      },
    });

    return {
      element,
      get list() {
        return element.shadowRoot?.querySelector(
          '[part="result-multi-value-text-list"]'
        );
      },
      get allValues() {
        return Array.from(
          element.shadowRoot?.querySelectorAll(
            '[part="result-multi-value-text-value"]'
          ) || []
        );
      },
      get allSeparators() {
        return Array.from(
          element.shadowRoot?.querySelectorAll(
            '[part="result-multi-value-text-separator"]'
          ) || []
        );
      },
      get more() {
        return element.shadowRoot?.querySelector(
          '[part="result-multi-value-text-value-more"]'
        );
      },
    };
  };

  beforeEach(async () => {
    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        'n-more': '{{value}} more',
      },
      true
    );
  });

  it('should be defined', () => {
    const el = document.createElement('atomic-result-multi-value-text');
    expect(el).toBeInstanceOf(AtomicResultMultiValueText);
  });

  it('should call buildBreadcrumbManager', async () => {
    const {element} = await renderComponent();
    expect(buildBreadcrumbManager).toHaveBeenCalled();
    expect(element.breadcrumbManager).toBe(mockBreadcrumbManager);
  });

  it('should not set error when #field is valid', async () => {
    const {element} = await renderComponent();
    expect(element.error).toBeUndefined();
  });

  it('should set error when #field is empty', async () => {
    const {element} = await renderComponent();
    expect(element.error).toBeUndefined();

    element.field = '';
    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(/field/i);
  });

  it('should set error when #maxValuesToDisplay is negative', async () => {
    const {element} = await renderComponent({maxValuesToDisplay: 3});
    expect(element.error).toBeUndefined();

    element.maxValuesToDisplay = -1;
    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(/maxValuesToDisplay/i);
  });

  it('should render all values when array is smaller than max', async () => {
    const {allValues, more} = await renderComponent({
      resultState: {
        raw: {tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], urihash: ''},
      },
      maxValuesToDisplay: 10,
    });

    expect(allValues).toHaveLength(5);
    expect(more).toBeNull();
  });

  it('should truncate values when array exceeds max', async () => {
    const {allValues, more} = await renderComponent({
      resultState: {
        raw: {tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], urihash: ''},
      },
      maxValuesToDisplay: 3,
    });

    expect(allValues).toHaveLength(3);
    expect(more).toHaveTextContent('2 more');
  });

  it('should render separators between values', async () => {
    const {allSeparators} = await renderComponent({
      resultState: {
        raw: {tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], urihash: ''},
      },
      maxValuesToDisplay: 3,
    });

    expect(allSeparators).toHaveLength(3);
  });

  it('should show all values in more label when maxValuesToDisplay is 0', async () => {
    const {allValues, more} = await renderComponent({
      resultState: {
        raw: {tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], urihash: ''},
      },
      maxValuesToDisplay: 0,
    });

    expect(allValues).toHaveLength(0);
    if (more) {
      expect(more).toHaveTextContent('5 more');
    }
  });

  it('should split string by delimiter', async () => {
    const {allValues} = await renderComponent({
      resultState: {
        raw: {categories: 'cat1;cat2;cat3', urihash: ''},
      },
      field: 'categories',
      delimiter: ';',
    });

    expect(allValues).toHaveLength(3);
    expect(allValues[0]).toHaveTextContent('cat1');
    expect(allValues[1]).toHaveTextContent('cat2');
    expect(allValues[2]).toHaveTextContent('cat3');
  });

  it('should treat as single value when no delimiter specified', async () => {
    const {allValues} = await renderComponent({
      resultState: {
        raw: {categories: 'cat1;cat2;cat3', urihash: ''},
      },
      field: 'categories',
    });

    expect(allValues).toHaveLength(1);
    expect(allValues[0]).toHaveTextContent('cat1;cat2;cat3');
  });

  it('should render single value', async () => {
    const {allValues, more} = await renderComponent({
      resultState: {
        raw: {single_value: 'single', urihash: ''},
      },
      field: 'single_value',
    });

    expect(allValues).toHaveLength(1);
    expect(more).toBeNull();
    expect(allValues[0]).toHaveTextContent('single');
  });

  it('should render nothing when field value is empty string', async () => {
    const {element} = await renderComponent({
      resultState: {
        raw: {empty_field: '', urihash: ''},
      },
      field: 'empty_field',
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when field does not exist', async () => {
    const {element} = await renderComponent({
      resultState: {
        raw: {urihash: ''},
      },
      field: 'nonexistent_field',
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should set error when field value is not a string or array', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const {element} = await renderComponent({
      resultState: {
        raw: {number_field: 42, urihash: ''},
      },
      field: 'number_field',
    });

    expect(element.error).toBeDefined();
    expect(element.error.message).toContain('Could not parse');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should prioritize selected facet values', async () => {
    const {allValues} = await renderComponent({
      resultState: {
        raw: {tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], urihash: ''},
      },
      maxValuesToDisplay: 5,
      breadcrumbState: {
        facetBreadcrumbs: [
          {
            field: 'tags',
            facetId: 'tags-facet',
            values: [
              {
                value: {value: 'tag3', numberOfResults: 1, state: 'selected'},
                deselect: vi.fn(),
              },
              {
                value: {value: 'tag5', numberOfResults: 1, state: 'selected'},
                deselect: vi.fn(),
              },
            ],
          },
        ],
      },
    });

    expect(allValues).toHaveLength(5);
    expect(allValues[0]).toHaveTextContent('tag3');
    expect(allValues[1]).toHaveTextContent('tag5');
  });

  it('should ignore facet values for different field', async () => {
    const {allValues} = await renderComponent({
      resultState: {
        raw: {tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], urihash: ''},
      },
      maxValuesToDisplay: 5,
      breadcrumbState: {
        facetBreadcrumbs: [
          {
            field: 'other_field',
            facetId: 'other-facet',
            values: [
              {
                value: {
                  value: 'other_value',
                  numberOfResults: 1,
                  state: 'selected',
                },
                deselect: vi.fn(),
              },
            ],
          },
        ],
      },
    });

    expect(allValues).toHaveLength(5);
    expect(allValues[0]).toHaveTextContent('tag1');
  });
});

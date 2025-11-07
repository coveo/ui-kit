import {
  buildNumericFacet,
  buildNumericFilter,
  buildSearchStatus,
  buildTabManager,
  type NumericFacet,
  type NumericFilter,
  type SearchStatus,
  type TabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/engine';
import {buildFakeNumericFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/numeric-facet-controller';
import {buildFakeNumericFilter} from '@/vitest-utils/testing-helpers/fixtures/headless/numeric-filter-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/tab-manager-controller';
import type {AtomicNumericFacet} from './atomic-numeric-facet';
import './atomic-numeric-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-numeric-facet', () => {
  let mockedFacetForRange: NumericFacet;
  let mockedFacetForInput: NumericFacet;
  let mockedFilter: NumericFilter;
  let mockedSearchStatus: SearchStatus;
  let mockedTabManager: TabManager;
  let mockedConsoleWarn: MockInstance;

  beforeEach(() => {
    mockedConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockedFacetForRange = buildFakeNumericFacet({
      implementation: {
        toggleSelect: vi.fn(),
        toggleSingleSelect: vi.fn(),
        deselectAll: vi.fn(),
      },
      state: {
        values: [
          {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 10,
          },
          {
            start: 100,
            end: 200,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 5,
          },
        ],
      },
    });

    mockedFacetForInput = buildFakeNumericFacet({
      state: {
        values: [
          {
            start: 0,
            end: 1000,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 100,
          },
        ],
      },
    });

    mockedFilter = buildFakeNumericFilter({
      implementation: {
        clear: vi.fn(),
      },
    });

    mockedSearchStatus = buildFakeSearchStatus({
      state: {
        firstSearchExecuted: true,
        hasError: false,
        hasResults: true,
        isLoading: false,
      },
    });

    mockedTabManager = buildFakeTabManager({});
  });

  afterEach(() => {
    mockedConsoleWarn.mockRestore();
  });

  const renderComponent = async ({
    field = 'size',
    label = 'Size',
    numberOfValues = 8,
    withInput,
    displayValuesAs = 'checkbox',
    isCollapsed = false,
    tabsIncluded = [],
    tabsExcluded = [],
  }: {
    field?: string;
    label?: string;
    numberOfValues?: number;
    withInput?: 'integer' | 'decimal';
    displayValuesAs?: 'checkbox' | 'link';
    isCollapsed?: boolean;
    tabsIncluded?: string[];
    tabsExcluded?: string[];
  } = {}) => {
    vi.mocked(buildNumericFacet).mockReturnValue(mockedFacetForRange);
    vi.mocked(buildNumericFilter).mockReturnValue(mockedFilter);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildTabManager).mockReturnValue(mockedTabManager);

    const {element} = await renderInAtomicSearchInterface<AtomicNumericFacet>({
      template: html`<atomic-numeric-facet
          field=${field}
          label=${label}
          number-of-values=${numberOfValues}
          with-input=${withInput || ''}
          display-values-as=${displayValuesAs}
          ?is-collapsed=${isCollapsed}
          .tabsIncluded=${tabsIncluded}
          .tabsExcluded=${tabsExcluded}
        ></atomic-numeric-facet>`,
      selector: 'atomic-numeric-facet',
      bindings: (bindings) => {
        bindings.engine = buildFakeEngine({});
        return bindings;
      },
    });

    return {
      element,
      parts: {
        get facet() {
          return element.shadowRoot!.querySelector('[part~=facet]')!;
        },
        get placeholder() {
          return element.shadowRoot!.querySelector('[part~=placeholder]')!;
        },
        get labelButton() {
          return element.shadowRoot!.querySelector('[part~=label-button]')!;
        },
        get labelButtonIcon() {
          return element.shadowRoot!.querySelector(
            '[part~=label-button-icon]'
          )!;
        },
        get clearButton() {
          return element.shadowRoot!.querySelector('[part~=clear-button]')!;
        },
        get clearButtonIcon() {
          return element.shadowRoot!.querySelector(
            '[part~=clear-button-icon]'
          )!;
        },
        get values() {
          return element.shadowRoot!.querySelector('[part~=values]')!;
        },
        get valueLabels() {
          return element.shadowRoot!.querySelectorAll('[part~=value-label]');
        },
        get valueCounts() {
          return element.shadowRoot!.querySelectorAll('[part~=value-count]');
        },
        get valueCheckboxes() {
          return element.shadowRoot!.querySelectorAll('[part~=value-checkbox]');
        },
        get valueLinks() {
          return element.shadowRoot!.querySelectorAll('[part~=value-link]');
        },
        get inputForm() {
          return element.shadowRoot!.querySelector('[part~=input-form]')!;
        },
      },
      get title() {
        return page.getByText(label, {exact: true});
      },
      get clearFilterButton() {
        return page.getByRole('button', {name: /clear filter/i});
      },
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      getFacetCheckboxByPosition(valuePosition: number) {
        return page.getByRole('checkbox').nth(valuePosition);
      },
      getFacetLinkByPosition(valuePosition: number) {
        return page.getByRole('link').nth(valuePosition);
      },
    };
  };

  describe('when no search has been executed', () => {
    beforeEach(() => {
      mockedSearchStatus = buildFakeSearchStatus({
        state: {
          firstSearchExecuted: false,
          hasError: false,
          hasResults: false,
          isLoading: false,
        },
      });
    });

    it('should render placeholder', async () => {
      const {parts} = await renderComponent();
      expect(parts.placeholder).toBeTruthy();
    });

    it('should not render facet container', async () => {
      const {parts} = await renderComponent();
      expect(parts.facet).toBeFalsy();
    });
  });

  describe('when a search has been executed', () => {
    it('should render the title', async () => {
      const {title} = await renderComponent({label: 'Price'});
      await expect.element(title).toBeInTheDocument();
    });

    it('should render facet container', async () => {
      const {parts} = await renderComponent();
      expect(parts.facet).toBeTruthy();
    });

    it('should render facet values', async () => {
      const {parts} = await renderComponent();
      expect(parts.valueLabels.length).toBeGreaterThan(0);
    });

    it('should display correct number of values', async () => {
      const {parts} = await renderComponent();
      expect(parts.valueLabels.length).toBe(2);
    });
  });

  describe('with checkbox display mode', () => {
    it('should render checkboxes', async () => {
      const {parts} = await renderComponent({displayValuesAs: 'checkbox'});
      expect(parts.valueCheckboxes.length).toBeGreaterThan(0);
    });

    it('should not render links', async () => {
      const {parts} = await renderComponent({displayValuesAs: 'checkbox'});
      expect(parts.valueLinks.length).toBe(0);
    });

    it('should call toggleSelect when checkbox is clicked', async () => {
      const {getFacetCheckboxByPosition} = await renderComponent({
        displayValuesAs: 'checkbox',
      });
      const checkbox = getFacetCheckboxByPosition(0);
      await checkbox.click();
      expect(mockedFacetForRange.toggleSelect).toHaveBeenCalled();
    });
  });

  describe('with link display mode', () => {
    it('should render links', async () => {
      const {parts} = await renderComponent({displayValuesAs: 'link'});
      expect(parts.valueLinks.length).toBeGreaterThan(0);
    });

    it('should not render checkboxes', async () => {
      const {parts} = await renderComponent({displayValuesAs: 'link'});
      expect(parts.valueCheckboxes.length).toBe(0);
    });

    it('should call toggleSingleSelect when link is clicked', async () => {
      const {getFacetLinkByPosition} = await renderComponent({
        displayValuesAs: 'link',
      });
      const link = getFacetLinkByPosition(0);
      await link.click();
      expect(mockedFacetForRange.toggleSingleSelect).toHaveBeenCalled();
    });
  });

  describe('when collapsed', () => {
    it('should not render values', async () => {
      const {parts} = await renderComponent({isCollapsed: true});
      expect(parts.values).toBeFalsy();
    });

    it('should still render title', async () => {
      const {title} = await renderComponent({
        isCollapsed: true,
        label: 'Price',
      });
      await expect.element(title).toBeInTheDocument();
    });
  });

  describe('when expanded', () => {
    it('should render values', async () => {
      const {parts} = await renderComponent({isCollapsed: false});
      expect(parts.values).toBeTruthy();
    });
  });

  describe('with selected values', () => {
    beforeEach(() => {
      mockedFacetForRange = buildFakeNumericFacet({
        implementation: {
          toggleSelect: vi.fn(),
          toggleSingleSelect: vi.fn(),
          deselectAll: vi.fn(),
        },
        state: {
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: true,
              state: 'selected',
              numberOfResults: 10,
            },
            {
              start: 100,
              end: 200,
              endInclusive: true,
              state: 'idle',
              numberOfResults: 5,
            },
          ],
        },
      });
    });

    it('should render clear button', async () => {
      const {clearFilterButton} = await renderComponent();
      await expect.element(clearFilterButton).toBeInTheDocument();
    });

    it('should call deselectAll when clear button is clicked', async () => {
      const {clearFilterButton} = await renderComponent();
      await clearFilterButton.click();
      expect(mockedFacetForRange.deselectAll).toHaveBeenCalled();
    });
  });

  describe('with number input', () => {
    beforeEach(() => {
      vi.mocked(buildNumericFacet).mockImplementation((_engine, options) => {
        if (options.options.facetId?.includes('_input_range')) {
          return mockedFacetForInput;
        }
        return mockedFacetForRange;
      });
    });

    it('should build facet for input', async () => {
      await renderComponent({withInput: 'integer'});
      expect(buildNumericFacet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            numberOfValues: 1,
            generateAutomaticRanges: true,
            facetId: expect.stringContaining('_input_range'),
          }),
        })
      );
    });

    it('should build numeric filter', async () => {
      await renderComponent({withInput: 'integer'});
      expect(buildNumericFilter).toHaveBeenCalled();
    });

    it('should render number input component', async () => {
      const {element} = await renderComponent({withInput: 'integer'});
      const inputComponent = element.shadowRoot!.querySelector(
        'atomic-facet-number-input'
      );
      expect(inputComponent).toBeTruthy();
    });
  });

  describe('with filter range active', () => {
    beforeEach(() => {
      mockedFilter = buildFakeNumericFilter({
        implementation: {
          clear: vi.fn(),
        },
        state: {
          range: {
            start: 10,
            end: 50,
          },
        },
      });
    });

    it('should call filter.clear when clear button is clicked', async () => {
      const {clearFilterButton} = await renderComponent({withInput: 'integer'});
      await clearFilterButton.click();
      expect(mockedFilter.clear).toHaveBeenCalled();
    });
  });

  describe('with tabs-included and tabs-excluded', () => {
    it('should warn when both tabs-included and tabs-excluded are provided', async () => {
      await renderComponent({
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      });
      expect(mockedConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Values for both "tabs-included" and "tabs-excluded"'
        )
      );
    });
  });

  describe('controller initialization', () => {
    it('should build numeric facet with correct options', async () => {
      await renderComponent({
        field: 'price',
        numberOfValues: 5,
        sortCriteria: 'descending',
      });
      expect(buildNumericFacet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            field: 'price',
            numberOfValues: 5,
            sortCriteria: 'descending',
          }),
        })
      );
    });

    it('should build search status', async () => {
      await renderComponent();
      expect(buildSearchStatus).toHaveBeenCalled();
    });

    it('should build tab manager', async () => {
      await renderComponent();
      expect(buildTabManager).toHaveBeenCalled();
    });
  });

  describe('facet ID generation', () => {
    it('should use field as facet ID when not already in use', async () => {
      const {element} = await renderComponent({field: 'uniquefield'});
      expect(element.facetId).toBe('uniquefield');
    });

    it('should generate random facet ID when facet-id prop is not provided but field is already in use', async () => {
      const {element: element1} = await renderComponent({field: 'size'});
      const {element: element2} = await renderComponent({field: 'size'});
      expect(element1.facetId).toBe('size');
      expect(element2.facetId).toContain('size_');
      expect(element2.facetId).not.toBe('size');
    });
  });

  describe('disconnection cleanup', () => {
    it('should clean up event listeners on disconnection', async () => {
      const {element} = await renderComponent();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
      element.disconnectedCallback();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/numberFormat',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/numberInputApply',
        expect.any(Function)
      );
    });
  });
});

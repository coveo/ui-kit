import {
  buildFacet as buildInsightFacet,
  buildFacetConditionsManager as buildInsightFacetConditionsManager,
  buildSearchStatus as buildInsightSearchStatus,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import './atomic-insight-facet';
import {ifDefined} from 'lit/directives/if-defined.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/facet-conditions-manager';
import {buildFakeFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import type {AtomicInsightFacet} from './atomic-insight-facet';

vi.mock('@coveo/headless/insight', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

describe('atomic-insight-facet', () => {
  let mockedRegisterFacet: Mock;

  beforeEach(() => {
    mockedRegisterFacet = vi.fn();
    vi.mocked(buildInsightFacet).mockReturnValue(buildFakeFacet({}));
    vi.mocked(buildInsightSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
    vi.mocked(buildInsightFacetConditionsManager).mockReturnValue(
      buildFakeFacetConditionsManager({})
    );
  });

  const setupElement = async (
    props: {
      field?: string;
      injectionDepth?: number;
      filterFacetCount?: boolean;
      resultsMustMatch?: 'allValues' | 'atLeastOneValue';
      sortCriteria?:
        | 'score'
        | 'alphanumeric'
        | 'alphanumericDescending'
        | 'occurrences'
        | 'alphanumericNatural'
        | 'alphanumericNaturalDescending'
        | 'automatic';
      numberOfValues?: number;
      isCollapsed?: boolean;
      displayValuesAs?: 'checkbox' | 'link' | 'box';
      enableExclusion?: boolean;
      facetId?: string;
      headingLevel?: number;
    } = {}
  ) => {
    const {element} = await renderInAtomicInsightInterface<AtomicInsightFacet>({
      template: html`<atomic-insight-facet
        field=${props.field ?? 'defaultField'}
        label="Test Field"
        facet-id=${ifDefined(props.facetId)}
        display-values-as=${ifDefined(props.displayValuesAs)}
        sort-criteria=${ifDefined(props.sortCriteria)}
        number-of-values=${ifDefined(props.numberOfValues)}
        results-must-match=${ifDefined(props.resultsMustMatch)}
        injection-depth=${ifDefined(props.injectionDepth)}
        heading-level=${ifDefined(props.headingLevel)}
        filter-facet-count=${ifDefined(props.filterFacetCount)}
        is-collapsed=${ifDefined(props.isCollapsed)}
        enable-exclusion=${ifDefined(props.enableExclusion)}
      ></atomic-insight-facet>`,
      selector: 'atomic-insight-facet',
      bindings: (bindings) => ({
        ...bindings,
        store: {
          ...bindings.store,
          getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
          registerFacet: mockedRegisterFacet,
        },
      }),
    });
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part~="${part}"]`)!;
    const qsa = (part: string, ...additionalSelector: string[]) =>
      element.shadowRoot?.querySelectorAll(
        `[part~="${part}"]${additionalSelector?.join('')}`
      )!;

    const locators = {
      get title() {
        return page.getByText('Test Field', {exact: true});
      },
      getFacetValueByPosition(valuePosition: number) {
        return page.getByTestId(`facet-value-${valuePosition}`);
      },
      getFacetValueButtonByPosition(valuePosition: number) {
        return page.getByTestId(`facet-value-button-${valuePosition}`);
      },
      getFacetValueByLabel(value: string | RegExp) {
        return page.getByText(value);
      },
      getFacetValueButtonByLabel(value: string | RegExp) {
        return page.getByRole('button', {name: value});
      },
      get componentError() {
        return page.getByText(/error/i);
      },
      placeholder: element.shadowRoot?.querySelector(
        'atomic-facet-placeholder'
      ),
      facet: qs('facet'),
      labelButton: qs('label-button'),
      labelButtonIcon: qs('label-button-icon'),
      clearButton: qs('clear-button'),
      clearButtonIcon: qs('clear-button-icon'),
      values: qsa('values'),
      valueLabel: qsa('value-label'),
      valueCount: qsa('value-count'),
      valueCheckbox: qsa('value-checkbox'),
      valueCheckboxChecked: qsa('value-checkbox-checked'),
      valueCheckboxExcluded: qsa(
        'value-checkbox-checked',
        '[aria-pressed=mixed]'
      ),
      valueCheckboxLabel: qsa('value-checkbox-label'),
      valueCheckboxIcon: qsa('value-checkbox-icon'),
      valueLink: qsa('value-link'),
      valueBox: qsa('value-box'),
      showMore: qs('show-more'),
      showLess: qs('show-less'),
    };

    return {element, locators};
  };

  describe('when the facet has not been initialized', () => {
    it('should render a placeholder', async () => {
      vi.mocked(buildInsightSearchStatus).mockReturnValue(
        buildFakeSearchStatus({firstSearchExecuted: false})
      );
      const {locators} = await setupElement();

      expect(locators.placeholder).toBeTruthy();
    });
  });

  describe('when the facet is initialized', () => {
    it('should call buildInsightFacet', async () => {
      await setupElement();
      expect(buildInsightFacet).toHaveBeenCalled();
    });

    it('should call buildInsightSearchStatus', async () => {
      await setupElement();
      expect(buildInsightSearchStatus).toHaveBeenCalled();
    });

    it('should call buildInsightFacetConditionsManager', async () => {
      await setupElement();
      expect(buildInsightFacetConditionsManager).toHaveBeenCalled();
    });

    it('should register the facet', async () => {
      await setupElement();
      expect(mockedRegisterFacet).toHaveBeenCalledWith(
        'facets',
        expect.objectContaining({
          facetId: 'some-facet-id',
        })
      );
    });
  });

  describe('when facet values are available', () => {
    beforeEach(() => {
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          state: {
            values: [
              {value: 'value-1', numberOfResults: 15, state: 'idle'},
              {value: 'value-2', numberOfResults: 8, state: 'idle'},
            ],
          },
        })
      );
    });

    it('should render the facet title', async () => {
      const {locators} = await setupElement();
      await expect.element(locators.title).toBeInTheDocument();
    });

    it('should render facet values', async () => {
      const {locators} = await setupElement();
      await expect
        .element(locators.getFacetValueByLabel('value-1'))
        .toBeInTheDocument();
      await expect
        .element(locators.getFacetValueByLabel('value-2'))
        .toBeInTheDocument();
    });

    it('should render facet values with checkbox display by default', async () => {
      const {locators} = await setupElement();
      expect(locators.valueCheckbox.length).toBe(2);
    });

    it('should render facet values with link display when displayValuesAs is "link"', async () => {
      const {locators} = await setupElement({displayValuesAs: 'link'});
      expect(locators.valueLink.length).toBe(2);
    });

    it('should render facet values with box display when displayValuesAs is "box"', async () => {
      const {locators} = await setupElement({displayValuesAs: 'box'});
      expect(locators.valueBox.length).toBe(2);
    });

    it('should call toggleSelect when clicking a facet value in checkbox mode', async () => {
      const toggleSelect = vi.fn();
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {toggleSelect},
        })
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.getFacetValueButtonByPosition(0));
      expect(toggleSelect).toHaveBeenCalled();
    });

    it('should call toggleSingleSelect when clicking a facet value in link mode', async () => {
      const toggleSingleSelect = vi.fn();
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {toggleSingleSelect},
        })
      );
      const {locators} = await setupElement({displayValuesAs: 'link'});
      await userEvent.click(locators.getFacetValueButtonByPosition(0));
      expect(toggleSingleSelect).toHaveBeenCalled();
    });

    it('should render exclusion button when enableExclusion is true', async () => {
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          state: {
            values: [
              {value: 'value-1', numberOfResults: 15, state: 'selected'},
            ],
          },
        })
      );
      const {element} = await setupElement({enableExclusion: true});
      const excludeButton = element.shadowRoot?.querySelector(
        '[part~="value-exclude-button"]'
      );
      expect(excludeButton).toBeTruthy();
    });

    it('should call toggleExclude when clicking an exclusion button', async () => {
      const toggleExclude = vi.fn();
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {toggleExclude},
          state: {
            values: [
              {value: 'value-1', numberOfResults: 15, state: 'selected'},
            ],
          },
        })
      );
      const {element} = await setupElement({enableExclusion: true});
      const excludeButton = element.shadowRoot?.querySelector(
        '[part~="value-exclude-button"]'
      ) as HTMLElement;
      await userEvent.click(excludeButton);
      expect(toggleExclude).toHaveBeenCalled();
    });
  });

  describe('when facet is collapsed', () => {
    it('should not render facet values', async () => {
      const {locators} = await setupElement({isCollapsed: true});
      expect(locators.valueCheckbox.length).toBe(0);
    });

    it('should expand facet when clicking the title', async () => {
      const {element, locators} = await setupElement({isCollapsed: true});
      await userEvent.click(locators.title);
      expect(element.isCollapsed).toBe(false);
    });
  });

  describe('when canShowMoreValues is true', () => {
    beforeEach(() => {
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          state: {canShowMoreValues: true},
        })
      );
    });

    it('should render show more button', async () => {
      const {locators} = await setupElement();
      expect(locators.showMore).toBeTruthy();
    });

    it('should call showMoreValues when clicking show more', async () => {
      const showMoreValues = vi.fn();
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {showMoreValues},
          state: {canShowMoreValues: true},
        })
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.showMore);
      expect(showMoreValues).toHaveBeenCalled();
    });
  });

  describe('when canShowLessValues is true', () => {
    beforeEach(() => {
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          state: {canShowLessValues: true},
        })
      );
    });

    it('should render show less button', async () => {
      const {locators} = await setupElement();
      expect(locators.showLess).toBeTruthy();
    });

    it('should call showLessValues when clicking show less', async () => {
      const showLessValues = vi.fn();
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {showLessValues},
          state: {canShowLessValues: true},
        })
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.showLess);
      expect(showLessValues).toHaveBeenCalled();
    });
  });

  describe('when active values are present', () => {
    beforeEach(() => {
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          state: {
            values: [
              {value: 'value-1', numberOfResults: 15, state: 'selected'},
              {value: 'value-2', numberOfResults: 8, state: 'idle'},
            ],
          },
        })
      );
    });

    it('should render clear button', async () => {
      const {locators} = await setupElement();
      expect(locators.clearButton).toBeTruthy();
    });

    it('should call deselectAll when clicking clear button', async () => {
      const deselectAll = vi.fn();
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {deselectAll},
          state: {
            values: [
              {value: 'value-1', numberOfResults: 15, state: 'selected'},
            ],
          },
        })
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.clearButton);
      expect(deselectAll).toHaveBeenCalled();
    });
  });

  describe('prop validation', () => {
    describe('#field', () => {
      it('should not set error when field is valid', async () => {
        const {element} = await setupElement({field: 'validField'});
        expect(element.error).toBeUndefined();
      });

      it('should set error when field is empty', async () => {
        const {element} = await setupElement({field: ''});
        expect(element.error).toBeInstanceOf(Error);
      });
    });

    describe('#numberOfValues', () => {
      it('should not set error when numberOfValues is valid', async () => {
        const {element} = await setupElement({numberOfValues: 10});
        expect(element.error).toBeUndefined();
      });

      it('should set error when numberOfValues is less than 1', async () => {
        const {element} = await setupElement({numberOfValues: 0});
        expect(element.error).toBeInstanceOf(Error);
      });
    });

    describe('#injectionDepth', () => {
      it('should not set error when injectionDepth is valid', async () => {
        const {element} = await setupElement({injectionDepth: 1000});
        expect(element.error).toBeUndefined();
      });

      it('should not set error when injectionDepth is 0', async () => {
        const {element} = await setupElement({injectionDepth: 0});
        expect(element.error).toBeUndefined();
      });

      it('should set error when injectionDepth is negative', async () => {
        const {element} = await setupElement({injectionDepth: -1});
        expect(element.error).toBeInstanceOf(Error);
      });
    });
  });

  describe('accessibility', () => {
    it('should announce facet search values to screen readers when there are search results', async () => {
      vi.mocked(buildInsightFacet).mockReturnValue(
        buildFakeFacet({
          implementation: {
            // @ts-expect-error: ignoring other methods
            facetSearch: {
              select: vi.fn(),
            },
          },
          state: {
            facetSearch: {
              moreValuesAvailable: true,
              isLoading: false,
              query: 'ele',
              values: [
                {
                  displayValue: 'sd',
                  rawValue: 'sd',
                  count: 1,
                },
              ],
            },
          },
        })
      );

      const announceSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'announce'
      );
      const {locators} = await setupElement();
      await userEvent.click(locators.valueLabel[0]);
      expect(announceSpy).toHaveBeenCalledWith(
        '1 value found in the Test Field facet'
      );
    });
  });

  describe('#disconnectedCallback', () => {
    it('should stop watching facetConditionsManager', async () => {
      const stopWatching = vi.fn();
      vi.mocked(buildInsightFacetConditionsManager).mockReturnValue(
        buildFakeFacetConditionsManager({
          stopWatching,
        })
      );
      const {element} = await setupElement();
      await element.remove();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(stopWatching).toHaveBeenCalled();
    });
  });
});

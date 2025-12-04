import {
  buildFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
  type FacetSortCriterion,
  type FacetValue,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicSegmentedFacet} from './atomic-segmented-facet';
import './atomic-segmented-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-segmented-facet', () => {
  const defaultFacetValues: FacetValue[] = [
    {value: 'PDF', numberOfResults: 42, state: 'idle'},
    {value: 'HTML', numberOfResults: 28, state: 'idle'},
    {value: 'Word', numberOfResults: 15, state: 'selected'},
  ];

  beforeEach(() => {
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        state: {
          values: defaultFacetValues,
          enabled: true,
          facetId: 'test-facet',
        },
      })
    );
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager({}));
    vi.mocked(buildFacetConditionsManager).mockReturnValue(
      buildFakeFacetConditionsManager({})
    );
  });

  const renderComponent = async ({
    props = {},
    facetState = {},
    searchStatusState = {},
  }: {
    props?: Partial<{
      field: string;
      facetId: string;
      label: string;
      tabsIncluded: string[];
      tabsExcluded: string[];
      filterFacetCount: boolean;
      injectionDepth: number;
      numberOfValues: number;
      sortCriteria: FacetSortCriterion;
      dependsOn: Record<string, string>;
      allowedValues: string[];
      customSort: string[];
    }>;
    facetState?: Partial<{
      values: FacetValue[];
      enabled: boolean;
      facetId: string;
    }>;
    searchStatusState?: Partial<{
      firstSearchExecuted: boolean;
      hasError: boolean;
      hasResults: boolean;
    }>;
  } = {}) => {
    vi.mocked(buildFacet).mockReturnValue(
      buildFakeFacet({
        state: {
          values: defaultFacetValues,
          enabled: true,
          facetId: 'test-facet',
          ...facetState,
        },
      })
    );

    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        firstSearchExecuted: true,
        ...searchStatusState,
      })
    );

    const {element} = await renderInAtomicSearchInterface<AtomicSegmentedFacet>(
      {
        template: html`<atomic-segmented-facet
          field=${props.field ?? 'filetype'}
          facet-id=${ifDefined(props.facetId)}
          label=${ifDefined(props.label)}
          .tabsIncluded=${props.tabsIncluded ?? []}
          .tabsExcluded=${props.tabsExcluded ?? []}
          filter-facet-count=${ifDefined(props.filterFacetCount)}
          injection-depth=${ifDefined(props.injectionDepth)}
          number-of-values=${ifDefined(props.numberOfValues)}
          sort-criteria=${ifDefined(props.sortCriteria)}
          .dependsOn=${props.dependsOn ?? {}}
          .allowedValues=${props.allowedValues ?? []}
          .customSort=${props.customSort ?? []}
        ></atomic-segmented-facet>`,
        selector: 'atomic-segmented-facet',
      }
    );

    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part~="${part}"]`)!;
    const qsa = (part: string) =>
      element.shadowRoot?.querySelectorAll(`[part~="${part}"]`)!;

    const locators = {
      get label() {
        return props.label ? page.getByText(props.label, {exact: false}) : null;
      },
      segmentedContainer: qs('segmented-container'),
      labelPart: qs('label'),
      values: qs('values'),
      valueBox: qsa('value-box'),
      valueBoxSelected: qsa('value-box-selected'),
      placeholder: qs('placeholder'),
    };

    return {element, locators};
  };

  describe('when initializing', () => {
    it('should build facet controller with correct options', async () => {
      const {element} = await renderComponent({
        props: {
          field: 'objecttype',
          numberOfValues: 8,
          sortCriteria: 'alphanumeric',
        },
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: 'objecttype',
            numberOfValues: 8,
            sortCriteria: 'alphanumeric',
          }),
        })
      );
    });

    it('should build search status controller', async () => {
      const {element} = await renderComponent();

      expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.searchStatus).toBeDefined();
    });

    it('should build tab manager controller', async () => {
      const {element} = await renderComponent();

      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.tabManager).toBeDefined();
    });

    it('should build facet conditions manager', async () => {
      const {element} = await renderComponent({
        props: {dependsOn: {abc: 'doc'}},
      });

      expect(buildFacetConditionsManager).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          facetId: element.facetId,
        })
      );
    });

    it('should set facetId from controller state', async () => {
      const {element} = await renderComponent({
        facetState: {facetId: 'generated-id'},
      });

      expect(element.facetId).toBe('generated-id');
    });

    it('should bind facet state to controller', async () => {
      const {element} = await renderComponent({
        facetState: {values: defaultFacetValues},
      });

      expect(element.facetState.values).toEqual(defaultFacetValues);
    });

    it('should bind search status state to controller', async () => {
      const {element} = await renderComponent({
        searchStatusState: {firstSearchExecuted: true},
      });

      expect(element.searchStatusState.firstSearchExecuted).toBe(true);
    });

    it('should bind tab manager state to controller', async () => {
      const {element} = await renderComponent();

      expect(element.tabManagerState).toBeDefined();
    });

    describe('when both tabsIncluded and tabsExcluded are provided', () => {
      let consoleWarnSpy: MockInstance;

      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it('should log a warning', async () => {
        await renderComponent({
          props: {
            tabsIncluded: ['tab1'],
            tabsExcluded: ['tab2'],
          },
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('tabs-included')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('tabs-excluded')
        );
      });
    });
  });

  describe('#facetOptions', () => {
    it('should include allowedValues when provided', async () => {
      const {element} = await renderComponent({
        props: {allowedValues: ['PDF', 'HTML']},
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            allowedValues: ['PDF', 'HTML'],
          }),
        })
      );
    });

    it('should set allowedValues to undefined when empty', async () => {
      const {element} = await renderComponent({
        props: {allowedValues: []},
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            allowedValues: undefined,
          }),
        })
      );
    });

    it('should include customSort when provided', async () => {
      const {element} = await renderComponent({
        props: {customSort: ['PDF', 'HTML', 'Word']},
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            customSort: ['PDF', 'HTML', 'Word'],
          }),
        })
      );
    });

    it('should set customSort to undefined when empty', async () => {
      const {element} = await renderComponent({
        props: {customSort: []},
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            customSort: undefined,
          }),
        })
      );
    });

    it('should include tabs configuration', async () => {
      const {element} = await renderComponent({
        props: {
          tabsIncluded: ['tab1', 'tab2'],
          tabsExcluded: ['tab3'],
        },
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            tabs: {
              included: ['tab1', 'tab2'],
              excluded: ['tab3'],
            },
          }),
        })
      );
    });

    it('should set hasBreadcrumbs to false', async () => {
      const {element} = await renderComponent();

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            hasBreadcrumbs: false,
          }),
        })
      );
    });

    it('should include filterFacetCount property', async () => {
      const {element} = await renderComponent({
        props: {filterFacetCount: false},
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            filterFacetCount: false,
          }),
        })
      );
    });

    it('should include injectionDepth property', async () => {
      const {element} = await renderComponent({
        props: {injectionDepth: 2000},
      });

      expect(buildFacet).toHaveBeenCalledWith(
        element.bindings.engine,
        expect.objectContaining({
          options: expect.objectContaining({
            injectionDepth: 2000,
          }),
        })
      );
    });
  });

  describe('rendering', () => {
    describe('when search has error', () => {
      it('should render nothing', async () => {
        const {locators} = await renderComponent({
          searchStatusState: {hasError: true},
        });

        await expect
          .element(locators.segmentedContainer)
          .not.toBeInTheDocument();
        await expect.element(locators.placeholder).not.toBeInTheDocument();
      });
    });

    describe('when facet is not enabled', () => {
      it('should render nothing', async () => {
        const {locators} = await renderComponent({
          facetState: {enabled: false},
        });

        await expect
          .element(locators.segmentedContainer)
          .not.toBeInTheDocument();
        await expect.element(locators.placeholder).not.toBeInTheDocument();
      });
    });

    describe('when first search not executed', () => {
      it('should render placeholder', async () => {
        const {locators} = await renderComponent({
          searchStatusState: {firstSearchExecuted: false},
        });

        await expect.element(locators.placeholder).toBeInTheDocument();
      });

      it('should render placeholder with correct classes', async () => {
        const {locators} = await renderComponent({
          searchStatusState: {firstSearchExecuted: false},
        });

        expect(locators.placeholder?.className).toContain('animate-pulse');
      });

      it('should not render segmented container', async () => {
        const {locators} = await renderComponent({
          searchStatusState: {firstSearchExecuted: false},
        });

        await expect
          .element(locators.segmentedContainer)
          .not.toBeInTheDocument();
      });
    });

    describe('when no facet values', () => {
      it('should render nothing', async () => {
        const {locators} = await renderComponent({
          facetState: {values: []},
        });

        await expect
          .element(locators.segmentedContainer)
          .not.toBeInTheDocument();
        await expect.element(locators.placeholder).not.toBeInTheDocument();
      });
    });

    describe('when facet has values', () => {
      it('should render segmented container', async () => {
        const {locators} = await renderComponent();

        await expect.element(locators.segmentedContainer).toBeInTheDocument();
      });

      it('should render values container', async () => {
        const {locators} = await renderComponent();

        await expect.element(locators.values).toBeInTheDocument();
      });

      it('should render correct number of facet values', async () => {
        const {locators} = await renderComponent({
          facetState: {values: defaultFacetValues},
        });

        expect(locators.valueBox.length).toBe(3);
      });

      it('should render selected facet values', async () => {
        const {locators} = await renderComponent({
          facetState: {values: defaultFacetValues},
        });

        expect(locators.valueBoxSelected.length).toBe(1);
      });

      describe('when label is provided', () => {
        it('should render label', async () => {
          const {locators} = await renderComponent({
            props: {label: 'File Type'},
          });

          await expect.element(locators.labelPart).toBeInTheDocument();
          expect(locators.labelPart?.textContent).toContain('File Type');
        });

        it('should render label with colon', async () => {
          const {locators} = await renderComponent({
            props: {label: 'File Type'},
          });

          expect(locators.labelPart?.textContent).toContain(':');
        });
      });

      describe('when label is not provided', () => {
        it('should not render label', async () => {
          const {locators} = await renderComponent({
            props: {label: undefined},
          });

          await expect.element(locators.labelPart).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('interaction', () => {
    it('should call toggleSingleSelect when value is clicked', async () => {
      const mockFacet = buildFakeFacet({
        state: {values: defaultFacetValues},
      });
      vi.mocked(buildFacet).mockReturnValue(mockFacet);

      const {locators} = await renderComponent();

      const firstValueButton = locators.valueBox[0] as HTMLElement;
      await userEvent.click(firstValueButton);

      expect(mockFacet.toggleSingleSelect).toHaveBeenCalledWith(
        defaultFacetValues[0]
      );
    });

    it('should call toggleSingleSelect with correct value for second item', async () => {
      const mockFacet = buildFakeFacet({
        state: {values: defaultFacetValues},
      });
      vi.mocked(buildFacet).mockReturnValue(mockFacet);

      const {locators} = await renderComponent();

      const secondValueButton = locators.valueBox[1] as HTMLElement;
      await userEvent.click(secondValueButton);

      expect(mockFacet.toggleSingleSelect).toHaveBeenCalledWith(
        defaultFacetValues[1]
      );
    });
  });

  describe('#disconnectedCallback', () => {
    it('should call stopWatching on dependencies manager', async () => {
      const mockDependenciesManager = buildFakeFacetConditionsManager({});
      vi.mocked(buildFacetConditionsManager).mockReturnValue(
        mockDependenciesManager
      );

      const {element} = await renderComponent();

      element.remove();

      expect(mockDependenciesManager.stopWatching).toHaveBeenCalled();
    });
  });

  describe('shadow parts', () => {
    it('should expose segmented-container part', async () => {
      const {locators} = await renderComponent();

      expect(locators.segmentedContainer?.getAttribute('part')).toBe(
        'segmented-container'
      );
    });

    it('should expose label part when label provided', async () => {
      const {locators} = await renderComponent({
        props: {label: 'Test'},
      });

      expect(locators.labelPart?.getAttribute('part')).toBe('label');
    });

    it('should expose values part', async () => {
      const {locators} = await renderComponent();

      expect(locators.values?.getAttribute('part')).toBe('values');
    });

    it('should expose placeholder part when rendering placeholder', async () => {
      const {locators} = await renderComponent({
        searchStatusState: {firstSearchExecuted: false},
      });

      expect(locators.placeholder?.getAttribute('part')).toBe('placeholder');
    });
  });
});

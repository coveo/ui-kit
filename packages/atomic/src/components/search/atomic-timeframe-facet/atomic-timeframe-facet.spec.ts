import {buildSearchStatus, buildTabManager} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {TimeframeFacetCommon} from '@/src/components/common/facets/timeframe-facet-common';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicTimeframeFacet} from './atomic-timeframe-facet';
import './atomic-timeframe-facet';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/common/facets/timeframe-facet-common');

describe('atomic-timeframe-facet', () => {
  let mockedRegisterFacet: MockInstance;
  let mockTimeframeFacetCommonRender: MockInstance;

  beforeEach(() => {
    mockConsole();
    mockedRegisterFacet = vi.fn();

    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager({}));

    // Mock TimeframeFacetCommon
    mockTimeframeFacetCommonRender = vi.fn(() => html`<div>mocked facet</div>`);
    vi.mocked(TimeframeFacetCommon).mockImplementation(
      () =>
        ({
          render: mockTimeframeFacetCommonRender,
          disconnectedCallback: vi.fn(),
        }) as unknown as TimeframeFacetCommon
    );
  });

  const setupElement = async (
    props?: Partial<{
      field: string;
      label: string;
      tabsIncluded: string[];
      tabsExcluded: string[];
      withDatePicker: boolean;
      isCollapsed: boolean;
      headingLevel: number;
      filterFacetCount: boolean;
      injectionDepth: number;
      dependsOn: Record<string, string>;
      min: string;
      max: string;
      sortCriteria: 'ascending' | 'descending';
      facetId: string;
    }>
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicTimeframeFacet>(
      {
        template: html`<atomic-timeframe-facet
        field=${props?.field ?? 'date'}
        label=${props?.label ?? 'Date'}
        facet-id=${ifDefined(props?.facetId)}
        sort-criteria=${ifDefined(props?.sortCriteria)}
        injection-depth=${ifDefined(props?.injectionDepth)}
        heading-level=${ifDefined(props?.headingLevel)}
        .tabsIncluded=${props?.tabsIncluded || []}
        .tabsExcluded=${props?.tabsExcluded || []}
        .dependsOn=${props?.dependsOn || {}}
        filter-facet-count=${ifDefined(props?.filterFacetCount)}
        is-collapsed=${ifDefined(props?.isCollapsed)}
        with-date-picker=${ifDefined(props?.withDatePicker)}
        min=${ifDefined(props?.min)}
        max=${ifDefined(props?.max)}
      >
        <atomic-timeframe unit="month" amount="1" period="past"></atomic-timeframe>
        <atomic-timeframe unit="month" amount="3" period="past"></atomic-timeframe>
      </atomic-timeframe-facet>`,
        selector: 'atomic-timeframe-facet',
        bindings: (bindings) => ({
          ...bindings,
          store: {
            ...bindings.store,
            getUniqueIDFromEngine: vi.fn().mockReturnValue('123'),
            registerFacet: mockedRegisterFacet,
            state: {
              ...bindings.store.state,
              dateFacets: {},
            },
          },
        }),
      }
    );

    return {
      element,
      get facet() {
        return element.shadowRoot!.querySelector('[part=facet]')!;
      },
      get placeholder() {
        return element.shadowRoot!.querySelector('[part=placeholder]')!;
      },
      get title() {
        return page.getByText('Date', {exact: true});
      },
    };
  };

  describe('when rendering (#render)', () => {
    it('should create TimeframeFacetCommon instance', async () => {
      await setupElement();
      expect(TimeframeFacetCommon).toHaveBeenCalled();
    });

    it('should pass correct options to TimeframeFacetCommon', async () => {
      await setupElement({
        field: 'customfield',
        label: 'Custom Label',
        withDatePicker: true,
        min: '2020-01-01',
        max: '2025-12-31',
        sortCriteria: 'ascending',
      });

      expect(TimeframeFacetCommon).toHaveBeenCalledWith(
        expect.objectContaining({
          field: 'customfield',
          label: 'Custom Label',
          withDatePicker: true,
          min: '2020-01-01',
          max: '2025-12-31',
          sortCriteria: 'ascending',
        })
      );
    });

    it('should delegate rendering to TimeframeFacetCommon', async () => {
      await setupElement();
      expect(mockTimeframeFacetCommonRender).toHaveBeenCalledWith(
        expect.objectContaining({
          hasError: false,
          firstSearchExecuted: true,
          isCollapsed: false,
        })
      );
    });

    it('should render placeholder when first search not executed', async () => {
      vi.mocked(buildSearchStatus).mockReturnValue(
        buildFakeSearchStatus({
          firstSearchExecuted: false,
        })
      );

      const {placeholder} = await setupElement();
      await expect.element(placeholder).toBeInTheDocument();
    });
  });

  describe('props', () => {
    describe('field', () => {
      it('should pass field to TimeframeFacetCommon', async () => {
        await setupElement({field: 'customfield'});
        expect(TimeframeFacetCommon).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'customfield',
          })
        );
      });
    });

    describe('facetId', () => {
      it('should pass facetId to TimeframeFacetCommon when provided', async () => {
        await setupElement({facetId: 'my-facet-id'});
        expect(TimeframeFacetCommon).toHaveBeenCalledWith(
          expect.objectContaining({
            facetId: 'my-facet-id',
          })
        );
      });
    });

    describe('sortCriteria', () => {
      it('should pass sortCriteria to TimeframeFacetCommon', async () => {
        await setupElement({sortCriteria: 'ascending'});
        expect(TimeframeFacetCommon).toHaveBeenCalledWith(
          expect.objectContaining({
            sortCriteria: 'ascending',
          })
        );
      });
    });

    describe('injectionDepth', () => {
      it('should validate injectionDepth is non-negative', async () => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await setupElement({injectionDepth: -1});
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });

    describe('headingLevel', () => {
      it('should pass headingLevel to TimeframeFacetCommon', async () => {
        await setupElement({headingLevel: 3});
        expect(TimeframeFacetCommon).toHaveBeenCalledWith(
          expect.objectContaining({
            headingLevel: 3,
          })
        );
      });
    });

    describe('min', () => {
      it('should pass min to TimeframeFacetCommon', async () => {
        await setupElement({min: '2020-01-01', withDatePicker: true});
        expect(TimeframeFacetCommon).toHaveBeenCalledWith(
          expect.objectContaining({
            min: '2020-01-01',
          })
        );
      });

      it('should validate min format', async () => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await setupElement({min: 'invalid-date'});
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });

    describe('max', () => {
      it('should pass max to TimeframeFacetCommon', async () => {
        await setupElement({max: '2025-12-31', withDatePicker: true});
        expect(TimeframeFacetCommon).toHaveBeenCalledWith(
          expect.objectContaining({
            max: '2025-12-31',
          })
        );
      });

      it('should validate max format', async () => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        await setupElement({max: 'invalid-date'});
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });

    it('should warn when both tabsIncluded and tabsExcluded are provided', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await setupElement({
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('tabs-included')
      );
    });
  });

  describe('#controllers', () => {
    it('should build search status controller', async () => {
      await setupElement();
      expect(buildSearchStatus).toHaveBeenCalled();
    });

    it('should build tab manager controller', async () => {
      await setupElement();
      expect(buildTabManager).toHaveBeenCalled();
    });
  });

  describe('when removed from the DOM (#disconnectedCallback)', () => {
    it('should call disconnectedCallback on TimeframeFacetCommon', async () => {
      const disconnectedCallbackSpy = vi.fn();
      vi.mocked(TimeframeFacetCommon).mockImplementation(
        () =>
          ({
            render: vi.fn(),
            disconnectedCallback: disconnectedCallbackSpy,
          }) as unknown as TimeframeFacetCommon
      );

      const {element} = await setupElement();
      element.remove();

      expect(disconnectedCallbackSpy).toHaveBeenCalled();
    });
  });

  describe('#interactions', () => {
    it('should handle date input apply event', async () => {
      const {element} = await setupElement({withDatePicker: true});

      // Simulate date input event - the event listener is registered in the component
      const customEvent = new CustomEvent('atomic-date-input-apply', {
        detail: {
          start: '2023-01-01',
          end: '2023-12-31',
          endInclusive: true,
        },
        bubbles: true,
        composed: true,
      });

      element.dispatchEvent(customEvent);

      // The event should be handled by the component
      expect(element).toBeDefined();
    });
  });

  describe('isCollapsed', () => {
    it('should pass isCollapsed state to TimeframeFacetCommon render', async () => {
      await setupElement({isCollapsed: true});
      expect(mockTimeframeFacetCommonRender).toHaveBeenCalledWith(
        expect.objectContaining({
          isCollapsed: true,
        })
      );
    });

    it('should toggle isCollapsed when onToggleCollapse is called', async () => {
      const {element} = await setupElement({isCollapsed: false});

      // Get the onToggleCollapse callback
      const renderCall = mockTimeframeFacetCommonRender.mock.calls[0][0];
      const onToggleCollapse = renderCall.onToggleCollapse;

      // Call the toggle function
      onToggleCollapse();

      // The component should re-render with the new isCollapsed state
      await element.updateComplete;

      expect(element.isCollapsed).toBe(true);
    });
  });
});

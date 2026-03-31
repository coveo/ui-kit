import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildFacetManager,
  type FacetManager,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeFacetManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-manager';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicBreadbox} from './atomic-breadbox';
import './atomic-breadbox';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-breadbox', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedBreadcrumbManager: BreadcrumbManager;
  let mockedFacetManager: FacetManager;
  const mockedDeselectAll = vi.fn();

  beforeEach(() => {
    mockConsole();
  });

  interface RenderBreadboxOptions {
    pathLimit?: number;
    breadcrumbState?: Partial<BreadcrumbManagerState>;
  }

  const renderBreadbox = async ({
    pathLimit = 3,
    breadcrumbState = {},
  }: RenderBreadboxOptions = {}) => {
    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbState,
      implementation: {
        deselectAll: mockedDeselectAll,
      },
    });
    mockedFacetManager = buildFakeFacetManager({});

    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockedBreadcrumbManager);
    vi.mocked(buildFacetManager).mockReturnValue(mockedFacetManager);

    const {element} = await renderInAtomicSearchInterface<AtomicBreadbox>({
      template: html`<atomic-breadbox
        path-limit=${ifDefined(pathLimit)}
      ></atomic-breadbox>`,
      selector: 'atomic-breadbox',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        bindings.store.state.facets = {
          'test-facet': {
            facetId: 'test-facet',
            label: () => 'Test Facet',
            element: document.createElement('div'),
            isHidden: () => false,
          },
        };
        bindings.store.state.numericFacets = {
          'test-numeric-facet': {
            facetId: 'test-numeric-facet',
            label: () => 'Test Numeric Facet',
            element: document.createElement('div'),
            isHidden: () => false,
            format: vi.fn((value) => value.toString()),
          },
        };
        return bindings;
      },
    });

    return {
      element,
      label: () => page.getByText('Filters:'),
      showMore: () => page.getByLabelText(/Show \+ \d+ more filters/),
      showLess: () => page.getByText('Show less'),
      clearAll: () => page.getByLabelText('Clear All Filters'),
      parts: (element: AtomicBreadbox) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          container: qs('container'),
          breadcrumbListContainer: qs('breadcrumb-list-container'),
          breadcrumbList: qs('breadcrumb-list'),
          breadcrumbButton: qs('breadcrumb-button'),
          breadcrumbLabel: qs('breadcrumb-label'),
          breadcrumbValue: qs('breadcrumb-value'),
          breadcrumbClear: qs('breadcrumb-clear'),
          showMore: qs('show-more'),
          showLess: qs('show-less'),
          clearAll: qs('clear'),
        };
      },
    };
  };

  describe('constructor', () => {
    it('should not set error when pathLimit is valid', async () => {
      const {element} = await renderBreadbox({
        pathLimit: 3,
      });

      expect(element.error).toBeUndefined();
    });

    it('should set error when pathLimit is initially lower than 1', async () => {
      const {element} = await renderBreadbox({
        pathLimit: 0,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(
        /pathLimit: minimum value of 1 not respected/i
      );
    });

    it('should set error when valid pathLimit is updated to a value lower than 1', async () => {
      const {element} = await renderBreadbox();

      expect(element.error).toBeUndefined();

      element.pathLimit = 0;

      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(
        /pathLimit: minimum value of 1 not respected/i
      );
    });
  });

  describe('initialize', () => {
    it('should set breadcrumbManager public property', async () => {
      const {element} = await renderBreadbox();

      expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
    });

    it('should set facetManager public property', async () => {
      const {element} = await renderBreadbox();

      expect(element.facetManager).toBe(mockedFacetManager);
    });

    it('should sync breadcrumbManagerState to controller state', async () => {
      const {element} = await renderBreadbox();

      expect(element.breadcrumbManagerState).toEqual(
        mockedBreadcrumbManager.state
      );
    });

    it('should sync facetManagerState to controller state', async () => {
      const {element} = await renderBreadbox();

      expect(element.facetManagerState).toEqual(mockedFacetManager.state);
    });

    it.each([
      {
        description: 'ResizeObserver is available',
        resizeObserverAvailable: true,
        shouldObserve: true,
      },
      {
        description: 'ResizeObserver is not available',
        resizeObserverAvailable: false,
        shouldObserve: false,
      },
    ])(
      'should handle ResizeObserver creation when $description',
      async ({resizeObserverAvailable, shouldObserve}) => {
        const originalResizeObserver = window.ResizeObserver;
        const observeSpy = vi.spyOn(ResizeObserver.prototype, 'observe');

        if (!resizeObserverAvailable) {
          // @ts-expect-error - Intentionally setting to undefined for testing
          window.ResizeObserver = undefined;
        }

        const {element} = await renderBreadbox();

        if (shouldObserve) {
          expect(observeSpy).toHaveBeenCalledWith(element.parentElement);
        } else {
          expect(observeSpy).not.toHaveBeenCalled();
        }

        window.ResizeObserver = originalResizeObserver;
      }
    );
  });

  describe('render', () => {
    it('should render nothing when there are no breadcrumbs', async () => {
      const {element} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [],
          categoryFacetBreadcrumbs: [],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          automaticFacetBreadcrumbs: [],
        },
      });
      expect(
        element.shadowRoot?.querySelector('[part="container"]')
      ).toBeNull();
    });

    it('should have the right text on the label', async () => {
      const {label} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });
      await expect.element(label()).toHaveTextContent('Filters:');
    });

    it('should render every part', async () => {
      const {element, parts} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });

      const partsElements = parts(element);

      await expect
        .element(partsElements.container! as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(partsElements.breadcrumbListContainer! as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(partsElements.breadcrumbList! as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(partsElements.breadcrumbButton! as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(partsElements.breadcrumbLabel! as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(partsElements.breadcrumbValue! as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(partsElements.breadcrumbClear! as HTMLElement)
        .toBeInTheDocument();
      await expect
        .element(partsElements.clearAll! as HTMLElement)
        .toBeInTheDocument();
    });

    it('should render show more part in shadow DOM even when not visible', async () => {
      const {element, parts} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value-1',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
          categoryFacetBreadcrumbs: [],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          automaticFacetBreadcrumbs: [],
          hasBreadcrumbs: true,
        },
        pathLimit: 2,
      });

      const showMorePart = parts(element).showMore;
      expect(showMorePart).toBeInTheDocument();
    });

    it('should not render show less part when component is collapsed', async () => {
      const {element, parts} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value-1',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
          categoryFacetBreadcrumbs: [],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          automaticFacetBreadcrumbs: [],
          hasBreadcrumbs: true,
        },
        pathLimit: 2,
      });

      expect(parts(element).showLess).toBeNull();
    });

    it('should render different breadcrumb types', async () => {
      const {element} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'facet-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
          numericFacetBreadcrumbs: [
            {
              facetId: 'test-numeric-facet',
              field: 'test-numeric-field',
              values: [
                {
                  value: {
                    start: 0,
                    end: 100,
                    endInclusive: true,
                    state: 'selected',
                    numberOfResults: 5,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });

      expect(
        element.shadowRoot?.querySelector('[part="container"]')
      ).not.toBeNull();
    });
  });

  it('should call deselect when a breadcrumb is clicked', async () => {
    const mockedDeselect = vi.fn();
    await renderBreadbox({
      breadcrumbState: {
        facetBreadcrumbs: [
          {
            facetId: 'test-facet',
            field: 'test-field',
            values: [
              {
                value: {
                  value: 'test-value',
                  state: 'selected',
                  numberOfResults: 1,
                },
                deselect: mockedDeselect,
              },
            ],
          },
        ],
      },
    });

    const breadcrumbButton = page.getByRole('button', {
      name: /test-value/i,
    });
    await userEvent.click(breadcrumbButton);

    expect(mockedDeselect).toHaveBeenCalled();
  });

  it('should call the deselectAll method when the clear all button is clicked', async () => {
    const {clearAll} = await renderBreadbox({
      breadcrumbState: {
        facetBreadcrumbs: [
          {
            facetId: 'test-facet',
            field: 'test-field',
            values: [
              {
                value: {
                  value: 'test-value',
                  state: 'selected',
                  numberOfResults: 1,
                },
                deselect: vi.fn(),
              },
            ],
          },
        ],
      },
    });
    await userEvent.click(clearAll());
    expect(mockedDeselectAll).toHaveBeenCalled();
  });

  it('should have the correct text on the clear all button', async () => {
    const {clearAll} = await renderBreadbox({
      breadcrumbState: {
        facetBreadcrumbs: [
          {
            facetId: 'test-facet',
            field: 'test-field',
            values: [
              {
                value: {
                  value: 'test-value',
                  state: 'selected',
                  numberOfResults: 1,
                },
                deselect: vi.fn(),
              },
            ],
          },
        ],
      },
    });
    await expect.element(clearAll()).toHaveTextContent('Clear');
  });

  it('should have the correct aria-label on the clear all button', async () => {
    const {clearAll} = await renderBreadbox({
      breadcrumbState: {
        facetBreadcrumbs: [
          {
            facetId: 'test-facet',
            field: 'test-field',
            values: [
              {
                value: {
                  value: 'test-value',
                  state: 'selected',
                  numberOfResults: 1,
                },
                deselect: vi.fn(),
              },
            ],
          },
        ],
      },
    });
    await expect
      .element(clearAll())
      .toHaveAttribute('aria-label', 'Clear All Filters');
  });

  describe('disconnectedCallback', () => {
    it('should disconnect the resize observer when disconnected', async () => {
      const {element} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });
      const disconnectSpy = vi.spyOn(ResizeObserver.prototype, 'disconnect');
      element.disconnectedCallback();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('user interactions', () => {
    it('should call individual breadcrumb deselect when clicked', async () => {
      const mockedDeselect = vi.fn();
      await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: mockedDeselect,
                },
              ],
            },
          ],
        },
      });

      const breadcrumbButton = page.getByRole('button', {
        name: /test-value/i,
      });
      await userEvent.click(breadcrumbButton);

      expect(mockedDeselect).toHaveBeenCalled();
    });

    it('should handle exclusion breadcrumbs', async () => {
      const mockedDeselectExclusion = vi.fn();
      const {element} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'excluded-value',
                    state: 'excluded',
                    numberOfResults: 1,
                  },
                  deselect: mockedDeselectExclusion,
                },
              ],
            },
          ],
        },
      });

      expect(
        element.shadowRoot?.querySelector('[part="container"]')
      ).not.toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes on breadcrumb buttons', async () => {
      await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });

      const breadcrumbButton = page.getByRole('button', {
        name: /test-value/i,
      });
      await expect.element(breadcrumbButton).toHaveRole('button');
      await expect.element(breadcrumbButton).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA attributes on clear all button', async () => {
      const {clearAll} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });

      await expect.element(clearAll()).toHaveRole('button');
      await expect
        .element(clearAll())
        .toHaveAttribute('aria-label', 'Clear All Filters');
    });
  });

  describe('updated', () => {
    it('should handle rendering with many breadcrumbs', async () => {
      const {element} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: Array.from({length: 10}, (_, i) => ({
                value: {
                  value: `test-value-${i}`,
                  state: 'selected' as const,
                  numberOfResults: 1,
                },
                deselect: vi.fn(),
              })),
            },
          ],
        },
      });

      expect(
        element.shadowRoot?.querySelector('[part="container"]')
      ).not.toBeNull();

      const breadcrumbButtons = element.shadowRoot?.querySelectorAll(
        '[part="breadcrumb-button"]'
      );
      expect(breadcrumbButtons?.length).toBeGreaterThan(0);

      expect(element.isConnected).toBe(true);
    });

    it('should handle when ResizeObserver is not available during initialization', async () => {
      const originalResizeObserver = window.ResizeObserver;
      // @ts-expect-error - Intentionally setting to undefined for testing
      window.ResizeObserver = undefined;

      const {element} = await renderBreadbox({
        breadcrumbState: {
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'test-value',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });

      expect(element).toBeDefined();

      window.ResizeObserver = originalResizeObserver;
    });
  });
});

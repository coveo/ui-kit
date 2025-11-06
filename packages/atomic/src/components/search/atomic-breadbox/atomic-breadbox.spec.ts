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
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/breadcrumb-manager';
import {buildFakeEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/engine';
import {buildFakeFacetManager} from '@/vitest-utils/testing-helpers/fixtures/headless/facet-manager';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicBreadbox} from './atomic-breadbox';
import './atomic-breadbox';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-breadbox', () => {
  const mockedEngine = buildFakeEngine();
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

  it('should call buildBreadcrumbManager', async () => {
    await renderBreadbox();
    expect(buildBreadcrumbManager).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildFacetManager', async () => {
    await renderBreadbox();
    expect(buildFacetManager).toHaveBeenCalledWith(mockedEngine);
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
    expect(element.shadowRoot?.querySelector('[part="container"]')).toBeNull();
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
      name: /test-field: test-value/i,
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

    await expect.element(partsElements.container!).toBeInTheDocument();
    await expect
      .element(partsElements.breadcrumbListContainer!)
      .toBeInTheDocument();
    await expect.element(partsElements.breadcrumbList!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbButton!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbLabel!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbValue!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbClear!).toBeInTheDocument();
    await expect.element(partsElements.clearAll!).toBeInTheDocument();
  });

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

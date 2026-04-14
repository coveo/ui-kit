import {
  buildBreadcrumbManager,
  buildFacetManager,
  buildQuerySummary,
  buildSearchStatus,
  buildSort,
  buildTabManager,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeFacetManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-manager';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeSort} from '@/vitest-utils/testing-helpers/fixtures/headless/search/sort-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicRefineToggle} from './atomic-refine-toggle';
import './atomic-refine-toggle';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-refine-toggle', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedSearchStatus: SearchStatus;

  interface RenderRefineToggleOptions {
    props?: Partial<AtomicRefineToggle>;
    searchStatusState?: Partial<SearchStatusState>;
  }

  const renderRefineToggle = async ({
    props = {},
    searchStatusState,
  }: RenderRefineToggleOptions = {}) => {
    mockedSearchStatus = buildFakeSearchStatus({
      firstSearchExecuted: true,
      hasResults: true,
      hasError: false,
      ...searchStatusState,
    });

    // Mock controllers used by atomic-refine-toggle
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);

    // Mock controllers used by atomic-refine-modal (which is dynamically created)
    vi.mocked(buildBreadcrumbManager).mockReturnValue(
      buildFakeBreadcrumbManager()
    );
    vi.mocked(buildSort).mockReturnValue(buildFakeSort());
    vi.mocked(buildQuerySummary).mockReturnValue(buildFakeSummary());
    vi.mocked(buildFacetManager).mockReturnValue(buildFakeFacetManager());
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager());

    const {element} = await renderInAtomicSearchInterface<AtomicRefineToggle>({
      template: html`<atomic-refine-toggle
        .collapseFacetsAfter=${props.collapseFacetsAfter ?? 0}
      ></atomic-refine-toggle>`,
      selector: 'atomic-refine-toggle',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        bindings.store.getFacetElements = () => [];
        bindings.store.getAllFacets = () => ({});
        bindings.store.state.sortOptions = [];
        return bindings;
      },
    });

    return {
      element,
      get placeholder() {
        return element.shadowRoot?.querySelector('[part="placeholder"]');
      },
      get button() {
        return element.shadowRoot?.querySelector('button');
      },
      get modal() {
        return (element.getRootNode() as Document | ShadowRoot)?.querySelector(
          'atomic-refine-modal'
        );
      },
    };
  };

  it('should call buildSearchStatus with the engine', async () => {
    await renderRefineToggle();

    expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set this.searchStatus to the search status controller', async () => {
    const {element} = await renderRefineToggle();

    expect(element.searchStatus).toBe(mockedSearchStatus);
  });

  it('should render nothing if there is an error', async () => {
    const {element} = await renderRefineToggle({
      searchStatusState: {
        hasError: true,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render a placeholder if the first request has not been executed', async () => {
    const {placeholder} = await renderRefineToggle({
      searchStatusState: {
        firstSearchExecuted: false,
      },
    });

    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('part', 'placeholder');
  });

  it('should render nothing if there are no results', async () => {
    const {element} = await renderRefineToggle({
      searchStatusState: {
        hasResults: false,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render the button with the correct text', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveTextContent('Sort & Filter');
  });

  it('should render the button with the correct part', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveAttribute('part', 'button');
  });

  it('should create the modal when rendered', async () => {
    const {modal} = await renderRefineToggle();

    expect(modal).toBeInTheDocument();
  });

  it('should set the openButton of the modal to the button', async () => {
    const {button, modal} = await renderRefineToggle();

    expect(modal?.openButton).toBe(button);
  });

  it('should set the collapseFacetsAfter of the modal to the component prop', async () => {
    const {modal} = await renderRefineToggle({
      props: {collapseFacetsAfter: 5},
    });

    expect(modal?.collapseFacetsAfter).toBe(5);
  });

  it('should open the modal when the button is clicked', async () => {
    const {button, modal} = await renderRefineToggle();

    await userEvent.click(button!);

    expect(modal?.isOpen).toBe(true);
  });
});

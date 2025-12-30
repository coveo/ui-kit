import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/breadcrumb-manager';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import type {AtomicInsightRefineToggle} from './atomic-insight-refine-toggle';
import './atomic-insight-refine-toggle';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-refine-toggle', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedSearchStatus: SearchStatus;
  let mockedBreadcrumbManager: BreadcrumbManager;

  interface RenderRefineToggleOptions {
    searchStatusState?: Partial<SearchStatusState>;
    breadcrumbManagerState?: Partial<BreadcrumbManagerState>;
  }

  const renderRefineToggle = async ({
    searchStatusState,
    breadcrumbManagerState,
  }: RenderRefineToggleOptions = {}) => {
    mockedSearchStatus = buildFakeSearchStatus({
      firstSearchExecuted: true,
      hasResults: true,
      hasError: false,
      ...searchStatusState,
    });

    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbManagerState,
    });

    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockedBreadcrumbManager);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightRefineToggle>({
        template: html`<atomic-insight-refine-toggle></atomic-insight-refine-toggle>`,
        selector: 'atomic-insight-refine-toggle',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
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
      get container() {
        return element.shadowRoot?.querySelector(
          '[part="insight-refine-toggle-container"]'
        );
      },
      get badge() {
        return element.shadowRoot?.querySelector(
          '[part="insight-refine-toggle-badge"]'
        );
      },
      get modal() {
        return (element.getRootNode() as Document | ShadowRoot)?.querySelector(
          'atomic-insight-refine-modal'
        );
      },
    };
  };

  it('should call buildSearchStatus with the engine', async () => {
    await renderRefineToggle();

    expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildBreadcrumbManager with the engine', async () => {
    await renderRefineToggle();

    expect(buildBreadcrumbManager).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set this.searchStatus to the search status controller', async () => {
    const {element} = await renderRefineToggle();

    expect(element.searchStatus).toBe(mockedSearchStatus);
  });

  it('should set this.breadcrumbManager to the breadcrumb manager controller', async () => {
    const {element} = await renderRefineToggle();

    expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
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

  it('should render nothing if there are no results and no breadcrumbs', async () => {
    const {element} = await renderRefineToggle({
      searchStatusState: {
        hasResults: false,
      },
      breadcrumbManagerState: {
        hasBreadcrumbs: false,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render the button when there are results', async () => {
    const {button} = await renderRefineToggle({
      searchStatusState: {
        hasResults: true,
      },
    });

    expect(button).toBeInTheDocument();
  });

  it('should render the button when there are breadcrumbs but no results', async () => {
    const {button} = await renderRefineToggle({
      searchStatusState: {
        hasResults: false,
      },
      breadcrumbManagerState: {
        hasBreadcrumbs: true,
        facetBreadcrumbs: [{field: 'test', values: []} as never],
      },
    });

    expect(button).toBeInTheDocument();
  });

  it('should render the button with the correct part', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveAttribute('part', 'insight-refine-toggle-button');
  });

  it('should render the button with the filters aria-label', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveAttribute('aria-label', 'Filters');
  });

  it('should create the modal when rendered', async () => {
    const {modal} = await renderRefineToggle();

    expect(modal).toBeInTheDocument();
  });

  it('should set the openButton of the modal to the button', async () => {
    const {button, modal} = await renderRefineToggle();

    expect(modal?.openButton).toBe(button);
  });

  it('should open the modal when the button is clicked', async () => {
    const {button, modal} = await renderRefineToggle();

    await userEvent.click(button!);

    expect(modal?.isOpen).toBe(true);
  });

  describe('badge', () => {
    it('should not display badge when there are no breadcrumbs', async () => {
      const {badge} = await renderRefineToggle({
        breadcrumbManagerState: {
          hasBreadcrumbs: false,
        },
      });

      expect(badge).not.toBeInTheDocument();
    });

    it('should display badge with breadcrumb count when there are breadcrumbs', async () => {
      const {badge} = await renderRefineToggle({
        breadcrumbManagerState: {
          hasBreadcrumbs: true,
          facetBreadcrumbs: [
            {field: 'test1', values: []} as never,
            {field: 'test2', values: []} as never,
          ],
        },
      });

      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });
  });

  it('should not be disabled when there are breadcrumbs but no results', async () => {
    const {button} = await renderRefineToggle({
      searchStatusState: {
        hasResults: false,
      },
      breadcrumbManagerState: {
        hasBreadcrumbs: true,
        facetBreadcrumbs: [{field: 'test', values: []} as never],
      },
    });

    expect(button).not.toBeDisabled();

    it('should enable button when there are results', async () => {
      const {button} = await renderRefineToggle({
        searchStatusState: {
          hasResults: true,
        },
      });

      expect(button).not.toBeDisabled();
    });
  });
});

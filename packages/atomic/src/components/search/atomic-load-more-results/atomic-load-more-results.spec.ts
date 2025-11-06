import {buildQuerySummary, buildResultList} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {page} from 'vitest/browser';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {buildFakeResultList} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result-list-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import type {AtomicLoadMoreResults} from './atomic-load-more-results';
import './atomic-load-more-results';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/common/interface/store', {spy: true});
describe('atomic-load-more-results', () => {
  const mockedEngine = buildFakeSearchEngine();
  let fetchMoreResultsSpy: Mock;
  let appLoadedCallback: (isAppLoaded: boolean) => void;

  beforeEach(() => {
    fetchMoreResultsSpy = vi.fn();
    vi.mocked(createAppLoadedListener).mockImplementation((_store, cb) => {
      appLoadedCallback = cb;
    });
  });

  const renderLoadMoreResults = async ({
    props = {},
  }: {
    props?: {
      numberOfResults?: number;
      totalNumberOfResults?: number;
      moreResultsAvailable?: boolean;
      isAppLoaded?: boolean;
    };
  } = {}) => {
    const {
      numberOfResults = 10,
      totalNumberOfResults = 100,
      moreResultsAvailable = true,
      isAppLoaded = true,
    } = props;

    const fakeResults = Array.from({length: numberOfResults}, (_, i) =>
      buildFakeResult({uniqueId: `result-${i}`})
    );

    vi.mocked(buildQuerySummary).mockReturnValue(
      buildFakeSummary({
        state: {
          total: totalNumberOfResults,
          lastResult: numberOfResults,
          hasResults: totalNumberOfResults > 0,
          firstSearchExecuted: true,
        },
      })
    );

    vi.mocked(buildResultList).mockReturnValue(
      buildFakeResultList({
        state: {
          results: fakeResults,
          moreResultsAvailable,
        },
        implementation: {
          fetchMoreResults: fetchMoreResultsSpy,
        },
      })
    );

    const {element} =
      await renderInAtomicSearchInterface<AtomicLoadMoreResults>({
        template: html`<atomic-load-more-results></atomic-load-more-results>`,
        selector: 'atomic-load-more-results',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.store.state.loadingFlags = isAppLoaded
            ? []
            : ['app-loading'];
          return bindings;
        },
      });

    appLoadedCallback(isAppLoaded);

    return {
      element,
      get loadMoreButton() {
        return page.getByRole('button');
      },
      get showingResults() {
        return element.shadowRoot?.querySelector('[part="showing-results"]');
      },
      get progressBar() {
        return element.shadowRoot?.querySelector('[part="progress-bar"]');
      },
      get container() {
        return element.shadowRoot?.querySelector('[part="container"]');
      },
      parts: (element: AtomicLoadMoreResults) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          container: qs('container'),
          showingResults: qs('showing-results'),
          progressBar: qs('progress-bar'),
          loadMoreButton: qs('load-more-results-button'),
        };
      },
    };
  };

  describe('#initialize', () => {
    it('should call #createAppLoadedListener with store', async () => {
      const {element} = await renderLoadMoreResults();
      expect(createAppLoadedListener).toHaveBeenCalledWith(
        element.bindings.store,
        expect.any(Function)
      );
    });

    it('should update #isAppLoaded when app loaded state changes', async () => {
      const {element} = await renderLoadMoreResults({
        props: {isAppLoaded: false},
      });
      // biome-ignore lint/complexity/useLiteralKeys: <accessing private property for testing>
      expect(element['isAppLoaded']).toBe(false);

      appLoadedCallback(true);
      // biome-ignore lint/complexity/useLiteralKeys: <accessing private property for testing>
      expect(element['isAppLoaded']).toBe(true);
    });
  });

  it('should call #buildQuerySummary with engine', async () => {
    const {element} = await renderLoadMoreResults();
    expect(buildQuerySummary).toHaveBeenCalledExactlyOnceWith(
      element.bindings.engine
    );
  });

  it('should call #buildResultList with engine', async () => {
    const {element} = await renderLoadMoreResults();
    expect(buildResultList).toHaveBeenCalledWith(
      element.bindings.engine,
      expect.objectContaining({
        options: expect.objectContaining({
          fieldsToInclude: [],
        }),
      })
    );
  });

  it('should render nothing when the app is not loaded', async () => {
    const {container} = await renderLoadMoreResults({
      props: {isAppLoaded: false},
    });

    expect(container).not.toBeInTheDocument();
  });

  it('should render nothing when there are no results', async () => {
    const {container} = await renderLoadMoreResults({
      props: {
        totalNumberOfResults: 0,
        numberOfResults: 0,
      },
    });

    expect(container).not.toBeInTheDocument();
  });

  describe('when the app is loaded and there are results', () => {
    it('should render the container', async () => {
      const {container} = await renderLoadMoreResults();

      expect(container).toBeInTheDocument();
    });

    it('should render a localized summary with formatted numbers', async () => {
      const {showingResults} = await renderLoadMoreResults({
        props: {
          numberOfResults: 1234,
          totalNumberOfResults: 1234567,
        },
      });

      expect(showingResults).toBeInTheDocument();
      expect(showingResults?.textContent?.trim()).toBe(
        'Showing 1,234 of 1,234,567 results'
      );
    });

    it('should render a progress bar with the correct width', async () => {
      const {progressBar} = await renderLoadMoreResults({
        props: {
          numberOfResults: 12,
          totalNumberOfResults: 123,
        },
      });
      const progressBarFill = progressBar?.querySelector(
        '[part="progress-bar"] div'
      );

      expect(progressBar).toBeInTheDocument();
      // Math.ceil(Math.min((12 / 123) * 100, 100)) = 10, so width will be 10%
      expect(progressBarFill).toHaveStyle('width: 10%');
    });

    it('should not render a load more button when all results are loaded', async () => {
      const {loadMoreButton} = await renderLoadMoreResults({
        props: {
          numberOfResults: 10,
          totalNumberOfResults: 10,
          moreResultsAvailable: false,
        },
      });

      await expect.element(loadMoreButton).not.toBeInTheDocument();
    });

    it('should render a load more button with the correct localized label when more results are available', async () => {
      const {loadMoreButton} = await renderLoadMoreResults({
        props: {
          numberOfResults: 10,
          totalNumberOfResults: 100,
        },
      });

      await expect.element(loadMoreButton).toBeInTheDocument();
      expect(loadMoreButton).toHaveTextContent('Load more results');
    });

    describe('when the load more button is clicked', () => {
      it('should call #fetchMoreResults', async () => {
        const {loadMoreButton} = await renderLoadMoreResults();

        await loadMoreButton.click();

        expect(fetchMoreResultsSpy).toHaveBeenCalledOnce();
      });

      it('should blur the active element', async () => {
        const {loadMoreButton} = await renderLoadMoreResults();
        const blurSpy = vi.fn();

        // Create a fake active element with a blur method
        const fakeActiveElement = document.createElement('button');
        fakeActiveElement.blur = blurSpy;
        Object.defineProperty(document, 'activeElement', {
          configurable: true,
          get: () => fakeActiveElement,
        });

        await loadMoreButton.click();

        expect(blurSpy).toHaveBeenCalledOnce();
      });
    });
  });
});

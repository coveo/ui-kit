import {
  buildHistoryManager,
  buildQuerySummary,
  buildSearchStatus,
  type HistoryManager,
  type HistoryManagerState,
  type QuerySummary,
  type QuerySummaryState,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';
import type {AtomicNoResults} from './atomic-no-results';
import './atomic-no-results';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-no-results', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedSearchStatus: SearchStatus;
  let mockedQuerySummary: QuerySummary;
  let mockedHistory: HistoryManager;

  const renderNoResults = async (options = {}) => {
    const {
      searchStatusState = {},
      querySummaryState = {},
      historyState = {},
      enableCancelLastAction = true,
    }: {
      searchStatusState?: Partial<SearchStatusState>;
      querySummaryState?: Partial<QuerySummaryState>;
      historyState?: Partial<HistoryManagerState>;
      enableCancelLastAction?: boolean;
    } = options;

    mockedSearchStatus = buildFakeSearchStatus({
      hasResults: false,
      firstSearchExecuted: true,
      isLoading: false,
      ...searchStatusState,
    });

    mockedQuerySummary = buildFakeSummary({
      state: {
        query: '',
        ...querySummaryState,
      },
    });

    mockedHistory = {
      state: {
        past: [],
        future: [],
        ...historyState,
      },
      subscribe: genericSubscribe,
      backOnNoResults: vi.fn(),
    } as unknown as HistoryManager;

    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildQuerySummary).mockReturnValue(mockedQuerySummary);
    vi.mocked(buildHistoryManager).mockReturnValue(mockedHistory);

    const {element} = await renderInAtomicSearchInterface<AtomicNoResults>({
      template: html`<atomic-no-results
        ?enable-cancel-last-action=${enableCancelLastAction}
      ></atomic-no-results>`,
      selector: 'atomic-no-results',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        bindings.store.onChange = vi.fn();
        return bindings;
      },
    });

    return {
      element,
      slot: element.shadowRoot?.querySelector('slot'),
      icon: element.shadowRoot?.querySelector('[part="icon"]'),
      noResultsText: element.shadowRoot?.querySelector('[part="no-results"]'),
      highlightedQuery: element.shadowRoot?.querySelector('[part="highlight"]'),
      searchTips: element.shadowRoot?.querySelector('[part="search-tips"]'),
      cancelButton: element.shadowRoot?.querySelector('[part="cancel-button"]'),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call buildSearchStatus with engine', async () => {
    await renderNoResults();
    expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildQuerySummary with engine', async () => {
    await renderNoResults();
    expect(buildQuerySummary).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildHistoryManager with engine', async () => {
    await renderNoResults();
    expect(buildHistoryManager).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set searchStatus to the controller', async () => {
    const {element} = await renderNoResults();
    expect(element.searchStatus).toBe(mockedSearchStatus);
  });

  it('should set querySummary to the controller', async () => {
    const {element} = await renderNoResults();
    expect(element.querySummary).toBe(mockedQuerySummary);
  });

  it('should set history to the controller', async () => {
    const {element} = await renderNoResults();
    expect(element.history).toBe(mockedHistory);
  });

  it('should render nothing when firstSearchExecuted is false', async () => {
    const {element} = await renderNoResults({
      searchStatusState: {
        firstSearchExecuted: false,
        isLoading: false,
        hasResults: false,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when isLoading is true', async () => {
    const {element} = await renderNoResults({
      searchStatusState: {
        firstSearchExecuted: true,
        isLoading: true,
        hasResults: false,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when hasResults is true', async () => {
    const {element} = await renderNoResults({
      searchStatusState: {
        firstSearchExecuted: true,
        isLoading: false,
        hasResults: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render a slot', async () => {
    const {slot} = await renderNoResults({
      searchStatusState: {
        firstSearchExecuted: true,
        isLoading: false,
        hasResults: false,
      },
    });
    expect(slot).toBeInTheDocument();
  });

  it('should render the correct part attribute on the icon', async () => {
    const {icon} = await renderNoResults();
    expect(icon).toHaveAttribute('part', 'icon');
  });

  it('should render an icon', async () => {
    const {icon} = await renderNoResults();
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('icon', MagnifyingGlassIcon);
  });

  it('should render the correct part attribute on the "no results" text', async () => {
    const {noResultsText} = await renderNoResults();
    expect(noResultsText).toHaveAttribute('part', 'no-results');
  });

  it('should render the correct text when there is a query', async () => {
    const query = 'test query';
    const {noResultsText} = await renderNoResults({
      querySummaryState: {
        query,
      },
    });

    expect(noResultsText).toHaveTextContent(
      `We couldn't find anything for "${query}"`
    );
  });

  it('should highlight the query in the "no results" text', async () => {
    const query = 'test query';
    const {highlightedQuery} = await renderNoResults({
      querySummaryState: {
        query,
      },
    });

    expect(highlightedQuery).toHaveTextContent(query);
  });

  it('should render the correct part attribute for the highlighted query', async () => {
    const query = 'test query';
    const {highlightedQuery} = await renderNoResults({
      querySummaryState: {
        query,
      },
    });

    expect(highlightedQuery).toHaveAttribute('part', 'highlight');
  });

  it('should render the correct text when there is no query', async () => {
    const {noResultsText} = await renderNoResults();
    expect(noResultsText).toHaveTextContent('No results');
  });

  it('should render the correct part attribute for the search tips', async () => {
    const {searchTips} = await renderNoResults();
    expect(searchTips).toHaveAttribute('part', 'search-tips');
  });

  it('should render the correct text in the search tips', async () => {
    const {searchTips} = await renderNoResults();

    expect(searchTips).toHaveTextContent(
      'You may want to try using different keywords, deselecting filters, or checking for spelling mistakes.'
    );
  });

  describe('when enableCancelLastAction is true', () => {
    it('should render cancel button when history has past actions', async () => {
      const {cancelButton} = await renderNoResults({
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
        enableCancelLastAction: true,
      });

      expect(cancelButton).toBeInTheDocument();
    });

    it('should not render cancel button when history has no past actions', async () => {
      const {cancelButton} = await renderNoResults({
        historyState: {
          past: [],
        },
        enableCancelLastAction: true,
      });

      expect(cancelButton).not.toBeInTheDocument();
    });

    it('should render the correct part attribute for the cancel button', async () => {
      const {cancelButton} = await renderNoResults({
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
        enableCancelLastAction: true,
      });

      expect(cancelButton).toHaveAttribute('part', 'cancel-button');
    });

    it('should call history.backOnNoResults when cancel button is clicked', async () => {
      const {cancelButton} = await renderNoResults({
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
        enableCancelLastAction: true,
      });

      cancelButton?.click();

      expect(mockedHistory.backOnNoResults).toHaveBeenCalled();
    });
  });

  describe('when enableCancelLastAction is false', () => {
    it('should not render cancel button even when history has past actions', async () => {
      const {cancelButton} = await renderNoResults({
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
        enableCancelLastAction: false,
      });

      expect(cancelButton).not.toBeInTheDocument();
    });
  });
});

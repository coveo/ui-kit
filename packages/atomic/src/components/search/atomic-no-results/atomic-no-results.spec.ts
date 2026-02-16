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
import {describe, expect, it, vi} from 'vitest';
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

  const renderNoResults = async ({
    props = {},
    searchStatusState = {},
    querySummaryState = {},
    historyState = {},
  }: {
    props?: {
      enableCancelLastAction?: boolean;
      hideCancelLastAction?: boolean;
    };
    searchStatusState?: Partial<SearchStatusState>;
    querySummaryState?: Partial<QuerySummaryState>;
    historyState?: Partial<HistoryManagerState>;
  } = {}) => {
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
      template: html`<atomic-no-results></atomic-no-results>`,
      selector: 'atomic-no-results',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        bindings.store.onChange = vi.fn();
        return bindings;
      },
    });

    if (props.enableCancelLastAction !== undefined) {
      element.enableCancelLastAction = props.enableCancelLastAction;
    }
    if (props.hideCancelLastAction !== undefined) {
      element.hideCancelLastAction = props.hideCancelLastAction;
    }
    await element.updateComplete;

    return {
      element,
      parts: (element: AtomicNoResults) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          slot: element.shadowRoot?.querySelector('slot'),
          icon: qs('icon'),
          noResults: qs('no-results'),
          highlight: qs('highlight'),
          searchTips: qs('search-tips'),
          cancelButton: qs('cancel-button'),
        };
      },
    };
  };

  describe('#initialize', () => {
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

  describe('when firstSearchExecuted is true, isLoading is false, and hasResults is false', () => {
    it('should render a slot', async () => {
      const {element, parts} = await renderNoResults();
      expect(parts(element).slot).toBeInTheDocument();
    });

    it('should render the correct part attribute on the icon', async () => {
      const {element, parts} = await renderNoResults();
      expect(parts(element).icon).toHaveAttribute('part', 'icon');
    });

    it('should render an icon', async () => {
      const {element, parts} = await renderNoResults();
      expect(parts(element).icon).toBeInTheDocument();
      expect(parts(element).icon).toHaveAttribute('icon', MagnifyingGlassIcon);
    });

    it('should render the correct part attribute on the "no results" text', async () => {
      const {element, parts} = await renderNoResults();
      expect(parts(element).noResults).toHaveAttribute('part', 'no-results');
    });

    it('should render the correct text when there is a query', async () => {
      const query = 'test query';
      const {element, parts} = await renderNoResults({
        querySummaryState: {
          query,
        },
      });

      expect(parts(element).noResults).toHaveTextContent(
        `We couldn't find anything for “${query}”`
      );
    });

    it('should highlight the query in the "no results" text', async () => {
      const query = 'test query';
      const {element, parts} = await renderNoResults({
        querySummaryState: {
          query,
        },
      });

      expect(parts(element).highlight).toHaveTextContent(query);
    });

    it('should render the correct part attribute for the highlighted query', async () => {
      const query = 'test query';
      const {element, parts} = await renderNoResults({
        querySummaryState: {
          query,
        },
      });

      expect(parts(element).highlight).toHaveAttribute('part', 'highlight');
    });

    it('should render the correct text when there is no query', async () => {
      const {element, parts} = await renderNoResults();
      expect(parts(element).noResults).toHaveTextContent('No results');
    });

    it('should render the correct part attribute for the search tips', async () => {
      const {element, parts} = await renderNoResults();
      expect(parts(element).searchTips).toHaveAttribute('part', 'search-tips');
    });

    it('should render the correct text in the search tips', async () => {
      const {element, parts} = await renderNoResults();

      expect(parts(element).searchTips).toHaveTextContent(
        'You may want to try using different keywords, deselecting filters, or checking for spelling mistakes.'
      );
    });
  });

  // TODO (v4): adjust the enable/hide cancel last action tests when we remove the enableCancelLastAction prop altogether.
  describe('when enableCancelLastAction is true', () => {
    it('should render cancel button when history has past actions', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: true,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      expect(parts(element).cancelButton).toBeInTheDocument();
    });

    it('should not render cancel button when history has no past actions', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: true,
        },
        historyState: {
          past: [],
        },
      });

      expect(parts(element).cancelButton).not.toBeInTheDocument();
    });

    it('should render the correct part attribute for the cancel button', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: true,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      expect(parts(element).cancelButton).toHaveAttribute(
        'part',
        'cancel-button'
      );
    });

    it('should call history.backOnNoResults when cancel button is clicked', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: true,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      parts(element).cancelButton?.click();

      expect(mockedHistory.backOnNoResults).toHaveBeenCalled();
    });
  });

  describe('when enableCancelLastAction is false', () => {
    it('should not render cancel button even when history has past actions', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: false,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      expect(parts(element).cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when hideCancelLastAction is true', () => {
    it('should not render cancel button even when history has past actions', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          hideCancelLastAction: true,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      expect(parts(element).cancelButton).not.toBeInTheDocument();
    });

    it('should not render cancel button regardless of enableCancelLastAction', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: true,
          hideCancelLastAction: true,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      expect(parts(element).cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when hideCancelLastAction is false', () => {
    it('should render cancel button when enableCancelLastAction is true and history has past actions', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: true,
          hideCancelLastAction: false,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      expect(parts(element).cancelButton).toBeInTheDocument();
    });

    it('should not render cancel button when enableCancelLastAction is false', async () => {
      const {element, parts} = await renderNoResults({
        props: {
          enableCancelLastAction: false,
          hideCancelLastAction: false,
        },
        historyState: {
          past: [{name: 'action1', value: 'value1'}],
        },
      });

      expect(parts(element).cancelButton).not.toBeInTheDocument();
    });
  });
});

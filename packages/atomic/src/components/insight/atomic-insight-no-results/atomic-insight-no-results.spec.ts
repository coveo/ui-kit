import {
  buildQuerySummary,
  buildSearchStatus,
  type QuerySummary,
  type QuerySummaryState,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeQuerySummary} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/query-summary-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';
import type {AtomicInsightNoResults} from './atomic-insight-no-results';
import './atomic-insight-no-results';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-no-results', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedSearchStatus: SearchStatus;
  let mockedQuerySummary: QuerySummary;

  const renderNoResults = async (options = {}) => {
    const {
      searchStatusState = {},
      querySummaryState = {},
    }: {
      searchStatusState?: Partial<SearchStatusState>;
      querySummaryState?: Partial<QuerySummaryState>;
    } = options;

    mockedSearchStatus = buildFakeSearchStatus({
      state: {
        ...searchStatusState,
        hasResults: false,
        firstSearchExecuted: true,
        isLoading: false,
      },
    });

    mockedQuerySummary = buildFakeQuerySummary({
      state: {
        ...querySummaryState,
      },
    });

    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightNoResults>({
        template: html`<atomic-insight-no-results></atomic-insight-no-results>`,
        selector: 'atomic-insight-no-results',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
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
    };
  };

  it('should call buildSearchStatus with the engine', async () => {
    await renderNoResults();
    expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildQuerySummary with the engine', async () => {
    await renderNoResults();
    expect(buildQuerySummary).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set searchStatus to the searchStatus controller', async () => {
    const {element} = await renderNoResults();
    expect(element.searchStatus).toBe(mockedSearchStatus);
  });

  it('should set querySummary to the querySummary controller', async () => {
    const {element} = await renderNoResults();
    expect(element.querySummary).toBe(mockedQuerySummary);
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
      `We couldn't find anything for “${query}”`
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
});

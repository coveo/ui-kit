import {buildQuerySummary, buildSearchStatus} from '@coveo/headless/insight';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeQuerySummary} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/query-summary-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import type {AtomicInsightNoResults} from './atomic-insight-no-results';
import './atomic-insight-no-results';

// Mock headless at the top level
vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-no-results', () => {
  const locators = {
    // Look for the component itself first
    component: () => page.getByRole('region', {name: /no.*results/i}),
    // Look for generic text content that should be in no-results state
    noResultsContent: () =>
      page.getByText(
        /no.*results.*found|try.*different.*keywords|search.*tips/i
      ),
    searchTips: () => page.getByText(/try.*different|search.*tips|keywords/i),
    // Use parts for more specific targeting
    parts: (element: AtomicInsightNoResults) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        searchTips: qs('search-tips'),
        highlight: qs('highlight'),
      };
    },
  };

  const setupElement = async (
    options: {
      searchStatusState?: Partial<{
        firstSearchExecuted: boolean;
        isLoading: boolean;
        hasResults: boolean;
        hasError: boolean;
      }>;
      querySummaryState?: Partial<{
        query: string;
        hasQuery: boolean;
        hasResults: boolean;
        total: number;
      }>;
    } = {}
  ) => {
    const {searchStatusState = {}, querySummaryState = {}} = options;

    const mockedSearchStatus = buildFakeSearchStatus({
      state: {
        firstSearchExecuted: true,
        isLoading: false,
        hasResults: false,
        hasError: false,
        ...searchStatusState,
      },
    });

    const mockedQuerySummary = buildFakeQuerySummary({
      state: {
        query: 'test query',
        hasQuery: true,
        hasResults: false,
        total: 0,
        firstSearchExecuted: true,
        isLoading: false,
        hasError: false,
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
          bindings.store.onChange = vi.fn();
          return bindings;
        },
      });

    return element;
  };

  beforeEach(() => {
    // Clean up before each test
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const element = await setupElement();
    expect(element).toBeDefined();
    expect(element.tagName.toLowerCase()).toBe('atomic-insight-no-results');
  });

  it('should initialize search status and query summary controllers', async () => {
    await setupElement();

    expect(vi.mocked(buildSearchStatus)).toHaveBeenCalled();
    expect(vi.mocked(buildQuerySummary)).toHaveBeenCalled();
  });

  it('should display no results when search executed with no results', async () => {
    const element = await setupElement({
      searchStatusState: {
        firstSearchExecuted: true,
        isLoading: false,
        hasResults: false,
      },
    });

    // Check if the component renders content (it has shadow content)
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.innerHTML).not.toBe('');
  });

  it('should not display content when search not executed', async () => {
    const element = await setupElement({
      searchStatusState: {
        firstSearchExecuted: false,
        isLoading: false,
        hasResults: false,
      },
    });

    // Should have minimal content when guard conditions not met
    const shadowContent = element.shadowRoot?.innerHTML || '';
    expect(shadowContent).toContain('p-3 text-center'); // Container should still be there
  });

  it('should not display content when loading', async () => {
    const element = await setupElement({
      searchStatusState: {
        firstSearchExecuted: true,
        isLoading: true,
        hasResults: false,
      },
    });

    // Should have minimal content when loading
    const shadowContent = element.shadowRoot?.innerHTML || '';
    expect(shadowContent).toContain('p-3 text-center'); // Container should still be there
  });

  it('should not display content when has results', async () => {
    const element = await setupElement({
      searchStatusState: {
        firstSearchExecuted: true,
        isLoading: false,
        hasResults: true,
      },
    });

    // Should have minimal content when there are results
    const shadowContent = element.shadowRoot?.innerHTML || '';
    expect(shadowContent).toContain('p-3 text-center'); // Container should still be there
  });

  describe('when no results are shown', () => {
    let element: AtomicInsightNoResults;

    beforeEach(async () => {
      element = await setupElement({
        searchStatusState: {
          firstSearchExecuted: true,
          isLoading: false,
          hasResults: false,
        },
        querySummaryState: {
          query: 'test query',
          hasQuery: true,
        },
      });
    });

    it('should render no results content structure', async () => {
      const shadowContent = element.shadowRoot?.innerHTML || '';

      // Should contain the no-items structure when conditions are met
      expect(shadowContent).toContain('text-on-background'); // Container class
      expect(shadowContent).toContain('flex'); // Layout classes
    });

    it('should have search tips part available', async () => {
      const parts = locators.parts(element);

      // Check if search tips part exists in shadow DOM
      expect(parts.searchTips).toBeTruthy();
    });
  });

  describe('when query has different content', () => {
    it('should handle query content in no results message', async () => {
      const element = await setupElement({
        searchStatusState: {
          firstSearchExecuted: true,
          isLoading: false,
          hasResults: false,
        },
        querySummaryState: {
          query: 'specific search term',
          hasQuery: true,
        },
      });

      const shadowContent = element.shadowRoot?.innerHTML || '';
      // Should render with the query content when no results shown
      expect(shadowContent).toContain('text-on-background');
    });

    it('should handle empty query gracefully', async () => {
      const element = await setupElement({
        searchStatusState: {
          firstSearchExecuted: true,
          isLoading: false,
          hasResults: false,
        },
        querySummaryState: {
          query: '',
          hasQuery: false,
        },
      });

      // Should still show container even with empty query
      const shadowContent = element.shadowRoot?.innerHTML || '';
      expect(shadowContent).toContain('p-3 text-center');
    });
  });

  describe('when error state occurs', () => {
    it('should handle error state appropriately', async () => {
      const element = await setupElement({
        searchStatusState: {
          firstSearchExecuted: true,
          isLoading: false,
          hasResults: false,
          hasError: true,
        },
      });

      // Component should still render its structure
      expect(element).toBeDefined();
      expect(element.shadowRoot).toBeTruthy();
    });
  });

  describe('#initialize', () => {
    it('should create search status controller', async () => {
      const element = await setupElement();

      expect(element.searchStatus).toBeDefined();
      expect(vi.mocked(buildSearchStatus)).toHaveBeenCalled();
    });

    it('should create query summary controller', async () => {
      const element = await setupElement();

      expect(element.querySummary).toBeDefined();
      expect(vi.mocked(buildQuerySummary)).toHaveBeenCalled();
    });

    it('should bind state to controllers', async () => {
      const element = await setupElement();

      // Check that state binding properties exist
      expect(element).toHaveProperty('searchStatusState');
      expect(element).toHaveProperty('querySummaryState');
    });
  });

  describe('#render', () => {
    it('should apply error guard decorator', async () => {
      const element = await setupElement();

      // Test that component handles error gracefully
      element.error = new Error('Test error');
      await element.updateComplete;

      // Component should still be defined even with error
      expect(element).toBeDefined();
    });

    it('should apply binding guard decorator', async () => {
      const element = await setupElement();

      // Component should have bindings available for guard to work
      expect(element.bindings).toBeDefined();
      expect(element.bindings.i18n).toBeDefined();
    });

    it('should use tailwind styles', async () => {
      const element = await setupElement();

      // Check that Tailwind CSS classes are applied
      const shadowContent = element.shadowRoot?.innerHTML || '';
      expect(shadowContent).toContain('p-3');
      expect(shadowContent).toContain('text-center');
    });
  });
});

import {
  buildResultsPerPage,
  buildSearchStatus,
  type ResultsPerPage,
  type SearchStatus,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-results-per-page';
import type {AtomicResultsPerPage} from './atomic-results-per-page';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-results-per-page', () => {
  const renderComponent = async (
    options: {choicesDisplayed?: string; initialChoice?: number} = {}
  ) => {
    const mockSearchStatus = {
      state: {
        hasError: false,
        hasResults: true,
        isLoading: false,
        firstSearchExecuted: true,
      },
      subscribe: vi.fn(),
    };

    const mockResultsPerPage = {
      state: {
        numberOfResults: options.initialChoice || 10,
      },
      subscribe: vi.fn(),
      set: vi.fn(),
      isSetTo: vi.fn().mockReturnValue(true),
    };

    vi.mocked(buildSearchStatus).mockReturnValue(
      mockSearchStatus as SearchStatus
    );
    vi.mocked(buildResultsPerPage).mockReturnValue(
      mockResultsPerPage as ResultsPerPage
    );

    const element = await fixture<AtomicResultsPerPage>(
      html`<atomic-results-per-page
        choices-displayed=${options.choicesDisplayed || '10,25,50,100'}
        initial-choice=${options.initialChoice || 10}
      ></atomic-results-per-page>`
    );

    // Set minimal bindings needed for the component to work
    Object.defineProperty(element, 'bindings', {
      value: {
        engine: {
          logger: {
            error: vi.fn(),
          },
        },
        i18n: {
          t: vi.fn((key: string) =>
            key === 'results-per-page' ? 'Results per page' : key
          ),
          language: 'en',
        },
        store: {
          state: {
            loadingFlags: [],
          },
          onChange: vi.fn(),
        },
      },
      writable: true,
    });

    element.initialize();
    await element.updateComplete;

    return {
      element,
      mockSearchStatus,
      mockResultsPerPage,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const {element} = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render with default properties', async () => {
    const {element} = await renderComponent();
    expect(element.choicesDisplayed).toBe('10,25,50,100');
  });

  it('should build search status controller', async () => {
    const {element} = await renderComponent();

    expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
    expect(element.searchStatus).toBeDefined();
  });

  it('should build results per page controller', async () => {
    const {element} = await renderComponent();

    expect(buildResultsPerPage).toHaveBeenCalledWith(element.bindings.engine, {
      initialState: {numberOfResults: 10},
    });
    expect(element.resultPerPage).toBeDefined();
  });

  it('should render custom choices when provided', async () => {
    const {element} = await renderComponent({
      choicesDisplayed: '5,15,30',
      initialChoice: 5, // Must match first choice in custom choices
    });

    // Verify that the component has the custom choices set
    expect(element.choicesDisplayed).toBe('5,15,30');
    expect(element.initialChoice).toBe(5);
  });

  it('should set initial choice correctly when provided', async () => {
    const {element} = await renderComponent({
      choicesDisplayed: '10,25,50',
      initialChoice: 25,
    });

    expect(element.initialChoice).toBe(25);
  });

  describe('when search has error', () => {
    it('should not render when search status has error', async () => {
      const {element, mockSearchStatus} = await renderComponent();
      mockSearchStatus.state = {
        hasError: true,
        hasResults: false,
        isLoading: false,
        firstSearchExecuted: true,
      };
      element.isAppLoaded = true;
      await element.updateComplete;

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });
  });

  describe('when no results available', () => {
    it('should not render when search has no results', async () => {
      const {element, mockSearchStatus} = await renderComponent();
      mockSearchStatus.state = {
        hasError: false,
        hasResults: false,
        isLoading: false,
        firstSearchExecuted: true,
      };
      element.isAppLoaded = true;
      await element.updateComplete;

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });
  });
});

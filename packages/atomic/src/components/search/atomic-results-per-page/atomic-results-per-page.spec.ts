import {
  buildResultsPerPage,
  buildSearchStatus,
  type ResultsPerPage,
  type SearchStatus,
} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture.js';
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

    // Set up mocks BEFORE creating the component
    vi.mocked(buildSearchStatus).mockReturnValue(
      mockSearchStatus as SearchStatus
    );
    vi.mocked(buildResultsPerPage).mockReturnValue(
      mockResultsPerPage as ResultsPerPage
    );

    const {atomicInterface} = await renderInAtomicSearchInterface<AtomicResultsPerPage>({
      template: html`<atomic-results-per-page
        choices-displayed=${options.choicesDisplayed || '10,25,50,100'}
        initial-choice=${options.initialChoice || 10}
      ></atomic-results-per-page>`,
      bindings: {
        engine: {
          subscribe: vi.fn(),
          logger: {
            error: vi.fn(),
            warn: vi.fn(),
            info: vi.fn(),
            debug: vi.fn(),
          },
        } as any,
        i18n: {
          t: vi.fn((key: string) =>
            key === 'results-per-page' ? 'Results per page' : key
          ),
          language: 'en',
          on: vi.fn(),
          off: vi.fn(),
        } as any,
        store: {
          state: {
            loadingFlags: [],
          },
          onChange: vi.fn(),
        } as any,
      },
    });

    // Get the element and set state before it renders
    const element = atomicInterface.shadowRoot!.querySelector<AtomicResultsPerPage>('atomic-results-per-page')!;
    
    // Ensure the component has the expected state for testing
    // This must be done immediately after component creation but before rendering
    (element as any).searchStatusState = mockSearchStatus.state;
    element.resultPerPageState = mockResultsPerPage.state;

    // Now trigger the component's update lifecycle
    await element.updateComplete;

    return {
      element,
      mockSearchStatus,
      mockResultsPerPage,
    };
  };

  it('should render correctly with radio buttons container', async () => {
    const {element} = await renderComponent();
    
    const buttonsContainer = element.shadowRoot?.querySelector('[part="buttons"]');
    expect(buttonsContainer).toBeDefined();
    expect(buttonsContainer?.getAttribute('role')).toBe('radiogroup');
  });

  it('should render default choices as radio buttons', async () => {
    const {element} = await renderComponent();
    
    const radioButtons = element.shadowRoot?.querySelectorAll('input[type="radio"]');
    expect(radioButtons).toHaveLength(4); // Default: 10,25,50,100
    
    const values = Array.from(radioButtons || []).map(button => (button as HTMLInputElement).value);
    expect(values).toEqual(['10', '25', '50', '100']);
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

  it('should render custom choices as radio buttons with correct values', async () => {
    const {element} = await renderComponent({
      choicesDisplayed: '5,15,30',
      initialChoice: 5,
    });

    const radioButtons = element.shadowRoot?.querySelectorAll('input[type="radio"]');
    expect(radioButtons).toHaveLength(3);
    
    const values = Array.from(radioButtons || []).map(button => (button as HTMLInputElement).value);
    expect(values).toEqual(['5', '15', '30']);
  });

  it('should mark correct radio button as checked based on initial choice', async () => {
    const {element} = await renderComponent({
      choicesDisplayed: '10,25,50',
      initialChoice: 25,
    });

    const radioButtons = element.shadowRoot?.querySelectorAll('input[type="radio"]');
    const checkedButton = Array.from(radioButtons || []).find(button => (button as HTMLInputElement).checked);
    
    expect(checkedButton).toBeDefined();
    expect((checkedButton as HTMLInputElement).value).toBe('25');
  });

  it('should have correct radio button group name for all buttons', async () => {
    const {element} = await renderComponent();
    
    const radioButtons = element.shadowRoot?.querySelectorAll('input[type="radio"]');
    const groupNames = Array.from(radioButtons || []).map(button => (button as HTMLInputElement).name);
    
    // All radio buttons should have the same group name
    expect(groupNames.every(name => name === groupNames[0])).toBe(true);
    expect(groupNames[0]).toMatch(/^atomic-results-per-page-/); // Should start with component prefix
  });

  it('should render radio buttons with correct part attributes', async () => {
    const {element} = await renderComponent({
      choicesDisplayed: '10,25',
      initialChoice: 25,
    });

    const radioButtons = element.shadowRoot?.querySelectorAll('input[type="radio"]');
    
    const button10 = Array.from(radioButtons || []).find(button => (button as HTMLInputElement).value === '10');
    const button25 = Array.from(radioButtons || []).find(button => (button as HTMLInputElement).value === '25');
    
    expect(button10?.getAttribute('part')).toBe('button');
    expect(button25?.getAttribute('part')).toBe('button active-button');
  });

  describe('when search has error', () => {
    it('should not render when search status has error', async () => {
      const {element} = await renderComponent();
      
      // Update the bound state to simulate error condition
      (element as any).searchStatusState = {
        hasError: true,
        hasResults: false,
        isLoading: false,
        firstSearchExecuted: true,
      };
      element.isAppLoaded = true;
      
      // Trigger re-render
      element.requestUpdate();
      await element.updateComplete;

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });
  });

  describe('when no results available', () => {
    it('should not render when search has no results', async () => {
      const {element} = await renderComponent();
      
      // Update the bound state to simulate no results condition  
      (element as any).searchStatusState = {
        hasError: false,
        hasResults: false,
        isLoading: false,
        firstSearchExecuted: true,
      };
      element.isAppLoaded = true;
      
      // Trigger re-render
      element.requestUpdate();
      await element.updateComplete;

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });
  });
});

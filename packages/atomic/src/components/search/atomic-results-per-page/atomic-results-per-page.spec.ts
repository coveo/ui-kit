import {
  buildResultsPerPage,
  buildSearchStatus,
  type ResultsPerPage,
  type ResultsPerPageState,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {userEvent} from '@storybook/test';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-results-per-page';
import {
  convertChoicesToNumbers,
  validateInitialChoice,
} from '@/src/components/common/items-per-page/validate.js';
import type {AtomicResultsPerPage} from './atomic-results-per-page';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/common/items-per-page/validate.js', {spy: true});

describe('AtomicResultsPerPage', () => {
  const mockedFocusOnFirstResultAfterNextSearch = vi.fn(() =>
    Promise.resolve()
  );
  const mockedFocusOnNextNewResult = vi.fn();
  let mockedSearchStatus: SearchStatus;
  let mockedResultsPerPage: ResultsPerPage;

  const createMockEngine = () => ({
    logger: {
      error: vi.fn(),
    },
  });

  const renderResultsPerPage = async ({
    searchStatusState = {},
    resultsPerPageState = {},
    props = {},
  }: {
    searchStatusState?: Partial<SearchStatusState>;
    resultsPerPageState?: Partial<ResultsPerPageState>;
    props?: {
      choicesDisplayed?: string;
      initialChoice?: number;
    };
  } = {}) => {
    const mockEngine = createMockEngine();
    
    mockedSearchStatus = {
      state: {
        hasError: false,
        hasResults: true,
        isLoading: false,
        ...searchStatusState,
      },
      subscribe: vi.fn(),
    } as any;

    mockedResultsPerPage = {
      state: {
        numberOfResults: 10,
        ...resultsPerPageState,
      },
      subscribe: vi.fn(),
      set: vi.fn(),
    } as any;

    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildResultsPerPage).mockReturnValue(mockedResultsPerPage);

    const element = await fixture<AtomicResultsPerPage>(
      html`<atomic-results-per-page
        choices-displayed=${ifDefined(props.choicesDisplayed)}
        initial-choice=${ifDefined(props.initialChoice)}
      ></atomic-results-per-page>`
    );

    // Mock the bindings since we're using the mixin pattern
    element.bindings = {
      engine: mockEngine,
      i18n: {
        t: vi.fn((key: string) => {
          const translations: Record<string, string> = {
            'results-per-page': 'Results per page',
          };
          return translations[key] || key;
        }),
        language: 'en',
      },
      store: {
        state: {
          resultList: {
            focusOnFirstResultAfterNextSearch:
              mockedFocusOnFirstResultAfterNextSearch,
            focusOnNextNewResult: mockedFocusOnNextNewResult,
          },
        },
      },
    } as any;

    element.initialize();
    await element.updateComplete;

    return {
      element,
      get legend() {
        return element.shadowRoot!.querySelector('legend');
      },
      get label() {
        return element.shadowRoot!.querySelector('span[part="label"]');
      },
      get buttonList() {
        return element.shadowRoot!.querySelector('div[part="buttons"]');
      },
      get buttons() {
        return Array.from(element.shadowRoot!.querySelectorAll('input[part*="button"]'));
      },
      get activeButton() {
        return element.shadowRoot!.querySelector(
          'input[part*="active-button"]'
        );
      },
    };
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should call convertChoicesToNumbers with the choicesDisplayed prop', async () => {
    const choicesDisplayed = '10,25,50,100';
    await renderResultsPerPage({
      props: {choicesDisplayed},
    });

    expect(convertChoicesToNumbers).toHaveBeenCalledWith(choicesDisplayed);
  });

  it('should call validateInitialChoice with the initialChoice prop and the choices', async () => {
    const choicesDisplayed = '10,25,50,100';
    const initialChoice = 50;
    await renderResultsPerPage({
      props: {choicesDisplayed, initialChoice},
    });

    expect(validateInitialChoice).toHaveBeenCalledWith(
      initialChoice,
      [10, 25, 50, 100]
    );
  });

  it('should call buildSearchStatus with the engine', async () => {
    const {element} = await renderResultsPerPage();

    expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
  });

  it('should call buildResultsPerPage with the engine and initial state', async () => {
    const initialChoice = 25;
    const {element} = await renderResultsPerPage({
      props: {initialChoice},
    });

    expect(buildResultsPerPage).toHaveBeenCalledWith(element.bindings.engine, {
      initialState: {numberOfResults: initialChoice},
    });
  });

  it("should set this.searchStatus to the search status controller", async () => {
    const {element} = await renderResultsPerPage();

    expect(element.searchStatus).toBe(mockedSearchStatus);
  });

  it("should set this.resultPerPage to the results per page controller", async () => {
    const {element} = await renderResultsPerPage();

    expect(element.resultPerPage).toBe(mockedResultsPerPage);
  });

  it('should render nothing if the search status has an error', async () => {
    const {element} = await renderResultsPerPage({
      searchStatusState: {hasError: true},
    });

    expect(element).toHaveTextContent('');
  });

  it('should render nothing if there are no results', async () => {
    const {element} = await renderResultsPerPage({
      searchStatusState: {hasResults: false},
    });

    expect(element).toHaveTextContent('');
  });

  it('should render nothing if app is not loaded', async () => {
    const {element} = await renderResultsPerPage();
    element.isAppLoaded = false;
    await element.updateComplete;

    expect(element).toHaveTextContent('');
  });

  describe('when app is loaded and there are results', () => {
    it('should render the label', async () => {
      const {label} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      expect(label).toHaveTextContent('Results per page');
    });

    it('should render the label as aria-hidden', async () => {
      const {label} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      expect(label).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render the label with the correct part', async () => {
      const {label} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      expect(label).toHaveAttribute('part', 'label');
    });

    it('should render the legend with the label', async () => {
      const {legend} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      expect(legend).toHaveTextContent('Results per page');
    });

    it('should render the button list with the correct part', async () => {
      const {buttonList} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      expect(buttonList).toHaveAttribute('part', 'buttons');
    });

    it('should render the buttons list with the correct role', async () => {
      const {buttonList} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      expect(buttonList).toHaveAttribute('role', 'radiogroup');
    });

    it('should render the buttons list with the correct aria-label', async () => {
      const {buttonList} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      expect(buttonList).toHaveAttribute('aria-label', 'Results per page');
    });

    it('should render the right amount of buttons', async () => {
      const choicesDisplayed = '10,25,50,100,200';
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed},
      });

      expect(buttons.length).toBe(5);
    });

    it('should render the first button as checked if no initial choice is provided', async () => {
      const choicesDisplayed = '10,25,50,100';
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed},
      });

      expect(buttons[0]).toHaveAttribute('checked');
    });

    it('should render the checked button with the correct part', async () => {
      const choicesDisplayed = '10,25,50,100';
      const initialChoice = 50;
      const {activeButton} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed, initialChoice},
        resultsPerPageState: {numberOfResults: initialChoice},
      });

      expect(activeButton).toHaveAttribute('part', 'button active-button');
    });

    it('should render the initial choice as checked', async () => {
      const choicesDisplayed = '10,25,50,100';
      const initialChoice = 50;
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed, initialChoice},
        resultsPerPageState: {numberOfResults: initialChoice},
      });

      expect(buttons[2]).toHaveAttribute('checked');
    });

    it('should render the buttons with the correct part', async () => {
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      buttons.forEach((button: Element) => {
        const part = button.getAttribute('part');
        expect(part === 'button' || part === 'button active-button').toBe(true);
      });
    });

    it('should render the proper reflected value for each button', async () => {
      const choicesDisplayed = '10,25,50,100';
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed},
      });

      expect(buttons[0]).toHaveAttribute('value', '10');
      expect(buttons[1]).toHaveAttribute('value', '25');
      expect(buttons[2]).toHaveAttribute('value', '50');
      expect(buttons[3]).toHaveAttribute('value', '100');
    });

    it('should render the proper reflected aria-label for each button', async () => {
      const choicesDisplayed = '10,25,50,100';
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed},
      });

      expect(buttons[0]).toHaveAttribute('aria-label', '10');
      expect(buttons[1]).toHaveAttribute('aria-label', '25');
      expect(buttons[2]).toHaveAttribute('aria-label', '50');
      expect(buttons[3]).toHaveAttribute('aria-label', '100');
    });

    it('should render the buttons with the type "radio"', async () => {
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });

      buttons.forEach((button: Element) => {
        expect(button).toHaveAttribute('type', 'radio');
      });
    });
  });

  describe('#setItemSize', () => {
    it('should call resultPerPage.set with the correct value when a button is checked', async () => {
      const {element, buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
      });
      const resultPerPageSpy = vi.spyOn(element.resultPerPage, 'set');

      await userEvent.click(buttons[1]);
      expect(resultPerPageSpy).toHaveBeenCalledWith(25);
    });

    it('should dispatch an atomic/scrollToTop event when a button is checked that is smaller than the currently checked button', async () => {
      const {element, buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed: '10,25,50,100'},
        resultsPerPageState: {numberOfResults: 50},
      });

      const scrollToTopSpy = vi.spyOn(element, 'dispatchEvent');

      await userEvent.click(buttons[0]);
      expect(scrollToTopSpy).toHaveBeenCalled();
    });

    it('should call focusOnFirstResultAfterNextSearch when a button is checked that is smaller than the currently checked button', async () => {
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed: '10,25,50,100'},
        resultsPerPageState: {numberOfResults: 50},
      });

      await userEvent.click(buttons[0]);
      expect(mockedFocusOnFirstResultAfterNextSearch).toHaveBeenCalled();
    });

    it('should call focusOnNextNewResult when a button is checked that is larger than the currently checked button', async () => {
      const {buttons} = await renderResultsPerPage({
        searchStatusState: {hasError: false, hasResults: true},
        props: {choicesDisplayed: '10,25,50,100'},
        resultsPerPageState: {numberOfResults: 10},
      });

      await userEvent.click(buttons[3]);
      expect(mockedFocusOnNextNewResult).toHaveBeenCalled();
    });
  });
});

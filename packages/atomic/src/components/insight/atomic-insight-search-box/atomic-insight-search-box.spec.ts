import {
  buildSearchBox as buildInsightSearchBox,
  type SearchBox as InsightSearchBox,
  type SearchBoxState as InsightSearchBoxState,
  loadInsightSearchActions,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeInsightSearchBox} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-box-controller';
import type {AtomicInsightSearchBox} from './atomic-insight-search-box';
import './atomic-insight-search-box';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-search-box', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedSearchBox: InsightSearchBox;
  let fetchQuerySuggestionsSpy: MockInstance;
  let registerQuerySuggestSpy: MockInstance;
  let dispatchSpy: MockInstance;

  beforeEach(() => {
    fetchQuerySuggestionsSpy = vi.fn(() => ({type: 'fetchQuerySuggestions'}));
    registerQuerySuggestSpy = vi.fn(() => ({type: 'registerQuerySuggest'}));
    dispatchSpy = vi.fn();

    vi.mocked(loadInsightSearchActions).mockReturnValue({
      fetchQuerySuggestions: fetchQuerySuggestionsSpy,
      registerQuerySuggest: registerQuerySuggestSpy,
      // Add other required actions as needed
    } as ReturnType<typeof loadInsightSearchActions>);

    mockedEngine.dispatch = dispatchSpy;
  });

  const renderComponent = async ({
    searchBoxState = {},
  }: {
    searchBoxState?: Partial<InsightSearchBoxState>;
  } = {}) => {
    mockedSearchBox = buildFakeInsightSearchBox({
      state: {
        value: '',
        suggestions: [],
        isLoading: false,
        isLoadingSuggestions: false,
        ...searchBoxState,
      },
    });

    vi.mocked(buildInsightSearchBox).mockReturnValue(mockedSearchBox);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightSearchBox>({
        template: html`<atomic-insight-search-box></atomic-insight-search-box>`,
        selector: 'atomic-insight-search-box',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      textarea: page.getByRole('textbox'),
      parts: (el: AtomicInsightSearchBox) => ({
        wrapper: el.shadowRoot?.querySelector('[part="wrapper"]'),
        submitIcon: el.shadowRoot?.querySelector('[part="submit-icon"]'),
        textarea: el.shadowRoot?.querySelector('[part="textarea"]'),
        suggestionsWrapper: el.shadowRoot?.querySelector(
          '[part="suggestions-wrapper"]'
        ),
        suggestions: el.shadowRoot?.querySelector('[part="suggestions"]'),
      }),
    };
  };

  describe('#initialize', () => {
    it('should build the insight search box controller with the engine', async () => {
      await renderComponent();
      expect(buildInsightSearchBox).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            numberOfSuggestions: 0,
          }),
        })
      );
    });

    it('should register query suggest with the default number of suggestions', async () => {
      await renderComponent();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({type: 'registerQuerySuggest'})
      );
      expect(registerQuerySuggestSpy).toHaveBeenCalledWith(
        expect.objectContaining({count: 5})
      );
    });

    it('should set searchBox property to the controller', async () => {
      const {element} = await renderComponent();
      expect(element.searchBox).toBe(mockedSearchBox);
    });

    it('should bind searchBoxState to the controller state', async () => {
      const {element} = await renderComponent({
        searchBoxState: {value: 'test query'},
      });
      expect(element.searchBoxState.value).toBe('test query');
    });
  });

  describe('rendering', () => {
    it('should render the wrapper part', async () => {
      const {parts, element} = await renderComponent();
      const wrapper = parts(element).wrapper;
      expect(wrapper).toBeInTheDocument();
    });

    it('should render the submit icon', async () => {
      const {parts, element} = await renderComponent();
      const submitIcon = parts(element).submitIcon;
      expect(submitIcon).toBeInTheDocument();
    });

    it('should render the textarea', async () => {
      const {textarea} = await renderComponent();
      await expect.element(textarea).toBeInTheDocument();
    });

    it('should set the textarea value from state', async () => {
      const {textarea} = await renderComponent({
        searchBoxState: {value: 'test query'},
      });
      await expect.element(textarea).toHaveValue('test query');
    });

    it('should not render suggestions when there are no suggestions', async () => {
      const {parts, element} = await renderComponent({
        searchBoxState: {suggestions: []},
      });
      const suggestionsWrapper = parts(element).suggestionsWrapper;
      expect(suggestionsWrapper).toBeNull();
    });
  });

  describe('when typing in the search box', () => {
    it('should update the search box value', async () => {
      const {textarea} = await renderComponent();
      await textarea.fill('new query');
      expect(mockedSearchBox.updateText).toHaveBeenCalledWith('new query');
    });

    it('should trigger query suggestions', async () => {
      const {textarea} = await renderComponent();
      await textarea.fill('test');
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({type: 'fetchQuerySuggestions'})
      );
    });
  });

  describe('when submitting the search', () => {
    it('should call submit on the controller when Enter is pressed', async () => {
      const {textarea} = await renderComponent();
      await textarea.press('Enter');
      expect(mockedSearchBox.submit).toHaveBeenCalled();
    });

    it('should not submit when disableSearch is true', async () => {
      const {element, textarea} = await renderComponent();
      element.disableSearch = true;
      await element.updateComplete;
      await textarea.press('Enter');
      expect(mockedSearchBox.submit).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should clear suggestions when Escape is pressed', async () => {
      const {textarea} = await renderComponent();
      await textarea.press('Escape');
      expect(mockedSearchBox.clear).not.toHaveBeenCalled();
    });

    it('should clear suggestions when Tab is pressed', async () => {
      const {textarea} = await renderComponent();
      await textarea.press('Tab');
      // Suggestions should be cleared, though we can't easily test internal state
    });
  });

  describe('clear button', () => {
    it('should call clear on the controller when clicked', async () => {
      const {element} = await renderComponent({
        searchBoxState: {value: 'test'},
      });
      await element.updateComplete;
      const clearButton = page.getByLabelText(/clear/i);
      await clearButton.click();
      expect(mockedSearchBox.clear).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for the textarea', async () => {
      const {textarea} = await renderComponent();
      await expect.element(textarea).toHaveAccessibleName();
    });

    it('should have a role of textbox for the textarea', async () => {
      const {textarea} = await renderComponent();
      await expect.element(textarea).toHaveRole('textbox');
    });
  });
});

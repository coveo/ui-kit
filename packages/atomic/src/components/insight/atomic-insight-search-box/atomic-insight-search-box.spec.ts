import {
  buildSearchBox as buildInsightSearchBox,
  type SearchBox as InsightSearchBox,
  type SearchBoxState as InsightSearchBoxState,
  loadInsightSearchActions,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  type MockInstance,
  vi,
} from 'vitest';
import {userEvent} from 'vitest/browser';
import {isMacOS} from '@/src/utils/device-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeInsightSearchBox} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-box-controller';
import type {AtomicInsightSearchBox} from './atomic-insight-search-box';
import './atomic-insight-search-box';

vi.mock('@coveo/headless/insight', {spy: true});
vi.mock('@/src/utils/device-utils', {spy: true});

describe('atomic-insight-search-box', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedSearchBox: InsightSearchBox;
  let fetchQuerySuggestionsSpy: MockInstance;
  let registerQuerySuggestSpy: MockInstance;
  let dispatchSpy: MockInstance;
  let submitMock: Mock<() => void>;
  let clearMock: Mock<() => void>;

  beforeEach(() => {
    fetchQuerySuggestionsSpy = vi.fn(() => ({type: 'fetchQuerySuggestions'}));
    registerQuerySuggestSpy = vi.fn(() => ({type: 'registerQuerySuggest'}));
    dispatchSpy = vi.fn();
    submitMock = vi.fn();
    clearMock = vi.fn();

    vi.mocked(loadInsightSearchActions).mockReturnValue({
      fetchQuerySuggestions: fetchQuerySuggestionsSpy,
      registerQuerySuggest: registerQuerySuggestSpy,
    } as unknown as ReturnType<typeof loadInsightSearchActions>);

    mockedEngine.dispatch =
      dispatchSpy as unknown as typeof mockedEngine.dispatch;
  });

  const renderComponent = async ({
    searchBoxState = {},
    searchBoxValue = '',
  }: {
    searchBoxState?: Partial<InsightSearchBoxState>;
    searchBoxValue?: string;
  } = {}) => {
    mockedSearchBox = buildFakeInsightSearchBox({
      state: {
        value: searchBoxValue,
        suggestions: [],
        isLoading: false,
        isLoadingSuggestions: false,
        ...searchBoxState,
      },
      implementation: {
        submit: submitMock,
        clear: clearMock,
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
      wrapper: element.shadowRoot!.querySelector('[part="wrapper"]')!,
      textArea: element.shadowRoot!.querySelector(
        '[part="textarea"]'
      )! as HTMLTextAreaElement,
      submitIcon: element.shadowRoot!.querySelector('[part="submit-icon"]'),
      clearButton: () =>
        element.shadowRoot!.querySelector('button[part="clear-button"]'),
      suggestionsWrapper: () =>
        element.shadowRoot!.querySelector('[part="suggestions-wrapper"]'),
    };
  };

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

  it('should render the wrapper part', async () => {
    const {wrapper} = await renderComponent();
    expect(wrapper).toBeInTheDocument();
  });

  it('should render the submit icon', async () => {
    const {submitIcon} = await renderComponent();
    expect(submitIcon).toBeInTheDocument();
  });

  it('should render the textarea', async () => {
    const {textArea} = await renderComponent();
    expect(textArea).toBeInTheDocument();
  });

  it('should set the textarea value from state', async () => {
    const {textArea} = await renderComponent({
      searchBoxValue: 'test query',
    });
    expect(textArea.value).toBe('test query');
  });

  it('should not render suggestions when there are no suggestions', async () => {
    const {suggestionsWrapper} = await renderComponent({
      searchBoxState: {suggestions: []},
    });
    expect(suggestionsWrapper()).toBeNull();
  });

  describe('when typing in the search box', () => {
    it('should update the search box value', async () => {
      const {textArea} = await renderComponent();
      await userEvent.type(textArea, 'new query');
      expect(mockedSearchBox.updateText).toHaveBeenCalledWith('new query');
    });

    it('should trigger query suggestions', async () => {
      const {textArea} = await renderComponent();
      await userEvent.type(textArea, 'test');
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({type: 'fetchQuerySuggestions'})
      );
    });
  });

  describe('when submitting the search', () => {
    it('should call submit on the controller when Enter is pressed', async () => {
      const {textArea} = await renderComponent();
      await userEvent.type(textArea, '{enter}');
      expect(submitMock).toHaveBeenCalled();
    });

    it('should not submit when disableSearch is true', async () => {
      const {element, textArea} = await renderComponent();
      element.disableSearch = true;
      await element.updateComplete;
      submitMock.mockClear();
      await userEvent.type(textArea, '{enter}');
      expect(submitMock).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should clear suggestions when Escape is pressed', async () => {
      const {textArea} = await renderComponent();
      await userEvent.click(textArea);
      await userEvent.type(textArea, '{escape}');
      expect(clearMock).not.toHaveBeenCalled();
    });

    it('should clear suggestions when Tab is pressed', async () => {
      const {textArea} = await renderComponent();
      await userEvent.click(textArea);
      await userEvent.type(textArea, '{tab}');
    });
  });

  describe('clear button', () => {
    it('should call clear on the controller when clicked', async () => {
      const {clearButton} = await renderComponent({
        searchBoxValue: 'test',
      });
      const btn = clearButton();
      if (btn) {
        await userEvent.click(btn);
        expect(clearMock).toHaveBeenCalled();
      }
    });
  });

  it('should have aria-label for the textarea', async () => {
    const {textArea} = await renderComponent();
    expect(textArea).toHaveAttribute('aria-label');
  });

  it('should have the "search-box-with-suggestions-macos" as the aria-label when the device uses macOS', async () => {
    vi.mocked(isMacOS).mockReturnValue(true);

    const {textArea} = await renderComponent();

    expect(textArea).toHaveAttribute(
      'aria-label',
      'Search field with suggestions. Suggestions may be available under this field. To send, press Enter.'
    );
  });

  it('should have the "search-box-with-suggestions" as the aria-label when the device does not use macOS', async () => {
    vi.mocked(isMacOS).mockReturnValue(false);

    const {textArea} = await renderComponent();

    expect(textArea).toHaveAttribute(
      'aria-label',
      'Search field with suggestions. To begin navigating suggestions, while focused, press Down Arrow. To send, press Enter.'
    );
  });
});

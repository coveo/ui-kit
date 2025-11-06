import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {isMacOS} from '@/src/utils/device-utils';
import * as replaceBreakpoint from '@/src/utils/replace-breakpoint-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/fake-atomic-commerce-search-box-suggestions-fixture';
import {
  buildRecentQueriesList,
  buildSearchBox,
  buildStandaloneSearchBox,
  loadQuerySetActions,
  loadQuerySuggestActions,
} from '@coveo/headless/commerce';
import {html, type TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {randomID} from '@/src/utils/utils';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeLoadQuerySetActions} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/query-set-actions';
import {buildFakeLoadQuerySuggestActions} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/query-suggest-actions';
import {buildFakeRecentQueriesList} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/recent-queries-list-controller';
import {buildFakeSearchBox} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-box-controller';
import {buildFakeStandaloneSearchBox} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/standalone-search-box-controller';
import {AtomicCommerceSearchBox} from './atomic-commerce-search-box';
import './atomic-commerce-search-box';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/utils/device-utils', {spy: true});
vi.mock(import('@/src/utils/utils'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    randomID: vi.fn((prefix?: string, _length?: number) => `${prefix}123`),
  };
});
vi.mock('@/src/utils/replace-breakpoint-utils', {spy: true});

const commonSearchBoxOptions = {
  id: 'atomic-commerce-search-box-123',
  highlightOptions: {
    notMatchDelimiters: {
      open: '<span class="font-bold">',
      close: '</span>',
    },
    correctionDelimiters: {
      open: '<span class="font-normal">',
      close: '</span>',
    },
  },
  clearFilters: true,
};

describe('atomic-commerce-search-box', () => {
  const mockedEngine = buildFakeCommerceEngine({});
  const afterRedirectionMock = vi.fn();
  const updateRedirectUrlMock = vi.fn();
  const submitMock = vi.fn();
  const clearMock = vi.fn();

  const renderSearchBox = async ({
    searchBoxProps = {},
    suggestionCount = 3,
    noSuggestions = false,
    redirectTo = undefined,
    searchBoxValue = '',
    additionalChildren = html``,
  }: {
    searchBoxProps?: {
      redirectionUrl?: string;
      disableSearch?: boolean;
      minimumQueryLength?: number;
      numberOfQueries?: number;
      clearFilters?: boolean;
    };
    suggestionCount?: number;
    noSuggestions?: boolean;
    redirectTo?: string;
    searchBoxValue?: string;
    additionalChildren?: TemplateResult;
  } = {}) => {
    vi.mocked(buildRecentQueriesList).mockReturnValue(
      buildFakeRecentQueriesList()
    );
    vi.mocked(loadQuerySuggestActions).mockReturnValue(
      buildFakeLoadQuerySuggestActions()
    );
    vi.mocked(buildSearchBox).mockReturnValue(
      buildFakeSearchBox(
        {
          value: searchBoxValue,
        },
        {
          submit: submitMock,
          clear: clearMock,
        }
      )
    );
    vi.mocked(buildStandaloneSearchBox).mockReturnValue(
      buildFakeStandaloneSearchBox(
        {
          redirectTo,
        },
        {
          afterRedirection: afterRedirectionMock,
          updateRedirectUrl: updateRedirectUrlMock,
        }
      )
    );
    vi.mocked(loadQuerySetActions).mockReturnValue(
      buildFakeLoadQuerySetActions()
    );

    const suggestions = noSuggestions
      ? ''
      : html`<fake-atomic-commerce-search-box-suggestions
          suggestion-count=${suggestionCount}
        ></fake-atomic-commerce-search-box-suggestions>`;
    const {
      redirectionUrl,
      disableSearch,
      minimumQueryLength,
      numberOfQueries,
      clearFilters,
    } = searchBoxProps || {};
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceSearchBox>({
        template: html`<atomic-commerce-search-box
          redirection-url=${ifDefined(redirectionUrl)}
          ?disable-search=${disableSearch ?? false}
          minimum-query-length=${ifDefined(minimumQueryLength)}
          number-of-queries=${ifDefined(numberOfQueries)}
          clear-filters=${ifDefined(clearFilters)}
        >
          ${suggestions}
          ${additionalChildren}
        </atomic-commerce-search-box>`,
        selector: 'atomic-commerce-search-box',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      spacer: element.shadowRoot!.querySelector(
        'textarea[part="textarea-spacer"]'
      )!,
      wrapper: element.shadowRoot!.querySelector('div[part="wrapper"]')!,
      textArea: element.shadowRoot!.querySelector('textarea[part="textarea"]')!,
      suggestions: () =>
        element.shadowRoot!.querySelectorAll('atomic-suggestion-renderer'),
      clearButton: element.shadowRoot!.querySelector(
        'button[part="clear-button"]'
      )!,
      submitButton: element.shadowRoot!.querySelector(
        'button[part="submit-button"]'
      )!,
      suggestionsContainer: element.shadowRoot!.querySelector(
        'div[part="suggestions-wrapper suggestions-single-list"]'
      )!,
    };
  };

  it('should replace the children with recent-queries & query-suggestions when there are no children', async () => {
    const {element} = await renderSearchBox({noSuggestions: true});
    expect(element.shadowRoot!.children.length).toBe(4);
    expect(element.shadowRoot!.children[0].tagName).toBe('TEXTAREA');
    expect(element.shadowRoot!.children[1].tagName).toBe('DIV');
    expect(element.shadowRoot!.children[2].tagName).toBe(
      'ATOMIC-COMMERCE-SEARCH-BOX-RECENT-QUERIES'
    );
    expect(element.shadowRoot!.children[3].tagName).toBe(
      'ATOMIC-COMMERCE-SEARCH-BOX-QUERY-SUGGESTIONS'
    );
  });

  it('should add the event listener for the "atomic/searchBoxSuggestion/register" event', async () => {
    const addEventListenerSpy = vi.spyOn(
      AtomicCommerceSearchBox.prototype,
      'addEventListener'
    );
    await renderSearchBox();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'atomic/searchBoxSuggestion/register',
      expect.any(Function)
    );
  });

  it('should add the event listener for the "atomic/selectChildProduct" event', async () => {
    const addEventListenerSpy = vi.spyOn(
      AtomicCommerceSearchBox.prototype,
      'addEventListener'
    );
    await renderSearchBox();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'atomic/selectChildProduct',
      expect.any(Function)
    );
  });

  describe('when the search box is not a standalone search box', () => {
    it('should initialize the search box controller with the correct options', async () => {
      await renderSearchBox();

      expect(buildSearchBox).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            ...commonSearchBoxOptions,
          }),
        })
      );
    });
  });

  it('should set the search box id', async () => {
    await renderSearchBox();
    expect(randomID).toHaveBeenCalledWith('atomic-commerce-search-box-');
  });

  it('should call updateBreakpoints once', async () => {
    await renderSearchBox();
    expect(replaceBreakpoint.updateBreakpoints).toHaveBeenCalledTimes(1);
  });

  it('should render the spacer with the "text-area" part', async () => {
    const {spacer} = await renderSearchBox();
    expect(spacer).toBeInstanceOf(HTMLTextAreaElement);
    expect(spacer?.getAttribute('part')).toBe('textarea-spacer');
  });

  it('should have the proper disabled class to the wrapper when the search box is disabled', async () => {
    const {wrapper} = await renderSearchBox({
      searchBoxProps: {disableSearch: true},
    });
    expect(wrapper).toHaveClass(
      'focus-within:border-disabled focus-within:ring-neutral'
    );
  });

  it('should disable the search box when the "disableSearch" property is set to true', async () => {
    const {wrapper} = await renderSearchBox({
      searchBoxProps: {disableSearch: true},
    });
    expect(wrapper).toBeDisabled();
  });

  it('should disable the search box when the value is lower than the minimum query length', async () => {
    const {wrapper, textArea} = await renderSearchBox({
      searchBoxProps: {minimumQueryLength: 5},
    });
    await userEvent.type(textArea, 'test');
    expect(wrapper).toBeDisabled();
  });

  it('should clear the suggestions when onFocusout is triggered on the wrapper', async () => {
    const {element, suggestions} = await renderSearchBox();

    await userEvent.click(element);
    expect(suggestions()).toHaveLength(3);
    await userEvent.click(document.body);

    expect(suggestions()).toHaveLength(0);
  });

  it('should have the "search-disabled" as the aria-label when the search box is disabled', async () => {
    const {textArea} = await renderSearchBox({
      searchBoxProps: {disableSearch: true},
    });

    expect(textArea).toHaveAttribute(
      'aria-label',
      'Enter a query with minimum of 0 character(s) to enable search.'
    );
  });

  it('should have the "search-box-with-suggestions-macos" as the aria-label when the device uses macOS', async () => {
    vi.mocked(isMacOS).mockReturnValue(true);

    const {textArea} = await renderSearchBox();

    expect(textArea).toHaveAttribute(
      'aria-label',
      'Search field with suggestions. Suggestions may be available under this field. To send, press Enter.'
    );
  });

  it('should have the "search-box-with-suggestions-keyboardless" as the aria-label when the device does not have a keyboard', async () => {
    vi.mocked(isMacOS).mockReturnValue(false);

    const {textArea} = await renderSearchBox();

    expect(textArea).toHaveAttribute(
      'aria-label',
      'Search field with suggestions. To begin navigating suggestions, while focused, press Down Arrow. To send, press Enter.'
    );
  });

  it('should have the "search-box-with-suggestions" as the aria-label when the device has a keyboard, does not use macOS and when the search box is enabled', async () => {
    vi.mocked(isMacOS).mockReturnValue(false);

    const {textArea} = await renderSearchBox({
      searchBoxProps: {disableSearch: false},
    });

    expect(textArea).toHaveAttribute(
      'aria-label',
      'Search field with suggestions. To begin navigating suggestions, while focused, press Down Arrow. To send, press Enter.'
    );
  });

  describe('when the search box is focused', () => {
    it('should show the suggestions', async () => {
      const {element, suggestions} = await renderSearchBox();

      expect(suggestions()).toHaveLength(0);
      await userEvent.click(element);
      expect(suggestions()).toHaveLength(3);
    });

    it('should announce "x search suggestions are available." to screen readers when there are suggestions', async () => {
      const setMessageSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'message',
        'set'
      );
      const {element} = await renderSearchBox();

      await userEvent.click(element);

      expect(setMessageSpy).toHaveBeenCalledWith(
        '3 search suggestions are available.'
      );
    });

    it('should announce "x search suggestions are available for y." to screen readers when there are suggestions & a query is entered', async () => {
      const setMessageSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'message',
        'set'
      );
      const {element} = await renderSearchBox({searchBoxValue: 'test'});

      await userEvent.click(element);

      expect(setMessageSpy).toHaveBeenCalledWith(
        '3 search suggestions are available for test.'
      );
    });

    it('should announce "No search suggestions are available." to screen readers when there are no suggestions', async () => {
      const setMessageSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'message',
        'set'
      );
      const {element} = await renderSearchBox({suggestionCount: 0});

      await userEvent.click(element);

      expect(setMessageSpy).toHaveBeenCalledWith(
        'There are no search suggestions.'
      );
    });
  });

  describe('when inputting text in the search box', () => {
    it('should dispatch the updateQuerySetQuery action from the loadQuerySetActions', async () => {
      const {textArea} = await renderSearchBox();
      await userEvent.type(textArea, 'a');
      expect(loadQuerySetActions).toHaveBeenCalled();
    });

    it('should clear the suggestions when search is disabled', async () => {
      const {textArea, suggestions} = await renderSearchBox({
        searchBoxProps: {disableSearch: true},
      });

      await userEvent.type(textArea, 'a');

      expect(suggestions()).toHaveLength(0);
    });
  });

  describe('when specific keys are pressed on the search box', () => {
    it('should trigger the submit event when the Enter key is pressed', async () => {
      const {textArea} = await renderSearchBox();

      await userEvent.type(textArea, '{enter}');

      expect(submitMock).toHaveBeenCalled();
    });

    it('should clear suggestions when the Escape key is pressed', async () => {
      const {element, suggestions} = await renderSearchBox();

      await userEvent.click(element);
      expect(suggestions()).toHaveLength(3);

      await userEvent.type(element, '{escape}');

      expect(suggestions()).toHaveLength(0);
    });

    it('should clear suggestions when the Tab key is pressed', async () => {
      const {element, suggestions} = await renderSearchBox();

      await userEvent.click(element);
      expect(suggestions()).toHaveLength(3);

      await userEvent.type(element, '{tab}');

      expect(suggestions()).toHaveLength(0);
    });

    describe('when navigating suggestions with arrow keys', () => {
      it('should call the #submit method on the search box controller when pressing Enter after clearing an active suggestion by typing', async () => {
        const {element, textArea, suggestions} = await renderSearchBox();

        submitMock.mockClear();

        await userEvent.click(element);
        expect(suggestions()).toHaveLength(3);

        await userEvent.keyboard('{ArrowDown}');
        await userEvent.type(textArea, 'new text');
        await userEvent.keyboard('{Enter}');

        expect(submitMock).toHaveBeenCalledTimes(1);
      });

      it('should call the #submit method on the search box controller when pressing Enter after clearing an active suggestion by using backspace', async () => {
        const {element, textArea, suggestions} = await renderSearchBox({
          searchBoxValue: 'test',
        });

        submitMock.mockClear();

        await userEvent.click(element);
        expect(suggestions()).toHaveLength(3);

        await userEvent.keyboard('{ArrowDown}');
        await userEvent.type(textArea, '{Backspace}');
        await userEvent.keyboard('{Enter}');

        expect(submitMock).toHaveBeenCalledTimes(1);
      });

      it('should call the #submit method on the search box controller when pressing Enter after clearing an active suggestion by typing space', async () => {
        const {element, textArea, suggestions} = await renderSearchBox();

        submitMock.mockClear();

        await userEvent.click(element);
        expect(suggestions()).toHaveLength(3);

        await userEvent.keyboard('{ArrowDown}');
        await userEvent.type(textArea, ' ');
        await userEvent.keyboard('{Enter}');

        expect(submitMock).toHaveBeenCalledTimes(1);
      });

      it('should call the #submit method on the search box controller when Enter is pressed without any active suggestion', async () => {
        const {element, suggestions} = await renderSearchBox();

        submitMock.mockClear();

        await userEvent.click(element);
        expect(suggestions()).toHaveLength(3);

        await userEvent.keyboard('{Enter}');

        expect(submitMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when clicking the clear button', () => {
    it('should call the clear method of the search box controller', async () => {
      const {clearButton} = await renderSearchBox({searchBoxValue: 'test'});

      await userEvent.click(clearButton);

      expect(clearMock).toHaveBeenCalled();
    });

    it('should clear the text area', async () => {
      const {textArea, clearButton} = await renderSearchBox({
        searchBoxValue: 'test',
      });

      await userEvent.click(clearButton);

      expect((textArea as HTMLTextAreaElement).value).toBe('');
    });
  });

  describe('when clicking the submit button', () => {
    it('should call the submit method of the search box controller', async () => {
      const {submitButton} = await renderSearchBox();

      await userEvent.click(submitButton);

      expect(submitMock).toHaveBeenCalled();
    });

    it('should clear the suggestions', async () => {
      const {element, suggestions, submitButton} = await renderSearchBox();

      await userEvent.click(element);
      expect(suggestions()).toHaveLength(3);

      await userEvent.click(submitButton);

      expect(suggestions()).toHaveLength(0);
    });
  });

  it('should have the "suggestions-wrapper suggestions-single-list" part on the suggestions container', async () => {
    const {suggestionsContainer, textArea} = await renderSearchBox();

    await userEvent.click(textArea);
    expect(suggestionsContainer).toHaveAttribute(
      'part',
      'suggestions-wrapper suggestions-single-list'
    );
  });

  it('should have the correct aria-label on the suggestions container', async () => {
    const {suggestionsContainer, textArea} = await renderSearchBox();

    await userEvent.click(textArea);
    expect(suggestionsContainer).toHaveAttribute(
      'aria-label',
      'Search suggestions. To navigate between suggestions, press Up Arrow or Down Arrow. To select a suggestion, press Enter.'
    );
  });

  it('should render the correct number of suggestions when the numberOfQueries property is set', async () => {
    const {suggestions, textArea} = await renderSearchBox({
      searchBoxProps: {numberOfQueries: 2},
    });
    await userEvent.click(textArea);
    expect(suggestions()).toHaveLength(2);
  });

  it('should call buildSearchBox with clearFilters set to false when clearFilters is set to false', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await renderSearchBox({
      searchBoxProps: {clearFilters: false},
    });

    expect(buildSearchBox).toHaveBeenCalledWith(mockedEngine, {
      options: {
        ...commonSearchBoxOptions,
        clearFilters: false,
      },
    });
  });

  it('should accept multiple slotted components without warning', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await renderSearchBox({
      additionalChildren: html`
        <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
        <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      `,
    });

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

expect.extend({
  toBeDisabled(received: Element) {
    const expectedClass =
      'focus-within:border-disabled focus-within:ring-neutral';
    const pass =
      received.classList.contains('focus-within:border-disabled') &&
      received.classList.contains('focus-within:ring-neutral');

    return {
      pass,
      message: () =>
        `expected element ${pass ? 'not ' : ''}to have classes "${expectedClass}"`,
    };
  },
});

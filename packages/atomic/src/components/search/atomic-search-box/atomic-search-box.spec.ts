import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {isMacOS} from '@/src/utils/device-utils';
import * as replaceBreakpoint from '@/src/utils/replace-breakpoint-utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import '@/vitest-utils/testing-helpers/fixtures/atomic/search/fake-atomic-search-box-suggestions-fixture';
import {
  buildRecentQueriesList,
  buildSearchBox,
  buildStandaloneSearchBox,
} from '@coveo/headless';
import {html, type TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {randomID} from '@/src/utils/utils';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeRecentQueriesList} from '@/vitest-utils/testing-helpers/fixtures/headless/search/recent-queries-list-controller';
import {buildFakeSearchBox} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-box-controller';
import {buildFakeStandaloneSearchBox} from '@/vitest-utils/testing-helpers/fixtures/headless/search/standalone-search-box-controller';
import {AtomicSearchBox} from './atomic-search-box';
import './atomic-search-box';

vi.mock('@coveo/headless', {spy: true});
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
  id: 'atomic-search-box-123',
  numberOfSuggestions: 0,
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
  enableQuerySyntax: false,
};

describe('atomic-search-box', () => {
  const mockedEngine = buildFakeSearchEngine({});
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
      enableQuerySyntax?: boolean;
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

    const suggestions = noSuggestions
      ? ''
      : html`<fake-atomic-search-box-suggestions
          suggestion-count=${suggestionCount}
        ></fake-atomic-search-box-suggestions>`;
    const {
      redirectionUrl,
      disableSearch,
      minimumQueryLength,
      numberOfQueries,
      clearFilters,
      enableQuerySyntax,
    } = searchBoxProps || {};
    const {element} = await renderInAtomicSearchInterface<AtomicSearchBox>({
      template: html`<atomic-search-box
        redirection-url=${ifDefined(redirectionUrl)}
        ?disable-search=${disableSearch ?? false}
        minimum-query-length=${ifDefined(minimumQueryLength)}
        number-of-queries=${ifDefined(numberOfQueries)}
        clear-filters=${ifDefined(clearFilters)}
        ?enable-query-syntax=${enableQuerySyntax ?? false}
      >
        ${suggestions} ${additionalChildren}
      </atomic-search-box>`,
      selector: 'atomic-search-box',
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
      'ATOMIC-SEARCH-BOX-RECENT-QUERIES'
    );
    expect(element.shadowRoot!.children[3].tagName).toBe(
      'ATOMIC-SEARCH-BOX-QUERY-SUGGESTIONS'
    );
  });

  it('should add the event listener for the "atomic/searchBoxSuggestion/register" event', async () => {
    const addEventListenerSpy = vi.spyOn(
      AtomicSearchBox.prototype,
      'addEventListener'
    );
    await renderSearchBox();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'atomic/searchBoxSuggestion/register',
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
    expect(randomID).toHaveBeenCalledWith('atomic-search-box-');
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
    expect(wrapper).toHaveClass(
      'focus-within:border-disabled focus-within:ring-neutral'
    );
  });

  it('should disable the search box when the value is lower than the minimum query length', async () => {
    const {wrapper, textArea} = await renderSearchBox({
      searchBoxProps: {minimumQueryLength: 5},
    });
    await userEvent.type(textArea, 'test');
    expect(wrapper).toHaveClass(
      'focus-within:border-disabled focus-within:ring-neutral'
    );
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
      const {element} = await renderSearchBox({
        suggestionCount: 0,
      });

      await userEvent.click(element);

      expect(setMessageSpy).toHaveBeenCalledWith(
        'There are no search suggestions.'
      );
    });
  });

  describe('when the clear button is clicked', () => {
    it('should clear the search box', async () => {
      const {textArea, clearButton} = await renderSearchBox({
        searchBoxValue: 'test',
      });

      await userEvent.type(textArea, 'test');
      await userEvent.click(clearButton);

      expect(clearMock).toHaveBeenCalled();
    });

    it('should announce "Search box cleared" to screen readers', async () => {
      const setMessageSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'message',
        'set'
      );
      const {clearButton} = await renderSearchBox({
        searchBoxValue: 'test',
      });

      await userEvent.click(clearButton);

      expect(setMessageSpy).toHaveBeenCalledWith('Search cleared');
    });
  });

  describe('when the submit button is clicked', () => {
    it('should submit the search', async () => {
      const {submitButton} = await renderSearchBox();

      await userEvent.click(submitButton);

      expect(submitMock).toHaveBeenCalled();
    });
  });
});

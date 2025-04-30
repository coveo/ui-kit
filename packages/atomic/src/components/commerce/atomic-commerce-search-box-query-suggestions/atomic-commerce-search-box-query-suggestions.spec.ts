import {buildCustomEvent} from '@/src/utils/event-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  defaultBindings,
  renderInAtomicCommerceSearchBox,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-search-box-fixture';
import {buildFakeLoadQuerySuggestActions} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/query-suggest-actions';
import {loadQuerySuggestActions} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach, MockInstance} from 'vitest';
import {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
} from '../../common/suggestions/suggestions-common';
import './atomic-commerce-search-box-query-suggestions';
import {AtomicCommerceSearchBoxQuerySuggestions} from './atomic-commerce-search-box-query-suggestions';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceSearchBoxQuerySuggestions', () => {
  beforeEach(() => {
    vi.mocked(loadQuerySuggestActions).mockReturnValue(
      buildFakeLoadQuerySuggestActions()
    );
  });

  const renderElements = async (bindings: {} = {}) => {
    const {element, searchBox} =
      await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxQuerySuggestions>(
        {
          template: html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`,
          selector: 'atomic-commerce-search-box-query-suggestions',
          bindings: {
            ...bindings,
          },
        }
      );
    return {element, searchBox};
  };

  describe('when outside of a search box', () => {
    let consoleErrorSpy: MockInstance;
    let element: AtomicCommerceSearchBoxQuerySuggestions;

    beforeEach(async () => {
      consoleErrorSpy = vi.spyOn(console, 'error');
      element = await fixture(
        html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`
      );
    });

    it('should log an error in the console', async () => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error(
          'The "atomic-commerce-search-box-query-suggestions" component was not handled, as it is not a child of the following elements: atomic-commerce-search-box'
        ),
        element
      );
    });

    it('should display an error component', async () => {
      await expect
        .element(
          page.getByText(
            'atomic-commerce-search-box-query-suggestions component error'
          )
        )
        .toBeInTheDocument();
    });
  });

  describe('when inside a search box', () => {
    let dispatchSpy: MockInstance;
    let initializeSpy: MockInstance;
    let element: AtomicCommerceSearchBoxQuerySuggestions;

    beforeEach(async () => {
      dispatchSpy = vi.spyOn(
        AtomicCommerceSearchBoxQuerySuggestions.prototype,
        'dispatchEvent'
      );
      initializeSpy = vi.spyOn(
        AtomicCommerceSearchBoxQuerySuggestions.prototype,
        'initialize'
      );
      ({element} = await renderElements());
    });

    it('should dispatch the search box suggestions event', async () => {
      const event = buildCustomEvent(
        'atomic/searchBoxSuggestion/register',
        vi.fn()
      );
      expect(dispatchSpy).toHaveBeenCalledWith(event);
    });

    it('should assign the bindings from the event', async () => {
      expect(element.bindings).toBeDefined();
      expect(element.bindings).toEqual(
        expect.objectContaining({
          ...defaultBindings,
          i18n: expect.anything(),
        })
      );
    });

    it('should call initialize after assigning bindings', async () => {
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe('#initialize', () => {
    it('should dispatch registerQuerySuggest with the correct id and count', async () => {
      const {element} = await renderElements();
      expect(
        loadQuerySuggestActions(element.bindings.engine).registerQuerySuggest
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: element.bindings.id,
          count: element.bindings.numberOfQueries,
        })
      );
    });

    it('should return a position that is the index of the element', async () => {
      const {element, searchBox} = await renderElements();

      const object = element.initialize();

      const position = Array.from(searchBox.children).indexOf(element);
      expect(object.position).toBe(position);
    });

    it('should return a onInput that calls fetchQuerySuggestions', async () => {
      const {element} = await renderElements();

      const object = element.initialize();

      object.onInput?.();

      expect(
        loadQuerySuggestActions(element.bindings.engine).fetchQuerySuggestions
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: element.bindings.id,
        })
      );
    });

    describe('renderItems', () => {
      let element: AtomicCommerceSearchBoxQuerySuggestions;
      let object: SearchBoxSuggestions;
      let items: SearchBoxSuggestionElement[];

      beforeEach(async () => {
        ({element} = await renderElements());
        object = element.initialize();
        items = object.renderItems();
      });

      it('should return the correct number of items', () => {
        expect(items.length).toBe(
          element.bindings.searchBoxController.state.suggestions.length
        );
      });

      it('each item should have the correct properties', () => {
        expect(items[0]).toEqual(
          expect.objectContaining({
            part: 'query-suggestion-item',
            query: 'suggestion1',
            ariaLabel: '“suggestion1”, suggested query',
            key: 'qs-suggestion1',
          })
        );
      });

      it('each item should have the correct content', () => {
        expect(items[0].content).toBeDefined();
        expect(items[0].content).toBeInstanceOf(HTMLElement);
      });

      it('each item should have the correct onSelect function', () => {
        const suggestion =
          element.bindings.searchBoxController.state.suggestions[0].rawValue;

        items[0].onSelect?.(new Event('click'));

        expect(
          element.bindings.searchBoxController.selectSuggestion
        ).toHaveBeenCalledWith(suggestion);
      });

      describe('content', () => {
        const setupContentTest = async (bindings: {}) => {
          ({element} = await renderElements(bindings));
          object = element.initialize();
          items = object.renderItems();
          return items[0].content as HTMLElement;
        };

        it('should contain an icon if there are multiple kinds of suggestions', async () => {
          const content = await setupContentTest({
            getSuggestions: vi.fn(() => Array(2)),
          });

          const icon = content.querySelector('atomic-icon');
          expect(icon).toBeDefined();
          expect(icon).toHaveAttribute('part', 'query-suggestion-icon');
        });

        it('should not contain an icon if there is only one kind of suggestion', async () => {
          const content = await setupContentTest({
            getSuggestions: vi.fn(() => Array(1)),
          });

          const icon = content.querySelector('atomic-icon');
          expect(icon).toBeNull();
        });

        it('should contain the highlighted value if there is a query', async () => {
          const content = await setupContentTest({
            searchBoxController: {
              state: {
                suggestions: [
                  {
                    highlightedValue: 'suggestion1Highlighted',
                    rawValue: 'suggestion1',
                  },
                ],
                value: 'query',
              },
              selectSuggestion: vi.fn(),
            },
          });

          expect(content).toHaveTextContent('suggestion1Highlighted');
        });

        it('should contain the raw value if there is no query', async () => {
          const content = await setupContentTest({
            searchBoxController: {
              state: {
                suggestions: [
                  {
                    highlightedValue: 'suggestion1Highlighted',
                    rawValue: 'suggestion1',
                  },
                ],
                value: '',
              },
              selectSuggestion: vi.fn(),
            },
          });

          expect(content).toHaveTextContent('suggestion1');
        });
      });
    });
  });
});

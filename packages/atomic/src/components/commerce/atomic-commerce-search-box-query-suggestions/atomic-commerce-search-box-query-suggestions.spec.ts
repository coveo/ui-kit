import {loadQuerySuggestActions} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
} from '@/src/components/common/suggestions/suggestions-types';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  defaultBindings,
  renderInAtomicCommerceSearchBox,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-search-box-fixture';
import {buildFakeLoadQuerySuggestActions} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/query-suggest-actions';
import {AtomicCommerceSearchBoxQuerySuggestions} from './atomic-commerce-search-box-query-suggestions';
import './atomic-commerce-search-box-query-suggestions';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-search-box-query-suggestions', () => {
  beforeEach(() => {
    vi.mocked(loadQuerySuggestActions).mockReturnValue(
      buildFakeLoadQuerySuggestActions()
    );
  });

  const renderElements = async (
    bindings: {} = {},
    maxWithoutQuery?: number
  ) => {
    const {element, searchBox} =
      await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxQuerySuggestions>(
        {
          template: html`<atomic-commerce-search-box-query-suggestions
            max-without-query=${ifDefined(maxWithoutQuery)}
          ></atomic-commerce-search-box-query-suggestions>`,
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
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
      const {element} = await renderElements({
        numberOfQueries: 3,
      });

      expect(
        loadQuerySuggestActions(element.bindings.engine).registerQuerySuggest
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: element.bindings.id,
          count: 3,
        })
      );
    });

    it('should log a warning when numberOfQueries < maxWithQuery', async () => {
      const warnSpy = vi.fn();

      const {element} = await renderElements({
        numberOfQueries: 3,
        engine: {
          ...defaultBindings.engine,
          logger: {
            warn: warnSpy,
          },
        },
      });
      element.maxWithQuery = 5;

      element.initialize();

      expect(warnSpy).toHaveBeenCalledOnce();
      const warningMessage = warnSpy.mock.calls[0][0];
      expect(warningMessage).toContain(
        'Query suggestions configuration mismatch'
      );
      expect(warningMessage).toContain('number-of-queries="3"');
      expect(warningMessage).toContain('max-with-query="5"');
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

    describe('when returning the renderItems function', () => {
      let element: AtomicCommerceSearchBoxQuerySuggestions;
      let object: SearchBoxSuggestions;
      let items: SearchBoxSuggestionElement[];
      let content: HTMLElement;

      const setupRenderItemsTest = async (
        bindings: {} = {},
        maxWithoutQuery?: number
      ) => {
        ({element} = await renderElements(bindings, maxWithoutQuery));
        object = element.initialize();
        items = object.renderItems();
        content = items[0].content as HTMLElement;
      };

      it('should return the correct number of items', async () => {
        await setupRenderItemsTest({
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

        expect(items.length).toBe(1);
      });

      it('should return the correct number of items when numberOfQueries < maxWithQuery (uses maxWithQuery)', async () => {
        await setupRenderItemsTest({
          numberOfQueries: 2,
          searchBoxController: {
            state: {
              suggestions: [
                {
                  highlightedValue: 'suggestion1Highlighted',
                  rawValue: 'suggestion1',
                },
                {
                  highlightedValue: 'suggestion2Highlighted',
                  rawValue: 'suggestion2',
                },
                {
                  highlightedValue: 'suggestion3Highlighted',
                  rawValue: 'suggestion3',
                },
                {
                  highlightedValue: 'suggestion4Highlighted',
                  rawValue: 'suggestion4',
                },
              ],
              value: 'query',
            },
            selectSuggestion: vi.fn(),
          },
        });

        element.maxWithQuery = 5;

        object = element.initialize();
        items = object.renderItems();

        expect(items.length).toBe(4);
      });

      it('should return the correct number of items when there is more suggestions than the maxWithoutQuery', async () => {
        await setupRenderItemsTest(
          {
            searchBoxController: {
              state: {
                suggestions: [
                  {
                    highlightedValue: 'suggestion1Highlighted',
                    rawValue: 'suggestion1',
                  },
                  {
                    highlightedValue: 'suggestion2Highlighted',
                    rawValue: 'suggestion2',
                  },
                  {
                    highlightedValue: 'suggestion3Highlighted',
                    rawValue: 'suggestion3',
                  },
                  {
                    highlightedValue: 'suggestion4Highlighted',
                    rawValue: 'suggestion4',
                  },
                ],
                value: '',
              },
              selectSuggestion: vi.fn(),
            },
          },
          3
        );

        expect(items.length).toBe(3);
      });

      it('should have the correct properties on an item', () => {
        expect(items[0]).toEqual(
          expect.objectContaining({
            part: 'query-suggestion-item',
            query: 'suggestion1',
            ariaLabel: '“suggestion1”, suggested query',
            key: 'qs-suggestion1',
          })
        );
      });

      it('should have the correct content on an item', () => {
        expect(items[0].content).toBeDefined();
        expect(items[0].content).toBeInstanceOf(HTMLElement);
      });

      it('should have the correct onSelect function on an item', () => {
        const suggestion =
          element.bindings.searchBoxController.state.suggestions[0].rawValue;

        items[0].onSelect?.(new Event('click'));

        expect(
          element.bindings.searchBoxController.selectSuggestion
        ).toHaveBeenCalledWith(suggestion);
      });

      describe('when rendering the content', () => {
        it('should contain an icon if there are multiple kinds of suggestions', async () => {
          await setupRenderItemsTest({
            getSuggestions: vi.fn(() => Array(2)),
          });

          const icon = content.querySelector('atomic-icon');
          expect(icon).toBeDefined();
          expect(icon).toHaveAttribute('part', 'query-suggestion-icon');
        });

        it('should not contain an icon if there is only one kind of suggestion', async () => {
          await setupRenderItemsTest({
            getSuggestions: vi.fn(() => Array(1)),
          });

          const icon = content.querySelector('atomic-icon');
          expect(icon).toBeNull();
        });

        it('should contain the highlighted value if there is a query', async () => {
          await setupRenderItemsTest({
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
          await setupRenderItemsTest({
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

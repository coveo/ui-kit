import {buildRecentQueriesList} from '@coveo/headless/commerce';
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
import {buildFakeRecentQueriesList} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/recent-queries-list-controller';
import {AtomicCommerceSearchBoxRecentQueries} from './atomic-commerce-search-box-recent-queries';
import './atomic-commerce-search-box-recent-queries';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-search-box-recent-queries', () => {
  beforeEach(() => {
    vi.mocked(buildRecentQueriesList).mockReturnValue(
      buildFakeRecentQueriesList()
    );
  });

  const renderElements = async (
    bindings: {} = {},
    maxWithoutQuery?: number
  ) => {
    const {element, searchBox} =
      await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxRecentQueries>(
        {
          template: html`<atomic-commerce-search-box-recent-queries
            max-without-query=${ifDefined(maxWithoutQuery)}
          ></atomic-commerce-search-box-recent-queries>`,
          selector: 'atomic-commerce-search-box-recent-queries',
          bindings: {
            ...bindings,
          },
        }
      );
    return {element, searchBox};
  };

  describe('when outside of a search box', () => {
    let consoleErrorSpy: MockInstance;
    let element: AtomicCommerceSearchBoxRecentQueries;

    beforeEach(async () => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      element = await fixture(
        html`<atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>`
      );
    });

    it('should log an error in the console', () => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error(
          'The "atomic-commerce-search-box-recent-queries" component was not handled, as it is not a child of the following elements: atomic-commerce-search-box'
        ),
        element
      );
    });

    it('should display an error component', async () => {
      await expect
        .element(
          page.getByText(
            'atomic-commerce-search-box-recent-queries component error'
          )
        )
        .toBeInTheDocument();
    });
  });

  describe('when inside a search box', () => {
    let dispatchSpy: MockInstance;
    let initializeSpy: MockInstance;
    let element: AtomicCommerceSearchBoxRecentQueries;

    beforeEach(async () => {
      dispatchSpy = vi.spyOn(
        AtomicCommerceSearchBoxRecentQueries.prototype,
        'dispatchEvent'
      );
      initializeSpy = vi.spyOn(
        AtomicCommerceSearchBoxRecentQueries.prototype,
        'initialize'
      );
      ({element} = await renderElements());
    });

    it('should dispatch the searchBoxSuggestion/register event', async () => {
      const event = buildCustomEvent(
        'atomic/searchBoxSuggestion/register',
        vi.fn()
      );
      expect(dispatchSpy).toHaveBeenCalledWith(event);
    });

    it('should assign the bindings from the event', () => {
      expect(element.bindings).toBeDefined();
      expect(element.bindings).toEqual(
        expect.objectContaining({
          ...defaultBindings,
          i18n: expect.anything(),
        })
      );
    });

    it('should call initialize after assigning bindings', () => {
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe('#initialize', () => {
    it('should create a recent queries list controller', async () => {
      const {element} = await renderElements();

      expect(buildRecentQueriesList).toHaveBeenCalledWith(
        element.bindings.engine,
        {
          initialState: {
            queries: ['query1', 'query2', 'query3'],
          },
          options: {
            clearFilters: element.bindings.clearFilters,
            maxLength: 1000,
          },
        }
      );
    });

    it('should subscribe to the recent queries list', async () => {
      await renderElements();

      expect(buildFakeRecentQueriesList().subscribe).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should return a position that is the index of the element', async () => {
      const {element, searchBox} = await renderElements();

      const object = element.initialize();

      const position = Array.from(searchBox.children).indexOf(element);
      expect(object.position).toBe(position);
    });

    describe('when returning the renderItems function', () => {
      it('should return an empty array when analytics are disabled', async () => {
        vi.mocked(buildRecentQueriesList).mockReturnValue(
          buildFakeRecentQueriesList({analyticsEnabled: false})
        );
        const {element} = await renderElements({
          engine: {
            logger: {
              warn: vi.fn(),
            },
          },
        });

        const object = element.initialize();

        expect(object.renderItems()).toEqual([]);
      });

      describe('when analytics are enabled', () => {
        let element: AtomicCommerceSearchBoxRecentQueries;
        let object: SearchBoxSuggestions;
        let items: SearchBoxSuggestionElement[];

        const setupRenderItemsTest = async (
          bindings: {} = {},
          maxWithoutQuery?: number
        ) => {
          ({element} = await renderElements(bindings, maxWithoutQuery));
          object = element.initialize();
          items = object.renderItems();
        };

        it('should return the correct number of items', async () => {
          await setupRenderItemsTest();
          vi.mocked(buildRecentQueriesList).mockReturnValue(
            buildFakeRecentQueriesList({
              queries: ['query1', 'query2', 'query3'],
            })
          );

          // The first item is the query clear item, followed by the recent queries
          expect(items.length).toBe(4);
        });

        it('should return the correct number of items when there is more suggestions that the maxWithQuery', async () => {
          await setupRenderItemsTest();
          vi.mocked(buildRecentQueriesList).mockReturnValue(
            buildFakeRecentQueriesList({
              queries: ['query1', 'query2', 'query3', 'query4', 'query5'],
            })
          );

          expect(items.length).toBe(4);
        });

        it('should return the correct number of items when there is more suggestions that the maxWithoutQuery', async () => {
          await setupRenderItemsTest({
            searchBoxController: {
              state: {
                value: '',
              },
              selectSuggestion: vi.fn(),
            },
          });
          vi.mocked(buildRecentQueriesList).mockReturnValue(
            buildFakeRecentQueriesList({
              queries: ['query1', 'query2', 'query3', 'query4', 'query5'],
            })
          );

          expect(items.length).toBe(4);
        });

        it('should have the correct properties on the query clear item', () => {
          expect(items[0]).toEqual(
            expect.objectContaining({
              part: 'recent-query-title-item suggestion-divider',
              hideIfLast: true,
              ariaLabel: 'Clear recent searches',
              key: 'recent-query-clear',
            })
          );
        });

        it('should have the correct properties on the recent query item', () => {
          expect(items[1]).toEqual(
            expect.objectContaining({
              part: 'recent-query-item',
              query: 'query1',
              ariaLabel: '“query1”, recent query',
              key: 'recent-query1',
            })
          );
        });

        it('should have the correct content for each item', () => {
          expect(items[0].content).toBeDefined();
          expect(items[0].content).toBeInstanceOf(HTMLElement);
          expect(items[1].content).toBeDefined();
          expect(items[1].content).toBeInstanceOf(HTMLElement);
        });

        it('should have the correct onSelect function for the query clear item', () => {
          items[0].onSelect?.(new Event('click'));

          expect(buildFakeRecentQueriesList().clear).toHaveBeenCalledWith();
          expect(element.bindings.triggerSuggestions).toHaveBeenCalled();
        });

        it('should have the correct onSelect function for the recent query item when the search box is standalone', async () => {
          await setupRenderItemsTest({isStandalone: true});

          items[1].onSelect?.(new Event('click'));

          expect(
            element.bindings.searchBoxController.updateText
          ).toHaveBeenCalledWith('query1');
          expect(
            element.bindings.searchBoxController.submit
          ).toHaveBeenCalled();
        });

        it('should have the correct onSelect function for the recent query item when the search box is not standalone', async () => {
          await setupRenderItemsTest();

          items[1].onSelect?.(new Event('click'));

          expect(
            buildFakeRecentQueriesList().executeRecentQuery
          ).toHaveBeenCalled();
        });

        describe('when rendering the query clear item', () => {
          const setupContent = () => {
            return items[0].content as HTMLElement;
          };

          it('should have the correct part on the container', () => {
            const content = setupContent();
            expect(content).toHaveAttribute(
              'part',
              'recent-query-title-content'
            );
          });

          it('should have the correct part on the recent searches span ', () => {
            const content = setupContent();
            const recentSearchesSpan = content.querySelector('span');
            expect(recentSearchesSpan).toHaveAttribute(
              'part',
              'recent-query-title'
            );
          });

          it('should have the correct text on the recent searches span', () => {
            const content = setupContent();
            const recentSearchesSpan = content.querySelector('span');
            expect(recentSearchesSpan).toHaveTextContent('Recent searches');
          });

          it('should have the correct part on the recent query clear span', () => {
            const content = setupContent();
            const recentQueryClearSpan = content.querySelector(
              'span[part="recent-query-clear"]'
            );
            expect(recentQueryClearSpan).toHaveAttribute(
              'part',
              'recent-query-clear'
            );
          });

          it('should have the correct text on the recent query clear span', () => {
            const content = setupContent();
            const recentQueryClearSpan = content.querySelector(
              'span[part="recent-query-clear"]'
            );
            expect(recentQueryClearSpan).toHaveTextContent('Clear');
          });
        });

        describe('when rendering the recent query item', () => {
          const setupContent = async (bindings: {} = {}) => {
            ({element} = await renderElements(bindings));
            object = element.initialize();
            items = object.renderItems();
            return items[1].content as HTMLElement;
          };

          it('should have the correct part on the container', async () => {
            const content = await setupContent();
            expect(content).toHaveAttribute('part', 'recent-query-content');
          });

          it('should have the correct part on the icon', async () => {
            const content = await setupContent();
            const icon = content.querySelector('atomic-icon');
            expect(icon).toHaveAttribute('part', 'recent-query-icon');
          });

          it('should have the correct part on the span when there is a query', async () => {
            const content = await setupContent({
              searchBoxController: {
                state: {
                  value: 'query',
                },
                selectSuggestion: vi.fn(),
              },
            });
            const span = content.querySelector('span');
            expect(span).toHaveAttribute('part', 'recent-query-text');
          });

          it('should contain the highlighted value when there is a query', async () => {
            const content = await setupContent({
              searchBoxController: {
                state: {
                  value: 'query',
                },
                selectSuggestion: vi.fn(),
              },
            });
            const highlightedValue = content.querySelector(
              'span[part="recent-query-text-highlight"]'
            );
            expect(highlightedValue).toHaveTextContent('1');
          });

          it('should have the correct part on the span when there is no query', async () => {
            const content = await setupContent();
            const span = content.querySelector('span');
            expect(span).toHaveAttribute('part', 'recent-query-text');
          });
        });
      });
    });
  });
});

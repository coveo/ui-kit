import {buildCustomEvent} from '@/src/utils/event-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  defaultBindings,
  renderInAtomicCommerceSearchBox,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-search-box-fixture';
import {buildFakeRecentQueriesList} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/recent-queries-list-controller';
import {buildRecentQueriesList} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, vi, expect, it, MockInstance, beforeEach} from 'vitest';
import {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
} from '../../common/suggestions/suggestions-common';
import {AtomicCommerceSearchBoxRecentQueries} from './atomic-commerce-search-box-recent-queries';
import './atomic-commerce-search-box-recent-queries';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceSearchBoxRecentQueries', () => {
  beforeEach(() => {
    vi.mocked(buildRecentQueriesList).mockReturnValue(
      buildFakeRecentQueriesList()
    );
  });

  const renderElements = async (bindings: {} = {}) => {
    const {element, searchBox} =
      await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxRecentQueries>(
        {
          template: html`<atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>`,
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
      consoleErrorSpy = vi.spyOn(console, 'error');
      element = await fixture(
        html`<atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>`
      );
    });

    it('should log an error in the console', async () => {
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

    describe('renderItems', () => {
      describe('when analytics are disabled', () => {
        it('should return an empty array', async () => {
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
      });

      describe('when analytics are enabled', () => {
        let element: AtomicCommerceSearchBoxRecentQueries;
        let object: SearchBoxSuggestions;
        let items: SearchBoxSuggestionElement[];

        beforeEach(async () => {
          vi.mocked(buildRecentQueriesList).mockReturnValue(
            buildFakeRecentQueriesList({
              queries: ['query1', 'query2', 'query3'],
            })
          );
          ({element} = await renderElements());
          object = element.initialize();
          items = object.renderItems();
        });

        it('should return the correct number of items', async () => {
          expect(items.length).toBe(4);
        });

        it('the query clear item should have the correct properties', async () => {
          expect(items[0]).toEqual(
            expect.objectContaining({
              part: 'recent-query-title-item suggestion-divider',
              hideIfLast: true,
              ariaLabel: 'Clear recent searches',
              key: 'recent-query-clear',
            })
          );
        });

        it('the recent query item should have the correct properties', async () => {
          expect(items[1]).toEqual(
            expect.objectContaining({
              part: 'recent-query-item',
              query: 'query1',
              ariaLabel: '“query1”, recent query',
              key: 'recent-query1',
            })
          );
        });

        it('each item should have the correct content', () => {
          expect(items[0].content).toBeDefined();
          expect(items[0].content).toBeInstanceOf(HTMLElement);
          expect(items[1].content).toBeDefined();
          expect(items[1].content).toBeInstanceOf(HTMLElement);
        });

        it('the query clear item should have the correct onSelect function', () => {
          items[0].onSelect?.(new Event('click'));

          expect(buildFakeRecentQueriesList().clear).toHaveBeenCalledWith();
          expect(element.bindings.triggerSuggestions).toHaveBeenCalled();
        });

        describe('when the search box is standalone', () => {
          it('the recent query item should have the correct onSelect function', async () => {
            items = await renderElements({isStandalone: true}).then(
              ({element}) => {
                const object = element.initialize();
                return object.renderItems();
              }
            );

            items[1].onSelect?.(new Event('click'));

            expect(
              element.bindings.searchBoxController.updateText
            ).toHaveBeenCalledWith('query1');
            expect(
              element.bindings.searchBoxController.submit
            ).toHaveBeenCalled();
          });
        });

        describe('when the search box is not standalone', () => {
          it('the recent query item should have the correct onSelect function', () => {
            items[1].onSelect?.(new Event('click'));
            expect(
              buildFakeRecentQueriesList().executeRecentQuery
            ).toHaveBeenCalled();
          });
        });

        describe('content', () => {
          describe('query clear item', () => {
            const setupContent = () => {
              return items[0].content as HTMLElement;
            };

            it('the outer container should have the correct part', () => {
              const content = setupContent();
              expect(content).toHaveAttribute(
                'part',
                'recent-query-title-content'
              );
            });

            it('the recent searches span should have the correct part', () => {
              const content = setupContent();
              const recentSearchesSpan = content.querySelector('span');
              expect(recentSearchesSpan).toHaveAttribute(
                'part',
                'recent-query-title'
              );
            });

            it('the recent searches span should have the correct text', () => {
              const content = setupContent();
              const recentSearchesSpan = content.querySelector('span');
              expect(recentSearchesSpan).toHaveTextContent('Recent searches');
            });

            it('the recent query clear span should have the correct part', () => {
              const content = setupContent();
              const recentQueryClearSpan = content.querySelector(
                'span[part="recent-query-clear"]'
              );
              expect(recentQueryClearSpan).toHaveAttribute(
                'part',
                'recent-query-clear'
              );
            });

            it('the recent query clear span should have the correct text', () => {
              const content = setupContent();
              const recentQueryClearSpan = content.querySelector(
                'span[part="recent-query-clear"]'
              );
              expect(recentQueryClearSpan).toHaveTextContent('Clear');
            });
          });

          describe('recent query item', () => {
            const setupContent = async (bindings: {} = {}) => {
              ({element} = await renderElements(bindings));
              object = element.initialize();
              items = object.renderItems();
              return items[1].content as HTMLElement;
            };

            it('outer container should have the correct part', async () => {
              const content = await setupContent();
              expect(content).toHaveAttribute('part', 'recent-query-content');
            });

            it('icon should have the correct part', async () => {
              const content = await setupContent();
              const icon = content.querySelector('atomic-icon');
              expect(icon).toHaveAttribute('part', 'recent-query-icon');
            });

            describe('when there is a query', () => {
              it('span should have the correct part', async () => {
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

              it('should container the highlighted value', async () => {
                const content = await setupContent({
                  searchBoxController: {
                    state: {
                      value: 'query',
                    },
                    selectSuggestion: vi.fn(),
                  },
                });
                console.log(content);
                const highlightedValue = content.querySelector(
                  'span[part="recent-query-text-highlight"]'
                );
                expect(highlightedValue).toHaveTextContent('1');
              });
            });

            describe('when there is no query', () => {
              it('span should have the correct part', async () => {
                const content = await setupContent();
                const span = content.querySelector('span');
                expect(span).toHaveAttribute('part', 'recent-query-text');
              });
            });
          });
        });
      });
    });
  });
});

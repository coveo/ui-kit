import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  defaultBindings,
  renderInAtomicCommerceSearchBox,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-search-box-fixture';
import {buildFakeLoadQuerySuggestActions} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/query-suggest-actions';
import {loadQuerySuggestActions} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html, LitElement} from 'lit';
import {describe, it, vi, expect, beforeEach, MockInstance} from 'vitest';
import './atomic-commerce-search-box-query-suggestions';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceSearchBoxQuerySuggestions', () => {
  let spiedConsoleError: MockInstance<typeof console.error>;
  let element: LitElement;
  beforeEach(() => {
    vi.mocked(loadQuerySuggestActions).mockReturnValue(
      buildFakeLoadQuerySuggestActions()
    );
    spiedConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {
      // Ignore console.error;
    });
  });

  describe('when the component is created', () => {
    describe('when outside of a search box', () => {
      beforeEach(async () => {
        element = await fixture(
          html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`
        );
      });

      it('should log an error in the console', async () => {
        expect(spiedConsoleError).toHaveBeenCalledWith(
          expect.toSatisfy((maybeError) => {
            return (
              maybeError instanceof Error &&
              maybeError.message ===
                'The "atomic-commerce-search-box-query-suggestions" component was not handled, as it is not a child of the following elements: atomic-commerce-search-box'
            );
          }),
          element
        );
      });

      it('should display an error component', async () => {
        expect(
          page.getByText(
            'atomic-commerce-search-box-query-suggestions component error'
          )
        ).toBeInTheDocument();
        expect(
          element.shadowRoot?.querySelector('atomic-component-error')
        ).toBeTruthy();
      });
    });

    describe('when inside a search box', () => {
      const setupElement = async (
        bindings: Parameters<
          typeof renderInAtomicCommerceSearchBox
        >[0]['bindings'] = defaultBindings
      ) => {
        const {element, searchBox} = await renderInAtomicCommerceSearchBox({
          template: html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`,
          bindings,
          selector: 'atomic-commerce-search-box-query-suggestions',
        });
        return {element, searchBox};
      };

      it('should not log an error in the console', async () => {
        await setupElement();

        expect(spiedConsoleError).not.toHaveBeenCalled();
      });

      it('should not display an error component', async () => {
        const {element} = await setupElement();

        // We cannot use the `getByText` method here because the error component is not rendered
        expect(
          element.shadowRoot?.querySelector('atomic-component-error')
        ).toBeFalsy();
      });

      it('should register itself with the search box', async () => {
        const registerQuerySuggest = vi.fn();

        vi.mocked(loadQuerySuggestActions).mockReturnValue(
          buildFakeLoadQuerySuggestActions({registerQuerySuggest})
        );
        const {searchBox} = await setupElement();

        expect(
          searchBox.searchBoxSuggestionsEventListener
        ).toHaveBeenCalledTimes(1);
        expect(registerQuerySuggest).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            id: searchBox.bindings.id,
            count: searchBox.bindings.numberOfQueries,
          })
        );
        expect(loadQuerySuggestActions).toHaveBeenCalledExactlyOnceWith(
          searchBox.bindings.engine
        );
        expect(searchBox.searchBoxSuggestionsEventListener).toHaveReturnedWith(
          expect.objectContaining({
            position: 0,
            onInput: expect.any(Function),
            renderItems: expect.any(Function),
          })
        );
      });
      describe('#SearchBoxSuggestions', () => {
        describe('#position', () => {
          it.todo(
            'should return the position of the suggestions within its siblings',
            async () => {
              // Add some stubbed elements prior to the query suggestions to bump the index and check the return value
              const {searchBox} = await setupElement();
              expect(
                searchBox.searchBoxSuggestionsEventListener
              ).toHaveReturnedWith(
                expect.objectContaining({
                  position: 1,
                })
              );
            }
          );
        });
        describe('#onInput', () => {
          it('should return an input handler', async () => {
            const mockQuerySuggestions = vi.fn();
            const fetchQuerySuggestions = vi
              .fn()
              .mockReturnValue(mockQuerySuggestions);
            vi.mocked(loadQuerySuggestActions).mockReturnValue(
              buildFakeLoadQuerySuggestActions({fetchQuerySuggestions})
            );
            const {searchBox} = await setupElement();

            searchBox.searchBoxSuggestionsEventListener.mock.results[0].value.onInput();

            expect(fetchQuerySuggestions).toHaveBeenCalledExactlyOnceWith({
              id: searchBox.bindings.id,
            });
            expect(searchBox.bindings.engine.dispatch).toHaveBeenNthCalledWith(
              2,
              mockQuerySuggestions
            );
          });
        });
        describe('#renderItems', () => {
          describe('when there is a query', () => {
            it.todo('should return `max-with-query` rendered suggestions');
          });
          describe('when there is no query', () => {
            it.todo('should return `max-without-query` rendered suggestions');
          });

          // In those, either:
          // A: Mock the `getPartialSearchBoxSuggestionElement` and `renderQuerySuggestion` methods
          // B: Spy the `renderItems` method and check that the `getPartialSearchBoxSuggestionElement` and `renderQuerySuggestion` methods are called with the right parameters
          // In either case, we need to check that the `renderItems` method returns the right values.
          it.todo(
            'calls the `#getPartialSearchBoxSuggestionElement` properly and returns it spread for each suggestion'
          );
          it.todo(
            'calls the `#renderQuerySuggestion` properly and returns it on the `content` prop for each suggestion'
          );
          it.todo(
            'returns an `#onSelect` method that calls the controller properly for each suggestion'
          );
        });
      });
    });
  });
});

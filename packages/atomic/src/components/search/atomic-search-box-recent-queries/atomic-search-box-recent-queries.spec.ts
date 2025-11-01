import {buildRecentQueriesList} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderInAtomicSearchBox} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-box-fixture';
import {buildFakeRecentQueriesList} from '@/vitest-utils/testing-helpers/fixtures/headless/search/recent-queries-list-controller';
import type {AtomicSearchBoxRecentQueries} from './atomic-search-box-recent-queries';
import './atomic-search-box-recent-queries';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-search-box-recent-queries', () => {
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
      await renderInAtomicSearchBox<AtomicSearchBoxRecentQueries>({
        template: html`<atomic-search-box-recent-queries
          max-without-query=${ifDefined(maxWithoutQuery)}
        ></atomic-search-box-recent-queries>`,
        selector: 'atomic-search-box-recent-queries',
        bindings: {
          ...bindings,
        },
      });
    return {element, searchBox};
  };

  describe('when outside of a search box', () => {
    let consoleErrorSpy: MockInstance;
    let element: AtomicSearchBoxRecentQueries;

    beforeEach(async () => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      element = await fixture(
        html`<atomic-search-box-recent-queries></atomic-search-box-recent-queries>`
      );
    });

    it('should log an error in the console', () => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error(
          'The "atomic-search-box-recent-queries" component was not handled, as it is not a child of the following elements: atomic-search-box'
        ),
        element
      );
    });

    it('should display an error component', async () => {
      await expect
        .element(
          page.getByText('atomic-search-box-recent-queries component error')
        )
        .toBeInTheDocument();
    });
  });

  describe('when inside a search box', () => {
    let dispatchSpy: MockInstance;
    let element: AtomicSearchBoxRecentQueries;

    beforeEach(async () => {
      dispatchSpy = vi.spyOn(HTMLElement.prototype, 'dispatchEvent');
      ({element} = await renderElements());
    });

    it('should be properly defined as a custom element', () => {
      expect(
        customElements.get('atomic-search-box-recent-queries')
      ).toBeDefined();
    });

    it('should render with default properties', () => {
      expect(element.maxWithQuery).toBe(3);
      expect(element.maxWithoutQuery).toBeUndefined();
      expect(element.icon).toBeUndefined();
    });

    it('should set maxWithoutQuery when provided', async () => {
      const {element: elementWithMax} = await renderElements({}, 5);
      expect(elementWithMax.maxWithoutQuery).toBe(5);
    });

    it('should reflect properties to attributes', async () => {
      const {element: elementWithReflection} = await renderElements({}, 8);
      expect(elementWithReflection.getAttribute('max-without-query')).toBe('8');
    });

    it('should handle undefined maxWithoutQuery properly', () => {
      expect(element.maxWithoutQuery).toBeUndefined();
      expect(element.getAttribute('max-without-query')).toBe(null);
    });

    it('should dispatch the searchBoxSuggestion/register event', async () => {
      const event = buildCustomEvent(
        'atomic/searchBoxSuggestion/register',
        vi.fn()
      );
      expect(dispatchSpy).toHaveBeenCalledWith(event);
    });

    it('should dispatch custom event with buildCustomEvent', () => {
      const customEvent = buildCustomEvent(
        'atomic/searchBoxRecentQueries/register',
        {element, recentQueriesList: expect.any(Object)}
      );
      expect(customEvent).toBeInstanceOf(CustomEvent);
    });
  });
});

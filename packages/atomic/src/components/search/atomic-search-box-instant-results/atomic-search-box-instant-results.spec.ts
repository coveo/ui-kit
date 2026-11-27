import {
  buildInstantResults,
  buildInteractiveInstantResult,
  buildResultTemplatesManager,
  type InteractiveResult,
  type ResultTemplatesManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {SearchBoxSuggestionElement} from '@/src/components/common/suggestions/suggestions-types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderInAtomicSearchBox} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-box-fixture';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeInstantResults} from '@/vitest-utils/testing-helpers/fixtures/headless/search/instant-results-controller';
import type {AtomicSearchBoxInstantResults} from './atomic-search-box-instant-results';
import './atomic-search-box-instant-results';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-search-box-instant-results', () => {
  beforeEach(() => {
    vi.mocked(buildInstantResults).mockReturnValue(buildFakeInstantResults());
    vi.mocked(buildInteractiveInstantResult).mockReturnValue({
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    } as unknown as InteractiveResult);
    vi.mocked(buildResultTemplatesManager).mockReturnValue({
      registerTemplates: vi.fn(),
      selectTemplate: vi.fn(() => null),
    } as unknown as ResultTemplatesManager);
  });

  const renderComponent = async () => {
    const {element} = await renderInAtomicSearchInterface<AtomicSearchBoxInstantResults>({
      template: html`<atomic-search-box-instant-results></atomic-search-box-instant-results>`,
      selector: 'atomic-search-box-instant-results',
    });
    return element;
  };

  const renderInSearchBox = async (bindings: Record<string, unknown> = {}) => {
    const {element} = await renderInAtomicSearchBox<AtomicSearchBoxInstantResults>({
      template: html`<atomic-search-box-instant-results></atomic-search-box-instant-results>`,
      selector: 'atomic-search-box-instant-results',
      bindings: {...bindings},
    });
    return element;
  };

  describe('when its parent is not an atomic-search-box', () => {
    let consoleErrorSpy: MockInstance;
    let element: AtomicSearchBoxInstantResults;

    beforeEach(async () => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      element = await fixture<AtomicSearchBoxInstantResults>(
        html`<atomic-search-box-instant-results></atomic-search-box-instant-results>`
      );
    });

    it('should log an error in the console', async () => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error(
          'The "atomic-search-box-instant-results" component was not handled, as it is not a child of the following elements: atomic-search-box'
        ),
        element
      );
    });

    it('should display an error component', async () => {
      await expect
        .element(page.getByText('atomic-search-box-instant-results component error'))
        .toBeInTheDocument();
    });
  });

  describe('when properly initialized', () => {
    let element: AtomicSearchBoxInstantResults;

    beforeEach(async () => {
      element = await renderComponent();
    });

    it('should render with default properties', async () => {
      expect(element).toBeDefined();
      expect(element.maxResultsPerQuery).toBe(4);
      expect(element.density).toBe('normal');
      expect(element.imageSize).toBe('icon');
    });

    describe('#setRenderFunction', () => {
      it('should set the itemRenderingFunction property', async () => {
        const mockRenderFunction = vi.fn();

        await element.setRenderFunction(mockRenderFunction);

        expect((element as unknown as {itemRenderingFunction: unknown}).itemRenderingFunction).toBe(
          mockRenderFunction
        );
      });
    });
  });

  describe('property changes', () => {
    let element: AtomicSearchBoxInstantResults;

    beforeEach(async () => {
      element = await renderComponent();
    });

    it('should handle maxResultsPerQuery property changes', async () => {
      element.maxResultsPerQuery = 8;
      await element.updateComplete;
      expect(element.maxResultsPerQuery).toBe(8);
    });

    it('should handle density property changes', async () => {
      element.density = 'compact';
      await element.updateComplete;
      expect(element.density).toBe('compact');
    });

    it('should handle imageSize property changes', async () => {
      element.imageSize = 'large';
      await element.updateComplete;
      expect(element.imageSize).toBe('large');
    });
  });

  describe('when returning the renderItems function', () => {
    it('should return an empty array when there is no suggested query', async () => {
      const element = await renderInSearchBox({suggestedQuery: () => undefined});

      expect(element.initialize().renderItems()).toEqual([]);
    });

    it('should return an empty array when the browser is in mobile mode', async () => {
      const element = await renderInSearchBox({
        store: {isMobile: vi.fn(() => true), onChange: vi.fn()},
      });

      expect(element.initialize().renderItems()).toEqual([]);
    });

    describe('when the browser is not in mobile mode and there is a suggested query', () => {
      let items: SearchBoxSuggestionElement[];

      beforeEach(async () => {
        const element = await renderInSearchBox();
        items = element.initialize().renderItems();
      });

      it('should return one item per result plus the show all item', () => {
        expect(items.length).toBe(4);
      });

      it('should have an atomic-result element as content for the instant result items', () => {
        expect((items[0].content as Element).tagName).toBe('ATOMIC-RESULT');
      });

      describe('when selecting an instant result item', () => {
        let itemElement: HTMLElement;
        let link: HTMLElement & {clickLink: Mock};

        const attachShadowContent = (host: HTMLElement, ...children: HTMLElement[]) => {
          const shadowContent = document.createElement('div');
          shadowContent.append(...children);
          Object.defineProperty(host, 'shadowRoot', {
            get: () => shadowContent,
            configurable: true,
          });
        };

        const selectItem = (target: HTMLElement, init: MouseEventInit = {}) => {
          const onSelect = (event: Event) => items[0].onSelect?.(event as MouseEvent);
          target.addEventListener('click', onSelect, {once: true});
          target.dispatchEvent(new MouseEvent('click', init));
        };

        beforeEach(() => {
          itemElement = items[0].content as HTMLElement;
          link = Object.assign(document.createElement('atomic-result-link'), {
            clickLink: vi.fn(),
          });
          attachShadowContent(itemElement, link);
        });

        it('should call #clickLink on the atomic-result-link without opening a new tab', () => {
          selectItem(itemElement);

          expect(link.clickLink).toHaveBeenCalledExactlyOnceWith({newTab: false});
        });

        it('should call #clickLink with newTab set to true when the Ctrl key is pressed', () => {
          selectItem(itemElement, {ctrlKey: true});

          expect(link.clickLink).toHaveBeenCalledExactlyOnceWith({newTab: true});
        });

        it('should call #clickLink with newTab set to true when the Meta key is pressed', () => {
          selectItem(itemElement, {metaKey: true});

          expect(link.clickLink).toHaveBeenCalledExactlyOnceWith({newTab: true});
        });

        it('should find the atomic-result when the event target contains it', () => {
          const wrapper = document.createElement('div');
          wrapper.appendChild(itemElement);

          selectItem(wrapper);

          expect(link.clickLink).toHaveBeenCalledExactlyOnceWith({newTab: false});
        });

        it('should not throw when the atomic-result has no atomic-result-link', () => {
          attachShadowContent(itemElement);

          expect(() => selectItem(itemElement)).not.toThrow();
          expect(link.clickLink).not.toHaveBeenCalled();
        });

        it('should not throw when the atomic-result-link is not upgraded yet', () => {
          attachShadowContent(itemElement, document.createElement('atomic-result-link'));

          expect(() => selectItem(itemElement)).not.toThrow();
        });
      });
    });
  });
});

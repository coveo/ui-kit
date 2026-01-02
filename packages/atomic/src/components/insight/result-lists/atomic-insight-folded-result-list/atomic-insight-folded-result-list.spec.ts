import {
  buildFoldedResultList,
  buildInteractiveResult,
  buildResultsPerPage,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {
  buildFakeFoldedCollection,
  buildFakeFoldedResultList,
} from '@/vitest-utils/testing-helpers/fixtures/headless/search/folded-result-list-controller';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {buildFakeResultsPerPage} from '@/vitest-utils/testing-helpers/fixtures/headless/search/results-per-page-controller';
import {AtomicInsightFoldedResultList} from './atomic-insight-folded-result-list';
import './atomic-insight-folded-result-list';
import '@/src/components/insight/result-templates/atomic-insight-result-template/atomic-insight-result-template';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});
vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-folded-result-list', () => {
  const interactiveResult = vi.fn();
  const mockedEngine = buildFakeInsightEngine();

  beforeEach(() => {
    vi.mocked(buildFoldedResultList).mockReturnValue(
      buildFakeFoldedResultList({
        state: {
          results: [buildFakeFoldedCollection()],
        },
      })
    );
    vi.mocked(buildResultsPerPage).mockReturnValue(buildFakeResultsPerPage());

    vi.mocked(buildInteractiveResult).mockImplementation((_engine, props) => {
      return interactiveResult(props);
    });
  });

  interface RenderOptions {
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    collectionField?: string;
    parentField?: string;
    childField?: string;
    numberOfFoldedResults?: number;
    isAppLoaded?: boolean;
  }

  const renderFoldedResultList = async ({
    density,
    imageSize,
    collectionField,
    parentField,
    childField,
    numberOfFoldedResults,
    isAppLoaded = true,
  }: RenderOptions = {}) => {
    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightFoldedResultList>({
        template: html`<atomic-insight-folded-result-list
          .density=${ifDefined(density)}
          .imageSize=${ifDefined(imageSize)}
          .collectionField=${ifDefined(collectionField)}
          .parentField=${ifDefined(parentField)}
          .childField=${ifDefined(childField)}
          .numberOfFoldedResults=${ifDefined(numberOfFoldedResults)}
        >
          <atomic-insight-result-template>
            <template>
              <div>Result Content</div>
            </template>
          </atomic-insight-result-template>
        </atomic-insight-folded-result-list>`,
        selector: 'atomic-insight-folded-result-list',
        bindings: (bindings) => {
          bindings.store.state.loadingFlags = isAppLoaded
            ? []
            : ['loading-flag'];
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      parts: {
        resultList: element.shadowRoot?.querySelector('[part="result-list"]'),
        outline: element.shadowRoot?.querySelector('[part="outline"]'),
      },
    };
  };

  const mockFoldedCollections = (count: number) => {
    vi.mocked(buildFoldedResultList).mockReturnValue(
      buildFakeFoldedResultList({
        state: {
          results: Array.from({length: count}, (_, i) =>
            buildFakeFoldedCollection({
              result: buildFakeResult({uniqueId: i.toString()}),
            })
          ),
        },
      })
    );
  };

  it('should initialize', async () => {
    const {element} = await renderFoldedResultList();

    expect(element).toBeInstanceOf(AtomicInsightFoldedResultList);
  });

  describe('#initialize', () => {
    it('should call buildFoldedResultList with engine and default options', async () => {
      await renderFoldedResultList();

      expect(vi.mocked(buildFoldedResultList)).toHaveBeenCalledWith(
        mockedEngine,
        {
          options: {
            folding: {
              collectionField: undefined,
              parentField: undefined,
              childField: undefined,
              numberOfFoldedResults: 2,
            },
          },
        }
      );
    });

    it('should call buildFoldedResultList with custom folding options', async () => {
      await renderFoldedResultList({
        collectionField: 'custom-collection',
        parentField: 'custom-parent',
        childField: 'custom-child',
        numberOfFoldedResults: 5,
      });

      expect(vi.mocked(buildFoldedResultList)).toHaveBeenCalledWith(
        mockedEngine,
        {
          options: {
            folding: {
              collectionField: 'custom-collection',
              parentField: 'custom-parent',
              childField: 'custom-child',
              numberOfFoldedResults: 5,
            },
          },
        }
      );
    });

    it('should call buildResultsPerPage with engine', async () => {
      await renderFoldedResultList();

      expect(vi.mocked(buildResultsPerPage)).toHaveBeenCalledWith(mockedEngine);
    });
  });

  describe('#render when app is loaded', () => {
    it('should render result-list part', async () => {
      mockFoldedCollections(3);
      const {parts} = await renderFoldedResultList();

      expect(parts.resultList).toBeTruthy();
      await expect
        .element(page.elementLocator(parts.resultList!))
        .toBeInTheDocument();
    });

    it('should render atomic-insight-result for each folded collection', async () => {
      mockFoldedCollections(3);
      await renderFoldedResultList();

      const results = page.getByRole('listitem');
      await expect.element(results.first()).toBeInTheDocument();
      expect(await results.all()).toHaveLength(3);
    });

    it('should pass correct density to atomic-insight-result', async () => {
      mockFoldedCollections(1);
      await renderFoldedResultList({density: 'compact'});

      const result = page.getByRole('listitem').first();
      expect(await result.getAttribute('density')).toBe('compact');
    });

    it('should pass correct imageSize to atomic-insight-result', async () => {
      mockFoldedCollections(1);
      await renderFoldedResultList({imageSize: 'large'});

      const result = page.getByRole('listitem').first();
      expect(await result.getAttribute('imagesize')).toBe('large');
    });
  });

  describe('#render when app is not loaded', () => {
    it('should render placeholders when app is not loaded', async () => {
      mockFoldedCollections(3);
      await renderFoldedResultList({isAppLoaded: false});

      const placeholders = page
        .getByRole('status', {name: 'Loading'})
        .elements();
      expect(await placeholders).toHaveLength(10);
    });
  });

  describe('when folded result list has no results', () => {
    beforeEach(() => {
      vi.mocked(buildFoldedResultList).mockReturnValue(
        buildFakeFoldedResultList({
          state: {
            results: [],
            hasResults: false,
          },
        })
      );
    });

    it('should not render result-list part', async () => {
      const {parts} = await renderFoldedResultList();

      expect(parts.resultList).toBeFalsy();
    });
  });

  describe('when folded result list has an error', () => {
    beforeEach(() => {
      vi.mocked(buildFoldedResultList).mockReturnValue(
        buildFakeFoldedResultList({
          state: {
            hasError: true,
          },
        })
      );
    });

    it('should render query error', async () => {
      await renderFoldedResultList();

      const errorContainer = page.getByRole('alert');
      await expect.element(errorContainer).toBeInTheDocument();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should remove event listeners when component is disconnected', async () => {
      const {element} = await renderFoldedResultList();

      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/resolveFoldedResultList',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/loadCollection',
        expect.any(Function)
      );
    });
  });

  describe('#setRenderFunction', () => {
    it('should accept a custom render function', async () => {
      const {element} = await renderFoldedResultList();
      const customRenderFunction = vi.fn();

      await element.setRenderFunction(customRenderFunction);

      expect(element.itemRenderingFunction).toBe(customRenderFunction);
    });
  });

  describe('event handlers', () => {
    it('should handle atomic/resolveFoldedResultList event', async () => {
      const {element} = await renderFoldedResultList();

      const event = new CustomEvent('atomic/resolveFoldedResultList', {
        detail: vi.fn(),
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      element.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(event.detail).toHaveBeenCalledWith(element.foldedResultList);
    });

    it('should handle atomic/loadCollection event', async () => {
      const {element} = await renderFoldedResultList();
      const mockCollection = buildFakeFoldedCollection();

      const loadCollectionSpy = vi.fn();
      element.foldedResultList = {
        ...element.foldedResultList,
        loadCollection: loadCollectionSpy,
        subscribe: genericSubscribe,
      };

      const event = new CustomEvent('atomic/loadCollection', {
        detail: mockCollection,
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      element.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(loadCollectionSpy).toHaveBeenCalledWith(mockCollection);
    });
  });

  describe('prop validation', () => {
    it('should accept valid density values', async () => {
      const densities: ItemDisplayDensity[] = [
        'normal',
        'comfortable',
        'compact',
      ];

      for (const density of densities) {
        const {element} = await renderFoldedResultList({density});
        expect(element.density).toBe(density);
      }
    });

    it('should accept valid imageSize values', async () => {
      const imageSizes: ItemDisplayImageSize[] = [
        'small',
        'large',
        'icon',
        'none',
      ];

      for (const imageSize of imageSizes) {
        const {element} = await renderFoldedResultList({imageSize});
        expect(element.imageSize).toBe(imageSize);
      }
    });

    it('should accept numberOfFoldedResults of 0 or greater', async () => {
      const {element} = await renderFoldedResultList({
        numberOfFoldedResults: 0,
      });
      expect(element.numberOfFoldedResults).toBe(0);
    });
  });
});

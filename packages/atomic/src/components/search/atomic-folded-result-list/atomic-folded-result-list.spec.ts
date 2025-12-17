import {
  buildFoldedResultList,
  buildInteractiveResult,
  buildResultsPerPage,
  buildTabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {
  buildFakeFoldedCollection,
  buildFakeFoldedResultList,
} from '@/vitest-utils/testing-helpers/fixtures/headless/search/folded-result-list-controller';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {buildFakeResultsPerPage} from '@/vitest-utils/testing-helpers/fixtures/headless/search/results-per-page-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {AtomicFoldedResultList} from './atomic-folded-result-list';
import './atomic-folded-result-list';
import '../atomic-result-template/atomic-result-template';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});
vi.mock('@coveo/headless', {spy: true});

describe('atomic-folded-result-list', () => {
  const interactiveResult = vi.fn();
  const mockedEngine = buildFakeSearchEngine();

  beforeEach(() => {
    vi.mocked(buildFoldedResultList).mockReturnValue(
      buildFakeFoldedResultList({
        state: {
          results: [buildFakeFoldedCollection()],
        },
      })
    );
    vi.mocked(buildResultsPerPage).mockReturnValue(buildFakeResultsPerPage());
    vi.mocked(buildTabManager).mockReturnValue(buildFakeTabManager());

    vi.mocked(buildInteractiveResult).mockImplementation((_engine, props) => {
      return interactiveResult(props);
    });
  });

  interface RenderOptions {
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    tabsIncluded?: string[];
    tabsExcluded?: string[];
    collectionField?: string;
    parentField?: string;
    childField?: string;
    numberOfFoldedResults?: number;
    isAppLoaded?: boolean;
  }

  const renderFoldedResultList = async ({
    density,
    imageSize,
    tabsIncluded,
    tabsExcluded,
    collectionField,
    parentField,
    childField,
    numberOfFoldedResults,
    isAppLoaded = true,
  }: RenderOptions = {}) => {
    const {element} =
      await renderInAtomicSearchInterface<AtomicFoldedResultList>({
        template: html`<atomic-folded-result-list
          .density=${ifDefined(density)}
          .imageSize=${ifDefined(imageSize)}
          .tabsIncluded=${ifDefined(tabsIncluded)}
          .tabsExcluded=${ifDefined(tabsExcluded)}
          .collectionField=${ifDefined(collectionField)}
          .parentField=${ifDefined(parentField)}
          .childField=${ifDefined(childField)}
          .numberOfFoldedResults=${ifDefined(numberOfFoldedResults)}
        >
          <atomic-result-template>
            <template>
              <div>Result Content</div>
            </template>
          </atomic-result-template>
        </atomic-folded-result-list>`,
        selector: 'atomic-folded-result-list',
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

    expect(element).toBeInstanceOf(AtomicFoldedResultList);
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

    it('should call buildTabManager with engine', async () => {
      await renderFoldedResultList();

      expect(vi.mocked(buildTabManager)).toHaveBeenCalledWith(mockedEngine);
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

    it('should render atomic-result for each folded collection', async () => {
      mockFoldedCollections(3);
      const {element} = await renderFoldedResultList();

      const results = element.shadowRoot?.querySelectorAll('atomic-result');
      expect(results?.length).toBe(3);
    });

    it('should render atomic-result with outline part', async () => {
      mockFoldedCollections(1);
      const {element} = await renderFoldedResultList();

      const result = element.shadowRoot?.querySelector(
        'atomic-result[part="outline"]'
      );
      expect(result).toBeTruthy();
      await expect.element(page.elementLocator(result!)).toBeInTheDocument();
    });
  });

  describe('#render when app is not loaded', () => {
    it('should render placeholders', async () => {
      const numberOfPlaceholders = 4;
      vi.mocked(buildResultsPerPage).mockReturnValue(
        buildFakeResultsPerPage({
          numberOfResults: numberOfPlaceholders,
        })
      );

      const {element} = await renderFoldedResultList({isAppLoaded: false});

      const placeholders = element.shadowRoot?.querySelectorAll(
        'atomic-result-placeholder'
      );
      expect(placeholders?.length).toBe(numberOfPlaceholders);
    });
  });

  describe('#setRenderFunction', () => {
    it('should store the rendering function', async () => {
      const {element} = await renderFoldedResultList();
      const mockRenderFunction = vi.fn();

      await element.setRenderFunction(mockRenderFunction);

      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for test
      expect((element as any).itemRenderingFunction).toBe(mockRenderFunction);
    });
  });

  describe('when handling atomic/resolveFoldedResultList event', () => {
    it('should call callback with foldedResultList controller', async () => {
      const {element} = await renderFoldedResultList();
      const mockCallback = vi.fn();

      const event = new CustomEvent('atomic/resolveFoldedResultList', {
        bubbles: true,
        cancelable: true,
        detail: mockCallback,
      });

      element.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith(element.foldedResultList);
    });

    it('should prevent event default', async () => {
      const {element} = await renderFoldedResultList();
      const mockCallback = vi.fn();

      const event = new CustomEvent('atomic/resolveFoldedResultList', {
        bubbles: true,
        cancelable: true,
        detail: mockCallback,
      });

      element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('when handling atomic/loadCollection event', () => {
    it('should call loadCollection on controller', async () => {
      const {element} = await renderFoldedResultList();
      const mockCollection = buildFakeFoldedCollection();

      const event = new CustomEvent('atomic/loadCollection', {
        bubbles: true,
        cancelable: true,
        detail: mockCollection,
      });

      element.dispatchEvent(event);

      expect(element.foldedResultList.loadCollection).toHaveBeenCalledWith(
        mockCollection
      );
    });

    it('should prevent event default', async () => {
      const {element} = await renderFoldedResultList();
      const mockCollection = buildFakeFoldedCollection();

      const event = new CustomEvent('atomic/loadCollection', {
        bubbles: true,
        cancelable: true,
        detail: mockCollection,
      });

      element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('when no folded results', () => {
    it('should not render when no results exist', async () => {
      vi.mocked(buildFoldedResultList).mockReturnValue(
        buildFakeFoldedResultList({
          state: {
            results: [],
            hasResults: false,
          },
        })
      );

      const {element} = await renderFoldedResultList();

      const renderedElements = element.shadowRoot?.querySelectorAll('*');
      expect(renderedElements).toHaveLength(0);
    });
  });

  describe('when controller has error', () => {
    it('should not render', async () => {
      vi.mocked(buildFoldedResultList).mockReturnValue(
        buildFakeFoldedResultList({
          state: {
            hasError: true,
          },
        })
      );

      const {element} = await renderFoldedResultList();

      const renderedElements = element.shadowRoot?.querySelectorAll('*');
      expect(renderedElements).toHaveLength(0);
    });
  });

  describe('#density property', () => {
    it('should apply normal density by default', async () => {
      const {element} = await renderFoldedResultList();

      expect(element.density).toBe('normal');
    });

    it('should accept comfortable density', async () => {
      const {element} = await renderFoldedResultList({density: 'comfortable'});

      expect(element.density).toBe('comfortable');
    });

    it('should accept compact density', async () => {
      const {element} = await renderFoldedResultList({density: 'compact'});

      expect(element.density).toBe('compact');
    });
  });

  describe('#imageSize property', () => {
    it('should apply icon size by default', async () => {
      const {element} = await renderFoldedResultList();

      expect(element.imageSize).toBe('icon');
    });

    it('should accept small size', async () => {
      const {element} = await renderFoldedResultList({imageSize: 'small'});

      expect(element.imageSize).toBe('small');
    });

    it('should accept large size', async () => {
      const {element} = await renderFoldedResultList({imageSize: 'large'});

      expect(element.imageSize).toBe('large');
    });
  });

  describe('#numberOfFoldedResults property', () => {
    it('should use 2 by default', async () => {
      const {element} = await renderFoldedResultList();

      expect(element.numberOfFoldedResults).toBe(2);
    });

    it('should accept custom value', async () => {
      const {element} = await renderFoldedResultList({
        numberOfFoldedResults: 5,
      });

      expect(element.numberOfFoldedResults).toBe(5);
    });
  });

  describe('tab filtering', () => {
    it('should render when no tabs are specified', async () => {
      mockFoldedCollections(1);
      const {parts} = await renderFoldedResultList({
        tabsIncluded: [],
        tabsExcluded: [],
      });

      expect(parts.resultList).toBeTruthy();
    });

    it('should accept tabsIncluded', async () => {
      const {element} = await renderFoldedResultList({
        tabsIncluded: ['tab1', 'tab2'],
      });

      expect(element.tabsIncluded).toEqual(['tab1', 'tab2']);
    });

    it('should accept tabsExcluded', async () => {
      const {element} = await renderFoldedResultList({
        tabsExcluded: ['tab3', 'tab4'],
      });

      expect(element.tabsExcluded).toEqual(['tab3', 'tab4']);
    });
  });
});

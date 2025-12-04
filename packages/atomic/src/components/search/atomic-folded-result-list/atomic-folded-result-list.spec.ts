import {
  buildFoldedResultList,
  buildInteractiveResult,
  buildResultsPerPage,
  buildTabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {
  buildFakeFoldedCollection,
  buildFakeFoldedResultList,
} from '@/vitest-utils/testing-helpers/fixtures/headless/search/folded-result-list-controller';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {buildFakeResultsPerPage} from '@/vitest-utils/testing-helpers/fixtures/headless/search/results-per-page-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {AtomicFoldedResultList} from './atomic-folded-result-list';
import './atomic-folded-result-list';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
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

  const mockResultsWithCount = (count: number) => {
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

  interface SetupElementOptions {
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

  const setupElement = async ({
    density = 'normal',
    imageSize = 'icon',
    tabsIncluded = [],
    tabsExcluded = [],
    collectionField = '',
    parentField = '',
    childField = '',
    numberOfFoldedResults = 2,
    isAppLoaded = true,
  }: SetupElementOptions = {}) => {
    const {element} =
      await renderInAtomicSearchInterface<AtomicFoldedResultList>({
        template: html`<atomic-folded-result-list
          .density=${density}
          .imageSize=${imageSize}
          .tabsIncluded=${tabsIncluded}
          .tabsExcluded=${tabsExcluded}
          .collectionField=${collectionField}
          .parentField=${parentField}
          .childField=${childField}
          .numberOfFoldedResults=${numberOfFoldedResults}
        >
          <atomic-result-template
            .conditions=${[]}
            .mustMatch=${{}}
            .mustNotMatch=${{}}
          >
            <slot>
              <template>
                <div>Result Content</div>
              </template>
            </slot>
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

    return element;
  };

  // #initialize =======================================================================================================

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicFoldedResultList);
  });

  it('should call buildFoldedResultList with engine and options', async () => {
    await setupElement({
      collectionField: 'myCollectionField',
      parentField: 'myParentField',
      childField: 'myChildField',
      numberOfFoldedResults: 5,
    });

    expect(vi.mocked(buildFoldedResultList)).toHaveBeenCalledWith(
      mockedEngine,
      {
        options: {
          folding: {
            collectionField: 'myCollectionField',
            parentField: 'myParentField',
            childField: 'myChildField',
            numberOfFoldedResults: 5,
          },
        },
      }
    );
  });

  it('should call buildResultsPerPage with engine', async () => {
    await setupElement();

    expect(vi.mocked(buildResultsPerPage)).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildTabManager with engine', async () => {
    await setupElement();

    expect(vi.mocked(buildTabManager)).toHaveBeenCalledWith(mockedEngine);
  });

  // #props validation ================================================================================================

  // TODO V4: KIT-5197 - Add validation tests when prop validation behavior is finalized
  it('should not throw when all props are valid', async () => {
    const element = await setupElement({
      density: 'normal',
      imageSize: 'icon',
    });

    expect(element.error).toBeUndefined();
  });

  // #render ===========================================================================================================

  describe('#render', () => {
    it('should render result-list part', async () => {
      mockResultsWithCount(3);
      const element = await setupElement();
      await element.updateComplete;

      const resultList = element.shadowRoot?.querySelector(
        '[part="result-list"]'
      );
      expect(resultList).toBeTruthy();
    });

    it('should render atomic-result for each folded collection', async () => {
      mockResultsWithCount(3);
      const element = await setupElement();
      await element.updateComplete;

      const results = element.shadowRoot?.querySelectorAll('atomic-result');
      expect(results?.length).toBe(3);
    });

    it('should render atomic-result with outline part', async () => {
      mockResultsWithCount(1);
      const element = await setupElement();
      await element.updateComplete;

      const result = element.shadowRoot?.querySelector(
        'atomic-result[part="outline"]'
      );
      expect(result).toBeTruthy();
    });
  });

  // #setRenderFunction ================================================================================================

  describe('#setRenderFunction', () => {
    it('should set the rendering function', async () => {
      const element = await setupElement();
      const mockRenderFunction = vi.fn();

      await element.setRenderFunction(mockRenderFunction);

      // The function should be stored and used during rendering
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for test
      expect((element as any).itemRenderingFunction).toBe(mockRenderFunction);
    });
  });

  // #event listeners ==================================================================================================

  describe('event listeners', () => {
    it('should handle atomic/resolveFoldedResultList event', async () => {
      const element = await setupElement();
      await element.updateComplete;

      const mockCallback = vi.fn();
      const event = new CustomEvent('atomic/resolveFoldedResultList', {
        bubbles: true,
        cancelable: true,
        detail: mockCallback,
      });

      element.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith(element.foldedResultList);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should handle atomic/loadCollection event', async () => {
      const element = await setupElement();
      await element.updateComplete;

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
      expect(event.defaultPrevented).toBe(true);
    });
  });

  // #tab filtering ====================================================================================================

  describe('tab filtering', () => {
    it('should render when no tabs are specified', async () => {
      mockResultsWithCount(1);
      const element = await setupElement({
        tabsIncluded: [],
        tabsExcluded: [],
      });
      await element.updateComplete;

      const resultList = element.shadowRoot?.querySelector(
        '[part="result-list"]'
      );
      expect(resultList).toBeTruthy();
    });
  });

  // #folding configuration =============================================================================================

  describe('folding configuration', () => {
    it('should pass folding options to buildFoldedResultList', async () => {
      await setupElement({
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

    it('should use default numberOfFoldedResults when not specified', async () => {
      await setupElement({});

      expect(vi.mocked(buildFoldedResultList)).toHaveBeenCalledWith(
        mockedEngine,
        {
          options: {
            folding: {
              collectionField: '',
              parentField: '',
              childField: '',
              numberOfFoldedResults: 2,
            },
          },
        }
      );
    });
  });
});

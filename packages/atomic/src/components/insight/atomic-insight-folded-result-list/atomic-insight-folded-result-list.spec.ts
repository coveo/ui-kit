import {
  buildFoldedResultList as buildInsightFoldedResultList,
  buildInteractiveResult as buildInsightInteractiveResult,
  buildResultsPerPage as buildInsightResultsPerPage,
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
import {buildMockInsightFoldedResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-result-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {AtomicInsightFoldedResultList} from './atomic-insight-folded-result-list';
import './atomic-insight-folded-result-list';
import '../atomic-insight-result-template/atomic-insight-result-template';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});
vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-folded-result-list', () => {
  const interactiveResult = vi.fn();
  const mockedEngine = buildFakeInsightEngine();

  const buildFakeInsightFoldedResultList = ({
    state = {},
  }: {
    state?: Record<string, unknown>;
  } = {}) => ({
    state: {
      results: [],
      isLoading: false,
      hasError: false,
      hasResults: true,
      firstSearchExecuted: true,
      searchResponseId: 'mock-search-response-id',
      ...state,
    },
    subscribe: vi.fn((listener: () => void) => {
      listener();
      return () => {};
    }),
    loadCollection: vi.fn(),
    logShowMoreFoldedResults: vi.fn(),
    logShowLessFoldedResults: vi.fn(),
  });

  const buildFakeInsightResultsPerPage = (
    overrides: {numberOfResults?: number} = {}
  ) => ({
    state: {
      numberOfResults: overrides.numberOfResults ?? 10,
    },
    subscribe: vi.fn((listener: () => void) => {
      listener();
      return () => {};
    }),
    set: vi.fn(),
  });

  beforeEach(() => {
    vi.mocked(buildInsightFoldedResultList).mockReturnValue(
      buildFakeInsightFoldedResultList({
        state: {
          results: [buildMockInsightFoldedResult()],
        },
      }) as ReturnType<typeof buildInsightFoldedResultList>
    );
    vi.mocked(buildInsightResultsPerPage).mockReturnValue(
      buildFakeInsightResultsPerPage() as ReturnType<
        typeof buildInsightResultsPerPage
      >
    );

    vi.mocked(buildInsightInteractiveResult).mockImplementation(
      (_engine, props) => {
        return interactiveResult(props);
      }
    );
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
    vi.mocked(buildInsightFoldedResultList).mockReturnValue(
      buildFakeInsightFoldedResultList({
        state: {
          results: Array.from({length: count}, (_, i) =>
            buildMockInsightFoldedResult({uniqueId: i.toString()})
          ),
        },
      }) as ReturnType<typeof buildInsightFoldedResultList>
    );
  };

  it('should initialize', async () => {
    const {element} = await renderFoldedResultList();

    expect(element).toBeInstanceOf(AtomicInsightFoldedResultList);
  });

  describe('#initialize', () => {
    it('should call buildFoldedResultList with engine and default options', async () => {
      await renderFoldedResultList();

      expect(vi.mocked(buildInsightFoldedResultList)).toHaveBeenCalledWith(
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

      expect(vi.mocked(buildInsightFoldedResultList)).toHaveBeenCalledWith(
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

      expect(vi.mocked(buildInsightResultsPerPage)).toHaveBeenCalledWith(
        mockedEngine
      );
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
      const {element} = await renderFoldedResultList();

      const results = element.shadowRoot?.querySelectorAll(
        'atomic-insight-result'
      );
      expect(results?.length).toBe(3);
    });

    it('should render atomic-insight-result with outline part', async () => {
      mockFoldedCollections(1);
      const {element} = await renderFoldedResultList();

      const result = element.shadowRoot?.querySelector(
        'atomic-insight-result[part="outline"]'
      );
      expect(result).toBeTruthy();
      await expect.element(page.elementLocator(result!)).toBeInTheDocument();
    });
  });

  describe('#render when app is not loaded', () => {
    it('should render placeholders', async () => {
      const numberOfPlaceholders = 4;
      vi.mocked(buildInsightResultsPerPage).mockReturnValue(
        buildFakeInsightResultsPerPage({
          numberOfResults: numberOfPlaceholders,
        }) as ReturnType<typeof buildInsightResultsPerPage>
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
      const mockCollection = buildMockInsightFoldedResult();

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
      const mockCollection = buildMockInsightFoldedResult();

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
      vi.mocked(buildInsightFoldedResultList).mockReturnValue(
        buildFakeInsightFoldedResultList({
          state: {
            results: [],
            hasResults: false,
          },
        }) as ReturnType<typeof buildInsightFoldedResultList>
      );

      const {element} = await renderFoldedResultList();

      const renderedElements = element.shadowRoot?.querySelectorAll('*');
      expect(renderedElements).toHaveLength(0);
    });
  });

  describe('when controller has error', () => {
    it('should not render', async () => {
      vi.mocked(buildInsightFoldedResultList).mockReturnValue(
        buildFakeInsightFoldedResultList({
          state: {
            hasError: true,
          },
        }) as ReturnType<typeof buildInsightFoldedResultList>
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
});

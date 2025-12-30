import {
  buildInteractiveResult as buildInsightInteractiveResult,
  buildResultList as buildInsightResultList,
  buildResultsPerPage as buildInsightResultsPerPage,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeInsightResult} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/result';
import {buildFakeInsightResultList} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/result-list-controller';
import {buildFakeInsightResultsPerPage} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/results-per-page-controller';
import {AtomicInsightResultList} from './atomic-insight-result-list';
import './atomic-insight-result-list';
import '@/src/components/insight/result-templates/atomic-insight-result-template/atomic-insight-result-template';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});
vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-result-list', () => {
  const interactiveResult = vi.fn();
  const mockedEngine = buildFakeInsightEngine();

  beforeEach(() => {
    vi.mocked(buildInsightResultList).mockReturnValue(
      buildFakeInsightResultList({
        state: {
          results: Array.from({length: 1}, (_, i) =>
            buildFakeInsightResult({uniqueId: i.toString()})
          ),
        },
      })
    );
    vi.mocked(buildInsightResultsPerPage).mockReturnValue(
      buildFakeInsightResultsPerPage()
    );

    vi.mocked(buildInsightInteractiveResult).mockImplementation(
      (_engine, props) => {
        return interactiveResult(props);
      }
    );
  });

  const mockResultsWithCount = (count: number) => {
    vi.mocked(buildInsightResultList).mockReturnValue(
      buildFakeInsightResultList({
        state: {
          results: Array.from({length: count}, (_, i) =>
            buildFakeInsightResult({uniqueId: i.toString()})
          ),
        },
      })
    );
  };

  // #initialize =======================================================================================================

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicInsightResultList);
  });

  // #controller integration ============================================================================================

  describe('when initialized', () => {
    it('should call buildInsightResultList with the engine', async () => {
      await setupElement();

      expect(buildInsightResultList).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            fieldsToInclude: undefined,
          }),
        })
      );
    });

    it('should call buildInsightResultsPerPage with the engine', async () => {
      await setupElement();

      expect(buildInsightResultsPerPage).toHaveBeenCalledWith(mockedEngine);
    });
  });

  // #rendering =========================================================================================================

  describe('#render', () => {
    describe('when no results', () => {
      it('should not render results container', async () => {
        vi.mocked(buildInsightResultList).mockReturnValue(
          buildFakeInsightResultList({
            state: {
              results: [],
              hasResults: false,
              firstSearchExecuted: true,
            },
          })
        );

        const element = await setupElement();
        const resultList = element.shadowRoot?.querySelector(
          '[part="result-list"]'
        );

        expect(resultList).toBeNull();
      });
    });

    describe('when results exist', () => {
      it('should render results container', async () => {
        mockResultsWithCount(3);
        const element = await setupElement();

        const resultList = element.shadowRoot?.querySelector(
          '[part="result-list"]'
        );

        expect(resultList).toBeDefined();
      });

      it('should render correct number of atomic-insight-result elements', async () => {
        mockResultsWithCount(3);
        const element = await setupElement();

        const results = element.shadowRoot?.querySelectorAll(
          'atomic-insight-result'
        );

        expect(results?.length).toBe(3);
      });

      it('should render results with outline part', async () => {
        mockResultsWithCount(2);
        const element = await setupElement();

        const results = element.shadowRoot?.querySelectorAll(
          'atomic-insight-result[part*="outline"]'
        );

        expect(results?.length).toBe(2);
      });
    });

    describe('when app is loading', () => {
      it('should render placeholders', async () => {
        vi.mocked(buildInsightResultsPerPage).mockReturnValue(
          buildFakeInsightResultsPerPage({
            state: {numberOfResults: 5},
          })
        );

        const element = await setupElement({isAppLoaded: false});

        const placeholders = element.shadowRoot?.querySelectorAll(
          'atomic-result-placeholder'
        );

        expect(placeholders?.length).toBe(5);
      });

      it('should hide results while showing placeholders', async () => {
        mockResultsWithCount(3);
        const element = await setupElement({isAppLoaded: false});

        const resultList =
          element.shadowRoot?.querySelector('.list-root.hidden');

        expect(resultList).toBeDefined();
      });
    });
  });

  // #atomic-insight-result props =======================================================================================

  describe('#atomic-insight-result props', () => {
    it('should pass correct #density', async () => {
      const element = await setupElement({density: 'comfortable'});

      const atomicResultElement = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );

      expect(atomicResultElement?.density).toBe('comfortable');
    });

    it('should pass correct #display', async () => {
      const element = await setupElement();

      const atomicResultElement = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );

      expect(atomicResultElement?.display).toBe('list');
    });

    it('should pass correct #imageSize', async () => {
      const element = await setupElement({imageSize: 'large'});

      const atomicResultElement = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );

      expect(atomicResultElement?.imageSize).toBe('large');
    });

    it('should pass #interactiveResult', async () => {
      const mockResult = buildFakeInsightResult({uniqueId: '123'});

      vi.mocked(buildInsightResultList).mockReturnValue(
        buildFakeInsightResultList({
          state: {
            results: [mockResult],
          },
        })
      );

      await setupElement();

      expect(interactiveResult).toHaveBeenCalledWith({
        options: {result: mockResult},
      });
    });

    it('should pass correct #loadingFlag', async () => {
      const element = await setupElement();

      const atomicResultElement = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );

      expect(atomicResultElement?.loadingFlag).toBe(
        // biome-ignore lint/suspicious/noExplicitAny: testing private property
        (element as any).loadingFlag
      );
    });

    it('should pass correct #result', async () => {
      const mockResult1 = buildFakeInsightResult({uniqueId: '123'});
      const mockResult2 = buildFakeInsightResult({uniqueId: '456'});

      vi.mocked(buildInsightResultList).mockReturnValue(
        buildFakeInsightResultList({
          state: {
            results: [mockResult1, mockResult2],
          },
        })
      );

      const element = await setupElement();

      const atomicResultElements = element.shadowRoot?.querySelectorAll(
        'atomic-insight-result'
      );

      expect(atomicResultElements?.[0].result).toBe(mockResult1);
      expect(atomicResultElements?.[1].result).toBe(mockResult2);
    });

    it('should pass correct #store', async () => {
      const element = await setupElement();

      const atomicResultElement = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );

      expect(atomicResultElement?.store).toEqual(element.bindings.store);
    });

    it('should pass template #content', async () => {
      const mockResult = buildFakeInsightResult({uniqueId: '123'});

      vi.mocked(buildInsightResultList).mockReturnValue(
        buildFakeInsightResultList({
          state: {
            results: [mockResult],
          },
        })
      );

      const element = await setupElement();

      const mockTemplate = document.createDocumentFragment();
      mockTemplate.appendChild(document.createElement('div'));

      vi.spyOn(
        // biome-ignore lint/suspicious/noExplicitAny: mocking private property
        (element as any).resultTemplateProvider,
        'getTemplateContent'
      ).mockReturnValue(mockTemplate);

      element.requestUpdate();
      await element.updateComplete;

      const atomicResultElement = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );

      expect(atomicResultElement?.content).toBe(mockTemplate);
    });
  });

  // #setRenderFunction =================================================================================================

  describe('#setRenderFunction', () => {
    it('should set the render function', async () => {
      const element = await setupElement();
      const mockRenderFunction = vi.fn();

      await element.setRenderFunction(mockRenderFunction);

      const atomicResultElement = element.shadowRoot?.querySelector(
        'atomic-insight-result'
      );

      expect(atomicResultElement?.renderingFunction).toBe(mockRenderFunction);
    });
  });

  // #parts =============================================================================================================

  describe('#parts', () => {
    it('should expose result-list part', async () => {
      mockResultsWithCount(2);
      const element = await setupElement();

      const parts = getParts(element);

      expect(parts.resultList?.length).toBe(1);
    });

    it('should expose outline part for each result', async () => {
      mockResultsWithCount(3);
      const element = await setupElement();

      const parts = getParts(element);

      expect(parts.outline?.length).toBe(3);
    });
  });

  // Helper functions ===================================================================================================

  const setupElement = async ({
    density = 'normal',
    imageSize = 'icon',
    isAppLoaded = true,
  }: {
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    isAppLoaded?: boolean;
  } = {}) => {
    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightResultList>({
        template: html`<atomic-insight-result-list
          .density=${density}
          .imageSize=${imageSize}
        >
          <atomic-insight-result-template
            .conditions=${[]}
            .mustMatch=${{}}
            .mustNotMatch=${{}}
          >
            <slot>
              <template>
                <div>Result Content</div>
              </template>
            </slot>
          </atomic-insight-result-template>
        </atomic-insight-result-list>`,
        selector: 'atomic-insight-result-list',
        bindings: (bindings) => {
          bindings.store.state.loadingFlags = isAppLoaded
            ? []
            : ['loading-flag'];
          bindings.engine = mockedEngine;
          bindings.engine.logger = {error: vi.fn()} as never;
          return bindings;
        },
      });

    return element;
  };

  const getParts = (element: AtomicInsightResultList) => {
    const qs = (part: string, exact = true) =>
      element.shadowRoot?.querySelectorAll(
        `[part${exact ? '' : '*'}="${part}"]`
      );

    return {
      outline: qs('outline', false),
      resultList: qs('result-list'),
    };
  };
});

import {loadIPXActionsHistoryActions} from '@coveo/headless';
import {
  buildRecommendationList,
  buildInteractiveResult as buildRecsInteractiveResult,
  loadConfigurationActions,
} from '@coveo/headless/recommendation';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils.js';
import {renderInAtomicRecsInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/recommendation/atomic-recs-interface-fixture.js';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common.js';
import {buildFakeRecommendationList} from '@/vitest-utils/testing-helpers/fixtures/headless/recommendation/recommendation-list-controller.js';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result.js';
import {AtomicIpxRecsList} from './atomic-ipx-recs-list';
import './atomic-ipx-recs-list';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@coveo/headless/recommendation', {spy: true});
vi.mock('@coveo/headless', {spy: true});

describe('atomic-ipx-recs-list', () => {
  const mockIPXActionsHistoryActions = {
    addPageViewEntryInActionsHistory: vi.fn((permanentid: string) => ({
      type: 'addPageViewEntryInActionsHistory',
      permanentid,
    })),
  };

  const mockConfigurationActions = {
    setOriginLevel2: vi.fn((payload: {originLevel2: string}) => ({
      type: 'setOriginLevel2',
      payload,
    })),
  };

  beforeEach(() => {
    vi.mocked(loadIPXActionsHistoryActions).mockReturnValue(
      mockIPXActionsHistoryActions as never
    );
    vi.mocked(loadConfigurationActions).mockReturnValue(
      mockConfigurationActions as never
    );
    vi.mocked(buildRecommendationList).mockImplementation(() =>
      buildFakeRecommendationList({
        state: {
          recommendations: Array.from({length: 3}, (_, i) =>
            buildFakeResult({
              uniqueId: `rec-${i}`,
              raw: {permanentid: `perm-id-${i}`},
            })
          ),
        },
      })
    );
    vi.mocked(buildRecsInteractiveResult).mockImplementation(
      (_engine, {options}) => ({
        select: vi.fn(),
        beginDelayedSelect: vi.fn(),
        cancelPendingSelect: vi.fn(),
        state: {isLoading: false},
        subscribe: genericSubscribe,
        result: options.result,
      })
    );
  });

  describe('initialization', () => {
    it('should initialize', async () => {
      const element = await setupElement();

      expect(element).toBeInstanceOf(AtomicIpxRecsList);
    });

    it('should initialize #recommendationList with buildRecommendationList', async () => {
      const element = await setupElement({recommendation: 'MyRecs'});

      expect(buildRecommendationList).toHaveBeenCalledWith(
        element.bindings.engine,
        {
          options: {
            id: 'MyRecs',
            numberOfRecommendations: 10,
          },
        }
      );
      expect(element.recommendationList).toBeDefined();
    });

    it('should use default recommendation identifier', async () => {
      const element = await setupElement();

      expect(buildRecommendationList).toHaveBeenCalledWith(
        element.bindings.engine,
        {
          options: {
            id: 'Recommendation',
            numberOfRecommendations: 10,
          },
        }
      );
    });

    it('should initialize with custom numberOfRecommendations', async () => {
      const element = await setupElement({numberOfRecommendations: 20});

      expect(buildRecommendationList).toHaveBeenCalledWith(
        element.bindings.engine,
        {
          options: {
            id: 'Recommendation',
            numberOfRecommendations: 20,
          },
        }
      );
    });

    it('should load IPX actions history actions', async () => {
      const element = await setupElement();

      expect(loadIPXActionsHistoryActions).toHaveBeenCalledWith(
        element.bindings.engine
      );
    });

    it('should warn when multiple lists have same recommendation identifier', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const mockEngine = {
        logger: {warn: vi.fn()},
        subscribe: genericSubscribe,
      };

      await setupElement({
        recommendation: 'duplicate-id',
        bindings: (bindings) => ({
          ...bindings,
          engine: mockEngine as never,
        }),
      });

      await setupElement({
        recommendation: 'duplicate-id',
        bindings: (bindings) => ({
          ...bindings,
          engine: mockEngine as never,
        }),
      });

      expect(mockEngine.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'There are multiple atomic-ipx-recs-list in this page with the same recommendation property "duplicate-id"'
        )
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('#numberOfRecommendationsPerPage validation', () => {
    it('should not throw when numberOfRecommendationsPerPage is undefined', async () => {
      await expect(
        setupElement({numberOfRecommendationsPerPage: undefined})
      ).resolves.toBeDefined();
    });

    it('should not throw when numberOfRecommendationsPerPage is valid', async () => {
      await expect(
        setupElement({numberOfRecommendationsPerPage: 5})
      ).resolves.toBeDefined();
    });

    it('should throw when numberOfRecommendationsPerPage is 0', async () => {
      const element = await setupElement({
        numberOfRecommendationsPerPage: 0,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'The "numberOfRecommendationsPerPage" is invalid'
      );
    });

    it('should throw when numberOfRecommendationsPerPage equals numberOfRecommendations', async () => {
      const element = await setupElement({
        numberOfRecommendations: 10,
        numberOfRecommendationsPerPage: 10,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'The "numberOfRecommendationsPerPage" is invalid'
      );
    });

    it('should throw when numberOfRecommendationsPerPage exceeds numberOfRecommendations', async () => {
      const element = await setupElement({
        numberOfRecommendations: 10,
        numberOfRecommendationsPerPage: 15,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'The "numberOfRecommendationsPerPage" is invalid'
      );
    });
  });

  describe('props', () => {
    it('should have default recommendation prop', async () => {
      const element = await setupElement();

      expect(element.recommendation).toBe('Recommendation');
    });

    it('should have default display prop', async () => {
      const element = await setupElement();

      expect(element.display).toBe('list');
    });

    it('should have default density prop', async () => {
      const element = await setupElement();

      expect(element.density).toBe('normal');
    });

    it('should have default imageSize prop', async () => {
      const element = await setupElement();

      expect(element.imageSize).toBe('small');
    });

    it('should have default numberOfRecommendations prop', async () => {
      const element = await setupElement();

      expect(element.numberOfRecommendations).toBe(10);
    });

    it('should have undefined numberOfRecommendationsPerPage by default', async () => {
      const element = await setupElement();

      expect(element.numberOfRecommendationsPerPage).toBeUndefined();
    });

    it('should have undefined label by default', async () => {
      const element = await setupElement();

      expect(element.label).toBeUndefined();
    });

    it('should have default headingLevel prop', async () => {
      const element = await setupElement();

      expect(element.headingLevel).toBe(0);
    });

    it('should accept custom recommendation prop', async () => {
      const element = await setupElement({recommendation: 'CustomRecs'});

      expect(element.recommendation).toBe('CustomRecs');
    });

    it('should accept custom display prop', async () => {
      const element = await setupElement({display: 'grid'});

      expect(element.display).toBe('grid');
    });

    it('should accept custom density prop', async () => {
      const element = await setupElement({density: 'compact'});

      expect(element.density).toBe('compact');
    });

    it('should accept custom imageSize prop', async () => {
      const element = await setupElement({imageSize: 'large'});

      expect(element.imageSize).toBe('large');
    });

    it('should accept custom numberOfRecommendations prop', async () => {
      const element = await setupElement({numberOfRecommendations: 15});

      expect(element.numberOfRecommendations).toBe(15);
    });

    it('should accept custom numberOfRecommendationsPerPage prop', async () => {
      const element = await setupElement({numberOfRecommendationsPerPage: 5});

      expect(element.numberOfRecommendationsPerPage).toBe(5);
    });

    it('should accept custom label prop', async () => {
      const element = await setupElement({label: 'Featured Products'});

      expect(element.label).toBe('Featured Products');
    });

    it('should accept custom headingLevel prop', async () => {
      const element = await setupElement({headingLevel: 2});

      expect(element.headingLevel).toBe(2);
    });
  });

  describe('lifecycle', () => {
    it('should reset currentPage when numberOfRecommendationsPerPage changes', async () => {
      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      await element.nextPage();
      expect(element['currentPage']).toBe(1);

      element.numberOfRecommendationsPerPage = 5;
      await element.updateComplete;

      expect(element['currentPage']).toBe(0);
    });

    it('should cleanup on disconnectedCallback', async () => {
      const element = await setupElement();

      const disconnectedCallbackSpy = vi.spyOn(element, 'disconnectedCallback');

      element.remove();

      expect(disconnectedCallbackSpy).toHaveBeenCalled();
    });
  });

  describe('carousel pagination', () => {
    it('should move to next page', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 9}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      expect(element['currentPage']).toBe(0);

      await element.nextPage();
      expect(element['currentPage']).toBe(1);

      await element.nextPage();
      expect(element['currentPage']).toBe(2);
    });

    it('should wrap to first page when next exceeds number of pages', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 6}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      await element.nextPage();
      expect(element['currentPage']).toBe(1);

      await element.nextPage();
      expect(element['currentPage']).toBe(0);
    });

    it('should move to previous page', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 9}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      await element.nextPage();
      await element.nextPage();
      expect(element['currentPage']).toBe(2);

      await element.previousPage();
      expect(element['currentPage']).toBe(1);
    });

    it('should wrap to last page when previous on first page', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 9}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      expect(element['currentPage']).toBe(0);

      await element.previousPage();
      expect(element['currentPage']).toBe(2);
    });
  });

  describe('IPX actions history integration', () => {
    it('should dispatch addPageViewEntryInActionsHistory on recommendation select', async () => {
      const mockEngine = {
        subscribe: genericSubscribe,
        dispatch: vi.fn(),
      };

      const selectSpy = vi.fn();
      vi.mocked(buildRecsInteractiveResult).mockReturnValue({
        select: selectSpy,
        beginDelayedSelect: vi.fn(),
        cancelPendingSelect: vi.fn(),
        state: {isLoading: false},
        subscribe: genericSubscribe,
        result: buildFakeResult({raw: {permanentid: 'test-permanentid'}}),
      } as never);

      const element = await setupElement({
        bindings: (bindings) => ({
          ...bindings,
          engine: mockEngine as never,
        }),
      });

      await element.updateComplete;

      const atomicRecsResult =
        element.shadowRoot?.querySelector('atomic-recs-result');
      expect(atomicRecsResult).toBeTruthy();

      const interactiveResult = atomicRecsResult!.interactiveResult;
      interactiveResult.select();

      expect(mockEngine.dispatch).toHaveBeenCalledWith({
        type: 'addPageViewEntryInActionsHistory',
        permanentid: 'test-permanentid',
      });
      expect(selectSpy).toHaveBeenCalled();
    });

    it('should not dispatch addPageViewEntryInActionsHistory when permanentid is missing', async () => {
      const mockEngine = {
        subscribe: genericSubscribe,
        dispatch: vi.fn(),
      };

      const selectSpy = vi.fn();
      vi.mocked(buildRecsInteractiveResult).mockReturnValue({
        select: selectSpy,
        beginDelayedSelect: vi.fn(),
        cancelPendingSelect: vi.fn(),
        state: {isLoading: false},
        subscribe: genericSubscribe,
        result: buildFakeResult({raw: {}}),
      } as never);

      const element = await setupElement({
        bindings: (bindings) => ({
          ...bindings,
          engine: mockEngine as never,
        }),
      });

      await element.updateComplete;

      const atomicRecsResult =
        element.shadowRoot?.querySelector('atomic-recs-result');
      expect(atomicRecsResult).toBeTruthy();

      const interactiveResult = atomicRecsResult!.interactiveResult;
      interactiveResult.select();

      expect(mockEngine.dispatch).not.toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('label and heading', () => {
    it('should dispatch setOriginLevel2 when label is provided', async () => {
      const mockEngine = {
        subscribe: genericSubscribe,
        dispatch: vi.fn(),
      };

      await setupElement({
        label: 'My Recommendations',
        bindings: (bindings) => ({
          ...bindings,
          engine: mockEngine as never,
        }),
      });

      expect(mockEngine.dispatch).toHaveBeenCalledWith({
        type: 'setOriginLevel2',
        payload: {originLevel2: 'My Recommendations'},
      });
    });

    it('should not dispatch setOriginLevel2 when label is not provided', async () => {
      const mockEngine = {
        subscribe: genericSubscribe,
        dispatch: vi.fn(),
      };

      await setupElement({
        bindings: (bindings) => ({
          ...bindings,
          engine: mockEngine as never,
        }),
      });

      expect(mockEngine.dispatch).not.toHaveBeenCalled();
    });

    it('should render heading when label is provided', async () => {
      const element = await setupElement({label: 'Featured Items'});

      const parts = getParts(element);
      const label = parts.label?.item(0);

      expect(label).toBeTruthy();
      await expect.element(page.elementLocator(label!)).toBeInTheDocument();
    });

    it('should not render heading when label is not provided', async () => {
      const element = await setupElement();

      const parts = getParts(element);
      const label = parts.label?.item(0);

      expect(label).toBeFalsy();
    });
  });

  describe('rendering', () => {
    it('should not render when bindings are undefined', async () => {
      const element = await setupElement();

      // @ts-expect-error - unsetting bindings for the sake of testing
      element.bindings = undefined;
      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');
      expect(renderedElements).toHaveLength(0);
    });

    it('should not render when there is an error', async () => {
      const element = await setupElement();

      element.error = new Error('Test error');
      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');
      expect(renderedElements).toHaveLength(1);
    });

    it('should not render when no template is registered', async () => {
      const element = await setupElement();

      // @ts-expect-error - setting private property for testing
      element.resultTemplateRegistered = false;
      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');
      expect(renderedElements).toHaveLength(0);
    });

    it('should not render when first request was executed and there are no recommendations', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: [],
            searchResponseId: 'response-id',
          },
        })
      );

      const element = await setupElement();

      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');
      expect(renderedElements).toHaveLength(0);
    });

    it('should render slot when template has error', async () => {
      const element = await setupElement();

      // @ts-expect-error - setting private property for testing
      element.templateHasError = true;
      await element.updateComplete;

      const slot = element.shadowRoot?.querySelector('slot');
      expect(slot).toBeTruthy();
    });

    it('should render correct number of atomic-recs-result elements', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 5}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );

      const element = await setupElement();

      await element.updateComplete;

      const recsResults =
        element.shadowRoot?.querySelectorAll('atomic-recs-result');
      expect(recsResults).toHaveLength(5);
    });

    it('should render carousel when numberOfRecommendationsPerPage is set', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 9}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      await element.updateComplete;

      const parts = getParts(element);
      expect(parts.previousButton?.item(0)).toBeTruthy();
      expect(parts.nextButton?.item(0)).toBeTruthy();
      expect(parts.indicators?.item(0)).toBeTruthy();
    });

    it('should not render carousel when numberOfRecommendationsPerPage is not set', async () => {
      const element = await setupElement();

      await element.updateComplete;

      const parts = getParts(element);
      expect(parts.previousButton?.item(0)).toBeFalsy();
      expect(parts.nextButton?.item(0)).toBeFalsy();
    });

    describe.each<{display: ItemDisplayBasicLayout}>([
      {display: 'list'},
      {display: 'grid'},
    ])('when display is $display', ({display}) => {
      it('should render with correct display classes', async () => {
        const element = await setupElement({display});

        await element.updateComplete;

        const listWrapper = element.shadowRoot?.querySelector('.list-wrapper');
        expect(listWrapper?.classList.contains('display-grid')).toBe(true);
      });

      describe.each<{density: ItemDisplayDensity}>([
        {density: 'comfortable'},
        {density: 'compact'},
        {density: 'normal'},
      ])('when density is $density', ({density}) => {
        it('should render with correct density class', async () => {
          const element = await setupElement({display, density});

          await element.updateComplete;

          const listWrapper =
            element.shadowRoot?.querySelector('.list-wrapper');
          expect(listWrapper?.classList.contains(`density-${density}`)).toBe(
            true
          );
        });
      });

      describe.each<{imageSize: ItemDisplayImageSize}>([
        {imageSize: 'icon'},
        {imageSize: 'large'},
        {imageSize: 'none'},
        {imageSize: 'small'},
      ])('when imageSize is $imageSize', ({imageSize}) => {
        it('should render with correct image size class', async () => {
          const element = await setupElement({display, imageSize});

          await element.updateComplete;

          const listWrapper =
            element.shadowRoot?.querySelector('.list-wrapper');
          expect(listWrapper?.classList.contains(`image-${imageSize}`)).toBe(
            true
          );
        });
      });
    });

    it('should render result-list part', async () => {
      const element = await setupElement();

      const parts = getParts(element);
      const resultList = parts.resultList?.item(0);

      expect(resultList).toBeTruthy();
      await expect
        .element(page.elementLocator(resultList!))
        .toBeInTheDocument();
    });

    it('should render placeholders when not all results are ready', async () => {
      const element = await setupElement({isAppLoaded: false});

      await element.updateComplete;

      const placeholders = element.shadowRoot?.querySelectorAll(
        '.placeholder-result'
      );
      expect(placeholders!.length).toBeGreaterThan(0);
    });

    it('should render grid layout', async () => {
      const element = await setupElement();

      await element.updateComplete;

      const parts = getParts(element);
      expect(parts.resultListGridClickableContainer).toBeTruthy();
    });

    it('should render carousel parts when pagination is enabled', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 6}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      await element.updateComplete;

      const parts = getParts(element);

      expect(parts.previousButton?.item(0)).toHaveAttribute(
        'part',
        'previous-button'
      );
      expect(parts.nextButton?.item(0)).toHaveAttribute('part', 'next-button');
      expect(parts.indicators?.item(0)).toHaveAttribute('part', 'indicators');
      expect(parts.indicator?.item(0)).toHaveAttribute('part', 'indicator');
    });
  });

  describe('template registration', () => {
    it('should initialize ResultTemplateProvider', async () => {
      const element = await setupElement();

      // @ts-expect-error - accessing private property for testing
      expect(element.itemTemplateProvider).toBeDefined();
    });

    it('should query for atomic-recs-result-template elements', async () => {
      const {atomicInterface} = await renderInAtomicRecsInterface({
        template: html`
          <atomic-ipx-recs-list>
            <atomic-recs-result-template></atomic-recs-result-template>
          </atomic-ipx-recs-list>
        `,
        selector: 'atomic-ipx-recs-list',
        bindings: (bindings) => ({
          ...bindings,
          engine: {
            subscribe: genericSubscribe,
          } as never,
        }),
      });

      const element = atomicInterface.querySelector('atomic-ipx-recs-list')!;
      await element.updateComplete;

      const templates = element.querySelectorAll('atomic-recs-result-template');
      expect(templates.length).toBe(1);
    });
  });
});

const setupElement = async ({
  recommendation = 'Recommendation',
  display = 'list',
  density = 'normal',
  imageSize = 'small',
  numberOfRecommendations = 10,
  numberOfRecommendationsPerPage,
  label,
  headingLevel = 0,
  isAppLoaded = true,
  bindings,
}: {
  recommendation?: string;
  display?: ItemDisplayBasicLayout;
  density?: ItemDisplayDensity;
  imageSize?: ItemDisplayImageSize;
  numberOfRecommendations?: number;
  numberOfRecommendationsPerPage?: number;
  label?: string;
  headingLevel?: number;
  isAppLoaded?: boolean;
  bindings?: (bindings: typeof defaultBindings) => typeof defaultBindings;
} = {}) => {
  const defaultBindings = {
    engine: {
      subscribe: genericSubscribe,
      logger: {warn: vi.fn()},
    } as never,
    store: {
      state: {
        loadingFlags: isAppLoaded ? [] : ['loading-flag'],
      },
      setLoadingFlag: vi.fn(),
      unsetLoadingFlag: vi.fn(),
    } as never,
  };

  const {element} = await renderInAtomicRecsInterface<AtomicIpxRecsList>({
    template: html`<atomic-ipx-recs-list
      .recommendation=${recommendation}
      .display=${display}
      .density=${density}
      .imageSize=${imageSize}
      .numberOfRecommendations=${numberOfRecommendations}
      .numberOfRecommendationsPerPage=${numberOfRecommendationsPerPage}
      .label=${label}
      .headingLevel=${headingLevel}
    ></atomic-ipx-recs-list>`,
    selector: 'atomic-ipx-recs-list',
    bindings: bindings ? bindings(defaultBindings) : defaultBindings,
  });

  await element.updateComplete;
  return element;
};

const getParts = (element: AtomicIpxRecsList) => {
  const qs = (part: string, exact = true) =>
    element.shadowRoot?.querySelectorAll(`[part${exact ? '' : '*'}="${part}"]`);

  return {
    resultList: qs('result-list'),
    resultListGridClickableContainer: qs(
      'result-list-grid-clickable-container',
      false
    ),
    label: qs('label'),
    previousButton: qs('previous-button'),
    nextButton: qs('next-button'),
    indicators: qs('indicators'),
    indicator: qs('indicator'),
    activeIndicator: qs('active-indicator', false),
  };
};

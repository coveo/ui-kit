import {loadIPXActionsHistoryActions} from '@coveo/headless';
import {
  buildRecommendationList,
  buildInteractiveResult as buildRecsInteractiveResult,
  loadConfigurationActions,
} from '@coveo/headless/recommendation';
import {html, LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicRecsInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/recommendation/atomic-recs-interface-fixture';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import {buildFakeRecommendationList} from '@/vitest-utils/testing-helpers/fixtures/headless/recommendation/recommendation-list-controller';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
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

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicIpxRecsList);
  });

  describe('#initialize', () => {
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

    it('should use default recommendation identifier when not specified', async () => {
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
  });

  describe('when multiple lists have same recommendation identifier', () => {
    it('should warn', async () => {
      const mockEngine = {
        logger: {warn: vi.fn()},
        subscribe: genericSubscribe,
        addReducers: vi.fn(),
        dispatch: vi.fn(),
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

    it('should set error when numberOfRecommendationsPerPage is 0', async () => {
      const element = await setupElement({
        numberOfRecommendationsPerPage: 0,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'The "numberOfRecommendationsPerPage" is invalid'
      );
    });

    it('should set error when numberOfRecommendationsPerPage equals numberOfRecommendations', async () => {
      const element = await setupElement({
        numberOfRecommendations: 10,
        numberOfRecommendationsPerPage: 10,
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'The "numberOfRecommendationsPerPage" is invalid'
      );
    });

    it('should set error when numberOfRecommendationsPerPage exceeds numberOfRecommendations', async () => {
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

  describe('#updated', () => {
    it('should reset currentPage when numberOfRecommendationsPerPage changes', async () => {
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
      expect(element['currentPage']).toBe(1);

      element.numberOfRecommendationsPerPage = 2;
      await element.updateComplete;

      expect(element['currentPage']).toBe(0);
    });

    it('should call super.disconnectedCallback', async () => {
      const element = await setupElement();
      const superSpy = vi.spyOn(LitElement.prototype, 'disconnectedCallback');

      element.disconnectedCallback();

      expect(superSpy).toHaveBeenCalledOnce();
    });
  });

  describe('carousel pagination', () => {
    beforeEach(() => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 9}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
          },
        })
      );
    });

    it('should move to next page', async () => {
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
      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      await element.nextPage();
      await element.nextPage();
      expect(element['currentPage']).toBe(2);

      await element.previousPage();
      expect(element['currentPage']).toBe(1);
    });

    it('should wrap to last page when previous on first page', async () => {
      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      expect(element['currentPage']).toBe(0);

      await element.previousPage();
      expect(element['currentPage']).toBe(2);
    });
  });

  describe('IPX actions history integration', () => {
    it('should dispatch addPageViewEntryInActionsHistory on recommendation select', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: [
              buildFakeResult({
                uniqueId: 'rec-0',
                raw: {permanentid: 'test-permanentid'},
              }),
            ],
          },
        })
      );

      mockIPXActionsHistoryActions.addPageViewEntryInActionsHistory.mockClear();

      const element = await setupElement();
      await element.updateComplete;

      const atomicRecsResult =
        element.shadowRoot?.querySelector('atomic-recs-result');
      expect(atomicRecsResult).toBeTruthy();

      const interactiveResult = atomicRecsResult!.interactiveResult;
      interactiveResult.select();

      expect(
        mockIPXActionsHistoryActions.addPageViewEntryInActionsHistory
      ).toHaveBeenCalledWith('test-permanentid');
    });

    it('should not dispatch addPageViewEntryInActionsHistory when permanentid is missing', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: [
              buildFakeResult({
                uniqueId: 'rec-0',
                raw: {},
              }),
            ],
          },
        })
      );

      mockIPXActionsHistoryActions.addPageViewEntryInActionsHistory.mockClear();

      const element = await setupElement();
      await element.updateComplete;

      const atomicRecsResult =
        element.shadowRoot?.querySelector('atomic-recs-result');
      expect(atomicRecsResult).toBeTruthy();

      const interactiveResult = atomicRecsResult!.interactiveResult;
      interactiveResult.select();

      expect(
        mockIPXActionsHistoryActions.addPageViewEntryInActionsHistory
      ).not.toHaveBeenCalled();
    });
  });

  describe('label and heading', () => {
    it('should dispatch setOriginLevel2 when label is provided', async () => {
      mockConfigurationActions.setOriginLevel2.mockClear();

      await setupElement({label: 'My Recommendations'});

      expect(mockConfigurationActions.setOriginLevel2).toHaveBeenCalledWith({
        originLevel2: 'My Recommendations',
      });
    });

    it('should not dispatch setOriginLevel2 when label is not provided', async () => {
      mockConfigurationActions.setOriginLevel2.mockClear();

      await setupElement();

      expect(mockConfigurationActions.setOriginLevel2).not.toHaveBeenCalled();
    });

    it('should render heading when label is provided', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 3}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
            searchResponseId: 'response-id',
          },
        })
      );

      const element = await setupElement({label: 'Featured Items'});
      await element.updateComplete;

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

    it('should render placeholders when results are not ready', async () => {
      vi.mocked(buildRecommendationList).mockImplementation(() =>
        buildFakeRecommendationList({
          state: {
            recommendations: Array.from({length: 3}, (_, i) =>
              buildFakeResult({uniqueId: `rec-${i}`})
            ),
            isLoading: true,
          },
        })
      );

      const element = await setupElement();
      await element.updateComplete;

      const placeholders = element.shadowRoot?.querySelectorAll(
        'atomic-result-placeholder'
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

      const element = atomicInterface.querySelector(
        'atomic-ipx-recs-list'
      ) as unknown as AtomicIpxRecsList;
      await element.updateComplete;

      const templates = element.querySelectorAll('atomic-recs-result-template');
      expect(templates.length).toBe(1);
    });
  });
});

const createDefaultBindings = (isAppLoaded: boolean) => ({
  engine: {
    subscribe: genericSubscribe,
    logger: {warn: vi.fn()},
    addReducers: vi.fn(),
    dispatch: vi.fn(),
  } as never,
  store: {
    state: {
      loadingFlags: isAppLoaded ? [] : ['loading-flag'],
    },
    setLoadingFlag: vi.fn(),
    unsetLoadingFlag: vi.fn(),
    onChange: vi.fn(),
  } as never,
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
  bindings?: (
    bindings: ReturnType<typeof createDefaultBindings>
  ) => ReturnType<typeof createDefaultBindings>;
} = {}) => {
  const defaultBindings = createDefaultBindings(isAppLoaded);

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

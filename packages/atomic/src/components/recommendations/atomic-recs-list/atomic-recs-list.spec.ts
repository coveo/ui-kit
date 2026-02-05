import {
  buildRecommendationList,
  buildInteractiveResult as buildRecsInteractiveResult,
  type InteractiveResult,
} from '@coveo/headless/recommendation';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicRecsInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/recommendation/atomic-recs-interface-fixture';
import {buildFakeRecommendationList} from '@/vitest-utils/testing-helpers/fixtures/headless/recommendation/recommendation-list-controller';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicRecsList} from './atomic-recs-list';
import './atomic-recs-list';
import '../atomic-recs-result-template/atomic-recs-result-template';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});
vi.mock('@coveo/headless/recommendation', {spy: true});

describe('atomic-recs-list', () => {
  const interactiveResult = vi.fn();

  beforeEach(() => {
    vi.mocked(buildRecommendationList).mockReturnValue(
      buildFakeRecommendationList({
        state: {
          recommendations: Array.from({length: 1}, (_, i) =>
            buildFakeResult({uniqueId: i.toString()})
          ),
          searchResponseId: 'test-response-id',
        },
      })
    );

    vi.mocked(buildRecsInteractiveResult).mockImplementation(
      (_engine, props) => {
        return interactiveResult(props);
      }
    );
  });

  const mockRecommendationsWithCount = (count: number) => {
    vi.mocked(buildRecommendationList).mockReturnValue(
      buildFakeRecommendationList({
        state: {
          recommendations: Array.from({length: count}, (_, i) =>
            buildFakeResult({uniqueId: i.toString()})
          ),
          searchResponseId: 'test-response-id',
        },
      })
    );
  };

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicRecsList);
  });

  // TODO V4: KIT-5197 - Remove skip
  it.skip.each<{
    prop: 'density' | 'display' | 'imageSize';
    invalidValue: string | number;
  }>([
    {
      prop: 'density',
      invalidValue: 'invalid',
    },
    {
      prop: 'display',
      invalidValue: 'invalid',
    },
    {
      prop: 'imageSize',
      invalidValue: 'invalid',
    },
  ])(
    'should set error when #$prop is invalid',
    async ({prop, invalidValue}) => {
      const element = await setupElement();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );

  // TODO V4: KIT-5197 - Remove this test
  it.each<{
    prop: 'density' | 'display' | 'imageSize';
    validValue:
      | ItemDisplayDensity
      | ItemDisplayBasicLayout
      | ItemDisplayImageSize;
    invalidValue: string | number;
  }>([
    {
      prop: 'density',
      validValue: 'normal',
      invalidValue: 'invalid',
    },
    {
      prop: 'display',
      validValue: 'list',
      invalidValue: 'invalid',
    },
    {
      prop: 'imageSize',
      validValue: 'small',
      invalidValue: 'invalid',
    },
  ])(
    'should log validation warning when #$prop is updated to invalid value',
    async ({prop, validValue, invalidValue}) => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const element = await setupElement({[prop]: validValue});

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Prop validation failed for component atomic-recs-list'
        ),
        element
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(prop),
        element
      );

      consoleWarnSpy.mockRestore();
    }
  );

  describe('#willUpdate', () => {
    // biome-ignore lint/suspicious/noExplicitAny: accessing private properties in tests
    let element: any;

    beforeEach(async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      element = await setupElement();
      element.isEveryResultReady = true;
    });

    it.each([
      {
        description:
          'should set #isEveryResultReady to false when transitioning from not loading to loading',
        oldState: false,
        newState: true,
        expectedResult: false,
      },
      {
        description:
          'should not change #isEveryResultReady when transitioning from loading to not loading',
        oldState: true,
        newState: false,
        expectedResult: true,
      },
      {
        description:
          'should not change #isEveryResultReady when staying in loading state',
        oldState: true,
        newState: true,
        expectedResult: true,
      },
      {
        description:
          'should not change #isEveryResultReady when staying in not loading state',
        oldState: false,
        newState: false,
        expectedResult: true,
      },
    ])('$description', ({oldState, newState, expectedResult}) => {
      element.recommendationListState = {
        isLoading: newState,
        recommendations: [buildFakeResult()],
        searchResponseId: 'test-response-id',
      };
      element.willUpdate(
        new Map([['recommendationListState', {isLoading: oldState}]])
      );

      expect(element.isEveryResultReady).toBe(expectedResult);
    });
  });

  it('should not render when bindings are undefined', async () => {
    const element = await setupElement();

    // @ts-expect-error - unsetting bindings for the sake of simplicity.
    element.bindings = undefined;

    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when there is an error', async () => {
    vi.mocked(buildRecommendationList).mockReturnValue(
      buildFakeRecommendationList({state: {error: {message: 'Test error'}}})
    );

    const element = await setupElement();

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when no template is registered', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property: mocking the template provider would be complex.
    element.resultTemplateRegistered = false;

    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  describe('when app is loaded', () => {
    it('should render 1 result-list part', async () => {
      const element = await setupElement();

      const resultListParts = getParts(element).resultList;

      expect(resultListParts).toHaveLength(1);

      await expect
        .element(page.elementLocator(resultListParts!.item(0)))
        .toBeInTheDocument();
    });

    it('should render correct # of atomic-recs-result', async () => {
      mockRecommendationsWithCount(5);

      const element = await setupElement();

      const atomicRecsResultElements =
        element.shadowRoot?.querySelectorAll('atomic-recs-result');

      expect(atomicRecsResultElements).toHaveLength(5);
    });

    it('should render 1 result-list-grid-clickable-container part per recommendation', async () => {
      mockRecommendationsWithCount(3);

      const element = await setupElement();

      const resultListGridClickableContainerParts =
        getParts(element).resultListGridClickableContainer;

      expect(resultListGridClickableContainerParts).toHaveLength(3);
      await expect
        .element(
          page.elementLocator(resultListGridClickableContainerParts!.item(0))
        )
        .toBeInTheDocument();
      await expect
        .element(
          page.elementLocator(resultListGridClickableContainerParts!.item(1))
        )
        .toBeInTheDocument();
      await expect
        .element(
          page.elementLocator(resultListGridClickableContainerParts!.item(2))
        )
        .toBeInTheDocument();
    });

    describe.each<{density: ItemDisplayDensity}>([
      {density: 'comfortable'},
      {density: 'compact'},
      {density: 'normal'},
    ])('when #density is $density', ({density}) => {
      it('should render list wrapper & root with correct density class', async () => {
        const element = await setupElement({density});

        const listWrapperElements =
          element.shadowRoot?.querySelectorAll('.list-wrapper');
        const listWrapperLocator = page.elementLocator(
          listWrapperElements!.item(0)
        );

        const listRootElements =
          element.shadowRoot?.querySelectorAll('.list-root');
        const listRootLocator = page.elementLocator(listRootElements!.item(0));

        await expect
          .element(listWrapperLocator)
          .toHaveClass(`density-${density}`);
        await expect.element(listRootLocator).toHaveClass(`density-${density}`);
      });
    });

    describe.each<{imageSize: ItemDisplayImageSize}>([
      {imageSize: 'icon'},
      {imageSize: 'large'},
      {imageSize: 'none'},
      {imageSize: 'small'},
    ])('when #imageSize is $imageSize', ({imageSize}) => {
      it('should render list wrapper & root with correct image size class', async () => {
        const element = await setupElement({imageSize});

        const listWrapperElements =
          element.shadowRoot?.querySelectorAll('.list-wrapper');
        const listWrapperLocator = page.elementLocator(
          listWrapperElements!.item(0)
        );

        const listRootElements =
          element.shadowRoot?.querySelectorAll('.list-root');
        const listRootLocator = page.elementLocator(listRootElements!.item(0));

        await expect
          .element(listWrapperLocator)
          .toHaveClass(`image-${imageSize}`);
        await expect.element(listRootLocator).toHaveClass(`image-${imageSize}`);
      });
    });

    describe('when rendering atomic-recs-result', () => {
      it('should pass correct #density', async () => {
        const density = 'comfortable';
        const element = await setupElement({density});

        const atomicRecsResultElement =
          element.shadowRoot?.querySelector('atomic-recs-result');

        expect(atomicRecsResultElement?.density).toBe(density);
      });

      it('should pass correct #display', async () => {
        const display = 'grid';
        const element = await setupElement({display});

        const atomicRecsResultElement =
          element.shadowRoot?.querySelector('atomic-recs-result');

        expect(atomicRecsResultElement?.display).toBe(display);
      });

      it('should pass correct #imageSize', async () => {
        const imageSize = 'none';
        const element = await setupElement({imageSize});

        const atomicRecsResultElement =
          element.shadowRoot?.querySelector('atomic-recs-result');

        expect(atomicRecsResultElement?.imageSize).toBe(imageSize);
      });

      it('should pass correct #result', async () => {
        const mockResult1 = buildFakeResult({uniqueId: '123'});
        const mockResult2 = buildFakeResult({uniqueId: '456'});

        vi.mocked(buildRecommendationList).mockReturnValue(
          buildFakeRecommendationList({
            state: {
              recommendations: [mockResult1, mockResult2],
              searchResponseId: 'test-response-id',
            },
          })
        );

        const element = await setupElement();

        const atomicRecsResultElements =
          element.shadowRoot?.querySelectorAll('atomic-recs-result');

        expect(atomicRecsResultElements?.[0].result).toBe(mockResult1);
        expect(atomicRecsResultElements?.[1].result).toBe(mockResult2);
      });

      it('should pass correct #store', async () => {
        const element = await setupElement();

        const atomicRecsResultElement =
          element.shadowRoot?.querySelector('atomic-recs-result');

        expect(atomicRecsResultElement?.store).toEqual(element.bindings.store);
      });
    });
  });

  describe('#label', () => {
    it('should render heading when label is provided', async () => {
      const element = await setupElement({label: 'Test Label'});

      const labelParts = getParts(element).label;

      expect(labelParts).toHaveLength(1);
      await expect
        .element(page.elementLocator(labelParts!.item(0)))
        .toBeInTheDocument();
    });

    it('should not render heading when label is not provided', async () => {
      const element = await setupElement();

      const labelParts = getParts(element).label;

      expect(labelParts).toHaveLength(0);
    });
  });

  describe('#numberOfRecommendationsPerPage (carousel)', () => {
    it('should render carousel controls when numberOfRecommendationsPerPage creates multiple pages', async () => {
      mockRecommendationsWithCount(10);

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      const previousButtonParts = getParts(element).previousButton;
      const nextButtonParts = getParts(element).nextButton;
      const indicatorParts = getParts(element).indicators;

      expect(previousButtonParts).toHaveLength(1);
      expect(nextButtonParts).toHaveLength(1);
      expect(indicatorParts).toHaveLength(1);
    });

    it('should not render carousel controls when numberOfRecommendationsPerPage is not set', async () => {
      mockRecommendationsWithCount(10);

      const element = await setupElement();

      const previousButtonParts = getParts(element).previousButton;
      const nextButtonParts = getParts(element).nextButton;

      expect(previousButtonParts).toHaveLength(0);
      expect(nextButtonParts).toHaveLength(0);
    });

    it('should only display the first page of recommendations initially', async () => {
      mockRecommendationsWithCount(10);

      const element = await setupElement({numberOfRecommendationsPerPage: 3});

      const atomicRecsResultElements =
        element.shadowRoot?.querySelectorAll('atomic-recs-result');

      expect(atomicRecsResultElements).toHaveLength(3);
    });
  });

  describe('#setRenderFunction', () => {
    it('should set the rendering function on atomic-recs-result', async () => {
      const element = await setupElement();

      const mockRenderingFunction = vi.fn();

      element.setRenderFunction(mockRenderingFunction);

      element.requestUpdate();
      await element.updateComplete;

      const atomicRecsResultElement =
        element.shadowRoot?.querySelector('atomic-recs-result');

      expect(atomicRecsResultElement?.renderingFunction).toBe(
        mockRenderingFunction
      );
    });
  });

  const setupElement = async ({
    display = 'grid',
    density = 'normal',
    imageSize = 'small',
    label,
    numberOfRecommendationsPerPage,
    isAppLoaded = true,
  }: {
    display?: ItemDisplayBasicLayout;
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    label?: string;
    numberOfRecommendationsPerPage?: number;
    isAppLoaded?: boolean;
  } = {}) => {
    const {element} = await renderInAtomicRecsInterface<AtomicRecsList>({
      template: html`<atomic-recs-list
          .display=${display}
          .density=${density}
          .imageSize=${imageSize}
          .label=${label}
          .numberOfRecommendationsPerPage=${numberOfRecommendationsPerPage}
        >
          <atomic-recs-result-template>
            <template>
              <div>Result Content</div>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>`,
      selector: 'atomic-recs-list',
      bindings: (bindings) => {
        bindings.store.state.loadingFlags = isAppLoaded ? [] : ['loading-flag'];
        bindings.engine.logger = {
          error: vi.fn(),
          warn: vi.fn(),
        } as never;
        return bindings;
      },
    });

    return element;
  };

  const getParts = (element: AtomicRecsList) => {
    const qs = (part: string, exact = true) =>
      element.shadowRoot?.querySelectorAll(
        `[part${exact ? '' : '*'}="${part}"]`
      );

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
      indicator: qs('indicator', false),
    };
  };
});

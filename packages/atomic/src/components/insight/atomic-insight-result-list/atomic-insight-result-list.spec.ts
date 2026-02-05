import {
  buildInteractiveResult as buildInsightInteractiveResult,
  buildResultList as buildInsightResultList,
  buildResultsPerPage as buildInsightResultsPerPage,
  type InsightInteractiveResultProps,
  type InteractiveResult,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
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
import '../atomic-insight-result-template/atomic-insight-result-template';

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

  describe('when density prop is invalid', () => {
    it('should set error', async () => {
      const element = await setupElement();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any).density = 'invalid';
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/density/i);
    });
  });

  describe('when imageSize prop is invalid', () => {
    it('should set error', async () => {
      const element = await setupElement();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any).imageSize = 'invalid';
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/imageSize/i);
    });
  });

  describe('#willUpdate', () => {
    // biome-ignore lint/suspicious/noExplicitAny: <accessing private properties in tests>
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
      element.resultListState = {
        isLoading: newState,
        results: [buildFakeInsightResult()],
      };
      element.willUpdate(new Map([['resultListState', {isLoading: oldState}]]));

      expect(element.isEveryResultReady).toBe(expectedResult);
    });
  });

  it('should not render when bindings are undefined', async () => {
    const element = await setupElement();

    // @ts-expect-error - unsetting bindings for the sake of simplicity.
    element.bindings = undefined;

    // Must wait for update to complete after unsetting bindings.
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when there is an error', async () => {
    vi.mocked(buildInsightResultList).mockReturnValue(
      buildFakeInsightResultList({state: {hasError: true}})
    );

    const element = await setupElement();

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when no template is registered', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property: mocking the template provider would be complex.
    element.resultTemplateRegistered = false;

    // Must wait for update to complete after setting resultTemplateRegistered to false.
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when first request was executed & there are no results', async () => {
    vi.mocked(buildInsightResultList).mockReturnValue(
      buildFakeInsightResultList({
        state: {hasResults: false},
      })
    );

    const element = await setupElement();

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should render empty slot when template has error', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property: mocking the template provider would be complex.
    element.templateHasError = true;

    // Must wait for update to complete after setting templateHasError to true.
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(1);
    expect(renderedElements?.item(0).tagName).toBe('SLOT');
    expect(renderedElements?.item(0).children).toHaveLength(0);
    expect(renderedElements?.item(0)).toBeInTheDocument();
  });

  it('should render correct # of atomic-result-placeholder when app is not loaded', async () => {
    const numberOfPlaceholders = 4;
    vi.mocked(buildInsightResultsPerPage).mockReturnValue(
      buildFakeInsightResultsPerPage({
        numberOfResults: numberOfPlaceholders,
      })
    );

    const element = await setupElement({
      isAppLoaded: false,
    });

    const atomicResultPlaceholderElements =
      element.shadowRoot?.querySelectorAll('atomic-result-placeholder');

    expect(atomicResultPlaceholderElements).toHaveLength(numberOfPlaceholders);
    expect(
      page.elementLocator(atomicResultPlaceholderElements!.item(0))
    ).toBeInTheDocument();
    expect(
      page.elementLocator(atomicResultPlaceholderElements!.item(1))
    ).toBeInTheDocument();
    expect(
      page.elementLocator(atomicResultPlaceholderElements!.item(2))
    ).toBeInTheDocument();
    expect(
      page.elementLocator(atomicResultPlaceholderElements!.item(3))
    ).toBeInTheDocument();
  });

  describe('when app is loaded', () => {
    it('should render list wrapper & root with correct display class', async () => {
      await renderListWrapperAndRootTestCase();
    });

    it('should render 1 result-list part', async () => {
      const resultListParts = getParts(await setupElement()).resultList;

      expect(resultListParts).toHaveLength(1);

      await expect
        .element(page.elementLocator(resultListParts!.item(0)))
        .toBeInTheDocument();
    });

    it('should render 1 outline part per result', async () => {
      vi.mocked(buildInsightResultList).mockReturnValue(
        buildFakeInsightResultList({
          state: {
            results: Array.from({length: 3}, (_, i) =>
              buildFakeInsightResult({uniqueId: i.toString()})
            ),
          },
        })
      );

      const element = await setupElement();

      const outlineParts = getParts(element).outline;

      expect(outlineParts).toHaveLength(3);
      await expect
        .element(page.elementLocator(outlineParts!.item(0)))
        .toBeInTheDocument();
      await expect
        .element(page.elementLocator(outlineParts!.item(1)))
        .toBeInTheDocument();
      await expect
        .element(page.elementLocator(outlineParts!.item(2)))
        .toBeInTheDocument();
    });

    describe.each<{
      density: ItemDisplayDensity;
    }>([{density: 'comfortable'}, {density: 'compact'}, {density: 'normal'}])(
      'when the #density prop is $density',
      ({density}) => {
        it('should render list wrapper & root with correct density class', async () => {
          await renderListWrapperAndRootTestCase({density});
        });
      }
    );

    describe.each<{imageSize: ItemDisplayImageSize}>([
      {imageSize: 'icon'},
      {imageSize: 'large'},
      {imageSize: 'none'},
      {imageSize: 'small'},
    ])('when the #imageSize prop is $imageSize', ({imageSize}) => {
      it('should render list wrapper & root with correct image size class', async () => {
        await renderListWrapperAndRootTestCase({imageSize});
      });
    });

    it('should render correct # of atomic-insight-result', async () => {
      mockResultsWithCount(9);

      const element = await setupElement();

      const atomicInsightResultElements = element.shadowRoot?.querySelectorAll(
        'atomic-insight-result'
      );

      expect(atomicInsightResultElements).toHaveLength(9);
    });

    describe('when rendering atomic-insight-result', () => {
      it('should pass correct #density', async () => {
        const density = 'comfortable';
        const element = await setupElement({density});

        const atomicInsightResultElement = element.shadowRoot?.querySelector(
          'atomic-insight-result'
        );

        expect(atomicInsightResultElement?.density).toBe(density);
      });

      it('should pass correct #imageSize', async () => {
        const imageSize = 'none';
        const element = await setupElement({imageSize});

        const renderedResultElement = element.shadowRoot?.querySelector(
          'atomic-insight-result'
        );

        expect(renderedResultElement?.imageSize).toBe(imageSize);
      });

      it('should pass correct #interactiveResult', async () => {
        const mockResult1 = buildFakeInsightResult({uniqueId: '123'});
        const mockResult2 = buildFakeInsightResult({uniqueId: '456'});

        interactiveResult.mockImplementation(
          (props: InsightInteractiveResultProps) => {
            return {
              select: vi.fn(),
              beginDelayedSelect: vi.fn(),
              cancelPendingSelect: vi.fn(),
              warningMessage: props.options.result.uniqueId,
            } as unknown as InteractiveResult;
          }
        );

        vi.mocked(buildInsightResultList).mockReturnValue(
          buildFakeInsightResultList({
            state: {
              results: [mockResult1, mockResult2],
            },
          })
        );

        const element = await setupElement();

        interactiveResult.mockClear();

        element.requestUpdate();
        await element.updateComplete;
        const atomicInsightResultElements =
          element.shadowRoot?.querySelectorAll('atomic-insight-result');

        expect(interactiveResult).toHaveBeenCalledTimes(2);
        expect(interactiveResult.mock.calls).toEqual([
          [{options: {result: mockResult1}}],
          [{options: {result: mockResult2}}],
        ]);
        expect(atomicInsightResultElements?.[0].interactiveResult).toBe(
          interactiveResult.mock.results[0].value
        );
        expect(atomicInsightResultElements?.[1].interactiveResult).toBe(
          interactiveResult.mock.results[1].value
        );
      });

      it('should pass correct #loadingFlag', async () => {
        const element = await setupElement();

        const atomicInsightResultElement = element.shadowRoot?.querySelector(
          'atomic-insight-result'
        );

        expect(atomicInsightResultElement?.loadingFlag).toBe(
          // @ts-expect-error - accessing private property
          element.loadingFlag
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

        const atomicInsightResultElement = element.shadowRoot?.querySelectorAll(
          'atomic-insight-result'
        );

        expect(atomicInsightResultElement?.[0].result).toBe(mockResult1);
        expect(atomicInsightResultElement?.[1].result).toBe(mockResult2);
      });

      it('should pass correct #store', async () => {
        const element = await setupElement();

        const atomicInsightResultElement = element.shadowRoot?.querySelector(
          'atomic-insight-result'
        );

        expect(atomicInsightResultElement?.store).toEqual(
          element.bindings.store
        );
      });
    });

    const renderListWrapperAndRootTestCase = async ({
      density,
      imageSize,
    }: {
      density?: ItemDisplayDensity;
      imageSize?: ItemDisplayImageSize;
    } = {}) => {
      const element = await setupElement({
        ...(density && {density}),
        ...(imageSize && {imageSize}),
      });

      const listWrapperElements =
        element.shadowRoot?.querySelectorAll('.list-wrapper');
      const listWrapperLocator = page.elementLocator(
        listWrapperElements!.item(0)
      );

      const listRootElements =
        element.shadowRoot?.querySelectorAll('.list-root');
      const listRootLocator = page.elementLocator(listRootElements!.item(0));

      const expectedClass = [
        'display-list',
        density ? ` density-${density}` : '',
        imageSize ? ` image-${imageSize}` : '',
      ].join('');

      expect(listWrapperElements).toHaveLength(1);
      await expect.element(listWrapperLocator).toBeInTheDocument();
      await expect.element(listWrapperLocator).toHaveClass(expectedClass);

      expect(listRootElements).toHaveLength(1);
      await expect.element(listRootLocator).toBeInTheDocument();
      await expect.element(listRootLocator).toHaveClass(expectedClass);
    };
  });

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
          </atomic-insight-result-template></atomic-insight-result-list
        >`,
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

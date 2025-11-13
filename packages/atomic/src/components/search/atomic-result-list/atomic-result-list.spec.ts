import {
  buildInteractiveResult,
  buildResultList,
  buildResultsPerPage,
  buildTabManager,
  type InteractiveResult,
  type InteractiveResultProps,
  type Result,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {buildFakeResultList} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result-list-controller';
import {buildFakeResultsPerPage} from '@/vitest-utils/testing-helpers/fixtures/headless/search/results-per-page-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import {AtomicResultList} from './atomic-result-list';
import './atomic-result-list';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import '../atomic-result-template/atomic-result-template';

vi.mock('@/src/components/common/item-list/table-layout', {spy: true});
vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});
vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-list', () => {
  const interactiveResult = vi.fn();
  const mockedEngine = buildFakeSearchEngine();

  beforeEach(() => {
    vi.mocked(buildResultList).mockReturnValue(
      buildFakeResultList({
        state: {
          results: Array.from({length: 1}, (_, i) =>
            buildFakeResult({uniqueId: i.toString()})
          ),
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
    vi.mocked(buildResultList).mockReturnValue(
      buildFakeResultList({
        state: {
          results: Array.from({length: count}, (_, i) =>
            buildFakeResult({uniqueId: i.toString()})
          ),
        },
      })
    );
  };

  // #initialize =======================================================================================================

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicResultList);
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
    validValue: ItemDisplayDensity | ItemDisplayLayout | ItemDisplayImageSize;
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
          'Prop validation failed for component atomic-result-list'
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

  // TODO V4: KIT-5197 - Remove skip
  it.skip.each<{
    prop: 'density' | 'display' | 'imageSize';
    validValue: ItemDisplayDensity | ItemDisplayLayout | ItemDisplayImageSize;
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
    'should set error when valid #$prop is updated to an invalid value',
    async ({prop, validValue, invalidValue}) => {
      const element = await setupElement({[prop]: validValue});

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );

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
        results: [buildFakeResult()],
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
    vi.mocked(buildResultList).mockReturnValue(
      buildFakeResultList({state: {hasError: true}})
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
    vi.mocked(buildResultList).mockReturnValue(
      buildFakeResultList({
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

  it("should render 1 result-list-grid-clickable-container part per result when #display is 'grid' & app is loaded", async () => {
    vi.mocked(buildResultList).mockReturnValue(
      buildFakeResultList({
        state: {
          results: Array.from({length: 3}, (_, i) =>
            buildFakeResult({uniqueId: i.toString()})
          ),
        },
      })
    );

    const element = await setupElement({display: 'grid'});

    const resultListGridClickableContainerParts =
      getParts(element).gridOnly.resultListGridClickableContainer;

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

  describe.each<{display: ItemDisplayLayout}>([
    {display: 'grid'},
    {display: 'list'},
  ])('when #display is $display', ({display}) => {
    it('should not set the renderingFunction on the atomic result itself', async () => {
      const element = await setupElement({display});

      const mockRenderingFunction = vi.fn();

      element.setRenderFunction(mockRenderingFunction);

      element.requestUpdate();
      await element.updateComplete;

      const atomicResultElement =
        element.shadowRoot?.querySelector('atomic-result');

      expect(atomicResultElement?.renderingFunction).toBe(
        mockRenderingFunction
      );
    });

    it('should render correct # of atomic-result-placeholder when app is not loaded', async () => {
      const numberOfPlaceholders = 4;
      vi.mocked(buildResultsPerPage).mockReturnValue(
        buildFakeResultsPerPage({
          numberOfResults: numberOfPlaceholders,
        })
      );

      const element = await setupElement({
        isAppLoaded: false,
        display,
      });

      const atomicResultPlaceholderElements =
        element.shadowRoot?.querySelectorAll('atomic-result-placeholder');

      expect(atomicResultPlaceholderElements).toHaveLength(
        numberOfPlaceholders
      );
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
        const resultListParts = getParts(
          await setupElement({
            display,
          })
        ).gridOrList.resultList;

        expect(resultListParts).toHaveLength(1);

        await expect
          .element(page.elementLocator(resultListParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 outline part per result', async () => {
        vi.mocked(buildResultList).mockReturnValue(
          buildFakeResultList({
            state: {
              results: Array.from({length: 3}, (_, i) =>
                buildFakeResult({uniqueId: i.toString()})
              ),
            },
          })
        );

        const element = await setupElement({
          display,
        });

        const outlineParts = getParts(element).gridOrList.outline;

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

      renderAtomicResultTestCases(display);

      const renderListWrapperAndRootTestCase = async ({
        density,
        imageSize,
      }: {
        density?: ItemDisplayDensity;
        imageSize?: ItemDisplayImageSize;
      } = {}) => {
        const element = await setupElement({
          display,
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
          `display-${display}`,
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
  });

  describe("when #display is 'table'", () => {
    it('should not set the renderingFunction on the atomic result itself', async () => {
      const element = await setupElement({display: 'table'});

      const mockRenderingFunction = vi.fn();

      element.setRenderFunction(mockRenderingFunction);

      element.requestUpdate();
      await element.updateComplete;

      const atomicResultElement =
        element.shadowRoot?.querySelector('atomic-result');

      expect(atomicResultElement?.renderingFunction).toBeUndefined();
    });

    it('should render 1 atomic-result-table-placeholder when app is not loaded', async () => {
      const element = await setupElement({
        display: 'table',
        isAppLoaded: false,
      });

      const atomicResultTablePlaceholderElements =
        element.shadowRoot?.querySelectorAll('atomic-result-table-placeholder');

      expect(atomicResultTablePlaceholderElements).toHaveLength(1);
      expect(
        page.elementLocator(atomicResultTablePlaceholderElements!.item(0))
      ).toBeInTheDocument();
    });

    describe('when app is loaded', () => {
      it('should render list wrapper & table with correct display class', async () => {
        await renderListWrapperAndTableTestCase();
      });

      it('should render 1 atomic-text with correct #value per atomic-table-element in template', async () => {
        const element = await setupElement({display: 'table'});

        const mockTableTemplate = document.createDocumentFragment();
        const atomicTableElement1 = document.createElement(
          'atomic-table-element'
        );
        atomicTableElement1.setAttribute('label', 'Label 1');
        const atomicTableElement2 = document.createElement(
          'atomic-table-element'
        );
        atomicTableElement2.setAttribute('label', 'Label 2');
        mockTableTemplate.appendChild(atomicTableElement1);
        mockTableTemplate.appendChild(atomicTableElement2);

        vi.spyOn(
          // @ts-expect-error -  spying on private property: mocking the template provider would be complex.
          element.resultTemplateProvider,
          'getTemplateContent'
        ).mockReturnValue(mockTableTemplate);

        // Must trigger update to get template content.
        element.requestUpdate();
        await element.updateComplete;

        const atomicTextElements =
          element.shadowRoot?.querySelectorAll('atomic-text');

        expect(atomicTextElements).toHaveLength(2);
        expect(atomicTextElements?.item(0).value).toBe('Label 1');
        expect(atomicTextElements?.item(1).value).toBe('Label 2');
        await expect
          .element(page.elementLocator(atomicTextElements!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(atomicTextElements!.item(1)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableParts = getParts(element).table.resultTable;

        expect(resultTableParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableHeadingParts =
          getParts(element).table.resultTableHeading;

        expect(resultTableHeadingParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableHeadingParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading-row part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableHeadingRowParts =
          getParts(element).table.resultTableHeadingRow;

        expect(resultTableHeadingRowParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableHeadingRowParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading-cell part per atomic-table-element in template', async () => {
        const element = await setupElement({display: 'table'});

        const mockTableTemplate = document.createDocumentFragment();
        const atomicTableElement1 = document.createElement(
          'atomic-table-element'
        );
        const atomicTableElement2 = document.createElement(
          'atomic-table-element'
        );
        mockTableTemplate.appendChild(atomicTableElement1);
        mockTableTemplate.appendChild(atomicTableElement2);

        vi.spyOn(
          // @ts-expect-error - spying on private property: mocking the template provider would be complex.
          element.resultTemplateProvider,
          'getTemplateContent'
        ).mockReturnValue(mockTableTemplate);

        // Must trigger update to get template content.
        element.requestUpdate();
        await element.updateComplete;

        const resultTableHeadingCellParts =
          getParts(element).table.resultTableHeadingCell;

        expect(resultTableHeadingCellParts).toHaveLength(2);
        await expect
          .element(page.elementLocator(resultTableHeadingCellParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableHeadingCellParts!.item(1)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-body part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableBodyParts = getParts(element).table.resultTableBody;

        expect(resultTableBodyParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableBodyParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-row part per result', async () => {
        vi.mocked(buildResultList).mockReturnValue(
          buildFakeResultList({
            state: {
              results: Array.from({length: 3}, (_, i) =>
                buildFakeResult({uniqueId: i.toString()})
              ),
            },
          })
        );

        const element = await setupElement({display: 'table'});

        const resultTableRowParts = getParts(element).table.resultTableRow;

        expect(resultTableRowParts).toHaveLength(3);
        await expect
          .element(page.elementLocator(resultTableRowParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowParts!.item(1)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowParts!.item(2)))
          .toBeInTheDocument();
      });

      it('should render floor(numberOfResults / 2) result-table-row-even parts', async () => {
        mockResultsWithCount(5);

        const element = await setupElement({display: 'table'});

        const resultTableRowEvenParts =
          getParts(element).table.resultTableRowEven;

        expect(resultTableRowEvenParts).toHaveLength(2); // floor(5 / 2) = 2
        await expect
          .element(page.elementLocator(resultTableRowEvenParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowEvenParts!.item(1)))
          .toBeInTheDocument();
      });

      it('should render ceil(numberOfResults / 2) result-table-row-odd parts', async () => {
        mockResultsWithCount(5);

        const element = await setupElement({display: 'table'});

        const resultTableRowOddParts =
          getParts(element).table.resultTableRowOdd;

        expect(resultTableRowOddParts).toHaveLength(3); // ceil(5 / 2) = 3
        await expect
          .element(page.elementLocator(resultTableRowOddParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowOddParts!.item(1)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowOddParts!.item(2)))
          .toBeInTheDocument();
      });

      describe.each<{
        density: ItemDisplayDensity;
      }>([{density: 'comfortable'}, {density: 'compact'}, {density: 'normal'}])(
        'when #density is $density',
        ({density}) => {
          it('should render list wrapper & table with correct density class', async () => {
            await renderListWrapperAndTableTestCase({density});
          });
        }
      );

      describe.each<{imageSize: ItemDisplayImageSize}>([
        {imageSize: 'icon'},
        {imageSize: 'large'},
        {imageSize: 'none'},
        {imageSize: 'small'},
      ])('when #imageSize is $imageSize', ({imageSize}) => {
        it('should render list wrapper & table with correct image size class', async () => {
          await renderListWrapperAndTableTestCase({imageSize});
        });
      });

      renderAtomicResultTestCases('table');
    });

    const renderListWrapperAndTableTestCase = async ({
      density,
      imageSize,
    }: {
      density?: ItemDisplayDensity;
      imageSize?: ItemDisplayImageSize;
    } = {}) => {
      const element = await setupElement({
        display: 'table',
        ...(density && {density}),
        ...(imageSize && {imageSize}),
      });

      const listWrapperElement =
        element.shadowRoot?.querySelectorAll('.list-wrapper');
      const listWrapperLocator = page.elementLocator(
        listWrapperElement!.item(0)
      );

      const tableElements = element.shadowRoot?.querySelectorAll('table');
      const tableLocator = page.elementLocator(tableElements!.item(0));

      const expectedClass = [
        'display-table',
        density ? ` density-${density}` : '',
        imageSize ? ` image-${imageSize}` : '',
      ].join('');

      expect(listWrapperElement).toHaveLength(1);
      await expect.element(listWrapperLocator).toBeInTheDocument();
      await expect.element(listWrapperLocator).toHaveClass(expectedClass);

      expect(tableElements).toHaveLength(1);
      await expect.element(tableLocator).toBeInTheDocument();
      await expect.element(tableLocator).toHaveClass(expectedClass);
    };
  });

  const renderAtomicResultTestCases = (display: ItemDisplayLayout) => {
    it('should render correct # of atomic-result', async () => {
      mockResultsWithCount(9);

      const element = await setupElement({
        display,
      });

      display === 'table' && (await setupTableTemplate(element));

      const atomicResultElements =
        element.shadowRoot?.querySelectorAll('atomic-result');

      expect(atomicResultElements).toHaveLength(9);
    });

    describe('when rendering atomic-result', () => {
      if (display === 'table') {
        it('should pass 1st result template to #content', async () => {
          const mockResult1 = buildFakeResult({uniqueId: '123'});
          const mockResult2 = buildFakeResult({uniqueId: '456'});

          vi.mocked(buildResultList).mockReturnValue(
            buildFakeResultList({
              state: {
                results: [mockResult1, mockResult2],
              },
            })
          );

          const element = await setupElement({display});

          vi.spyOn(
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
            element.resultTemplateProvider,
            'getTemplateContent'
          ).mockImplementation((result: Result) => {
            const mockTemplate = document.createDocumentFragment();
            const atomicTableElement = document.createElement(
              'atomic-table-element'
            );
            const content = document.createElement('div');
            content.textContent = `Hello from ${result.uniqueId}`;
            atomicTableElement.appendChild(content);
            mockTemplate.appendChild(atomicTableElement);

            return mockTemplate;
          });

          // Must trigger update to get template content.
          element.requestUpdate();
          await element.updateComplete;

          const atomicResultElements =
            element.shadowRoot?.querySelectorAll('atomic-result');

          expect(
            atomicResultElements?.[0].content?.querySelector('div')?.textContent
          ).toBe('Hello from 123');
          expect(
            atomicResultElements?.[1].content?.querySelector('div')?.textContent
          ).toBe('Hello from 123');
        });
      } else {
        it('should pass correct result template to #content', async () => {
          const mockResult1 = buildFakeResult({uniqueId: '123'});
          const mockResult2 = buildFakeResult({uniqueId: '456'});

          vi.mocked(buildResultList).mockReturnValue(
            buildFakeResultList({
              state: {
                results: [mockResult1, mockResult2],
              },
            })
          );

          const element = await setupElement({display});

          vi.spyOn(
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
            element.resultTemplateProvider,
            'getTemplateContent'
          ).mockImplementation((result: Result) => {
            const mockTemplate = document.createDocumentFragment();
            const content = document.createElement('div');
            content.textContent = `Hello from ${result.uniqueId}`;
            mockTemplate.appendChild(content);
            return mockTemplate;
          });

          // Must trigger update to get template content.
          element.requestUpdate();
          await element.updateComplete;

          const atomicResultElements =
            element.shadowRoot?.querySelectorAll('atomic-result');

          expect(
            atomicResultElements?.[0].content?.querySelector('div')?.textContent
          ).toBe('Hello from 123');
          expect(
            atomicResultElements?.[1].content?.querySelector('div')?.textContent
          ).toBe('Hello from 456');
        });
      }
      it('should pass correct #density', async () => {
        const density = 'comfortable';
        const element = await setupElement({display, density});
        display === 'table' && (await setupTableTemplate(element));

        const atomicResultElement =
          element.shadowRoot?.querySelector('atomic-result');

        expect(atomicResultElement?.density).toBe(density);
      });

      it('should pass correct #display', async () => {
        const element = await setupElement({display});
        display === 'table' && (await setupTableTemplate(element));

        const atomicResultElement =
          element.shadowRoot?.querySelector('atomic-result');

        expect(atomicResultElement?.display).toBe(display);
      });

      it('should pass correct #imageSize', async () => {
        const imageSize = 'none';
        const element = await setupElement({display, imageSize});
        display === 'table' && (await setupTableTemplate(element));

        const renderedResultElement =
          element.shadowRoot?.querySelector('atomic-result');

        expect(renderedResultElement?.imageSize).toBe(imageSize);
      });

      it('should pass correct #interactiveResult', async () => {
        const mockResult1 = buildFakeResult({uniqueId: '123'});
        const mockResult2 = buildFakeResult({uniqueId: '456'});

        interactiveResult.mockImplementation(
          (props: InteractiveResultProps) => {
            return {
              select: vi.fn(),
              beginDelayedSelect: vi.fn(),
              cancelPendingSelect: vi.fn(),
              warningMessage: props.options.result.uniqueId,
            } as unknown as InteractiveResult;
          }
        );

        vi.mocked(buildResultList).mockReturnValue(
          buildFakeResultList({
            state: {
              results: [mockResult1, mockResult2],
            },
          })
        );

        const element = await setupElement({display});

        display === 'table' && (await setupTableTemplate(element));

        interactiveResult.mockClear();

        element.requestUpdate();
        await element.updateComplete;
        const atomicResultElements =
          element.shadowRoot?.querySelectorAll('atomic-result');

        expect(interactiveResult).toHaveBeenCalledTimes(2);
        expect(interactiveResult.mock.calls).toEqual([
          [{options: {result: mockResult1}}],
          [{options: {result: mockResult2}}],
        ]);
        expect(atomicResultElements?.[0].interactiveResult).toBe(
          interactiveResult.mock.results[0].value
        );
        expect(atomicResultElements?.[1].interactiveResult).toBe(
          interactiveResult.mock.results[1].value
        );
      });

      if (display === 'grid') {
        it('should pass result link template to #linkContent', async () => {
          const mockResult1 = buildFakeResult({uniqueId: '123'});
          const mockResult2 = buildFakeResult({uniqueId: '456'});

          vi.mocked(buildResultList).mockReturnValue(
            buildFakeResultList({
              state: {
                results: [mockResult1, mockResult2],
              },
            })
          );

          const element = await setupElement({display});

          vi.spyOn(
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
            element.resultTemplateProvider,
            'getLinkTemplateContent'
          ).mockImplementation((result: Result) => {
            const mockLinkTemplate = document.createDocumentFragment();
            const content = document.createElement('a');
            content.href = `https://example.com/${result.uniqueId}`;
            mockLinkTemplate.appendChild(content);

            return mockLinkTemplate;
          });

          // Must trigger update to get link template content.
          element.requestUpdate();
          await element.updateComplete;

          const atomicResultElements =
            element.shadowRoot?.querySelectorAll('atomic-result');

          expect(
            atomicResultElements?.[0].linkContent?.querySelector('a')?.href
          ).toBe('https://example.com/123');
          expect(
            atomicResultElements?.[1].linkContent?.querySelector('a')?.href
          ).toBe('https://example.com/456');
        });
      } else {
        it('should pass empty link template to #linkContent', async () => {
          const mockResult1 = buildFakeResult({uniqueId: '123'});
          const mockResult2 = buildFakeResult({uniqueId: '456'});

          vi.mocked(buildResultList).mockReturnValue(
            buildFakeResultList({
              state: {
                results: [mockResult1, mockResult2],
              },
            })
          );

          const element = await setupElement({display});

          const mockEmptyLinkTemplate = document.createDocumentFragment();
          mockEmptyLinkTemplate.appendChild(document.createElement('span'));

          vi.spyOn(
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
            element.resultTemplateProvider,
            'getEmptyLinkTemplateContent'
          ).mockReturnValue(mockEmptyLinkTemplate);

          if (display === 'table') {
            await setupTableTemplate(element);
          } else {
            // Must trigger update to get link template content.
            element.requestUpdate();
            await element.updateComplete;
          }

          const atomicResultElements =
            element.shadowRoot?.querySelectorAll('atomic-result');

          expect(atomicResultElements?.[0].linkContent).toBe(
            mockEmptyLinkTemplate
          );
          expect(atomicResultElements?.[1].linkContent).toBe(
            mockEmptyLinkTemplate
          );
        });
      }

      it('should pass correct #loadingFlag', async () => {
        const element = await setupElement({display});
        display === 'table' && (await setupTableTemplate(element));

        const atomicResultElement =
          element.shadowRoot?.querySelector('atomic-result');

        // @ts-expect-error - testing private property
        expect(atomicResultElement?.loadingFlag).toBe(element.loadingFlag);
      });

      it('should pass correct #result', async () => {
        const mockResult1 = buildFakeResult({uniqueId: '123'});
        const mockResult2 = buildFakeResult({uniqueId: '456'});

        vi.mocked(buildResultList).mockReturnValue(
          buildFakeResultList({
            state: {
              results: [mockResult1, mockResult2],
            },
          })
        );

        const element = await setupElement({
          display,
        });

        display === 'table' && (await setupTableTemplate(element));

        const atomicResultElement =
          element.shadowRoot?.querySelectorAll('atomic-result');

        expect(atomicResultElement?.[0].result).toBe(mockResult1);
        expect(atomicResultElement?.[1].result).toBe(mockResult2);
      });

      it('should pass correct #store', async () => {
        const element = await setupElement({display});
        display === 'table' && (await setupTableTemplate(element));

        const atomicResultElement =
          element.shadowRoot?.querySelector('atomic-result');

        expect(atomicResultElement?.store).toEqual(element.bindings.store);
      });
    });

    const setupTableTemplate = async (element: AtomicResultList) => {
      const mockTableTemplate = document.createDocumentFragment();
      mockTableTemplate.appendChild(
        document.createElement('atomic-table-element')
      );

      vi.spyOn(
        // @ts-expect-error - mocking method on private property
        element.resultTemplateProvider,
        'getTemplateContent'
      ).mockReturnValue(mockTableTemplate);

      // Must trigger update to get template content.
      element.requestUpdate();
      await element.updateComplete;
    };
  };

  const setupElement = async ({
    display = 'grid',
    density = 'normal',
    imageSize = 'small',
    isAppLoaded = true,
  }: {
    display?: ItemDisplayLayout;
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    isAppLoaded?: boolean;
  } = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicResultList>({
      template: html`<atomic-result-list
          .display=${display}
          .density=${density}
          .imageSize=${imageSize}
        >  <atomic-result-template
            .conditions=${[]}
            .mustMatch=${{}}
            .mustNotMatch=${{}}
          >
            <slot>
              <template>
                <div>Result Content</div>
              </template>
            </slot>
          </atomic-result-template></atomic-result-list>`,
      selector: 'atomic-result-list',
      bindings: (bindings) => {
        bindings.store.state.loadingFlags = isAppLoaded ? [] : ['loading-flag'];
        bindings.engine = mockedEngine;
        bindings.engine.logger = {error: vi.fn()} as never;
        return bindings;
      },
    });

    return element;
  };

  const getParts = (element: AtomicResultList) => {
    const qs = (part: string, exact = true) =>
      element.shadowRoot?.querySelectorAll(
        `[part${exact ? '' : '*'}="${part}"]`
      );

    return {
      gridOnly: {
        resultListGridClickableContainer: qs(
          'result-list-grid-clickable-container',
          false
        ),
      },
      gridOrList: {
        outline: qs('outline', false),
        resultList: qs('result-list'),
      },
      table: {
        resultTable: qs('result-table'),
        resultTableHeading: qs('result-table-heading'),
        resultTableHeadingRow: qs('result-table-heading-row'),
        resultTableHeadingCell: qs('result-table-heading-cell'),
        resultTableBody: qs('result-table-body'),
        resultTableRow: qs('result-table-row', false),
        resultTableRowEven: qs('result-table-row-even', false),
        resultTableRowOdd: qs('result-table-row-odd', false),
        resultTableCell: qs('result-table-cell'),
      },
    };
  };
});

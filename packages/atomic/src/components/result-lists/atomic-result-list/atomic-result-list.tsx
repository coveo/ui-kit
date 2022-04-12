import {Component, Element, State, Prop, Listen, Method} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  buildResultList,
  Result,
  ResultsPerPageState,
  ResultsPerPage,
  buildResultsPerPage,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  ResultDisplayLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../atomic-result/atomic-result-display-options';
import {ResultListCommon, ResultRenderingFunction} from '../result-list-common';

/**
 * The `atomic-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @part result-list - The element containing every result of a result list
 * @part result-list-grid-clickable - The clickable result when results are displayed as a grid
 * @part result-table - The element of the result table containing a heading and a body
 * @part result-table-heading - The element containing the row of cells in the result table's heading
 * @part result-table-heading-row - The element containing cells of the result table's heading
 * @part result-table-heading-cell - The element representing a cell of the result table's heading
 * @part result-table-body - The element containing the rows of the result table's body
 * @part result-table-row - The element containing the cells of a row in the result table's body
 * @part result-table-row-odd - The element containing the cells of an odd row in the result table's body
 * @part result-table-row-even - The element containing the cells of an even row in the result table's body
 * @part result-table-cell - The element representing a cell of the result table's body
 */
@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.pcss',
  shadow: true,
})
export class AtomicResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public resultList!: ResultList;
  public resultsPerPage!: ResultsPerPage;
  public listWrapperRef?: HTMLDivElement;

  @Element() public host!: HTMLDivElement;

  /**
   * Whether to automatically retrieve an additional page of results and append it to the
   * current results when the user scrolls down to the bottom of element
   */
  private enableInfiniteScroll = false;

  @BindStateToController('resultList')
  @State()
  public resultListState!: ResultListState;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;

  @State() public ready = false;

  @State() public error!: Error;
  @State() public templateHasError = false;

  private resultListCommon!: ResultListCommon;
  private renderingFunction: ((res: Result) => HTMLElement) | null = null;

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   */
  @Prop({reflect: true}) public fieldsToInclude = '';
  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  @Prop({reflect: true}) public display: ResultDisplayLayout = 'list';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize?: ResultDisplayImageSize;
  /**
   * @deprecated use `imageSize` instead.
   */
  @Prop({reflect: true}) image: ResultDisplayImageSize = 'icon';

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param render
   */
  @Method() public async setRenderFunction(
    render: (result: Result) => HTMLElement
  ) {
    this.renderingFunction = render;
    this.assignRenderingFunctionIfPossible();
  }

  @Listen('scroll', {target: 'window'})
  handleInfiniteScroll() {
    if (
      this.enableInfiniteScroll &&
      this.resultListCommon.scrollHasReachedEndOfList
    ) {
      this.resultList.fetchMoreResults();
    }
  }

  public async initialize() {
    if (this.host.innerHTML.includes('<atomic-result-children')) {
      console.warn(
        'Folded results will not render any children for the "atomic-result-list". Please use "atomic-folded-result-list" instead.'
      );
    }
    this.resultListCommon = new ResultListCommon({
      host: this.host,
      bindings: this.bindings,
      fieldsToInclude: this.fieldsToInclude,
      templateElements: this.host.querySelectorAll('atomic-result-template'),
      onReady: () => {
        this.ready = true;
        this.assignRenderingFunctionIfPossible();
      },
      onError: () => {
        this.templateHasError = true;
      },
    });

    this.resultList = buildResultList(
      this.bindings.engine,
      this.resultListCommon.resultListControllerProps
    );
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
  }

  public getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.resultListCommon.getContentOfResultTemplate(result);
  }

  public componentDidRender() {
    this.resultListCommon.componentDidRender(
      this.resultListState.firstSearchExecuted,
      this.listWrapperRef
    );
  }

  public render() {
    return this.resultListCommon.renderList({
      host: this.host,
      display: this.display,
      density: this.density,
      imageSize: this.imageSize,
      templateHasError: this.templateHasError,
      resultListState: this.resultListState,
      resultsPerPageState: this.resultsPerPageState,
      setListWrapperRef: (el) => {
        this.listWrapperRef = el as HTMLDivElement;
      },
      getContentOfResultTemplate: this.getContentOfResultTemplate,
    });
  }

  private assignRenderingFunctionIfPossible() {
    if (this.resultListCommon && this.renderingFunction) {
      this.resultListCommon.renderingFunction = this
        .renderingFunction as ResultRenderingFunction;
    }
  }
}

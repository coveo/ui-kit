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
  BindStateToController,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  BaseResultList,
  ResultListCommon,
  ResultRenderingFunction,
} from '../result-list-common';
import {randomID} from '../../../../utils/utils';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {ResultListInfo} from '../../atomic-search-interface/store';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../../common/layout/display-options';

/**
 * The `atomic-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 * @part result-list-grid-clickable-container - The parent of the result & the clickable link encompassing it, when results are displayed as a grid
 * @part result-list-grid-clickable - The clickable link encompassing the result when results are displayed as a grid
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
  styleUrl: '../../../common/result-list/result-list.pcss',
  shadow: true,
})
export class AtomicResultList implements BaseResultList, ResultListInfo {
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

  @FocusTarget() nextNewResultTarget!: FocusTargetController;

  public resultListCommon!: ResultListCommon;
  private renderingFunction: ResultRenderingFunction | null = null;
  private loadingFlag = randomID('firstResultLoaded-');

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   * @deprecated add it to atomic-search-interface instead
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
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';
  /**
   * @deprecated use `imageSize` instead.
   */
  @Prop({reflect: true}) image: ResultDisplayImageSize = 'icon';

  // to remove when `image` prop is removed;
  private propToUseForImageSize: 'image' | 'imageSize' = 'imageSize';

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param render
   */
  @Method() public async setRenderFunction(render: ResultRenderingFunction) {
    this.renderingFunction = render;
    this.assignRenderingFunctionIfPossible();
  }

  /**
   * @internal
   */
  @Method() public async focusOnNextNewResult() {
    this.resultListCommon.focusOnNextNewResult(this.resultListState);
  }

  connectedCallback() {
    // to remove when `image` prop is removed;
    if (this.host.hasAttribute('image')) {
      this.propToUseForImageSize = 'image';
    }
    if (this.host.hasAttribute('image-size')) {
      this.propToUseForImageSize = 'imageSize';
    }
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
      templateElements: this.host.querySelectorAll('atomic-result-template'),
      onReady: () => {
        this.ready = true;
        this.assignRenderingFunctionIfPossible();
      },
      onError: () => {
        this.templateHasError = true;
      },
      loadingFlag: this.loadingFlag,
      nextNewResultTarget: this.nextNewResultTarget,
    });

    const localFieldsToInclude = this.fieldsToInclude
      ? this.fieldsToInclude.split(',').map((field) => field.trim())
      : [];
    const fieldsToInclude = localFieldsToInclude.concat(
      this.bindings.store.state.fieldsToInclude
    );

    this.resultList = buildResultList(this.bindings.engine, {
      options: {fieldsToInclude},
    });
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    this.bindings.store.registerResultList(this);
  }

  public getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.resultListCommon.getContentOfResultTemplate(result);
  }

  public render() {
    return this.resultListCommon.renderList({
      host: this.host,
      display: this.display,
      density: this.density,
      imageSize: this.determineImageSize,
      templateHasError: this.templateHasError,
      resultListState: this.resultListState,
      resultsPerPageState: this.resultsPerPageState,
      setListWrapperRef: (el) => {
        this.listWrapperRef = el as HTMLDivElement;
      },
      getContentOfResultTemplate: this.getContentOfResultTemplate,
      ready: this.ready,
    });
  }

  private assignRenderingFunctionIfPossible() {
    if (this.resultListCommon && this.renderingFunction) {
      this.resultListCommon.renderingFunction = this
        .renderingFunction as ResultRenderingFunction;
    }
  }

  private get determineImageSize() {
    if (this.propToUseForImageSize === 'image') {
      return this.image;
    }
    return this.imageSize;
  }
}

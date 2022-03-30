import {
  Component,
  h,
  Element,
  State,
  Prop,
  Listen,
  Method,
} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  ResultTemplatesManager,
  buildResultList,
  Result,
  ResultsPerPageState,
  ResultsPerPage,
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
import {TemplateContent} from '../../result-template/atomic-result-template/atomic-result-template';
import {ResultList as ResultListComponent} from '../result-list';
import {
  getTemplate,
  handleInfiniteScroll,
  initializeResultList,
  postRenderCleanUp,
} from '../result-list-common';

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
  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  public listWrapperRef?: HTMLDivElement;

  /**
   * TODO: KIT-452 Infinite scroll feature
   * Whether to automatically retrieve an additional page of results and append it to the
   * current results when the user scrolls down to the bottom of element
   */
  private enableInfiniteScroll = false;
  private renderingFunction?: (result: Result) => HTMLElement = undefined;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  public resultListState!: ResultListState;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;

  @State() public ready = false;

  @State() public error!: Error;
  @State() public templateHasError = false;

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   * The default fields sent in a request are: 'date', 'author', 'source', 'language', 'filetype', 'parents', ‘urihash’, ‘objecttype’, ‘collection’, ‘permanentid’ 'ec_price', 'ec_name', 'ec_description', 'ec_brand', 'ec_category', 'ec_item_group_id', 'ec_shortdesc', 'ec_thumbnails', 'ec_images', 'ec_promo_price', 'ec_in_stock', 'ec_cogs', and 'ec_rating'.
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
  }

  @Listen('scroll', {target: 'window'})
  handleInfiniteScroll() {
    handleInfiniteScroll(this.enableInfiniteScroll, this.host, this.resultList);
  }

  public async initialize() {
    if (this.host.innerHTML.includes('<atomic-result-children')) {
      console.warn(
        'Folded results will not render any children for the "atomic-result-list". Please use "atomic-folded-result-list" instead.'
      );
    }
    await initializeResultList.call(this, buildResultList);
  }

  public getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.renderingFunction
      ? this.renderingFunction(result)
      : getTemplate(this.resultTemplatesManager, result)!;
  }

  public componentDidRender() {
    postRenderCleanUp.call(this);
  }

  public render() {
    return <ResultListComponent parent={this} />;
  }
}

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
  buildResultTemplatesManager,
  Result,
  buildResultsPerPage,
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
import {TemplateContent} from '../../atomic-result-template/atomic-result-template';
import {ResultList as ResultListComponent} from '../result-list';

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
  private resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  public resultListState!: ResultListState;

  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;

  @State() public error!: Error;
  @State() public templateHasError = false;

  /**
   * TODO: KIT-452 Infinite scroll feature
   * Whether to automatically retrieve an additional page of results and append it to the
   * current results when the user scrolls down to the bottom of element
   */
  private enableInfiniteScroll = false;
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

  private renderingFunction?: (result: Result) => HTMLElement = undefined;

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

  public listWrapperRef?: HTMLDivElement;

  private get fields() {
    if (this.fieldsToInclude.trim() === '') return [];
    return this.fieldsToInclude.split(',').map((field) => field.trim());
  }

  private get defaultFieldsToInclude() {
    return [
      'date',
      'author',
      'source',
      'language',
      'filetype',
      'parents',
      'ec_price',
      'ec_name',
      'ec_description',
      'ec_brand',
      'ec_category',
      'ec_item_group_id',
      'ec_shortdesc',
      'ec_thumbnails',
      'ec_images',
      'ec_promo_price',
      'ec_in_stock',
      'ec_cogs',
      'ec_rating',
    ];
  }

  public initialize() {
    if (this.host.innerHTML.includes('<atomic-result-children')) {
      console.warn(
        'Folded results will not render any children for the "atomic-result-list". Please use "atomic-folded-result-list" instead.'
      );
    }
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );
    this.resultList = buildResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: [...this.defaultFieldsToInclude, ...this.fields],
      },
    });
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    this.registerDefaultResultTemplates();
    this.registerChildrenResultTemplates();
  }

  private registerDefaultResultTemplates() {
    const content = document.createDocumentFragment();
    const linkEl = document.createElement('atomic-result-link');
    content.appendChild(linkEl);
    this.resultTemplatesManager.registerTemplates({
      content,
      conditions: [],
    });
  }

  private registerChildrenResultTemplates() {
    this.host
      .querySelectorAll('atomic-result-template')
      .forEach(async (resultTemplateElement) => {
        const template = await resultTemplateElement.getTemplate();
        if (!template) {
          this.templateHasError = true;
          return;
        }
        this.resultTemplatesManager.registerTemplates(template);
      });
  }

  private getTemplate(result: Result): TemplateContent {
    return this.resultTemplatesManager.selectTemplate(result)!;
  }

  public getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.renderingFunction
      ? this.renderingFunction(result)
      : this.getTemplate(result);
  }

  @Listen('scroll', {target: 'window'})
  handleInfiniteScroll() {
    if (!this.enableInfiniteScroll) {
      return;
    }

    const hasReachedEndOfElement =
      window.innerHeight + window.scrollY >= this.host.offsetHeight;

    if (hasReachedEndOfElement) {
      this.resultList.fetchMoreResults();
    }
  }

  public componentDidRender() {
    if (this.resultListState.firstSearchExecuted) {
      this.listWrapperRef?.classList.remove('placeholder');
    }
  }

  public render() {
    return <ResultListComponent parent={this} />;
  }
}

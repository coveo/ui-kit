import {
  Component,
  h,
  Element,
  State,
  Prop,
  Listen,
  Host,
  Method,
} from '@stencil/core';
import {
  ResultTemplatesManager,
  buildResultTemplatesManager,
  Result,
  buildResultsPerPage,
  ResultsPerPageState,
  ResultsPerPage,
  buildFoldedResultList,
  FoldedResultList,
  FoldedResult,
  FoldedResultListState,
  FoldedResultListProps,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  getResultDisplayClasses,
} from '../../atomic-result/atomic-result-display-options';
import {TemplateContent} from '../../atomic-result-template/atomic-result-template';
import {once} from '../../../utils/utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';

/**
 * The `atomic-folded-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @internal
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
  tag: 'atomic-folded-result-list',
  styleUrl: 'atomic-folded-result-list.pcss',
  shadow: true,
})
export class AtomicFoldedResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private resultList!: FoldedResultList;
  public resultsPerPage!: ResultsPerPage;
  private resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;

  @Element() private host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  private resultListState!: FoldedResultListState;

  @BindStateToController('resultsPerPage')
  @State()
  private resultsPerPageState!: ResultsPerPageState;

  @State() public error!: Error;
  @State() private templateHasError = false;

  /**
   * TODO:
   */
  @Prop({reflect: true}) public collectionField?: string;
  /**
   * TODO:
   */
  @Prop({reflect: true}) public parentField?: string;
  /**
   * TODO:
   */
  @Prop({reflect: true}) public childField?: string;

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

  private renderingFunction?: (result: FoldedResult) => HTMLElement = undefined;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param render
   */
  @Method() public async setRenderFunction(
    render: (result: FoldedResult) => HTMLElement
  ) {
    this.renderingFunction = render;
  }

  private listWrapperRef?: HTMLDivElement;

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
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );
    this.resultList = this.initFolding({
      fieldsToInclude: [...this.defaultFieldsToInclude, ...this.fields],
    });
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
    this.registerDefaultResultTemplates();
    this.registerChildrenResultTemplates();
  }

  private initFolding(options = {}) {
    const opts: FoldedResultListProps = {};
    opts.options = {...options};
    opts.options.folding = {};
    if (this.collectionField) {
      opts.options.folding.collectionField = this.collectionField;
    }
    if (this.parentField) {
      opts.options.folding.parentField = this.parentField;
    }
    if (this.childField) {
      opts.options.folding.childField = this.childField;
    }

    return buildFoldedResultList(this.bindings.engine, opts);
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

  private getTemplate(foldedResult: FoldedResult): TemplateContent {
    return this.resultTemplatesManager.selectTemplate(foldedResult.result)!;
  }

  private getId(result: Result) {
    return result.uniqueId + this.resultListState.searchResponseId;
  }

  private buildListPlaceholders() {
    return Array.from(
      {length: this.resultsPerPageState.numberOfResults},
      (_, i) => (
        <atomic-result-placeholder
          key={`placeholder-${i}`}
          density={this.density}
          display="list"
          imageSize={this.imageSize ?? this.image}
        ></atomic-result-placeholder>
      )
    );
  }

  private buildListResults() {
    return this.resultListState.results.map((result) => (
      <atomic-result
        key={this.getId(result.result)}
        result={result}
        engine={this.bindings.engine}
        density={this.density}
        imageSize={this.imageSize ?? this.image}
        content={this.getContentOfResultTemplate(result)}
      ></atomic-result>
    ));
  }

  private getContentOfResultTemplate(
    result: FoldedResult
  ): HTMLElement | DocumentFragment {
    return this.renderingFunction
      ? this.renderingFunction(result)
      : this.getTemplate(result);
  }

  private buildResultWrapper() {
    return (
      <div
        class={`list-wrapper placeholder ${this.classes}`}
        ref={(el) => (this.listWrapperRef = el as HTMLDivElement)}
      >
        <div class={`list-root ${this.classes}`} part="result-list">
          {this.buildListPlaceholders()}
          {this.resultListState.results.length ? this.buildListResults() : null}
        </div>
      </div>
    );
  }

  private get classes() {
    const classes = getResultDisplayClasses(
      'list',
      this.density,
      this.imageSize ?? this.image
    );
    if (
      this.resultListState.firstSearchExecuted &&
      this.resultList.state.isLoading
    ) {
      classes.push('loading');
    }
    return classes.join(' ');
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

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();
    if (this.resultListState.hasError) {
      return;
    }

    return (
      <Host>
        {this.templateHasError && <slot></slot>}
        {this.buildResultWrapper()}
      </Host>
    );
  }
}

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
  ResultList,
  ResultListState,
  ResultTemplatesManager,
  buildResultList,
  buildResultTemplatesManager,
  Result,
  buildResultsPerPage,
  ResultsPerPageState,
  ResultsPerPage,
  buildInteractiveResult,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {
  ResultDisplayLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  getResultDisplayClasses,
} from '../atomic-result/atomic-result-display-options';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {once} from '../../utils/utils';
import {updateBreakpoints} from '../../utils/replace-breakpoint';

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
  private resultList!: ResultList;
  public resultsPerPage!: ResultsPerPage;
  private resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;

  @Element() private host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;

  @BindStateToController('resultsPerPage')
  @State()
  private resultsPerPageState!: ResultsPerPageState;

  @State() public error!: Error;
  @State() private templateHasError = false;

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
  @Prop({reflect: true}) display: ResultDisplayLayout = 'list';
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

  private getId(result: Result) {
    return result.uniqueId + this.resultListState.searchResponseId;
  }

  private buildListPlaceholders() {
    return Array.from(
      {length: this.resultsPerPageState.numberOfResults},
      (_, i) => (
        <atomic-result-placeholder
          key={`placeholder-${i}`}
          display={this.display}
          density={this.density}
          imageSize={this.imageSize ?? this.image}
        ></atomic-result-placeholder>
      )
    );
  }

  private buildListResults() {
    return this.resultListState.results.map((result) => {
      const content = this.getContentOfResultTemplate(result);

      const atomicResult = (
        <atomic-result
          key={this.getId(result)}
          result={result}
          engine={this.bindings.engine}
          display={this.display}
          density={this.density}
          imageSize={this.imageSize ?? this.image}
          content={content}
        ></atomic-result>
      );

      return this.display === 'grid' ? (
        <LinkWithResultAnalytics
          part="result-list-grid-clickable"
          interactiveResult={buildInteractiveResult(this.bindings.engine, {
            options: {result},
          })}
          href={result.clickUri}
          target="_self"
        >
          {atomicResult}
        </LinkWithResultAnalytics>
      ) : (
        atomicResult
      );
    });
  }

  private buildTablePlaceholder() {
    return (
      <atomic-result-table-placeholder
        density={this.density}
        imageSize={this.imageSize ?? this.image}
        rows={this.resultsPerPageState.numberOfResults}
      ></atomic-result-table-placeholder>
    );
  }

  private buildTable() {
    const fieldColumns = Array.from(
      this.getContentOfResultTemplate(
        this.resultListState.results[0]
      ).querySelectorAll('atomic-table-element')
    );

    if (fieldColumns.length === 0) {
      this.bindings.engine.logger.error(
        'atomic-table-element elements missing in the result template to display columns.',
        this.host
      );
    }

    return (
      <table class={`list-root ${this.classes}`} part="result-table">
        <thead part="result-table-heading">
          <tr part="result-table-heading-row">
            {fieldColumns.map((column) => (
              <th part="result-table-heading-cell">
                <atomic-text
                  value={column.getAttribute('label')!}
                ></atomic-text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody part="result-table-body">
          {this.resultListState.results.map((result, rowIndex) => (
            <tr
              key={this.getId(result)}
              part={
                'result-table-row ' +
                (rowIndex % 2 === 1
                  ? 'result-table-row-even'
                  : 'result-table-row-odd') /* Offset by 1 since the index starts at 0 */
              }
            >
              {fieldColumns.map((column) => {
                return (
                  <td
                    key={column.getAttribute('label')! + this.getId(result)}
                    part="result-table-cell"
                  >
                    <atomic-result
                      engine={this.bindings.engine}
                      result={result}
                      display={this.display}
                      density={this.density}
                      image-size={this.imageSize ?? this.image}
                      content={column}
                    ></atomic-result>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  private getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.renderingFunction
      ? this.renderingFunction(result)
      : this.getTemplate(result);
  }

  private buildList() {
    return (
      <div class={`list-root ${this.classes}`} part="result-list">
        {this.buildListPlaceholders()}
        {this.resultListState.results.length ? this.buildListResults() : null}
      </div>
    );
  }

  private buildResultRoot() {
    if (this.display === 'table') {
      return [
        this.buildTablePlaceholder(),
        this.resultListState.results.length ? this.buildTable() : null,
      ];
    }

    return this.buildList();
  }

  private buildResultWrapper() {
    return (
      <div
        class={`list-wrapper placeholder ${this.classes}`}
        ref={(el) => (this.listWrapperRef = el as HTMLDivElement)}
      >
        {this.buildResultRoot()}
      </div>
    );
  }

  private get classes() {
    const classes = getResultDisplayClasses(
      this.display,
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

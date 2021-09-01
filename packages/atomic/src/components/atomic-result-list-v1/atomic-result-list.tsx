import {Component, h, Element, State, Prop, Listen, Host} from '@stencil/core';
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
import defaultTemplate from '../../templates/default.html';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {parseHTML} from '../../utils/utils';
import {
  ResultDisplayLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  getResultDisplayClasses,
} from '../atomic-result-v1/atomic-result-display-options';

/**
 * The `atomic-result-list` component is responsible for displaying query results by applying one or more result templates.
 */
@Component({
  tag: 'atomic-result-list-v1',
  styleUrl: 'atomic-result-list.pcss',
  shadow: false,
})
export class AtomicResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private resultList!: ResultList;
  public resultsPerPage!: ResultsPerPage;
  private resultTemplatesManager!: ResultTemplatesManager<string>;

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
   * A list of fields to include in the query results, separated by commas.
   */
  @Prop() public fieldsToInclude = '';

  @Prop() display: ResultDisplayLayout = 'list';

  @Prop() density: ResultDisplayDensity = 'normal';

  @Prop() image: ResultDisplayImageSize = 'icon';

  private placeholdersRef: HTMLElement[] = [];
  private resultsWereRendered = false;

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
    this.resultTemplatesManager.registerTemplates({
      content: defaultTemplate,
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

  private getTemplate(result: Result) {
    return this.resultTemplatesManager.selectTemplate(result) || '';
  }

  private getId(result: Result) {
    return result.uniqueId + this.resultListState.searchResponseId;
  }

  private buildListPlaceholders() {
    this.placeholdersRef = [];
    return Array.from(
      {length: this.resultsPerPageState.numberOfResults},
      (_, i) => (
        <atomic-result-placeholder-v1
          key={`placeholder-${i}`}
          display={this.display}
          density={this.density}
          image={this.image}
          ref={(el) => this.placeholdersRef.push(el!)}
        ></atomic-result-placeholder-v1>
      )
    );
  }

  private buildListResults() {
    return this.resultListState.results.map((result) => (
      <atomic-result-v1
        key={this.getId(result)}
        result={result}
        engine={this.bindings.engine}
        display={this.display}
        density={this.density}
        image={this.image}
        content={this.getTemplate(result)}
      ></atomic-result-v1>
    ));
  }

  private buildTablePlaceholder() {
    this.placeholdersRef = [];
    return (
      <atomic-result-table-placeholder-v1
        density={this.density}
        image={this.image}
        rows={this.resultsPerPageState.numberOfResults}
        ref={(el) => this.placeholdersRef.push(el!)}
      ></atomic-result-table-placeholder-v1>
    );
  }

  private buildTable() {
    const fieldColumns = Array.from(
      parseHTML(
        this.getTemplate(this.resultListState.results[0])
      ).querySelectorAll('atomic-table-element-v1')
    );

    return (
      <table class={`list-root ${this.getClasses().join(' ')}`}>
        <thead>
          <tr>
            {fieldColumns.map((column) => (
              <th>
                <atomic-text
                  value={column.getAttribute('label')!}
                ></atomic-text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {this.resultListState.results.map((result) => (
            <tr key={this.getId(result)}>
              {fieldColumns.map((column) => (
                <td key={column.getAttribute('label')! + this.getId(result)}>
                  <atomic-table-cell-v1
                    result={result}
                    content={column.innerHTML}
                  ></atomic-table-cell-v1>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  private buildList() {
    return (
      <div class={`list-root ${this.getClasses().join(' ')}`}>
        {!this.resultsWereRendered ? this.buildListPlaceholders() : null}
        {this.resultListState.results.length ? this.buildListResults() : null}
      </div>
    );
  }

  private buildResultRoot() {
    if (this.display === 'table') {
      return [
        !this.resultsWereRendered ? this.buildTablePlaceholder() : null,
        this.resultListState.results.length ? this.buildTable() : null,
      ];
    }

    return this.buildList();
  }

  private getClasses() {
    const classes = getResultDisplayClasses(
      this.display,
      this.density,
      this.image
    );
    if (
      this.resultListState.firstSearchExecuted &&
      this.resultList.state.isLoading
    ) {
      classes.push('loading');
    }
    return classes;
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
    if (this.shouldCleanupPlaceholders()) {
      this.resultsWereRendered = true;
      this.placeholdersRef.forEach((placeholder) => placeholder.remove());
      this.placeholdersRef = [];
    }
  }

  public render() {
    if (this.resultListState.hasError) {
      return;
    }

    return (
      <Host>
        {this.templateHasError && <slot></slot>}
        {this.buildResultRoot()}
      </Host>
    );
  }

  private shouldCleanupPlaceholders() {
    return (
      this.resultListState.results.length > 0 &&
      !this.resultsWereRendered &&
      this.placeholdersRef.length > 0
    );
  }
}

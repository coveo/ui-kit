import {Component, h, Element, State, Prop, Listen} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  ResultTemplatesManager,
  buildResultList,
  buildResultTemplatesManager,
  ResultsPerPage,
  ResultsPerPageState,
  buildResultsPerPage,
} from '@coveo/headless';
import Mustache from 'mustache';
import defaultTemplate from '../../templates/default.html';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

/**
 * The `ResultList` component is responsible for displaying query results by applying one or several result templates.
 *
 * @part list-element - The list element
 */
@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.pcss',
  shadow: true,
})
export class AtomicResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public resultPerPage!: ResultsPerPage;
  private resultList!: ResultList;
  private resultTemplatesManager!: ResultTemplatesManager<string>;

  @Element() private host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;
  @BindStateToController('resultPerPage')
  @State()
  private resultPerPageState!: ResultsPerPageState;
  @State() public error!: Error;

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

  private get fields() {
    if (this.fieldsToInclude.trim() === '') return;
    return this.fieldsToInclude.split(',').map((field) => field.trim());
  }

  public initialize() {
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );
    this.resultList = buildResultList(this.bindings.engine, {
      options: {fieldsToInclude: this.fields},
    });
    this.resultPerPage = buildResultsPerPage(this.bindings.engine);
    this.registerDefaultResultTemplates();
    this.registerChildrenResultTemplates();
  }

  private registerDefaultResultTemplates() {
    // TODO: get fields & conditions from default templates
    this.resultTemplatesManager.registerTemplates({
      content: defaultTemplate,
      conditions: [],
    });
  }

  private registerChildrenResultTemplates() {
    this.host
      .querySelectorAll('atomic-result-template')
      .forEach(async (resultTemplateElement) => {
        const conditions = await resultTemplateElement.getConditions();
        const fields = await resultTemplateElement.getFields();
        this.resultTemplatesManager.registerTemplates({
          content: resultTemplateElement.innerHTML,
          conditions,
          fields,
          priority: 1,
        });
      });
  }

  private get results() {
    return this.resultListState.results.map((result) => (
      <atomic-result
        key={result.uniqueId}
        part="list-element"
        result={result}
        engine={this.bindings.engine}
        innerHTML={Mustache.render(
          this.resultTemplatesManager.selectTemplate(result) || '',
          result
        )}
      ></atomic-result>
    ));
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

  private renderPlaceholder() {
    const results = [];
    for (let i = 0; i < this.resultPerPageState.numberOfResults; i++) {
      results.push(
        <div class="flex pl-5 pt-5 mb-5">
          <div class="w-14 h-14 bg-divider mr-8"></div>
          <div class="flex-grow">
            <div>
              <div class="flex justify-between mb-5">
                <div class="h-3 bg-divider w-1/2"></div>
                <div class="h-2 bg-divider w-1/6"></div>
              </div>
              <div class="h-2 bg-divider w-4/6 mb-3"></div>
              <div class="h-2 bg-divider w-5/6 mb-3"></div>
              <div class="h-2 bg-divider w-5/12"></div>
            </div>
          </div>
        </div>
      );
    }
    return results;
  }

  public render() {
    if (!this.resultListState.firstSearchExecuted) {
      return this.renderPlaceholder();
    }

    return this.results;
  }
}

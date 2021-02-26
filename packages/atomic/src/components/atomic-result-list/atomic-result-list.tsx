import {Component, h, Element, State, Prop, Listen} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  ResultTemplatesManager,
  buildResultList,
  buildResultTemplatesManager,
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
 */
@Component({
  tag: 'atomic-result-list',
  shadow: false,
})
export class AtomicResultList implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private resultList!: ResultList;
  private resultTemplatesManager!: ResultTemplatesManager<string>;

  @Element() private host!: HTMLDivElement;

  @BindStateToController('resultList')
  @State()
  private resultListState!: ResultListState;

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
    this.registerDefaultResultTemplates();
    this.registerChildrenResultTemplates();
  }

  private registerDefaultResultTemplates() {
    // TODO: build more default templates
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

  private get results() {
    return this.resultListState.results.map((result) => (
      <atomic-result
        key={result.raw.permanentid}
        result={result}
        engine={this.bindings.engine}
        // TODO: decide to get rid of Mustache or not
        content={Mustache.render(
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

  public render() {
    if (!this.resultListState.firstSearchExecuted) {
      return <atomic-result-list-placeholder></atomic-result-list-placeholder>;
    }

    return [this.templateHasError && <slot></slot>, this.results];
  }
}

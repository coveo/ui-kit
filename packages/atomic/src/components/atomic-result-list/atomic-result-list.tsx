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
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

/**
 * @part list - The list wrapper
 * @part list-element - The list element
 */
@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.css',
  shadow: true,
})
export class AtomicResultList implements AtomicComponentInterface {
  /**
   * Whether to automatically retrieve an additional page of results and append it to the
   * current results when the user scrolls down to the bottom of element
   */
  @Prop() enableInfiniteScroll = false;
  /**
   * Css class for the list wrapper
   */
  @Prop() listClass = '';
  /**
   * Css class for a list element
   */
  @Prop() listElementClass = '';
  @Prop() fieldsToInclude = '';
  @Element() host!: HTMLDivElement;
  @State() controllerState!: ResultListState;

  public bindings!: Bindings;
  public controller!: ResultList;
  private resultTemplatesManager!: ResultTemplatesManager<string>;

  private get fields() {
    if (this.fieldsToInclude.trim() === '') return;
    return this.fieldsToInclude.split(',').map((field) => field.trim());
  }

  @Initialization()
  public initialize() {
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );
    this.controller = buildResultList(this.bindings.engine, {
      options: {fieldsToInclude: this.fields},
    });
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
    return this.controllerState.results.map((result) => (
      <atomic-result
        key={result.uniqueId}
        part="list-element"
        class={this.listElementClass}
        result={result}
        engine={this.bindings.engine}
        innerHTML={Mustache.render(
          this.resultTemplatesManager.selectTemplate(result) || '',
          result
        )}
      ></atomic-result>
    ));
  }

  // TODO: improve rudimentary infinite scroll, add scroll container option
  @Listen('scroll', {target: 'window'})
  handleInfiniteScroll() {
    if (!this.enableInfiniteScroll) {
      return;
    }

    const hasReachedEndOfElement =
      window.innerHeight + window.scrollY >= this.host.offsetHeight;

    if (hasReachedEndOfElement) {
      this.controller.fetchMoreResults();
    }
  }

  // TODO: improve loading
  public renderLoading() {
    return (
      <div class="loading">
        {Array.from(Array(10)).map(() => (
          <p></p>
        ))}
      </div>
    );
  }

  public render() {
    if (this.controllerState.isLoading) {
      return this.renderLoading();
    }

    return (
      <div part="list" class={this.listClass}>
        {this.results}
      </div>
    );
  }
}

import {Component, h, Element, State} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  Unsubscribe,
  ResultTemplatesManager,
  buildResultList,
  Engine,
} from '@coveo/headless';
import Mustache from 'mustache';
import defaultTemplate from '../../templates/default.html';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.css',
  shadow: true,
})
export class AtomicResultList {
  @Element() host!: HTMLDivElement;
  @State() state!: ResultListState;
  private engine!: Engine;
  private unsubscribe: Unsubscribe = () => {};
  private resultList!: ResultList;
  private resultTemplatesManager!: ResultTemplatesManager<string>;

  @Initialization()
  public initialize() {
    this.resultTemplatesManager = new ResultTemplatesManager<string>(
      this.engine
    );
    this.resultList = buildResultList(this.engine);
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
    this.registerDefaultResultTemplates();
    this.registerChildrenResultTemplates();
  }

  private fetchMoreResults() {
    if (!this.state.isLoading) {
      this.resultList.fetchMoreResults();
    }
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

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.resultList.state;
  }

  private get results() {
    return this.state.results.map((result) => (
      <atomic-result
        result={result}
        engine={this.engine}
        innerHTML={Mustache.render(
          this.resultTemplatesManager.selectTemplate(result) || '',
          result
        )}
      ></atomic-result>
    ));
  }

  public render() {
    return [
      ...this.results,
      <button id="fetch-more-results" onClick={() => this.fetchMoreResults()}>
        Fetch more results
      </button>,
    ];
  }
}

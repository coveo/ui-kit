import {Component, h, Element, State} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  Unsubscribe,
  ResultTemplatesManager,
} from '@coveo/headless';
import {headlessEngine} from '../../engine';
import Mustache from 'mustache';
import defaultTemplate from '../../templates/default.html';

@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.css',
  shadow: true,
})
export class AtomicResultList {
  @Element() host!: HTMLDivElement;
  private resultList: ResultList;
  private unsubscribe: Unsubscribe;
  private resultTemplatesManager = new ResultTemplatesManager<string>();

  @State() state!: ResultListState;

  constructor() {
    this.resultList = new ResultList(headlessEngine);
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
    this.registerDefaultResultTemplates();
    this.registerChildrenResultTemplates();
  }

  private registerDefaultResultTemplates() {
    // Eventually there would be more default templates
    // They could all be registered here.
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
        this.resultTemplatesManager.registerTemplates({
          content: resultTemplateElement.innerHTML,
          conditions,
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
      <div
        class="result"
        id={result.uniqueId}
        innerHTML={Mustache.render(
          this.resultTemplatesManager.selectTemplate(result) || '',
          result
        )}
      ></div>
    ));
  }

  public render() {
    return this.results;
  }
}

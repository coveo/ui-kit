import {Component, h, Element, State} from '@stencil/core';
import {
  ResultList,
  ResultListState,
  Unsubscribe,
  ResultTemplatesManager,
  buildResultList,
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
  private resultTemplatesManager = new ResultTemplatesManager<string>(
    headlessEngine
  );

  @State() state!: ResultListState;

  constructor() {
    this.resultList = buildResultList(headlessEngine);
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
  }

  public componentWillLoad() {
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
        innerHTML={Mustache.render(
          this.resultTemplatesManager.selectTemplate(result) || '',
          result
        )}
      ></atomic-result>
    ));
  }

  public render() {
    return this.results;
  }
}

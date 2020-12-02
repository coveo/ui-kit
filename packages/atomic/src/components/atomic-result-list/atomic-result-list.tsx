import {Component, h, Element, State, Prop} from '@stencil/core';
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

/**
 * @part list - The list wrapper
 * @part list-element - The list element
 */
@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.scss',
  shadow: true,
})
export class AtomicResultList {
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
  @State() state!: ResultListState;

  private engine!: Engine;
  private unsubscribe: Unsubscribe = () => {};
  private resultList!: ResultList;
  private resultTemplatesManager!: ResultTemplatesManager<string>;

  private get fields() {
    if (this.fieldsToInclude.trim() === '') return;
    return this.fieldsToInclude.split(',').map((field) => field.trim());
  }

  @Initialization()
  public initialize() {
    this.resultTemplatesManager = new ResultTemplatesManager<string>(
      this.engine
    );
    this.resultList = buildResultList(this.engine, {
      options: {fieldsToInclude: this.fields},
    });
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());

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
        key={result.uniqueId}
        part="list-element"
        class={this.listElementClass}
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
    return (
      <div part="list" class={this.listClass}>
        {this.results}
      </div>
    );
  }
}

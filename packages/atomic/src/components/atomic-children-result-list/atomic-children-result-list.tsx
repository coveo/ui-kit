import {
  buildResultTemplatesManager,
  FoldedResult,
  ResultTemplatesManager,
} from '@coveo/headless';
import {Component, h, State, Element} from '@stencil/core';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';

import {FoldedResultContext} from '../result-template-components/result-template-decorators';

@Component({
  tag: 'atomic-children-result-list',
  styleUrl: 'atomic-children-result-list.pcss',
  shadow: true,
})
export class AtomicChildrenResultList {
  private childResultsTemplatesManager!: ResultTemplatesManager<TemplateContent>;

  @InitializeBindings() public bindings!: Bindings;
  @Element() private host!: HTMLElement;

  @FoldedResultContext() private foldedResult!: FoldedResult;

  @State() public ready = false;
  @State() public error!: Error;

  private constructor() {
    this.host.removeAttribute('result-children');
  }

  public async initialize() {
    this.childResultsTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );
    await this.registerChildrenResultTemplates();
    this.ready = true;
  }

  private registerChildrenResultTemplates() {
    return this.host
      .querySelectorAll('atomic-result-children-template')
      .forEach(async (childrenResultTemplateElement) => {
        const template = await childrenResultTemplateElement.getTemplate();
        this.childResultsTemplatesManager.registerTemplates(template!);
      });
  }

  public render() {
    if (!this.ready) return null;
    return this.foldedResult.children.map((child) => {
      const template = this.childResultsTemplatesManager.selectTemplate(
        child.result
      );
      if (!template) return null;
      return (
        <atomic-child-result
          template={template}
          child={child.result}
        ></atomic-child-result>
      );
    });
  }
}

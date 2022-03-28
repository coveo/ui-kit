import {Component, Element, State, h} from '@stencil/core';
import {
  buildResultTemplatesManager,
  FoldedResult,
  ResultTemplate,
  ResultTemplatesManager,
} from '@coveo/headless';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../utils/utils';
import {ResultContext} from '../result-template-components/result-template-decorators';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';

const childTemplateComponent = 'atomic-result-children-template';
/**
 * TODO:
 */
@Component({
  tag: 'atomic-result-children',
  shadow: true,
})
export class AtomicResultChildren {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext({folded: true}) private result!: FoldedResult;

  private childrenResultsTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  @Element() private host!: HTMLDivElement;
  @State() public error!: Error;
  @State() public ready = false;
  @State() private templateHasError = false;

  public async initialize() {
    const childrenTemplates = Array.from(
      this.host.querySelectorAll(childTemplateComponent)
    ).filter((template) => {
      return !elementHasAncestorTag(template, childTemplateComponent);
    });

    if (!childrenTemplates.length) {
      this.error = new Error(
        `The "atomic-result-children" component requires at least one ${childTemplateComponent} component.`
      );
      return;
    }

    if (this.result.children) {
      this.childrenResultsTemplatesManager = buildResultTemplatesManager(
        this.bindings.engine
      );
      const templates = (await Promise.all(
        childrenTemplates.map(async (childTemplate) => {
          const template = await childTemplate.getTemplate();
          if (!template) {
            this.templateHasError = true;
          }
          return template;
        })
      )) as ResultTemplate<DocumentFragment>[];

      if (!this.templateHasError) {
        this.childrenResultsTemplatesManager.registerTemplates(...templates);
      }
      this.ready = true;
    }
  }

  public render() {
    if (!this.ready) return null;
    if (this.templateHasError) return <slot></slot>;
    if (this.result.children.length) {
      return this.result.children.map((child) => {
        const content = this.childrenResultsTemplatesManager.selectTemplate(
          child.result
        );
        if (content) {
          return (
            <atomic-result
              content={content}
              result={child}
              engine={this.bindings.engine}
            ></atomic-result>
          );
        }
        return null;
      });
    }
    return null;
  }
}

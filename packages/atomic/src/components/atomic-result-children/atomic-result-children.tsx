import {FoldedResult, Result, ResultTemplatesManager} from '@coveo/headless';
import {Component, Element, State, h, Host, Listen, Prop} from '@stencil/core';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../utils/utils';
import {
  ResultContext,
  ChildTemplatesContext,
  ChildTemplatesContextEvent,
} from '../result-template-components/result-template-decorators';
import {ResultListCommon} from '../result-lists/result-list-common';
import {TemplateContent} from '../result-templates/result-template-common';

const childTemplateComponent = 'atomic-result-children-template';
const componentTag = 'atomic-result-children';

/**
 * TODO:
 * @internal
 */
@Component({
  tag: 'atomic-result-children',
  shadow: true,
})
export class AtomicResultChildren {
  @InitializeBindings() public bindings!: Bindings;
  @ChildTemplatesContext()
  public templatesManager!: ResultTemplatesManager<TemplateContent>;
  @ResultContext({folded: true}) private result!: FoldedResult;

  public resultListCommon?: ResultListCommon;

  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() public ready = false;
  @State() public templateHasError = false;

  /**
   * Whether to inherit templates defined in a parent atomic-result-children. Only works for the second level of child nesting.
   */
  @Prop() inheritTemplates = false;

  @Listen('atomic/resolveChildTemplates')
  public resolveChildTemplates(event: ChildTemplatesContextEvent) {
    event.preventDefault();
    event.detail(this.resultListCommon?.resultTemplatesManager);
  }

  public async initialize() {
    const childrenTemplates = Array.from(
      this.host.querySelectorAll(childTemplateComponent)
    ).filter((template) => {
      return !elementHasAncestorTag(template, childTemplateComponent);
    });
    if (!childrenTemplates.length && !this.inheritTemplates) {
      this.error = new Error(
        `The "${componentTag}" component requires at least one "${childTemplateComponent}" component.`
      );
      return;
    }

    if (this.result.children.length) {
      this.resultListCommon = new ResultListCommon({
        host: this.host,
        bindings: this.bindings,
        templateElements: this.host.querySelectorAll(childTemplateComponent),
        includeDefaultTemplate: false,
        onReady: () => {
          this.ready = true;
        },
        onError: () => {
          this.templateHasError = true;
        },
      });
    }
  }

  private selectInheritedTemplate(result: Result) {
    const content = this.templatesManager?.selectTemplate(result);
    if (!content) return;

    const fragment = document.createDocumentFragment();
    const children = Array.from(content.children).filter(
      (el) =>
        el.tagName.toLowerCase() !== componentTag &&
        !el.querySelector(componentTag)
    );
    fragment.append(...children);
    return fragment;
  }

  private getContent(result: Result) {
    return (
      this.resultListCommon!.resultTemplatesManager.selectTemplate(result) ||
      this.selectInheritedTemplate(result)
    );
  }

  private renderChild(child: FoldedResult) {
    const content = this.getContent(child.result);
    if (!content) return null;
    return (
      <atomic-result
        content={content}
        result={child}
        engine={this.bindings.engine}
      ></atomic-result>
    );
  }

  public render() {
    if (!this.ready) return null;
    if (this.templateHasError) return <slot></slot>;
    if (this.result.children.length) {
      // TODO: document this in KIT-1519 and KIT-1520
      return (
        <Host>
          <slot name="before-children"></slot>
          {this.result.children.map((child) => this.renderChild(child))}
          <slot name="after-children"></slot>
        </Host>
      );
    }
    return null;
  }
}

import {Component, Element, State, h} from '@stencil/core';
import {
  buildResultTemplatesManager,
  FoldedResult,
  ResultTemplatesManager,
} from '@coveo/headless';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../utils/utils';
import {ResultContext} from '../result-template/result-template-components/result-template-decorators';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';
import {registerResultTemplates} from '../result-lists/result-list-common';

const childTemplateComponent = 'atomic-result-children-template';

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
  @ResultContext({folded: true}) private result!: FoldedResult;

  public resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() public ready = false;
  @State() public templateHasError = false;

  public async initialize() {
    const childrenTemplates = Array.from(
      this.host.querySelectorAll(childTemplateComponent)
    ).filter((template) => {
      return !elementHasAncestorTag(template, childTemplateComponent);
    });
    if (!childrenTemplates.length) {
      this.error = new Error(
        `The "atomic-result-children" component requires at least one "${childTemplateComponent}" component.`
      );
      return;
    }

    if (this.result.children) {
      this.resultTemplatesManager = buildResultTemplatesManager(
        this.bindings.engine
      );
      await registerResultTemplates.call(this, childrenTemplates);

      this.ready = true;
    }
  }

  public render() {
    if (!this.ready) return null;
    if (this.templateHasError) return <slot></slot>;
    if (this.result.children.length) {
      return this.result.children.map((child) => {
        const content = this.resultTemplatesManager.selectTemplate(
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

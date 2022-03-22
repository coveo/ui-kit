import {
  Result,
  FoldedResult,
  ResultTemplatesManager,
  buildResultTemplatesManager,
  ResultTemplate,
} from '@coveo/headless';
import {Component, State, h, Element, Method, Host} from '@stencil/core';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {FoldedResultContext} from '../result-template-components/result-template-decorators';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';

/**
 * The `atomic-result-folding` renders folded result sets. It is usable inside a result template when there is an
 * active [`Folding`]{@link Folding} component in the page. This component takes care of rendering the parent result and
 * its child results in a coherent manner.
 *
 * This component is a result template component (see [Result Templates](https://docs.coveo.com/en/413/)).
 *
 * See [Folding Results](https://docs.coveo.com/en/428/).
 */
@Component({
  tag: 'atomic-result-children',
  shadow: true,
})
export class AtomicResultChildren {
  @InitializeBindings() public bindings!: Bindings;
  @FoldedResultContext() private foldedResult!: FoldedResult;

  @State() public error!: Error;
  @Element() private host!: HTMLDivElement;

  @State() private ready: Boolean = false;

  private renderingFunction?: (result: Result) => HTMLElement = undefined;

  private resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;
  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param render
   */
  @Method() public async setRenderFunction(
    render: (result: Result) => HTMLElement
  ) {
    this.renderingFunction = render;
  }

  private getTemplate(result: Result): TemplateContent {
    return this.resultTemplatesManager.selectTemplate(result)!;
  }

  private getContentOfResultTemplate(
    result: Result
  ): HTMLElement | DocumentFragment {
    return this.renderingFunction
      ? this.renderingFunction(result)
      : this.getTemplate(result);
  }

  public async initialize() {
    if (!this.foldedResult.children.length) return;
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.bindings.engine
    );
    await this.registerChildrenResultTemplates();
    this.ready = true;
  }

  private async registerChildrenResultTemplates() {
    const templates = (await Promise.all(
      Array.from(this.host.querySelectorAll('atomic-result-child-template'))
        .map(async (resultChildTemplate) => {
          const template = await resultChildTemplate.getTemplate();
          return template;
        })
        .filter((t) => t)
    )) as ResultTemplate<DocumentFragment>[];
    this.resultTemplatesManager.registerTemplates(...templates);
  }

  public render() {
    if (!this.foldedResult.children.length || !this.ready) {
      return null;
    }
    return (
      <Host>
        {this.foldedResult.children.map((c) => {
          return (
            <atomic-child-result
              result={c.result}
              content={this.getContentOfResultTemplate(c.result)}
            ></atomic-child-result>
          );
        })}
      </Host>
    );
  }
}

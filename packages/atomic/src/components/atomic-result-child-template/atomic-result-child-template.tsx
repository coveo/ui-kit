import {ResultTemplate, ResultTemplateCondition} from '@coveo/headless';
import {Component, State, h, Method, Element, Prop} from '@stencil/core';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';

/**
 */
@Component({
  tag: 'atomic-result-child-template',
  shadow: true,
})
export class AtomicResultChildTemplate {
  private matchConditions: ResultTemplateCondition[] = [];

  @State() public error!: Error;

  @Element() private host!: HTMLDivElement;

  @Prop() public conditions: ResultTemplateCondition[] = [];

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<ResultTemplate<TemplateContent> | null> {
    if (this.error) {
      return null;
    }

    return {
      conditions: this.getConditions(),
      content: this.getContent(),
      priority: 1,
    };
  }

  private getConditions() {
    return this.conditions.concat(this.matchConditions);
  }

  private getTemplateElement() {
    return (
      this.host.querySelector('template') ?? document.createElement('template')
    );
  }

  private getContent() {
    return this.getTemplateElement().content;
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}

import {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {Component, Element, h, Method, Prop, State} from '@stencil/core';
import {MapProp} from '../../utils/props-utils';
import {TemplateContent} from '../atomic-result-template/atomic-result-template';

@Component({
  tag: 'atomic-result-children-template',
  shadow: true,
})
export class AtomicResultChildrenTemplate {
  private matchConditions: ResultTemplateCondition[] = [];

  @State() private error?: Error;

  @Element() private host!: HTMLDivElement;

  @Prop() public conditions: ResultTemplateCondition[] = [];
  /**
   * Fields and field values that results must match for the result template to apply.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`
   */
  @MapProp({splitValues: true}) public mustMatch: Record<string, string[]> = {};

  /**
   * Fields and field values that results must not match for the result template to apply.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   */
  @MapProp({splitValues: true}) public mustNotMatch: Record<string, string[]> =
    {};

  constructor() {
    const rootNode = this.host.parentElement?.getRootNode() as ShadowRoot;
    const isParentResultTemplate = rootNode.host?.tagName === 'ATOMIC-RESULT';

    if (!isParentResultTemplate) {
      this.error = new Error(
        'The "atomic-result-child-template" component has to be the child of an "atomic-result" component.'
      );
      return;
    }
  }

  public componentWillLoad() {
    for (const field in this.mustMatch) {
      this.matchConditions.push(
        ResultTemplatesHelpers.fieldMustMatch(field, this.mustMatch[field])
      );
    }

    for (const field in this.mustNotMatch) {
      this.matchConditions.push(
        ResultTemplatesHelpers.fieldMustNotMatch(
          field,
          this.mustNotMatch[field]
        )
      );
    }
  }

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

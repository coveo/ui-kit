import {Component, h, Element, Prop, Method, State} from '@stencil/core';
import {MapProp} from '../../../utils/props-utils';
import {InsightResultTemplate, InsightResultTemplateCondition} from '..';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {makeMatchConditions} from '../../common/result-templates/result-template-common';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-template',
  shadow: true,
})
export class AtomicInsightResultTemplate {
  @State() public error!: Error;

  @Element() public host!: HTMLDivElement;
  public matchConditions: InsightResultTemplateCondition[] = [];

  /**
   * A function that must return true on results for the result template to apply.
   *
   * For example, a template with the following condition only applies to results whose `title` contains `singapore`:
   * `[(result) => /singapore/i.test(result.title)]`
   */
  @Prop() public conditions: InsightResultTemplateCondition[] = [];

  /**
   * The field that, when defined on a result item, would allow the template to be applied.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` and `sourcetype` fields are defined: `if-defined="filetype,sourcetype"`
   */
  @Prop({reflect: true}) ifDefined?: string;

  /**
   * The field that, when defined on a result item, would prevent the template from being applied.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` and `sourcetype` fields are NOT defined: `if-not-defined="filetype,sourcetype"`
   */
  @Prop({reflect: true}) ifNotDefined?: string;

  /**
   * The field and values that define which result items the condition must be applied to.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`
   */
  @MapProp({splitValues: true}) public mustMatch: Record<string, string[]> = {};

  /**
   * The field and values that define which result items the condition must not be applied to.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   */
  @MapProp({splitValues: true}) public mustNotMatch: Record<string, string[]> =
    {};

  public componentWillLoad() {
    if (this.ifDefined) {
      const fieldNames = this.ifDefined.split(',');
      this.conditions.push(
        ResultTemplatesHelpers.fieldsMustBeDefined(fieldNames)
      );
    }
    if (this.ifNotDefined) {
      const fieldNames = this.ifNotDefined.split(',');
      this.conditions.push(
        ResultTemplatesHelpers.fieldsMustNotBeDefined(fieldNames)
      );
    }
    this.matchConditions.push(
      ...makeMatchConditions(this.mustMatch, this.mustNotMatch)
    );
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<InsightResultTemplate<DocumentFragment> | null> {
    if (this.error) {
      return null;
    }

    return {
      conditions: this.conditions.concat(this.matchConditions),
      content: this.host.querySelector('template')!.content!,
      priority: 1,
    };
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

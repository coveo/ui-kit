import {
  Result,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {Component, Prop, h, Element} from '@stencil/core';
import {MapProp} from '../../../../utils/props-utils';
import {makeMatchConditions} from '../../../common/result-templates/result-template-common';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-field-condition` component takes a list of conditions that, if fulfilled, apply the template in which it's defined.
 * 
 * The condition properties can be based on any top-level result property of the `result` object, not restricted to fields (for example, `isRecommendation`).
 * 
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that define which result items the condition must be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that define which result items the condition must not be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 */
@Component({
  tag: 'atomic-field-condition',
  styleUrl: 'atomic-field-condition.pcss',
  shadow: false,
})
export class AtomicFieldCondition {
  @Element() host!: HTMLElement;

  /**
   * Verifies whether the specified fields are defined.
   */
  @Prop({reflect: true}) ifDefined?: string;
  /**
   * Verifies whether the specified fields are not defined.
   */
  @Prop({reflect: true}) ifNotDefined?: string;
  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * Use only when the condition you need to define can’t be expressed through exsisting `if-defined`,`if-not-defined`,`must-match`, etc. markup attributes of the component.
   * 
   * For example, the following targets an `atomic-field-condition` component and sets a condition to make it apply only to results whose title contains singapore:
   * `document.querySelector('atomic-result-template#templateId').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @Prop() conditions: ResultTemplateCondition[] = [];

  @MapProp({splitValues: true}) mustMatch: Record<string, string[]> = {};

  @MapProp({splitValues: true}) mustNotMatch: Record<string, string[]> = {};

  private shouldBeRemoved = false;

  @ResultContext() private result!: Result;

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

    this.conditions.push(
      ...makeMatchConditions(this.mustMatch, this.mustNotMatch)
    );
  }

  public render() {
    if (!this.conditions.every((condition) => condition(this.result))) {
      this.shouldBeRemoved = true;
      return '';
    }

    return <slot />;
  }

  public componentDidLoad() {
    this.shouldBeRemoved && this.host.remove();
  }
}

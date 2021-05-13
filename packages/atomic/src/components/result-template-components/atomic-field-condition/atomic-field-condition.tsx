import {Component, Prop, h, Element} from '@stencil/core';
import {
  Result,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {MapProp} from '../../../utils/props-utils';

/**
 * The `atomic-field-condition` component takes a list of conditions that, if fulfilled, apply the template in which it's defined.
 * @MapProp name: mustMatch;attr: must-match;docs: Creates a condition which verifies that a field's value contains any of the specified values.;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: Creates a condition which verifies that a field's value doesn't contain any of the specified values.;type: Record<string, string[]> ;default: {}
 */
@Component({
  tag: 'atomic-field-condition',
  shadow: false,
})
export class AtomicFieldCondition {
  @Element() host!: HTMLElement;

  /**
   * Verifies if the specified fields are defined
   */
  @Prop() ifDefined?: string;
  /**
   * Verifies if the specified fields are not defined
   */
  @Prop() ifNotDefined?: string;
  /**
   * A list of conditions that must be fulfilled for this template to be selected
   */
  @Prop() conditions: ResultTemplateCondition[] = [];
  @MapProp() mustMatch: Record<string, string[]> = {};
  @MapProp() mustNotMatch: Record<string, string[]> = {};

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

    for (const field in this.mustMatch) {
      this.conditions.push(
        ResultTemplatesHelpers.fieldMustMatch(field, this.mustMatch[field])
      );
    }

    for (const field in this.mustNotMatch) {
      this.conditions.push(
        ResultTemplatesHelpers.fieldMustNotMatch(
          field,
          this.mustNotMatch[field]
        )
      );
    }
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

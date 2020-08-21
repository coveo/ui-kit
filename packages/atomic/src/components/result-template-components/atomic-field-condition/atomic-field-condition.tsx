import {Component, Prop, h, Method} from '@stencil/core';
import {
  Result,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';
import {MapProp} from '../../../utils/props-utils';

@Component({
  tag: 'atomic-field-condition',
  shadow: true,
})
export class AtomicFieldCondition {
  @Prop() ifDefined?: string;

  @Prop() conditions: ResultTemplateCondition[] = [];
  @MapProp() mustMatch: Record<string, string[]> = {};
  @MapProp() mustNotMatch: Record<string, string[]> = {};

  private fields: string[] = [];

  @ResultContext() private result!: Result;

  componentWillLoad() {
    if (this.ifDefined) {
      const fieldNames = this.ifDefined.split(',');
      this.fields.push(...fieldNames);
      this.conditions.push(
        ResultTemplatesHelpers.fieldsMustBeDefined(fieldNames)
      );
    }

    for (const field in this.mustMatch) {
      this.conditions.push(
        ResultTemplatesHelpers.fieldMustMatch(field, this.mustMatch[field])
      );
      this.fields.push(field);
    }

    for (const field in this.mustNotMatch) {
      this.conditions.push(
        ResultTemplatesHelpers.fieldMustNotMatch(
          field,
          this.mustNotMatch[field]
        )
      );
      this.fields.push(field);
    }
  }

  @ResultContextRenderer
  public render() {
    if (!this.conditions.every((condition) => condition(this.result))) {
      return '';
    }

    return <slot />;
  }

  @Method()
  async getFields() {
    return this.fields;
  }
}

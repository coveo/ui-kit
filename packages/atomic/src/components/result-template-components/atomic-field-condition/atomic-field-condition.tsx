import {Component, Prop, h, Element} from '@stencil/core';
import {
  Result,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {MapProp} from '../../../utils/props-utils';

@Component({
  tag: 'atomic-field-condition',
  shadow: false,
})
export class AtomicFieldCondition {
  @Element() host!: HTMLElement;
  @Prop() ifDefined?: string;
  @Prop() ifNotDefined?: string;

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

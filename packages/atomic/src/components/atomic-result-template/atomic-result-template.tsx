import {Component, Element, Prop, Method} from '@stencil/core';
import {ResultTemplateCondition, resultTemplatesHelpers} from '@coveo/headless';
import {MapProp} from '../../utils/props-utils';

export interface FieldMatch {
  field: string;
  values: string[];
}

@Component({
  tag: 'atomic-result-template',
  shadow: true,
})
export class AtomicResultTemplate {
  @Element() host!: HTMLDivElement;
  @Prop() conditions: ResultTemplateCondition[] = [];
  @Prop() fieldsToInclude?: string;
  @MapProp() mustMatch: Record<string, string[]> = {};
  @MapProp() mustNotMatch: Record<string, string[]> = {};

  private fields: string[] = [];
  private matchConditions: ResultTemplateCondition[] = [];

  constructor() {
    const isParentResultList =
      this.host.parentElement?.nodeName === 'ATOMIC-RESULT-LIST';

    if (!isParentResultList) {
      throw new Error(
        'The "atomic-result-template" component has to be the child of an "atomic-result-list" component.'
      );
    }
  }

  componentWillLoad() {
    this.fieldsToInclude &&
      this.fields.push(...this.fieldsToInclude.split(','));

    for (const field in this.mustMatch) {
      this.matchConditions.push(
        resultTemplatesHelpers.fieldMustMatch(field, this.mustMatch[field])
      );
      this.fields.push(field);
    }

    for (const field in this.mustNotMatch) {
      this.matchConditions.push(
        resultTemplatesHelpers.fieldMustNotMatch(
          field,
          this.mustNotMatch[field]
        )
      );
      this.fields.push(field);
    }
  }

  @Method()
  async getConditions() {
    return this.conditions.concat(this.matchConditions);
  }

  @Method()
  async getFields() {
    const fieldValues: string[] = [];
    this.host
      .querySelectorAll('atomic-result-value')
      .forEach((resultValueElement) => {
        fieldValues.push(resultValueElement.value);
      });

    const fieldsPromises: Promise<string[]>[] = [];
    this.host
      .querySelectorAll('atomic-field-condition')
      .forEach((fieldConditionElement) => {
        fieldsPromises.push(fieldConditionElement.getFields());
      });

    return this.fields.concat(
      fieldValues,
      ...(await Promise.all(fieldsPromises))
    );
  }
}

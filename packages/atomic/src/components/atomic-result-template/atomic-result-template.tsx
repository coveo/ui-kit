import {Component, Element, Prop, Method} from '@stencil/core';
import {ResultTemplateCondition, ResultTemplatesHelpers} from '@coveo/headless';
import {MapProp} from '../../utils/props-utils';

export interface FieldMatch {
  field: string;
  values: string[];
}

@Component({
  tag: 'atomic-result-template',
  shadow: false,
})
export class AtomicResultTemplate {
  private fields: string[] = [];
  private matchConditions: ResultTemplateCondition[] = [];

  @Element() host!: HTMLDivElement;

  @Prop() conditions: ResultTemplateCondition[] = [];
  @Prop() fieldsToInclude?: string;
  @MapProp() mustMatch: Record<string, string[]> = {};
  @MapProp() mustNotMatch: Record<string, string[]> = {};

  constructor() {
    const isParentResultList =
      this.host.parentElement?.nodeName === 'ATOMIC-RESULT-LIST';

    if (!isParentResultList) {
      throw new Error(
        'The "atomic-result-template" component has to be the child of an "atomic-result-list" component.'
      );
    }
  }

  public componentWillLoad() {
    this.fieldsToInclude &&
      this.fields.push(...this.fieldsToInclude.split(','));

    for (const field in this.mustMatch) {
      this.matchConditions.push(
        ResultTemplatesHelpers.fieldMustMatch(field, this.mustMatch[field])
      );
      this.fields.push(field);
    }

    for (const field in this.mustNotMatch) {
      this.matchConditions.push(
        ResultTemplatesHelpers.fieldMustNotMatch(
          field,
          this.mustNotMatch[field]
        )
      );
      this.fields.push(field);
    }
  }

  @Method()
  public async getConditions() {
    return this.conditions.concat(this.matchConditions);
  }

  @Method()
  public async getFields() {
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

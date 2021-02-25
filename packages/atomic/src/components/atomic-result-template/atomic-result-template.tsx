import {Component, Element, Prop, Method, State, h} from '@stencil/core';
import {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
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
  private fields: string[] = [];
  private matchConditions: ResultTemplateCondition[] = [];

  @Element() private host!: HTMLDivElement;

  @State() private error?: Error;

  @Prop() public conditions: ResultTemplateCondition[] = [];
  @MapProp() public mustMatch: Record<string, string[]> = {};
  @MapProp() public mustNotMatch: Record<string, string[]> = {};

  constructor() {
    const isParentResultList =
      this.host.parentElement?.nodeName === 'ATOMIC-RESULT-LIST';

    if (!isParentResultList) {
      this.error = new Error(
        'The "atomic-result-template" component has to be the child of an "atomic-result-list" component.'
      );
      return;
    }

    if (!this.host.querySelector('template')) {
      this.error = new Error(
        'The "atomic-result-template" component has to contain a "template" element as a child.'
      );
    }
  }

  public componentWillLoad() {
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

  @Method() public async getTemplate(): Promise<ResultTemplate<string> | null> {
    if (this.error) {
      return null;
    }

    return {
      conditions: this.getConditions(),
      content: this.getContent(),
      fields: this.getFields(),
      priority: 1,
    };
  }

  private getConditions() {
    return this.conditions.concat(this.matchConditions);
  }

  private getContent() {
    return this.host.querySelector('template')?.innerHTML || '';
  }

  private getFields() {
    const fieldValues: string[] = [];
    this.host
      .querySelectorAll('atomic-result-value')
      .forEach((resultValueElement) => {
        fieldValues.push(resultValueElement.value);
      });

    // TODO: extract fields from atomic-field-condition

    return this.fields.concat(fieldValues);
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

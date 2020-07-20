import {Component, Element, Prop, Method} from '@stencil/core';
import {ResultTemplateCondition, resultTemplatesHelpers} from '@coveo/headless';

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

  @Prop() fieldsMustMatch: FieldMatch[] = [];
  @Prop() fieldsMustNotMatch: FieldMatch[] = [];
  @Prop() conditions: ResultTemplateCondition[] = [];

  constructor() {
    const isParentResultList =
      this.host.parentElement?.tagName === 'ATOMIC-RESULT-LIST';
    if (!isParentResultList) {
      console.warn(
        'The atomic-result-template component has to be a child of an atomic-result-list component.'
      );
    }
  }

  @Method()
  async getConditions() {
    return this.conditions.concat(
      this.fieldsMustMatch.map(({field, values}) =>
        resultTemplatesHelpers.fieldMustMatch(field, values)
      ),
      this.fieldsMustNotMatch.map(({field, values}) =>
        resultTemplatesHelpers.fieldMustNotMatch(field, values)
      )
    );
  }
}

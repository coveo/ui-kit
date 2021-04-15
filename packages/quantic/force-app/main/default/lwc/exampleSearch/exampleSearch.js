// @ts-ignore
import template1 from './resultTemplates/template1.html';
// @ts-ignore
import template2 from './resultTemplates/template2.html';
import {LightningElement, api} from 'lwc';

export default class ExampleSearch extends LightningElement {
  /** @type {String} */
  @api engineId = 'example-search';
  
  handleResultTemplateRegistration(event) {
    event.stopPropagation();

    /** @type {import("coveo").ResultTemplatesManager} */
    const resultTemplatesManager = event.detail;

    const isMessage = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'objecttype',
      ['Message']
    );
    const fieldsMustBeDefined = CoveoHeadless.ResultTemplatesHelpers.fieldsMustBeDefined(
      ['gdfiletitle']
    );
    resultTemplatesManager.registerTemplates(
      {content: template1, conditions: [isMessage]},
      {
        content: template2,
        conditions: [fieldsMustBeDefined],
        fields: ['gdfiletitle'],
      }
    );
  }
}

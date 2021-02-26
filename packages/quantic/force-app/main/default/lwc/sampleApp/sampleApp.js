// @ts-ignore
import template1 from './resultTemplates/template1.html';
// @ts-ignore
import template2 from './resultTemplates/template2.html';
import { LightningElement } from 'lwc';

export default class SampleApp extends LightningElement {
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

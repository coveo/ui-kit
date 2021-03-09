// @ts-ignore
import template1 from './resultTemplates/template1.html';
// @ts-ignore
import template2 from './resultTemplates/template2.html';
import { LightningElement, api } from 'lwc';

export default class SampleApp extends LightningElement {
  /** @type {String} */
  @api engineId;

  renderedCallback() {	
    // Example on how to init the search interface	
    // const searchInterface = this.template.querySelector('c-search-interface');	
    // searchInterface.initialize({	
    //   organizationId: 'my_org',	
    //   accessToken: 'my_access_token'	
    // });	
  }
  
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

// @ts-ignore
import template1 from './resultTemplates/youtubeResultTemplate.html';
// @ts-ignore
import template2 from './resultTemplates/caseResultTemplate.html';
// @ts-ignore
import template3 from './resultTemplates/chatterResultTemplate.html';
import {LightningElement, api} from 'lwc';

export default class ExampleSearch extends LightningElement {
  /** @type {String} */
  @api engineId = 'example-search';
  
  handleResultTemplateRegistration(event) {
    event.stopPropagation();

    /** @type {import("coveo").ResultTemplatesManager} */
    const resultTemplatesManager = event.detail;
    
    const isCase = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'objecttype',
      ['Case']
    );
    const isYouTube = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'sourcetype',
      ['YouTube']
    );
    const isChatter = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'objecttype',
      ['FeedItem']
    );
    resultTemplatesManager.registerTemplates(
      {
        content: template1,
        conditions: [isYouTube],
        fields: ['ytvideoid', 'ytvideoduration']
      },
      {
        content: template2,
        conditions: [isCase],
        fields: ['sfstatus', 'sfcasestatus', 'sfcasenumber']
      },
      {
        content: template3,
        conditions: [isChatter],
        fields: ['sfcreatedbyname']
      },
    );
  }
}
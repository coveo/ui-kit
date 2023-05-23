import {LightningElement, api} from 'lwc';
// @ts-ignore
import caseTemplate from './resultTemplates/caseResultTemplate.html';
// @ts-ignore
import chatterTemplate from './resultTemplates/chatterResultTemplate.html';
// @ts-ignore
import childTemplate from './resultTemplates/childTemplate.html';
// @ts-ignore
import parentTemplate from './resultTemplates/parentTemplate.html';
// @ts-ignore
import youtubeTemplate from './resultTemplates/youtubeResultTemplate.html';

export default class ExampleSearch extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-search';
  /** @type {string} */
  @api searchHub = 'default';
  /** @type {string} */
  @api pipeline = 'default';
  /** @type {boolean} */
  @api disableStateInUrl = false;
  /** @type {boolean} */
  @api skipFirstSearch = false;

  handleResultTemplateRegistration(event) {
    event.stopPropagation();

    const resultTemplatesManager = event.detail;

    const isCase = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'objecttype',
      ['Case']
    );
    const isYouTube = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'filetype',
      ['YouTubeVideo']
    );
    const isChatter = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'objecttype',
      ['FeedItem']
    );
    const isThread = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'source',
      ['iNaturalistTaxons']
    );
    const isChild = CoveoHeadless.ResultTemplatesHelpers.fieldMustMatch(
      'quantic__templateId',
      ['myChildTemplate']
    );

    resultTemplatesManager.registerTemplates(
      {
        content: youtubeTemplate,
        conditions: [isYouTube],
        fields: ['ytvideoid', 'ytvideoduration'],
      },
      {
        content: caseTemplate,
        conditions: [isCase],
        fields: ['sfstatus', 'sfcasestatus', 'sfcasenumber'],
      },
      {
        content: chatterTemplate,
        conditions: [isChatter],
        fields: ['sfcreatedbyname'],
      },
      {
        content: childTemplate,
        conditions: [isChild],
        priority: 1,
      },
      {
        content: parentTemplate,
        conditions: [isThread],
      }
    );
  }
}

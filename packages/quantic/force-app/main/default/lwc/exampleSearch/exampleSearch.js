// @ts-ignore
import youtubeTemplate from './resultTemplates/youtubeResultTemplate.html';
// @ts-ignore
import caseTemplate from './resultTemplates/caseResultTemplate.html';
// @ts-ignore
import chatterTemplate from './resultTemplates/chatterResultTemplate.html';
import {LightningElement, api} from 'lwc';

export default class ExampleSearch extends LightningElement {
  /** @type {String} */
  @api engineId = 'example-search';
  /** @type {String} */
  @api searchHub = 'default';
  /** @type {String} */
  @api pipeline = 'default';
  /** @type {String} */
  @api disableStateInUrl = false;
  /** @type {boolean} */
  @api skipFirstSearch = false;

  renderedCallback() {
    console.log(this.searchHub);
  }

  
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
    resultTemplatesManager.registerTemplates(
      {
        content: youtubeTemplate,
        conditions: [isYouTube],
        fields: ['ytvideoid', 'ytvideoduration']
      },
      {
        content: caseTemplate,
        conditions: [isCase],
        fields: ['sfstatus', 'sfcasestatus', 'sfcasenumber']
      },
      {
        content: chatterTemplate,
        conditions: [isChatter],
        fields: ['sfcreatedbyname']
      },
    );
  }
}
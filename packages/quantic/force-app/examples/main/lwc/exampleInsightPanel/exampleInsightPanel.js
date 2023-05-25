// @ts-ignore
import {
  getHeadlessBundle,
  getHeadlessEnginePromise,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import caseTemplate from './resultTemplates/caseResultTemplate.html';
// @ts-ignore
import chatterTemplate from './resultTemplates/chatterResultTemplate.html';
// @ts-ignore
import childTemplate from './resultTemplates/childResultTemplate.html';
// @ts-ignore
import defaultTemplate from './resultTemplates/defaultResultTemplate.html';
// @ts-ignore
import parentTemplate from './resultTemplates/parentResultTemplate.html';
// @ts-ignore
import youtubeTemplate from './resultTemplates/youtubeResultTemplate.html';

export default class ExampleInsightPanel extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-insight-panel';
  /** @type {string} */
  @api insightId = '6a333202-b1e0-451e-8664-26a1f93c2faf';

  connectedCallback() {
    this.template.addEventListener(
      'quantic__insightinterfaceinitialized',
      this.handleInterfaceLoad
    );
  }

  disconnectedCallback() {
    this.template.removeEventListener(
      'quantic__insightinterfaceinitialized',
      this.handleInterfaceLoad
    );
  }

  handleInterfaceLoad = (event) => {
    event.stopPropagation();
    getHeadlessEnginePromise(this.engineId).then((engine) => {
      engine.executeFirstSearch();
    });
  };

  handleResultTemplateRegistration(event) {
    const headless = getHeadlessBundle(this.engineId);

    event.stopPropagation();

    const resultTemplatesManager = event.detail;

    const isCase = headless.ResultTemplatesHelpers.fieldMustMatch(
      'objecttype',
      ['Case']
    );
    const isYouTube = headless.ResultTemplatesHelpers.fieldMustMatch(
      'filetype',
      ['YouTubeVideo']
    );
    const isChatter = headless.ResultTemplatesHelpers.fieldMustMatch(
      'objecttype',
      ['FeedItem']
    );
    const isThread = headless.ResultTemplatesHelpers.fieldMustMatch(
      'source',
      ['iNaturalistTaxons']
    );
    const isChild = headless.ResultTemplatesHelpers.fieldMustMatch(
      'quantic__templateId',
      ['myChildTemplate']
    );

    resultTemplatesManager.registerTemplates(
      {content: childTemplate, conditions: [isChild], priority: 1},
      {content: parentTemplate, conditions: [isThread], fields: []},
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
        content: defaultTemplate,
        conditions: [],
      }
    );
  }
}

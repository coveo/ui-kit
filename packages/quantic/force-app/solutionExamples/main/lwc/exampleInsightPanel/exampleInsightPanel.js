import {
  getHeadlessBundle,
  getHeadlessEnginePromise,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import defaultTemplate from './resultTemplates/defaultResultTemplate.html';
// @ts-ignore
import youtubeTemplate from './resultTemplates/youtubeResultTemplate.html';

export default class ExampleInsightPanel extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-insight-panel';
  /** @type {string} */
  @api insightId = '142be676-703c-445f-b2d3-fcc7c0a3ded8';

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

    const isYouTube = headless.ResultTemplatesHelpers.fieldMustMatch(
      'filetype',
      ['YouTubeVideo']
    );

    resultTemplatesManager.registerTemplates(
      {
        content: youtubeTemplate,
        conditions: [isYouTube],
        fields: ['ytvideoid', 'ytvideoduration'],
      },
      {
        content: defaultTemplate,
        conditions: [],
      }
    );
  }
}

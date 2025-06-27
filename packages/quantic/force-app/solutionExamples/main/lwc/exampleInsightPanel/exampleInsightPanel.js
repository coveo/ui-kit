import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import defaultTemplate from './resultTemplates/defaultResultTemplate.html';
// @ts-ignore
import youtubeTemplate from './resultTemplates/youtubeResultTemplate.html';
// @ts-ignore
import {buildAttachedResultsPayloadHeadless} from 'c/attachToCaseUtils';
// @ts-ignore
import {getAllAttachedResults} from 'c/attachToCaseService';

export default class ExampleInsightPanel extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-insight-panel';
  /** @type {string} */
  @api insightId = '142be676-703c-445f-b2d3-fcc7c0a3ded8';
  /** @type {string} */
  @api caseId = '1234';

  /** @type {boolean} */
  isInitAttachedResults = false;

  loadAttachedResults() {
    getAllAttachedResults(this.caseId)
      .then((data) => {
        const dataParsed = JSON.parse(data);
        if (
          dataParsed?.succeeded &&
          Array.isArray(dataParsed.attachedResults)
        ) {
          this._attachedResults = dataParsed.attachedResults;
          this.initAttachedResults();
        } else {
          console.warn(dataParsed?.message);
        }
      })
      .catch((error) => {
        console.warn(error?.body?.message);
      });
  }

  connectedCallback() {
    this.template.addEventListener(
      'quantic__insightinterfaceinitialized',
      this.handleInterfaceLoad
    );
    this.loadAttachedResults();
    registerComponentForInit(this, this.engineId);
  }

  disconnectedCallback() {
    this.template.removeEventListener(
      'quantic__insightinterfaceinitialized',
      this.handleInterfaceLoad
    );
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.engine = engine;

    this.insightInterface = this.headless.buildInsightInterface(engine);
    this.searchStatus = this.headless.buildSearchStatus(engine);

    this.actions = {
      ...this.headless.loadCaseContextActions(engine),
      ...this.headless.loadAttachedResultsActions(engine),
    };

    this.engine.dispatch(this.actions.setCaseId(this.caseId));
    this.initAttachedResults();
  };

  initAttachedResults = () => {
    if (!this.isInitAttachedResults) {
      if (this.engine && Array.isArray(this._attachedResults)) {
        this.isInitAttachedResults = true;
        if (this.actions.setAttachedResults) {
          this.engine.dispatch(
            this.actions.setAttachedResults({
              results: buildAttachedResultsPayloadHeadless(
                this._attachedResults
              ),
              loading: false,
            })
          );
        }
      }
    }
  };

  handleInterfaceLoad = (event) => {
    event.stopPropagation();
    this.engine.executeFirstSearch();
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

import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api, wire} from 'lwc';
// @ts-ignore
import defaultTemplate from './resultTemplates/defaultResultTemplate.html';
// @ts-ignore
import youtubeTemplate from './resultTemplates/youtubeResultTemplate.html';
// @ts-ignore
import {buildAttachedResultsPayloadHeadless} from 'c/attachToCaseUtils';
// @ts-ignore
import {getAllAttachedResults} from 'c/attachToCaseService';
import {getRecord} from 'lightning/uiRecordApi';
import noGeneratedAnswer from '@salesforce/label/c.NoGeneratedAnswer';

export default class ExampleInsightPanel extends LightningElement {
  /** @type {string} */
  @api engineId = 'example-insight-panel';
  /** @type {string} */
  @api insightId = '142be676-703c-445f-b2d3-fcc7c0a3ded8';
  /** @type {string} */
  @api caseId = '1234';
  answerConfigurationId = '10f49a04-76d3-46bf-b8dc-22b0c291c254';

  labels = {
    noGeneratedAnswer,
  };

  /** @type {boolean} */
  isInitAttachedResults = false;
  /** @type {boolean} */
  triggeredFirstSearch = false;
  /** @type {object} */
  caseRecord;

  caseFields = [
    'Case.CreatedDate',
    'Case.CreatedBy.Email',
    'Case.CaseNumber',
    'Case.Subject',
    'Case.Description',
  ];
  defaultExcludedCustomActions = [
    'ticket_field_update',
    'ticket_next_stage',
    'ticket_classification_click',
    'generatedAnswerStreamEnd',
  ];
  ticketCreationDateTime;
  ticketCreationUserId;
  userActionsReady = false;

  @wire(getRecord, {recordId: '$caseId', fields: '$caseFields'})
  wiredRecord({data, error}) {
    if (data) {
      if (!this.triggeredFirstSearch) {
        this.caseRecord = data;
      } else {
        if (this.watchedFieldsUpdated(data)) {
          this.caseRecord = data;
          this.executeSearchAfterContextChanged();
        }
      }
    } else {
      console.warn('An error occurred while retrieving the record.');
      console.warn(error);
    }
  }

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
      ...this.headless.loadInsightSearchAnalyticsActions(engine),
      ...this.headless.loadInsightSearchActions(engine),
    };

    this.caseNumber =
      this.getFieldValueFromRecord(this.caseRecord, 'Case.CaseNumber') ||
      '1234'; // Default case number if example insight panel is not on a case record page.
    this.engine.dispatch(this.actions.setCaseId(this.caseId));
    this.engine.dispatch(this.actions.setCaseNumber(this.caseNumber));
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
    if (!this.triggeredFirstSearch) {
      this.triggeredFirstSearch = true;
      this.executeFirstSearch();
    }
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

  /**
   * Indicates whether the watched fields of a case record have been updated.
   * @param {object} newRecordData the new case record data
   * @returns {boolean}
   */
  watchedFieldsUpdated(newRecordData) {
    return Object.values(this.caseFields)?.reduce((result, field) => {
      const previousValue = this.getFieldValueFromRecord(
        this.caseRecord,
        field
      );
      const newValue = this.getFieldValueFromRecord(newRecordData, field);
      return result || previousValue !== newValue;
    }, false);
  }

  /**
   * Returns the value of a record field.
   * This function expects the fieldName to be in the following format "Case.Contact.Name".
   * @param {{fields: any}} record The case record
   * @param {string} fieldName The case field name
   * @returns {string}
   */
  getFieldValueFromRecord(record, fieldName) {
    let innerKeys = fieldName.split('.');
    if (!record || !innerKeys.length) return null;
    if (innerKeys[0].toLowerCase() === 'case') {
      innerKeys = innerKeys.slice(1);
    }
    if (innerKeys.length === 1) return record.fields?.[innerKeys[0]]?.value;
    return this.getFieldValueFromRecord(
      record.fields?.[innerKeys[0]]?.value,
      innerKeys.slice(1).join('.')
    );
  }

  /**
   * Setup the case context.
   * @returns {void}
   */
  setupContext() {
    const subject = this.getFieldValueFromRecord(
      this.caseRecord,
      'Case.Subject'
    );
    const description = this.getFieldValueFromRecord(
      this.caseRecord,
      'Case.Description'
    );
    const context = {
      Case_ID: this.caseId,
      ...(subject ? {Case_Subject: subject} : {}),
      ...(description ? {Case_Description: description} : {}),
    };
    this.engine.dispatch(this.actions.setCaseContext(context));
  }

  /**
   * Executes a search after detecting context change.
   * @returns {void}
   */
  executeSearchAfterContextChanged() {
    this.setupContext();
    this.engine.dispatch(
      this.actions.executeSearch(
        this.actions.logContextChanged(this.caseId, this.caseNumber)
      )
    );
  }

  /**
   * Executes the first search.
   * @returns {void}
   */
  executeFirstSearch = () => {
    this.ticketCreationDateTime = this.getFieldValueFromRecord(
      this.caseRecord,
      'Case.CreatedDate'
    );
    this.ticketCreationUserId = this.getFieldValueFromRecord(
      this.caseRecord,
      'Case.CreatedBy.Email'
    );
    this.userActionsReady = true;
    this.setupContext();
    this.engine.executeFirstSearch();
  };
}

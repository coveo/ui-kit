import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import { LightningElement, api, track } from 'lwc';
// @ts-ignore
import DetachFromCase from '@salesforce/apex/AttachToCaseController.AuraDetachFromCase';

export default class QuanticAttachedResults extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * Note: this needs to be the same as the one set in Hosted Insight Panel. it should be in the format `insight-recordId`.
   * For example, `insight-500RL00000NA2BNYA1`, the current record id is just an example for the POC.
   * @api
   * @type {string}
   */
  engineId = `insight-500RL00000NA2BNYA1`;
  @track results = [];

  attachedResults;
  unsubscribe;
  headless;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    // This component needs to do a logic similar to what the Insight Renderer does to use APEX to get the attached results saved in Salesforce and setting them in the Headless state.
    // While doing that the loading state should be handled properly and reflected in the UI.
    this.engine = engine;
    this.headless = getHeadlessBundle(this.engineId);
    this.attachedResults = this.headless.buildAttachToCase(engine, {
      options: {
        result: null,
        caseId: '123', // The caseId should be dynamic based on the current record id.
      },
    });
    this.unsubscribe = this.attachedResults.subscribe(() => this.updateState());
    this.actions = {
      ...this.headless.loadAttachedResultsActions(engine),
      ...this.headless.loadAttachedResultsAnalyticsActions(engine),
    };
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.results =
      this.attachedResults.state?.results.map((result) => ({
        ...result,
        handleDetach: () => {
          this.detach(result);
        },
      })) || [];
  }

  detach = (result) => {
    // Loading state should be handled properly in the UI after clicking the detach button.
    this._isLoading = true;
    // We detach using the attach to case APEX service. 
    DetachFromCase({
      uriHash: result.permanentId,
      sfkbid: result.knowledgeArticleId,
      caseId: '500RL00000NA2BNYA1',
    })
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse?.succeeded) {
          // we detach from the Headless state.
          this.engine.dispatch(
            this.actions.detachResult({ ...result, uriHash: result.permanentId }
            )
          );
          // We log analytics event.
          this.engine.dispatch(
            this.actions.logCaseDetach({
              ...result,
              raw: {
                urihash: result.permanentId,
                permanentid: result.permanentId,
              },
            })
          );
        } else {
          console.error('Error detaching result:', parsedResponse?.errors);
        }
      })
      .catch((error) => {
        console.error('Error detaching result:');
      })
      .finally(() => {
        this._isLoading = false;
      });
  };
}
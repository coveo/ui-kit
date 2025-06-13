import {api, LightningElement} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
// @ts-ignore
import {buildResultToAttach, buildResultToDetach} from 'c/attachToCaseUtils';
import attachResult from '@salesforce/label/c.AttachResult';
import detachResult from '@salesforce/label/c.DetachResult';
import resultIsAttached from '@salesforce/label/c.ResultIsAttached';
// @ts-ignore
import {attachToCase, detachFromCase} from 'c/attachToCaseService';

/** @typedef {import("coveo").AttachToCase} AttachToCase */
/** @typedef {import("coveo").Result} Result */

export default class ResultAttachToCase extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The result to attach/detach.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The label displayed in the tooltip of the result action button.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * Set to true so the resultAttachToCase behaves only as a visual indicator when results are attached.
   * @api
   * @type {boolean}
   */
  @api readOnly;

  /** @type {string} */
  eventName = 'insightpanel__attachtocase';

  labels = {
    attachResult: attachResult,
    detachResult: detachResult,
    resultIsAttached: resultIsAttached,
  };

  _isAttached;
  _isLoading;

  /** @type {Function} */
  unsubscribe;
  headless;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.addEventListener(this.eventName, this.handleAttachClick.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener(this.eventName, this.handleAttachClick.bind(this));
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  get displayedLabel() {
    return this._isAttached
      ? this.labels.detachResult
      : this.labels.attachResult;
  }

  initialize = (engine) => {
    this._isLoading = true;
    this.headless = getHeadlessBundle(this.engineId);
    this.engine = engine;
    this.caseId = engine.state.insightCaseContext?.caseId;

    this.attachToCase = this.headless.buildAttachToCase(engine, {
      options: {
        result: this.result,
        caseId: this.caseId,
      },
    });
    this.unsubscribe = this.attachToCase.subscribe(() => this.updateState());
  };

  updateState() {
    if (this._isLoading && !!this.result && !!this.attachToCase) {
      this._isLoading = false;
    }
    if (this.result) {
      this._isAttached = this.attachToCase.isAttached();
    }
  }

  handleAttachClick = () => {
    if (this._isAttached) {
      this.detach(buildResultToDetach(this.result, this.caseId));
    } else {
      const resultToAttach = buildResultToAttach(this.result, this.caseId);

      if (
        typeof resultToAttach === 'string' ||
        resultToAttach instanceof String
      ) {
        // There was an error with the creation of a result to attach.
        console.error(resultToAttach);
      } else if (resultToAttach) {
        this.attach(resultToAttach);
      }
    }
  };

  attach = (resultToAttach) => {
    this._isLoading = true;
    attachToCase({
      result: JSON.stringify(resultToAttach),
    })
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse?.succeeded) {
          this.attachToCase.attach();
        } else {
          console.error(parsedResponse?.message);
        }
      })
      .catch((error) => {
        console.error(error?.body?.message);
      })
      .finally(() => {
        this._isLoading = false;
      });
  };

  detach = (resultToDetach) => {
    this._isLoading = true;
    detachFromCase({
      ...resultToDetach,
    })
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse?.succeeded) {
          this.attachToCase.detach();
        } else {
          console.error(parsedResponse?.message);
        }
      })
      .catch((error) => {
        console.error(error?.body?.message);
      })
      .finally(() => {
        this._isLoading = false;
      });
  };
}

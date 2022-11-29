import { api, LightningElement, track } from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").AttachToCase} AttachToCase */

export default class QuanticResultAttachToCase extends LightningElement {
  @api engineId;
  @api result;
  @api label;

  @track _isAttached;

  /** @type {Function} */
  unsubscribe;
  /** @type {InsightEngine} */
  headless;

  connectedCallback() {
    this.displayedLabel = this.label;
    registerComponentForInit(this, this.engineId);
    this.addEventListener(
      'quantic__attachtocase',
      this.handleAttachClick
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      'quantic__attachtocase',
      this.handleAttachClick
    );
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.engine = engine;

    this.attachToCase = this.headless.buildAttachToCase(engine, {
      initialState: {
        attachedResults: []
      }
    });
    this.unsubscribe = this.attachToCase.subscribe(() => this.updateState());
  }

  updateIsAttached() {
    this._isAttached = this.attachToCase.isAttached(this.result);
  }

  updateState() {
    this.updateIsAttached();
  }

  get isAttached() {
    this.updateIsAttached();
    return this._isAttached;
  }

  handleAttachClick = (event) => {
    console.log(event.detail);
    if (this.isAttached) {
      console.log('Detaching result');
      return this.attachToCase.detach(this.result);
    }
    console.log('Attaching result');
    this.attachToCase.attach(this.result);
  }
}
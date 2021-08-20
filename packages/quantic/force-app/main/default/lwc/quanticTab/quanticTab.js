import { LightningElement, api } from 'lwc';
import { registerComponentForInit, initializeWithHeadless } from 'c/quanticHeadlessLoader';


export default class QuanticTab extends LightningElement {
  /** @type {import("coveo").Tab} */
  tab;
  /** @type {()=> void} */
  unsubscribe;
  /** @type {boolean} */
  isActive;
  /** @type {string} */
  @api label;
  /** @type {string} */
  @api expression;
  /** @type {string} */
  @api engineId;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
  * @param {import("coveo").SearchEngine} engine
  */
  @api
  initialize(engine) {
    this.tab = CoveoHeadless.buildTab(engine, {
      options: {
        expression: this.expression,
        id: this.label,
      },
      initialState: {
        isActive: this.isActive,
      }
    });
    this.unsubscribe = this.tab.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.isActive = this.tab.state.isActive;
  }

  select() {
    this.tab.select();
  }

  get tabClass() {
    return `slds-tabs_default__item ${this.isActive ? 'slds-is-active' : ''}`
  }

}
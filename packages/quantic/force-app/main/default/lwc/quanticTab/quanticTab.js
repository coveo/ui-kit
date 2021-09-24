import { LightningElement, api } from 'lwc';
import { registerComponentForInit, initializeWithHeadless } from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").Tab} Tab */

/**
 * The `QuanticSearchBox` component creates a search box with built-in support for query suggestions.
 * @category LWC
 * @example
 * <c-quantic-tab label="Community" expression="@objecttype==&quot;Message&quot;" engine-id={engineId}></c-quantic-tab>
 */
export default class QuanticTab extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The non-localized label for the tab.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The constant query expression or filter that the Tab should add to any outgoing query.
   * @api
   * @type {string}
   */
  @api expression;
  /**
   * Whether to initialize the tab as active.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api initAsActive = false

  /** @type {Tab} */
  tab;
  /** @type {Function} */
  unsubscribe;
  /** @type {boolean} */
  isActive;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
  * @param {SearchEngine} engine
  */
  initialize = (engine) => {
    this.tab = CoveoHeadless.buildTab(engine, {
      options: {
        expression: this.expression,
        id: this.label,
      },
      initialState: {
        isActive: this.initAsActive,
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
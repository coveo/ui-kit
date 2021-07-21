import { api, LightningElement, track } from 'lwc';
import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';

export default class QuanticDidYouMean extends LightningElement {
    /** @type {()=> void} */
    unsubscribe;
    /** @type {Boolean}*/
    @track hasQueryCorrection;
    /** @type {Boolean}*/
    @track wasAutomaticallyCorrected;
    /** @type {string}*/
    @track originalQuery;
    /** @type {string}*/
    @track correctedQuery;
    /** @type {string}*/
    @api engineId;

    /** @type {import("coveo").DidYouMean} */
    didYouMean;

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
        this.didYouMean = CoveoHeadless.buildDidYouMean(engine);
        this.unsubscribe = this.didYouMean.subscribe(() => this.updateState());
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
    }

    updateState() {
        this.hasQueryCorrection = this.didYouMean.state.hasQueryCorrection;
        this.wasAutomaticallyCorrected = this.didYouMean.state.wasAutomaticallyCorrected;
        this.originalQuery = this.didYouMean.state.originalQuery;
        this.correctedQuery = this.didYouMean.state.queryCorrection.correctedQuery;
    }

    applyCorrection() {
        this.didYouMean.applyCorrection();
    }
}
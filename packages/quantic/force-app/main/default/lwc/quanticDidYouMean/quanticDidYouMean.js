import { api, LightningElement, track } from 'lwc';
import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';

export default class QuanticDidYouMean extends LightningElement {
    @track state = {};
    /** @type {()=> void} */
    unsubscribe;
    /**
     * @type {Boolean}
     */
    @track hasQueryCorrection;

    /**
     * @type {Boolean}
     */
    @track wasAutomaticallyCorrected;

    /** @type {import("coveo").DidYouMean} */
    didYouMean;
    
    /**
     * @type {string}
     */
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
    }

    applyCorrection() {
        this.didYouMean.applyCorrection();
    }

    get noResults() {
        return this.didYouMean.state.originalQuery;
    }

    get queryAutoCorrectedTo() {
        return this.didYouMean.state.wasCorrectedTo;
    }

    get correctedQuery() {
        return this.didYouMean.state.queryCorrection.correctedQuery;
    }
}
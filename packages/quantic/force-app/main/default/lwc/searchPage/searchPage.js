// @ts-check
import { LightningElement, api } from "lwc";
import HeadlessPath from "@salesforce/resourceUrl/coveoheadless";
// @ts-ignore
import { loadScript } from "lightning/platformResourceLoader";

export default class SearchPage extends LightningElement {
  /** @type {any} */
  @api flexipageRegionWidth;
  /** @type {boolean} */
  @api hasResults;

  /** @type {boolean} */
  initialized;
  /** @type {import("coveo").HeadlessEngine<any>} */
  engine;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  connectedCallback() {
    if (this.initialized) {
      return;
    }

    /**
     * @param {any} e
     */
    loadScript(this, HeadlessPath + "/browser/headless.js")
      .then(() => this.initializeCoveo())
      .catch((e) => {
        console.error(e);
      });
  }

  disconnectedCallback() {
    this.unsubscribe && this.unsubscribe();
  }

  initializeCoveo() {
    this.engine = new CoveoHeadless.HeadlessEngine({
      configuration: CoveoHeadless.HeadlessEngine.getSampleConfiguration(),
      reducers: CoveoHeadless.searchPageReducers
    });

    this.unsubscribe = this.engine.subscribe(() => this.updateState());
    this.initialized = true;

    // TODO: proper child sync
    setTimeout(() => {
      this.engine.dispatch(
        CoveoHeadless.SearchActions.executeSearch(
          CoveoHeadless.AnalyticsActions.logGenericSearchEvent({
            evt: "interfaceLoad"
          })
        )
      );
    }, 100);
  }

  updateState() {
    this.hasResults = this.engine.state.search.response.results.length !== 0;
  }
}

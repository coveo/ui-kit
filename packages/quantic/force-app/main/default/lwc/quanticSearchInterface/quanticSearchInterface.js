import {LightningElement, api, wire} from 'lwc';
import {setEngineConfiguration, setInitializedCallback} from 'c/quanticHeadlessLoader';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

export default class QuanticSearchInterface extends LightningElement {
  /** @type {any} */
  @api flexipageRegionWidth;

  /** @type {string} */
  @api searchHub = 'default';

  /** @type {string} */
  @api pipeline = 'default';

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").HeadlessOptions} */
  fullConfig;

  @wire(getHeadlessConfiguration)
  wiredConfig({ error, data }) {
    if (data) {
      this.fullConfig = {
        configuration: {
          ...JSON.parse(data),
          search: {
            searchHub: this.searchHub,
            pipeline: this.pipeline
          }
        },
        reducers: CoveoHeadless.searchAppReducers
      };
      setEngineConfiguration(this.fullConfig, this.engineId, this);
      setInitializedCallback(this.performInitialQuery, this.engineId);
    } else if (error) {
      console.error(error.message);
    }
  }

  performInitialQuery = async (engine) => {
    engine.dispatch(
      CoveoHeadless.SearchActions.executeSearch(
        CoveoHeadless.AnalyticsActions.logInterfaceLoad()
      )
    );
  }
}

import {LightningElement, api} from 'lwc';
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
  engineConfiguration;

  connectedCallback() {
    getHeadlessConfiguration().then((data) => {
      if (data) {
        this.engineConfiguration = {
          configuration: {
            ...JSON.parse(data),
            search: {
              searchHub: this.searchHub,
              pipeline: this.pipeline
            }
          }
        };
        setEngineConfiguration(this.engineConfiguration, CoveoHeadless.buildSearchEngine, this.engineId, this);
        setInitializedCallback(this.performInitialQuery, this.engineId);
      }
    });
  }

  performInitialQuery = (engine) => {
    engine.executeFirstSearch()
  }
}